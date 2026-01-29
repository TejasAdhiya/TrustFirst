import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { spawn } from "child_process";


export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save temp file
        const tempDir = join(process.cwd(), "tmp");
        // Ensure tmp dir exists
        try {
            await writeFile(join(tempDir, "test"), "");
        } catch {
            // If write fails, try to mkdir
            const fs = require('fs');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }
        }

        const tempFilePath = join(tempDir, `upload-${Date.now()}-${file.name}`);
        await writeFile(tempFilePath, buffer);

        // Spawn Python process
        return new Promise((resolve) => {
            const pythonProcess = spawn("python", ["scripts/extract_transaction_id.py", tempFilePath]);

            let outputData = "";
            let errorData = "";

            pythonProcess.stdout.on("data", (data) => {
                outputData += data.toString();
            });

            pythonProcess.stderr.on("data", (data) => {
                errorData += data.toString();
            });

            pythonProcess.on("close", async (code) => {
                // Cleanup temp file
                try {
                    await unlink(tempFilePath);
                } catch (e) {
                    console.error("Failed to delete temp file", e);
                }

                if (code !== 0) {
                    console.error("Python script error:", errorData);
                    resolve(
                        NextResponse.json(
                            { error: "Extraction process failed", details: errorData },
                            { status: 500 }
                        )
                    );
                    return;
                }

                try {
                    const result = JSON.parse(outputData);
                    if (result.error) {
                        resolve(NextResponse.json({ error: result.error }, { status: 500 }));
                    } else {
                        resolve(NextResponse.json(result));
                    }
                } catch (e) {
                    console.error("Failed to parse Python output:", outputData);
                    resolve(
                        NextResponse.json(
                            { error: "Invalid response from extraction script", details: outputData },
                            { status: 500 }
                        )
                    );
                }
            });
        });

    } catch (error: any) {
        console.error("Extraction Fatal Error:", error);
        return NextResponse.json(
            { error: "Failed to process request", details: error.message },
            { status: 500 }
        );
    }
}
