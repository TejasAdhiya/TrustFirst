import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Group from '@/models/Group';
import User from '@/models/User';

// GET single group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const group = await Group.findById(id);

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ group }, { status: 200 });
  } catch (error: any) {
    console.error('Get Group Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH update group (add/remove members)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const group = await Group.findById(id);

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Add members
    if (body.addMemberEmails && Array.isArray(body.addMemberEmails)) {
      for (const email of body.addMemberEmails) {
        // Check if already a member
        const existingMember = group.members.find((m: any) => m.email === email);
        if (existingMember) continue;

        // Check if user exists
        const user = await User.findOne({ email: email.trim() });
        if (user) {
          group.members.push({
            userId: user.uid,
            name: user.name,
            email: user.email,
            joinedAt: new Date(),
          });
        }
      }
    }

    // Remove member
    if (body.removeMemberEmail) {
      group.members = group.members.filter(
        (m: any) => m.email !== body.removeMemberEmail
      );
    }

    // Update other fields
    if (body.name) group.name = body.name;
    if (body.description !== undefined) group.description = body.description;

    await group.save();

    return NextResponse.json(
      { message: 'Group updated successfully', group },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update Group Error:', error);
    return NextResponse.json(
      { error: 'Failed to update group', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const group = await Group.findByIdAndDelete(id);

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Group deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete Group Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete group', details: error.message },
      { status: 500 }
    );
  }
}
