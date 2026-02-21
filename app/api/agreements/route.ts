import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agreement from '@/models/Agreement';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { sendEmail, emailTemplates } from '@/lib/email';
import { sendNotification } from '@/lib/firebase-admin';

// GET all agreements for a user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Find agreements where user is either lender or borrower
    // Check both lenderId and borrowerId fields
    const agreements = await Agreement.find({
      $or: [
        { lenderId: userId },
        { borrowerId: userId },
        { borrowerEmail: { $exists: true } } // Fallback for old agreements
      ],
    }).sort({ createdAt: -1 });

    // Filter to only include agreements where user is actually involved
    const userAgreements = agreements.filter(agreement => {
      return agreement.lenderId === userId || agreement.borrowerId === userId;
    });

    return NextResponse.json({ agreements: userAgreements }, { status: 200 });
  } catch (error: any) {
    console.error('Get Agreements Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agreements', details: error.message },
      { status: 500 }
    );
  }
}

// POST create new agreement
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      lenderId,
      lenderName,
      lenderEmail,
      borrowerName,
      borrowerEmail,
      borrowerPhone,
      amount,
      purpose,
      dueDate,
      bufferDays,
      witnessName,
      witnessEmail,
      witnessPhone,
      proofFile,
    } = body;

    if (!lenderId || !lenderName || !lenderEmail || !borrowerName || !borrowerEmail || !amount || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // VALIDATION: Check if borrower exists in the database
    const borrowerUser = await User.findOne({ email: borrowerEmail });
    if (!borrowerUser) {
      return NextResponse.json(
        {
          error: 'Borrower not found',
          message: `${borrowerEmail} is not registered on TrustFirst. They must create an account first.`
        },
        { status: 404 }
      );
    }

    // VALIDATION: Check if witness exists in the database (if provided)
    if (witnessEmail) {
      const witnessUser = await User.findOne({ email: witnessEmail });
      if (!witnessUser) {
        return NextResponse.json(
          {
            error: 'Witness not found',
            message: `${witnessEmail} is not registered on TrustFirst. They must create an account first.`
          },
          { status: 404 }
        );
      }
    }

    // Create timeline
    const timeline = [
      { event: 'Agreement Created', date: new Date(), completed: true },
      { event: 'Witness Approved', date: witnessEmail ? null : new Date(), completed: !witnessEmail },
      { event: 'Money Sent', date: proofFile ? new Date() : null, completed: !!proofFile },
      { event: 'Payment Received', date: null, completed: false },
    ];

    // Create agreement
    const agreement = await Agreement.create({
      lenderId,
      lenderName,
      lenderEmail,
      borrowerId: borrowerUser.uid,
      borrowerName,
      borrowerEmail,
      borrowerPhone,
      amount,
      purpose,
      dueDate: new Date(dueDate),
      type: 'lent',
      status: witnessEmail ? 'pending_witness' : 'active',
      bufferDays: bufferDays || 3,
      witnessName,
      witnessEmail,
      witnessPhone,
      witnessApproved: !witnessEmail,
      lenderProof: proofFile ? {
        fileName: proofFile.fileName,
        fileUrl: proofFile.fileUrl,
        uploadedAt: new Date(),
      } : undefined,
      timeline,
      aiMessages: [
        {
          role: 'system',
          content: 'TrustFirst AI Mediator is ready to help with this agreement.',
          timestamp: new Date(),
        },
      ],
    });

    // Update lender's stats
    await User.findOneAndUpdate(
      { uid: lenderId },
      {
        $inc: { totalLent: amount, agreementCount: 1 },
      }
    );

    // Update borrower's stats
    await User.findOneAndUpdate(
      { uid: borrowerUser.uid },
      {
        $inc: { totalBorrowed: amount, agreementCount: 1 },
      }
    );

    // Create notification for lender
    await Notification.create({
      userId: lenderId,
      type: 'agreement_created',
      title: 'Agreement Created',
      description: `You created an agreement with ${borrowerName} for $${amount}`,
      agreementId: agreement._id.toString(),
    });

    // Create notification for borrower
    await Notification.create({
      userId: borrowerUser.uid,
      type: 'agreement_created',
      title: 'New Lending Agreement',
      description: `${lenderName} created a lending agreement with you for $${amount}`,
      agreementId: agreement._id.toString(),
    });

    // Send email to borrower
    const borrowerEmailTemplate = emailTemplates.agreementRequest(
      lenderName,
      borrowerName,
      amount,
      dueDate,
      agreement._id.toString()
    );
    await sendEmail({
      to: borrowerEmail,
      subject: borrowerEmailTemplate.subject,
      html: borrowerEmailTemplate.html,
    });

    // Send email to witness if provided
    if (witnessEmail && witnessName) {
      const witnessEmailTemplate = emailTemplates.witnessApprovalRequest(
        lenderName,
        borrowerName,
        witnessName,
        agreement._id.toString()
      );
      await sendEmail({
        to: witnessEmail,
        subject: witnessEmailTemplate.subject,
        html: witnessEmailTemplate.html,
      });
    }

    // Send Push Notification to Borrower
    if (borrowerUser.fcmToken) {
      await sendNotification(
        borrowerUser.fcmToken,
        "New Lending Agreement",
        `${lenderName} created a lending agreement with you for ₹${amount}`
      );
    }

    return NextResponse.json(
      { message: 'Agreement created successfully', agreement },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create Agreement Error:', error);
    return NextResponse.json(
      { error: 'Failed to create agreement', details: error.message },
      { status: 500 }
    );
  }
}
