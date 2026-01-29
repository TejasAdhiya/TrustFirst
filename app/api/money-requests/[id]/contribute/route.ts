import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MoneyRequest from '@/models/MoneyRequest';
import Agreement from '@/models/Agreement';
import Notification from '@/models/Notification';
import { sendEmail, emailTemplates } from '@/lib/email';

// POST contribute to money request (lend partial amount)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const {
      lenderId,
      lenderName,
      lenderEmail,
      contributionAmount,
      witnessName,
      witnessEmail,
      witnessPhone,
      bufferDays,
    } = body;

    if (!lenderId || !lenderName || !lenderEmail || !contributionAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find money request
    const moneyRequest = await MoneyRequest.findById(id);

    if (!moneyRequest) {
      return NextResponse.json(
        { error: 'Money request not found' },
        { status: 404 }
      );
    }

    if (moneyRequest.status !== 'active') {
      return NextResponse.json(
        { error: 'Money request is not active' },
        { status: 400 }
      );
    }

    // Check if contribution amount is valid
    if (contributionAmount > moneyRequest.amountRemaining) {
      return NextResponse.json(
        { error: `Cannot contribute more than remaining amount (₹${moneyRequest.amountRemaining})` },
        { status: 400 }
      );
    }

    // Create agreement between lender and requester
    const agreement = await Agreement.create({
      lenderId,
      lenderName,
      lenderEmail,
      borrowerId: moneyRequest.requesterId,
      borrowerName: moneyRequest.requesterName,
      borrowerEmail: moneyRequest.requesterEmail,
      borrowerPhone: moneyRequest.requesterPhone,
      amount: contributionAmount,
      purpose: moneyRequest.purpose || `Group money request contribution`,
      createdDate: new Date(),
      dueDate: new Date(moneyRequest.dueDate),
      type: 'lent', // Contributor is lending money
      bufferDays: bufferDays || 3,
      witnessName: witnessName || '',
      witnessEmail: witnessEmail || '',
      witnessPhone: witnessPhone || '',
      witnessApproved: witnessEmail ? false : true,
      status: witnessEmail ? 'pending_witness' : 'active',
      trustScore: 100,
      strictMode: false,
      timeline: [
        {
          event: 'Agreement Created',
          date: new Date(),
          completed: true,
        },
        {
          event: 'Witness Approved',
          date: null,
          completed: witnessEmail ? false : true,
        },
        {
          event: 'Payment Received',
          date: null,
          completed: false,
        },
      ],
      aiMessages: [],
      groupContribution: true, // Mark as group contribution
      moneyRequestId: id, // Link to money request
    });

    // Update money request
    moneyRequest.amountReceived += contributionAmount;
    moneyRequest.amountRemaining -= contributionAmount;
    moneyRequest.contributions.push({
      lenderId,
      lenderName,
      lenderEmail,
      amount: contributionAmount,
      agreementId: agreement._id.toString(),
      contributedAt: new Date(),
    });

    // Check if fully funded
    if (moneyRequest.amountRemaining <= 0) {
      moneyRequest.status = 'fulfilled';
    }

    await moneyRequest.save();

    // Create notification for requester
    await Notification.create({
      userId: moneyRequest.requesterId,
      type: 'money_received',
      title: 'Money Contribution Received',
      description: `${lenderName} contributed ₹${contributionAmount} to your request`,
      agreementId: agreement._id.toString(),
    });

    // Send email to borrower (requester)
    const borrowerEmailTemplate = emailTemplates.agreementRequest(
      lenderName,
      moneyRequest.requesterName,
      contributionAmount,
      moneyRequest.dueDate,
      agreement._id.toString()
    );
    await sendEmail({
      to: moneyRequest.requesterEmail,
      subject: borrowerEmailTemplate.subject,
      html: borrowerEmailTemplate.html,
    });

    // Send email to witness if provided
    if (witnessEmail && witnessName) {
      const witnessEmailTemplate = emailTemplates.witnessApprovalRequest(
        lenderName,
        moneyRequest.requesterName,
        witnessName,
        agreement._id.toString()
      );
      await sendEmail({
        to: witnessEmail,
        subject: witnessEmailTemplate.subject,
        html: witnessEmailTemplate.html,
      });
    }

    return NextResponse.json(
      {
        message: 'Contribution successful',
        agreement,
        moneyRequest,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Contribute Error:', error);
    return NextResponse.json(
      { error: 'Failed to contribute', details: error.message },
      { status: 500 }
    );
  }
}
