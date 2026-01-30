import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { uid, fcmToken } = await request.json();

        if (!uid || !fcmToken) {
            return NextResponse.json({ error: 'Missing uid or fcmToken' }, { status: 400 });
        }

        const updatedUser = await User.findOneAndUpdate(
            { uid },
            { $set: { fcmToken } },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Token saved', user: updatedUser }, { status: 200 });

    } catch (error: any) {
        console.error('Error saving FCM token:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
