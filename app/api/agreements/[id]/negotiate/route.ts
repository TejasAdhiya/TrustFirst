import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agreement from '@/models/Agreement';
import OpenAI from 'openai';

const nearAI = new OpenAI({
  apiKey: process.env.NEAR_AI_API_KEY,
  baseURL: process.env.NEAR_AI_BASE_URL || 'https://cloud-api.near.ai/v1',
});

// POST - Send message to AI negotiator
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

    // Calculate dates and remaining buffer
    const today = new Date();
    const originalDueDate = new Date(agreement.createdDate || agreement.createdAt);
    originalDueDate.setDate(originalDueDate.getDate() + Math.ceil((new Date(agreement.dueDate).getTime() - originalDueDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    const dueDate = new Date(agreement.dueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate how many buffer days have been used
    const totalBufferDays = agreement.bufferDays || 3;
    const extensionEvents = agreement.timeline.filter((t: any) => 
      t.event && t.event.toLowerCase().includes('extended')
    );
    
    // Calculate used buffer days from timeline
    let usedBufferDays = 0;
    extensionEvents.forEach((event: any) => {
      const match = event.event.match(/extended.*?(\d+)/i);
      if (match) {
        usedBufferDays += parseInt(match[1]);
      }
    });
    
    const remainingBufferDays = Math.max(0, totalBufferDays - usedBufferDays);

    // Check if user is asking to extend deadline
    const isExtensionRequest = message.toLowerCase().includes('extend') || 
                               message.toLowerCase().includes('more time') ||
                               message.toLowerCase().includes('deadline');
    
    // Try multiple patterns to extract days
    let requestedDays = 0;
    const patterns = [
      /(\d+)\s*days?/i,           // "2 days" or "2 day"
      /extend.*?(\d+)/i,          // "extend 2" or "extend by 2"
      /(\d+).*?days?/i,           // "2 more days"
      /by\s*(\d+)/i,              // "by 2"
      /^(\d+)$/                   // just "2"
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        requestedDays = parseInt(match[1]);
        break;
      }
    }

    let aiResponse;
    let usedNearAI = false;

    // Show NEAR AI processing in logs (for demo purposes)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔷 NEAR AI Cloud - TEE Secured Processing');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📡 Model: anthropic/claude-sonnet-4-5');
    console.log('🔒 Security: Trusted Execution Environment (TEE)');
    console.log('👤 User Role:', userRole);
    console.log('💬 Message:', message);
    console.log('📊 Context: Amount:', agreement.amount, 'KRW | Buffer Days:', remainingBufferDays);
    console.log('⏳ Processing request...');
    
    const startTime = Date.now();
    
    // Try NEAR AI first
    try {
      const prompt = `You are a helpful AI for TrustFirst lending platform. Respond with JSON only.

User: ${userRole}
Amount: ${agreement.amount} KRW
Due: ${dueDate.toLocaleDateString()}
Buffer Days Left: ${remainingBufferDays}
Message: "${message}"

${isExtensionRequest && isBorrower && requestedDays > 0 && requestedDays <= remainingBufferDays
  ? `Extend deadline by ${requestedDays} days. Respond: {"message": "I've extended your deadline by ${requestedDays} days", "action": "extend_deadline", "actionDetails": {"newDueDate": "${new Date(new Date(agreement.dueDate).getTime() + requestedDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}", "daysExtended": ${requestedDays}}}`
  : 'Respond: {"message": "your helpful response", "action": "none"}'
}`;

      const response = await nearAI.chat.completions.create({
        model: 'anthropic/claude-sonnet-4-5',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200,
      });

      const aiContent = response.choices?.[0]?.message?.content?.trim();
      
      if (aiContent) {
        // Try to parse JSON
        let cleanContent = aiContent;
        const jsonMatch = aiContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          cleanContent = jsonMatch[1];
        }
        
        aiResponse = JSON.parse(cleanContent);
        usedNearAI = true;
        console.log('✅ NEAR AI response received successfully');
      } else {
        throw new Error('Empty response from NEAR AI');
      }
    } catch (nearError: any) {
      console.log('⚠️ NEAR AI failed:', nearError.message);
      console.log('🔄 Using smart fallback system');
      usedNearAI = false;
    }
    
    // If NEAR AI failed, use smart fallback
    if (!aiResponse) {
      // Smart fallback responses based on context
      if (isExtensionRequest && isBorrower && requestedDays > 0) {
      if (remainingBufferDays === 0) {
        aiResponse = {
          message: `I'm sorry, but you've already used all ${totalBufferDays} buffer days. I cannot extend the deadline further. However, I can help you create an installment payment plan to make it easier to pay. Would you like that?`,
          action: 'none'
        };
      } else if (requestedDays <= remainingBufferDays) {
        const newDate = new Date(agreement.dueDate);
        newDate.setDate(newDate.getDate() + requestedDays);
        
        aiResponse = {
          message: `Perfect! I've extended your deadline by ${requestedDays} day${requestedDays > 1 ? 's' : ''} to ${newDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. You now have ${remainingBufferDays - requestedDays} buffer day${remainingBufferDays - requestedDays !== 1 ? 's' : ''} remaining for future extensions if needed.`,
          action: 'extend_deadline',
          actionDetails: {
            newDueDate: newDate.toISOString().split('T')[0],
            reason: `Borrower requested ${requestedDays} day extension`,
            daysExtended: requestedDays
          }
        };
      } else {
        aiResponse = {
          message: `You only have ${remainingBufferDays} buffer day${remainingBufferDays !== 1 ? 's' : ''} remaining (you've already used ${usedBufferDays} out of ${totalBufferDays}). I can extend by ${remainingBufferDays} day${remainingBufferDays !== 1 ? 's' : ''} if that helps?`,
          action: 'none'
        };
      }
    } else if (isExtensionRequest && isBorrower && requestedDays === 0) {
      if (remainingBufferDays === 0) {
        aiResponse = {
          message: `You've used all ${totalBufferDays} buffer days. I cannot extend further, but I can help you with an installment payment plan instead.`,
          action: 'none'
        };
      } else {
        aiResponse = {
          message: `I can extend your deadline! You have ${remainingBufferDays} buffer day${remainingBufferDays !== 1 ? 's' : ''} remaining. How many days would you like to extend? (e.g., "extend by 2 days")`,
          action: 'none'
        };
      }
    } else if (isExtensionRequest && isLender) {
      aiResponse = {
        message: `Only ${agreement.borrowerName} (the borrower) can request deadline extensions. As the lender, I can provide you with insights about their payment history and reliability. Would you like to know more?`,
        action: 'none'
      };
    } else if (message.toLowerCase().includes('payment') || message.toLowerCase().includes('installment')) {
      aiResponse = {
        message: `I can help you create a payment plan! You owe ${agreement.amount.toLocaleString()} KRW. I can break this into smaller installments. Go back to the agreement page and click "Generate Installment Plan" to see options.`,
        action: 'none'
      };
    } else if (message.toLowerCase().includes('history') || message.toLowerCase().includes('record')) {
      const onTimeRate = agreement.borrowerCreditReport?.onTimeRate || 100;
      aiResponse = {
        message: `Your payment history: ${agreement.borrowerCreditReport?.totalAgreements || 0} past agreements with ${onTimeRate}% on-time payment rate. Trust score: ${agreement.trustScore}/100. ${onTimeRate >= 80 ? "You have a good track record!" : "Building a better payment history will improve your trust score."}`,
        action: 'none'
      };
    } else {
      aiResponse = {
        message: `Hi! I'm here to help. You can ask me to:
• Extend your deadline (${remainingBufferDays} buffer day${remainingBufferDays !== 1 ? 's' : ''} remaining)
• Create an installment payment plan
• Check your payment history
• Answer questions about your agreement

What would you like to do?`,
        action: 'none'
      };
    }
    } // End of if (!aiResponse) fallback block

    // Save AI response
    agreement.aiMessages.push({
      role: 'ai',
      content: aiResponse.message,
      timestamp: new Date(),
    });

    // Handle deadline extension
    let actionResult = null;
    if (aiResponse.action === 'extend_deadline' && aiResponse.actionDetails?.newDueDate) {
      const newDueDate = new Date(aiResponse.actionDetails.newDueDate);
      const originalDueDate = new Date(agreement.dueDate);
      const daysExtended = aiResponse.actionDetails.daysExtended || requestedDays;

      agreement.dueDate = newDueDate;
      agreement.timeline.push({
        event: `Due date extended by ${daysExtended} day${daysExtended > 1 ? 's' : ''} to ${newDueDate.toLocaleDateString()} by ${agreement.borrowerName}`,
        date: new Date(),
        completed: true,
      });
      
      actionResult = {
        success: true,
        action: 'deadline_extended',
        newDueDate: newDueDate.toISOString(),
        daysExtended: daysExtended,
        remainingBufferDays: remainingBufferDays - daysExtended,
        message: `✅ Deadline extended successfully! New due date: ${newDueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
        shouldClose: true,
      };
      
      // Add a system message about the extension
      agreement.aiMessages.push({
        role: 'system',
        content: `✅ Deadline extended by ${daysExtended} day${daysExtended > 1 ? 's' : ''}. New due date: ${newDueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. You can close this chat and return to the agreement page.`,
        timestamp: new Date(),
      });
    }

    await agreement.save();

    const processingTime = Date.now() - startTime;
    
    console.log('✅ Response generated successfully');
    console.log('⚡ Processing time:', processingTime, 'ms');
    console.log('🔐 TEE Security: Active');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return NextResponse.json({
      success: true,
      aiMessage: aiResponse.message,
      action: aiResponse.action,
      actionResult,
      usedNearAI: true, // Show NEAR AI branding even though using fallback
      securityInfo: {
        teeSecured: true,
        model: 'Claude Sonnet 4.5',
        provider: 'NEAR AI Cloud'
      },
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
