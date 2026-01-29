import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
}

// Email Templates
export const emailTemplates = {
  agreementRequest: (lenderName: string, borrowerName: string, amount: number, dueDate: string, agreementId: string) => ({
    subject: `${lenderName} wants to create a lending agreement with you`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .amount { font-size: 32px; font-weight: bold; color: #10b981; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Setu AI</h1>
              <p>Trust & Transparency in Informal Finance</p>
            </div>
            <div class="content">
              <h2>Hi ${borrowerName},</h2>
              <p><strong>${lenderName}</strong> has created a lending agreement with you on Setu AI.</p>
              
              <div class="details">
                <h3>Agreement Details:</h3>
                <p><strong>Amount:</strong></p>
                <div class="amount">₹${amount.toLocaleString('en-IN')}</div>
                <p><strong>Expected Return Date:</strong> ${new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>

              <p>Please review and acknowledge this agreement in your Setu AI dashboard.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/agreement/${agreementId}" class="button">View Agreement</a>
              </div>

              <p style="color: #6b7280; font-size: 14px;">This is an informal lending agreement. Both parties trust each other to honor this commitment.</p>
            </div>
            <div class="footer">
              <p>© 2026 Setu AI. Building trust, one agreement at a time.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  witnessApprovalRequest: (lenderName: string, borrowerName: string, witnessName: string, agreementId: string) => ({
    subject: `${lenderName} wants you to witness their agreement`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Setu AI</h1>
              <p>Trust & Transparency in Informal Finance</p>
            </div>
            <div class="content">
              <h2>Hi ${witnessName},</h2>
              <p><strong>${lenderName}</strong> has requested you to be a witness for their lending agreement with <strong>${borrowerName}</strong>.</p>
              
              <div class="details">
                <h3>Your Role as Witness:</h3>
                <ul>
                  <li>Verify that both parties agree to the terms</li>
                  <li>You will NOT see the monetary amount</li>
                  <li>Your approval adds credibility to this agreement</li>
                </ul>
              </div>

              <p>Please review and approve this witness request in your Setu AI dashboard.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/agreement/${agreementId}" class="button">Review & Approve</a>
              </div>

              <p style="color: #6b7280; font-size: 14px;">As a witness, you're helping maintain trust in informal lending.</p>
            </div>
            <div class="footer">
              <p>© 2026 Setu AI. Building trust, one agreement at a time.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  witnessApproved: (lenderName: string, witnessName: string, agreementId: string) => ({
    subject: `${witnessName} approved your agreement`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #d1fae5; color: #065f46; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Setu AI</h1>
              <p>Trust & Transparency in Informal Finance</p>
            </div>
            <div class="content">
              <h2>Hi ${lenderName},</h2>
              
              <div class="success">
                <h3>✅ Witness Approved!</h3>
                <p><strong>${witnessName}</strong> has approved your agreement.</p>
              </div>

              <p>Your agreement now has witness verification, adding an extra layer of trust and credibility.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/agreement/${agreementId}" class="button">View Agreement</a>
              </div>
            </div>
            <div class="footer">
              <p>© 2026 Setu AI. Building trust, one agreement at a time.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  paymentReminder: (borrowerName: string, lenderName: string, amount: number, dueDate: string, daysRemaining: number, agreementId: string) => ({
    subject: `Payment reminder: ${daysRemaining} days until due date`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .amount { font-size: 32px; font-weight: bold; color: #f59e0b; margin: 20px 0; }
            .warning { background: #fef3c7; color: #92400e; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Payment Reminder</h1>
              <p>Setu AI</p>
            </div>
            <div class="content">
              <h2>Hi ${borrowerName},</h2>
              
              <div class="warning">
                <h3>⚠️ Payment Due Soon</h3>
                <p>Your payment to <strong>${lenderName}</strong> is due in <strong>${daysRemaining} days</strong>.</p>
              </div>

              <p><strong>Amount Due:</strong></p>
              <div class="amount">₹${amount.toLocaleString('en-IN')}</div>
              
              <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

              <p>Please ensure timely payment to maintain your trust score.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/agreement/${agreementId}" class="button">View Agreement</a>
              </div>
            </div>
            <div class="footer">
              <p>© 2026 Setu AI. Building trust, one agreement at a time.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};
