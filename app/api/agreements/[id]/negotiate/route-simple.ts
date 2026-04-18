import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agreement from '@/models/Agreement';
import OpenAI from 'openai';

const nearAI = new OpenAI({
  apiKey: process.env.NEAR_AI_API_KEY,
  baseURL: process.env.NEAR_AI_BASE_URL || 'https://cloud-api.near.ai/v1',
});

// POST - Send message to AI negotiator (SIMPLIFIED VERSION)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const body = await request.json();
    const { message, userId } = body;

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      );
    }

    const agreement = await Agreement.findById(id);
    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    const isBorrower = userId === agreement.borrowerId;
    const isLender = userId === agreement.lenderId;
    const userRole = isBorrower ? 'borrower' : isLender ? 'lender' : 'unknown';

    if (userRole === 'unknown') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Save user message
    agreement.aiMessages.push({
      role: 'user',
      content: `[${userRole.toUpperCase()}] ${message}`,
      timestamp: new Date(),
    });

    // Calculate dates
    const today = new Date();
    const dueDate = new Date(agreement.dueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // SIMPLIFIED PROMPT
    const prompt = `You are a helpful AI assistant for TrustFirst lending platform.

User: ${userRole} (${userRole === 'borrower' ? agreement.borrowerName : agreement.lenderName})
Amount: ${agreement.amount} KRW
Due Date: ${dueDate.toLocaleDateString()}
Days Until Due: ${daysUntilDue}
Buffer Days: ${agreement.bufferDays}

${userRole === 'borrower' 
  ? 'Help the borrower negotiate terms. You can extend the deadline within buffer days.'
  : 'Provide insights about the borrower. You CANNOT extend deadlines (only borrower can).'}

User asks: "${message}"

Respond with JSON:
{"message": "your helpful response", "action": "none"}

If borrower asks to extend deadline by X days and X <= ${agreement.bufferDays}:
{"message": "I'll extend your deadline by X days", "action": "extend_deadline", "actionDetails": {"newDueDate": "YYYY-MM-DD", "reason": "approved"}}`;

    // Call NEAR AI
    const response = await nearAI.chat.completions.create({
      model: 'Qwen/Qwen3-30B-A3B-Instruct-2507',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiContent = response.choices[0]?.message?.content?.trim();

    if (!aiContent) {
      throw new Error('Empty AI response');
    }

    let aiResponse;
    try {
      aiResponse = JSON.parse(aiContent);
    } catch (e) {
      aiResponse = {
        message: aiContent,
        action: 'none',
      };
    }

    // Save AI response
    agreement.aiMessages.push({
      role: 'ai',
      content: aiResponse.message,
      timestamp: new Date(),
    });

    // Handle deadline extension
    let actionResult = null;
    if (aiResponse.action === 'extend_deadline' && aiResponse.actionDetails?.newDueDate) {
      if (!isBorrower) {
        actionResult = {
          success: false,
          message: 'Only borrower can extend deadlines',
        };
      } else {
        const newDueDate = new Date(aiResponse.actionDetails.newDueDate);
        const originalDueDate = new Date(agreement.dueDate);
        const maxAllowedDate = new Date(originalDueDate);
        maxAllowedDate.setDate(maxAllowedDate.getDate() + agreement.bufferDays);

        if (newDueDate <= maxAllowedDate && newDueDate > originalDueDate) {
          agreement.dueDate = newDueDate;
          agreement.timeline.push({
            event: `Due date extended to ${newDueDate.toLocaleDateString()} by ${agreement.borrowerName}`,
            date: new Date(),
            completed: true,
          });
          
          actionResult = {
            success: true,
            action: 'deadline_extended',
            newDueDate: newDueDate.toISOString(),
            message: `Due date extended to ${newDueDate.toLocaleDateString()}`,
          };
        } else {
          actionResult = {
            success: false,
            message: 'Date exceeds buffer days limit',
          };
        }
      }
    }

    await agreement.save();

    return NextResponse.json({
      success: true,
      aiMessage: aiResponse.message,
      action: aiResponse.action,
      actionResult,
      agreement: {
        id: agreement._id,
        dueDate: agreement.dueDate,
      },
    });

  } catch (error: any) {
    console.error('[AI Negotiation] Error:', error.message);
    return NextResponse.json(
      { 
        error: 'Failed to process', 
        details: error.message,
        fallback: true,
        aiMessage: "I'm having trouble right now. Please try again.",
      },
      { status: 500 }
    );
  }
}

// GET - Fetch conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const agreement = await Agreement.findById(id);
    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
    }

    if (userId !== agreement.borrowerId && userId !== agreement.lenderId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      messages: agreement.aiMessages,
      agreementContext: {
        amount: agreement.amount,
        dueDate: agreement.dueDate,
        status: agreement.status,
        bufferDays: agreement.bufferDays,
        borrowerName: agreement.borrowerName,
        lenderName: agreement.lenderName,
        hasInstallmentPlan: !!agreement.selectedInstallmentPlan,
        borrowerId: agreement.borrowerId,
        lenderId: agreement.lenderId,
      },
    });

  } catch (error: any) {
    console.error('[AI Negotiation] Get Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation', details: error.message },
      { status: 500 }
    );
  }
}
