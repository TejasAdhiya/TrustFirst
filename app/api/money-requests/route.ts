import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MoneyRequest from '@/models/MoneyRequest';

// GET all money requests for a group
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      );
    }

    // Find all active money requests for the group
    const requests = await MoneyRequest.find({
      groupId,
      status: { $in: ['active', 'fulfilled'] }
    }).sort({ createdAt: -1 });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error: any) {
    console.error('Get Money Requests Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch money requests', details: error.message },
      { status: 500 }
    );
  }
}

// POST create new money request
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      groupId,
      requesterId,
      requesterName,
      requesterEmail,
      requesterPhone,
      amount,
      purpose,
      dueDate,
    } = body;

    if (!groupId || !requesterId || !requesterName || !requesterEmail || !amount || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create money request
    const moneyRequest = await MoneyRequest.create({
      groupId,
      requesterId,
      requesterName,
      requesterEmail,
      requesterPhone,
      amount,
      amountReceived: 0,
      amountRemaining: amount,
      purpose,
      dueDate,
      status: 'active',
      contributions: [],
    });

    return NextResponse.json(
      { message: 'Money request created successfully', moneyRequest },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create Money Request Error:', error);
    return NextResponse.json(
      { error: 'Failed to create money request', details: error.message },
      { status: 500 }
    );
  }
}
