import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { uid, email, name, phone, photoURL, provider } = body;

    if (!uid || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: uid, email, name' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists', user: existingUser },
        { status: 200 }
      );
    }

    // Create new user
    const newUser = await User.create({
      uid,
      email,
      name,
      phone: phone || '',
      photoURL: photoURL || '',
      provider: provider || 'email',
      trustScore: 70,
      totalLent: 0,
      totalBorrowed: 0,
      agreementCount: 0,
    });

    return NextResponse.json(
      { message: 'User created successfully', user: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    );
  }
}
