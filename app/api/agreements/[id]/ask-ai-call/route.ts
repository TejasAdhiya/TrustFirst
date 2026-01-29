import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agreement from '@/models/Agreement';

// POST - Trigger AI mediator call via Make.com
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    // Get userId from request body
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch the agreement from MongoDB
    const agreement = await Agreement.findById(id);

    if (!agreement) {
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      );
    }

    // Determine who triggered the call
    let triggeredBy: 'lender' | 'borrower';
    if (userId === agreement.lenderId) {
      triggeredBy = 'lender';
    } else if (userId === agreement.borrowerId) {
      triggeredBy = 'borrower';
    } else {
      return NextResponse.json(
        { error: 'User is not authorized for this agreement' },
        { status: 403 }
      );
    }

    // Extract required data
    const { 
      borrowerName, 
      borrowerPhone, 
      borrowerEmail, 
      lenderName, 
      amount, 
      purpose,
      dueDate, 
      status, 
      trustScore,
      type,
      strictMode,
      bufferDays,
      witnessName,
      witnessApproved,
      createdAt
    } = agreement;

    // Use email as fallback if phone is missing
    const contactInfo = borrowerPhone || borrowerEmail;
    
    if (!contactInfo) {
      return NextResponse.json(
        { error: 'Borrower contact information (phone or email) is missing' },
        { status: 400 }
      );
    }

    // Calculate repayment details
    const totalBorrowed = amount;
    const totalPaid = agreement.repayments 
      ? agreement.repayments.reduce((sum: number, repayment: any) => sum + (repayment.amount || 0), 0)
      : 0;
    const pendingAmount = totalBorrowed - totalPaid;

    // Format dates in human-readable format
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    // Convert booleans to natural language
    const strictModeText = strictMode ? 'strict' : 'flexible';
    const witnessApprovalText = witnessApproved ? 'approved' : 'pending approval';

    // Generate comprehensive agreement context string
    const agreementContext = `Agreement summary:
This is a personal lending agreement between two parties.

Borrower details:
Name: ${borrowerName}
Phone: ${borrowerPhone || 'Not provided'}
Email: ${borrowerEmail}

Lender details:
Name: ${lenderName}

Loan details:
Total amount borrowed: ${totalBorrowed}
Purpose of loan: ${purpose || 'Not specified'}

Repayment status:
Current status: ${status}
Amount already paid: ${totalPaid}
Remaining amount: ${pendingAmount}

Important dates:
Agreement created on: ${formatDate(createdAt)}
Due date: ${formatDate(dueDate)}
Buffer period allowed: ${bufferDays || 0} days

Trust and agreement conditions:
Trust score: ${trustScore || 80}
Agreement type: ${type}
Strict mode: ${strictModeText}

Witness information:
Witness name: ${witnessName || 'Not assigned'}
Witness approval status: ${witnessApprovalText}

Conversation behavior rules for the AI:
- You are a neutral mediator.
- Do not accuse, threaten, or pressure the borrower.
- Do not mention money amounts unless the borrower asks.
- Be calm, polite, and respectful.
- Focus on acknowledgment and clarity.
- End the call politely if the borrower sounds busy.`;

    // Prepare payload for Make.com webhook
    const webhookPayload = {
      agreementId: id,
      borrowerName,
      borrowerPhone: borrowerPhone || null,
      borrowerEmail,
      borrowerContact: contactInfo,
      lenderName,
      amount,
      dueDate,
      status,
      timestamp: new Date().toISOString(),
      agreementContext,
      triggeredBy,
    };

    // Get webhook URL from environment variables
    const webhookUrl = process.env.MAKE_CALL_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('MAKE_CALL_WEBHOOK_URL is not configured');
      return NextResponse.json(
        { error: 'MAKE_CALL_WEBHOOK_URL is not configured' },
        { status: 500 }
      );
    }

    console.log('Sending webhook to:', webhookUrl);
    console.log('Webhook payload:', JSON.stringify(webhookPayload, null, 2));

    // Send POST request to Make.com webhook
    let webhookResponse;
    try {
      webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      console.log('Webhook response status:', webhookResponse.status);
      
      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error('Make.com webhook error response:', errorText);
        // Don't fail the entire request if webhook fails
        // Just log it and continue
      } else {
        const responseData = await webhookResponse.text();
        console.log('Webhook success response:', responseData);
      }
    } catch (fetchError: any) {
      console.error('Webhook fetch error:', fetchError.message);
      // Don't fail the entire request if webhook fails
      // Just log it and continue
    }

    // Log the AI call request in the agreement's timeline
    agreement.timeline.push({
      event: 'AI Mediator Call Requested',
      date: new Date(),
      completed: true,
    });

    // Add system message to aiMessages
    const triggerText = triggeredBy === 'lender' ? 'lender' : 'borrower';
    agreement.aiMessages.push({
      role: 'system',
      content: `AI mediator call initiated by ${triggerText} for borrower ${borrowerName} at ${contactInfo}`,
      timestamp: new Date(),
    });

    await agreement.save();

    return NextResponse.json(
      {
        success: true,
        message: 'AI mediator call triggered successfully',
        agreementId: id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Ask AI Call Error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger AI call', details: error.message },
      { status: 500 }
    );
  }
}
