import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';

// GET all notifications for a user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error: any) {
    console.error('Get Notifications Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: error.message },
      { status: 500 }
    );
  }
}

// POST create notification
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, type, title, description, agreementId } = body;

    if (!userId || !type || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      description,
      agreementId,
    });

    return NextResponse.json(
      { message: 'Notification created successfully', notification },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create Notification Error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Missing notificationId' },
        { status: 400 }
      );
    }

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Notification marked as read', notification },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update Notification Error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification', details: error.message },
      { status: 500 }
    );
  }
}
