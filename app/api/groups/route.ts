import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Group from '@/models/Group';
import User from '@/models/User';

// GET all groups for a user
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find all groups where user is a member or creator
    const groups = await Group.find({
      $or: [
        { createdBy: userId },
        { 'members.userId': userId }
      ]
    }).sort({ createdAt: -1 });

    return NextResponse.json({ groups }, { status: 200 });
  } catch (error: any) {
    console.error('Get Groups Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups', details: error.message },
      { status: 500 }
    );
  }
}

// POST create new group
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, description, createdBy, createdByName, createdByEmail, memberEmails } = body;

    if (!name || !createdBy || !createdByName || !createdByEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize members array with creator
    const members = [
      {
        userId: createdBy,
        name: createdByName,
        email: createdByEmail,
        joinedAt: new Date(),
      }
    ];

    // Add other members if provided
    if (memberEmails && Array.isArray(memberEmails)) {
      for (const email of memberEmails) {
        if (email === createdByEmail) continue; // Skip creator

        // Check if user exists
        const user = await User.findOne({ email: email.trim() });
        if (user) {
          members.push({
            userId: user.uid,
            name: user.name,
            email: user.email,
            joinedAt: new Date(),
          });
        }
      }
    }

    // Create group
    const group = await Group.create({
      name,
      description,
      createdBy,
      createdByName,
      createdByEmail,
      members,
    });

    return NextResponse.json(
      { message: 'Group created successfully', group },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create Group Error:', error);
    return NextResponse.json(
      { error: 'Failed to create group', details: error.message },
      { status: 500 }
    );
  }
}
