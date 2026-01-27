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

    // Fetch the agreement from MongoDB
    const agreement = await Agreement.findById(id);

    if (!agreement) {
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      );
    }

    // Extract required data
    const { borrowerName, borrowerPhone, borrowerEmail, lenderName, amount, dueDate, status, trustScore } = agreement;

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

    // Generate agreement context string
    const agreementContext = `Agreement context:
Borrower has borrowed ${totalBorrowed}.
Borrower has already paid ${totalPaid}.
Pending amount is ${pendingAmount}.
Agreement status is ${status}.
Trust score is ${trustScore || 100}.
Tone should remain polite and non-confrontational.`;

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
    agreement.aiMessages.push({
      role: 'system',
      content: `AI mediator call initiated for borrower ${borrowerName} at ${contactInfo}`,
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
