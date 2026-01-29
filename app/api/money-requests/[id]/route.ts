import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MoneyRequest from '@/models/MoneyRequest';

// GET single money request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const moneyRequest = await MoneyRequest.findById(id);

    if (!moneyRequest) {
      return NextResponse.json(
        { error: 'Money request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ moneyRequest }, { status: 200 });
  } catch (error: any) {
    console.error('Get Money Request Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch money request', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH update money request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const moneyRequest = await MoneyRequest.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!moneyRequest) {
      return NextResponse.json(
        { error: 'Money request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Money request updated successfully', moneyRequest },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update Money Request Error:', error);
    return NextResponse.json(
      { error: 'Failed to update money request', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE money request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const moneyRequest = await MoneyRequest.findByIdAndDelete(id);

    if (!moneyRequest) {
      return NextResponse.json(
        { error: 'Money request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Money request deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete Money Request Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete money request', details: error.message },
      { status: 500 }
    );
  }
}
