import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    // Test MongoDB connection
    await connectDB();

    // Test query
    const userCount = await User.countDocuments();

    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      userCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('MongoDB Test Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'MongoDB connection failed',
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
