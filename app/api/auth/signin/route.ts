import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { uid, email, name, photoURL, provider } = body;

    if (!uid || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: uid, email' },
        { status: 400 }
      );
    }

    // Find user by uid
    let user = await User.findOne({ uid });

    // If user doesn't exist, create new user (for Google sign-in)
    if (!user) {
      user = await User.create({
        uid,
        email,
        name: name || email.split('@')[0],
        photoURL: photoURL || '',
        provider: provider || 'email',
        trustScore: 70,
        totalLent: 0,
        totalBorrowed: 0,
        agreementCount: 0,
      });

      return NextResponse.json(
        { message: 'User created and signed in', user },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { message: 'User signed in successfully', user },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Signin API Error:', error);
    return NextResponse.json(
      { error: 'Failed to sign in user', details: error.message },
      { status: 500 }
    );
  }
}
