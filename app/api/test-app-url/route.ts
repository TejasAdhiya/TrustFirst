import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
    message: 'This is the URL that will be used in emails',
  });
}
