import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agreement from '@/models/Agreement';
import { unlink } from 'fs/promises';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const { installmentIndex } = body;

    if (installmentIndex === undefined || isNaN(installmentIndex)) {
      return NextResponse.json(
        { error: 'Invalid installment index' },
        { status: 400 }
      );
    }

    const agreement = await Agreement.findById(id);

    if (!agreement) {
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      );
    }

    if (!agreement.selectedInstallmentPlan) {
      return NextResponse.json(
        { error: 'No installment plan selected' },
        { status: 400 }
      );
    }

    const installment = agreement.selectedInstallmentPlan.installments[installmentIndex];

    if (!installment) {
      return NextResponse.json(
        { error: 'Installment not found' },
        { status: 404 }
      );
    }

    // Delete file if it exists
    if (installment.proofUrl) {
      try {
        const filePath = path.join(process.cwd(), 'public', installment.proofUrl);
        await unlink(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
        // Continue even if file deletion fails
      }
    }

    // Update agreement
    installment.proofUploaded = false;
    installment.proofUrl = undefined;
    installment.proofFileName = undefined;
    installment.uploadedAt = undefined;

    await agreement.save();

    return NextResponse.json(
      { message: 'Proof removed successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Remove Proof Error:', error);
    return NextResponse.json(
      { error: 'Failed to remove proof', details: error.message },
      { status: 500 }
    );
  }
}
