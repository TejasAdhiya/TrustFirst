import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, ''); // Sanitize filename
        const filename = `${uniqueSuffix}-${originalName}`;

        // Ensure uploads directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore error if directory exists
        }

        const path = join(uploadDir, filename);

        await writeFile(path, buffer);
        console.log(`Uploaded file saved to ${path}`);

        const fileUrl = `/uploads/${filename}`;

        return NextResponse.json({
            success: true,
            fileUrl,
            fileName: file.name
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed', details: error.message },
            { status: 500 }
        );
    }
}
