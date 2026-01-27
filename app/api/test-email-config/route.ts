import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    emailUser: process.env.EMAIL_USER ? 'Set' : 'Not set',
    emailPassword: process.env.EMAIL_PASSWORD ? `Set (${process.env.EMAIL_PASSWORD.length} chars)` : 'Not set',
    emailHost: process.env.EMAIL_SERVER_HOST || 'Not set',
    emailPort: process.env.EMAIL_SERVER_PORT || 'Not set',
    emailFrom: process.env.EMAIL_FROM || 'Not set',
  });
}
