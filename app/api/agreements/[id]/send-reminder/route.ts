import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agreement from '@/models/Agreement';
import Notification from '@/models/Notification';
import { sendEmail, emailTemplates } from '@/lib/email';

// POST send payment reminder
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

    // Calculate days remaining
    const dueDate = new Date(agreement.dueDate);
    const today = new Date();
    const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Create notification for borrower
    if (agreement.borrowerId) {
      await Notification.create({
        userId: agreement.borrowerId,
        type: 'payment_due',
        title: 'Payment Reminder',
        description: `Payment to ${agreement.lenderName} is due in ${daysRemaining} days`,
        agreementId: agreement._id.toString(),
      });
    }

    // Send email to borrower
    const reminderEmailTemplate = emailTemplates.paymentReminder(
      agreement.borrowerName,
      agreement.lenderName,
      agreement.amount,
      agreement.dueDate,
      daysRemaining,
      agreement._id.toString()
    );
    await sendEmail({
      to: agreement.borrowerEmail,
      subject: reminderEmailTemplate.subject,
      html: reminderEmailTemplate.html,
    });

    return NextResponse.json(
      { message: 'Reminder sent successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Send Reminder Error:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder', details: error.message },
      { status: 500 }
    );
  }
}
