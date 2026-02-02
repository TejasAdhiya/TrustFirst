import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agreement from '@/models/Agreement';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    console.log('=== Save Installment Plan Request ===');
    console.log('Agreement ID:', id);

    const { planIndex, planName, installments } = body;

    console.log('Plan:', planName, 'Index:', planIndex, 'Installments:', installments?.length);

    if (!installments || !Array.isArray(installments)) {
      console.error('Invalid installments data:', installments);
      return NextResponse.json(
        { error: 'Invalid installments data' },
        { status: 400 }
      );
    }

    const agreement = await Agreement.findById(id);

    if (!agreement) {
      console.error('Agreement not found:', id);
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      );
    }

    // Save the selected installment plan
    agreement.selectedInstallmentPlan = {
      planIndex,
      planName,
      installments: installments.map((inst: any) => ({
        date: inst.date,
        amount: inst.amount,
        note: inst.note || '',
        proofUploaded: false,
      })),
    };

    // Mark as modified for Mongoose
    agreement.markModified('selectedInstallmentPlan');

    const savedAgreement = await agreement.save();

    console.log('Installment plan saved successfully:', planName, 'with', installments.length, 'installments');
    console.log('Saved agreement has plan?', !!savedAgreement.selectedInstallmentPlan);

    // Verify by fetching again
    const verifyAgreement = await Agreement.findById(id);
    console.log('Verification: Agreement has plan?', !!verifyAgreement?.selectedInstallmentPlan);

    return NextResponse.json(
      { message: 'Installment plan saved successfully', agreement: savedAgreement },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Save Plan Error:', error);
    return NextResponse.json(
      { error: 'Failed to save plan', details: error.message },
      { status: 500 }
    );
  }
}
