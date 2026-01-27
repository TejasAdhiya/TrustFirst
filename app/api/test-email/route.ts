import { NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function GET() {
  try {
    // Test email
    const testTemplate = emailTemplates.agreementRequest(
      "Test Lender",
      "Test Borrower",
      1000,
      new Date().toISOString(),
      "test123"
    );

    const result = await sendEmail({
      to: process.env.EMAIL_USER || "jeelnandha52@gmail.com",
      subject: testTemplate.subject,
      html: testTemplate.html,
    });

    return NextResponse.json({
      success: result.success,
      message: result.success ? "Test email sent successfully!" : "Failed to send email",
      details: result,
    });
  } catch (error: any) {
    console.error('Test Email Error:', error);
    return NextResponse.json(
      { error: 'Failed to send test email', details: error.message },
      { status: 500 }
    );
  }
}
