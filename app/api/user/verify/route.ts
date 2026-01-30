import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { uid } = body;

        if (!uid) {
            return NextResponse.json(
                { error: 'Missing required field: uid' },
                { status: 400 }
            );
        }

        const user = await User.findOne({ uid });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (user.isVerified) {
            return NextResponse.json(
                { message: 'User is already verified', user },
                { status: 200 }
            );
        }

        // Update user: set isVerified to true and increase trustScore by 10
        // Ensure trustScore doesn't exceed 100
        const newTrustScore = Math.min(user.trustScore + 10, 100);

        const updatedUser = await User.findOneAndUpdate(
            { uid },
            {
                $set: {
                    isVerified: true,
                    trustScore: newTrustScore
                }
            },
            { new: true } // Return the updated document
        );

        return NextResponse.json(
            { message: 'Verification successful', user: updatedUser },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Verification API Error:', error);
        return NextResponse.json(
            { error: 'Failed to verify user', details: error.message },
            { status: 500 }
        );
    }
}
