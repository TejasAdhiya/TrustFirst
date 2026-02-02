import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Agreement from '@/models/Agreement';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    console.log('=== Upload Installment Proof Request ===');
    console.log('Agreement ID:', id);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const installmentIndex = parseInt(formData.get('installmentIndex') as string);

    console.log('File:', file?.name, 'Size:', file?.size, 'Type:', file?.type);
    console.log('Installment Index:', installmentIndex);

    if (!file) {
      console.error('No file provided in request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (isNaN(installmentIndex)) {
      console.error('Invalid installment index:', formData.get('installmentIndex'));
      return NextResponse.json(
        { error: 'Invalid installment index' },
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

    console.log('Agreement found. Has selectedInstallmentPlan?', !!agreement.selectedInstallmentPlan);
    console.log('Agreement object keys:', Object.keys(agreement.toObject()));

    if (!agreement.selectedInstallmentPlan) {
      console.error('Upload Error: No installment plan selected for agreement', id);
      console.error('Agreement data:', JSON.stringify(agreement.toObject(), null, 2));
      return NextResponse.json(
        { error: 'No installment plan selected. Please select a plan first.' },
        { status: 400 }
      );
    }

    console.log('Agreement has plan with', agreement.selectedInstallmentPlan.installments.length, 'installments');
    console.log('Uploading proof for installment index:', installmentIndex);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('File converted to buffer, size:', buffer.length, 'bytes');

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'installments', id);
    console.log('Upload directory:', uploadsDir);
    
    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log('Directory created/verified');
    } catch (error: any) {
      console.log('Directory already exists or error:', error.message);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `installment-${installmentIndex + 1}-${timestamp}.${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    console.log('Writing file to:', filePath);

    // Write file
    try {
      await writeFile(filePath, buffer);
      console.log('File written successfully');
    } catch (writeError: any) {
      console.error('Error writing file:', writeError);
      throw new Error(`Failed to write file: ${writeError.message}`);
    }

    // Generate public URL
    const proofUrl = `/uploads/installments/${id}/${fileName}`;
    console.log('Public URL:', proofUrl);

    // Update agreement
    if (agreement.selectedInstallmentPlan.installments[installmentIndex]) {
      agreement.selectedInstallmentPlan.installments[installmentIndex].proofUploaded = true;
      agreement.selectedInstallmentPlan.installments[installmentIndex].proofUrl = proofUrl;
      agreement.selectedInstallmentPlan.installments[installmentIndex].proofFileName = file.name;
      agreement.selectedInstallmentPlan.installments[installmentIndex].uploadedAt = new Date();

      // Mark the nested field as modified for Mongoose
      agreement.markModified('selectedInstallmentPlan');

      await agreement.save();

      console.log('Proof uploaded and saved successfully for installment', installmentIndex + 1);

      return NextResponse.json(
        { 
          message: 'Proof uploaded successfully', 
          proofUrl,
          fileName: file.name,
        },
        { status: 200 }
      );
    } else {
      console.error('Invalid installment index:', installmentIndex, 'Total installments:', agreement.selectedInstallmentPlan.installments.length);
      return NextResponse.json(
        { error: 'Invalid installment index' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Upload Proof Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload proof', details: error.message },
      { status: 500 }
    );
  }
}
