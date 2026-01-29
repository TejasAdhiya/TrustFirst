import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agreement from '@/models/Agreement';

// POST - Extend due date using buffer days
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    // Get data from request body
    const body = await request.json();
    const { userId, extensionDays } = body;

    if (!userId || !extensionDays) {
      return NextResponse.json(
        { error: 'User ID and extension days are required' },
        { status: 400 }
      );
    }

    // Fetch the agreement from MongoDB
    const agreement = await Agreement.findById(id);

    if (!agreement) {
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      );
    }

    // Verify user is the borrower
    if (userId !== agreement.borrowerId) {
      return NextResponse.json(
        { error: 'Only borrower can extend due date' },
        { status: 403 }
      );
    }

    // Validate extension days
    if (extensionDays < 1 || extensionDays > agreement.bufferDays) {
      return NextResponse.json(
        { error: `Extension must be between 1 and ${agreement.bufferDays} days` },
        { status: 400 }
      );
    }

    // Calculate new due date
    const currentDueDate = new Date(agreement.dueDate);
    const newDueDate = new Date(currentDueDate);
    newDueDate.setDate(newDueDate.getDate() + extensionDays);

    // Calculate remaining buffer days
    const remainingBufferDays = agreement.bufferDays - extensionDays;

    // Format date for display
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    // Update agreement
    agreement.dueDate = newDueDate;
    agreement.bufferDays = remainingBufferDays;

    // Add timeline event
    agreement.timeline.push({
      event: `Due date extended by ${extensionDays} day(s)`,
      date: new Date(),
      completed: true,
    });

    // Add system message to chat
    agreement.aiMessages.push({
      role: 'system',
      content: `📅 Borrower extended the due date by ${extensionDays} day(s) using buffer time. New due date: ${formatDate(newDueDate)}.`,
      timestamp: new Date(),
    });

    await agreement.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Due date extended successfully',
        newDueDate,
        remainingBufferDays,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Extend Due Date Error:', error);
    return NextResponse.json(
      { error: 'Failed to extend due date', details: error.message },
      { status: 500 }
    );
  }
}
