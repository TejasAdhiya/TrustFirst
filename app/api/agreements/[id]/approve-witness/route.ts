import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agreement from '@/models/Agreement';
import Notification from '@/models/Notification';
import { sendEmail, emailTemplates } from '@/lib/email';

// POST approve witness
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const agreement = await Agreement.findById(id);

    if (!agreement) {
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      );
    }

    // Update agreement
    agreement.witnessApproved = true;
    agreement.status = 'active';
    
    // Update timeline
    const witnessTimelineIndex = agreement.timeline.findIndex(
      (t: any) => t.event === 'Witness Approved'
    );
    if (witnessTimelineIndex !== -1) {
      agreement.timeline[witnessTimelineIndex].date = new Date();
      agreement.timeline[witnessTimelineIndex].completed = true;
    }

    await agreement.save();

    // Create notification for lender
    await Notification.create({
      userId: agreement.lenderId,
      type: 'witness_approved',
      title: 'Witness Approved',
      description: `${agreement.witnessName} approved your agreement with ${agreement.borrowerName}`,
      agreementId: agreement._id.toString(),
    });

    // Send email to lender
    if (agreement.lenderEmail && agreement.witnessName) {
      const lenderEmailTemplate = emailTemplates.witnessApproved(
        agreement.lenderName,
        agreement.witnessName,
        agreement._id.toString()
      );
      await sendEmail({
        to: agreement.lenderEmail,
        subject: lenderEmailTemplate.subject,
        html: lenderEmailTemplate.html,
      });
    }

    return NextResponse.json(
      { message: 'Witness approved successfully', agreement },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Approve Witness Error:', error);
    return NextResponse.json(
      { error: 'Failed to approve witness', details: error.message },
      { status: 500 }
    );
  }
}
