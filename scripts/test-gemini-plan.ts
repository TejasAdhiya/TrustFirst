
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import * as dotenv from "dotenv";

// Load env vars
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCsj30jdybWVuJUVkn7JSCDNxDy7C29jJE";

console.log("Testing with API Key ending in:", GEMINI_API_KEY.slice(-4));

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function testGenerate() {
    const modelName = "gemini-2.5-pro";
    const amount = 5000;

    const prompt = `Generate 3 installment plans for ${amount} INR debt. JSON output only.`;

    // Define schema for structured output
    const schema = {
        type: SchemaType.ARRAY,
        items: {
            type: SchemaType.OBJECT,
            properties: {
                planName: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                durationMonths: { type: SchemaType.NUMBER },
                totalAmount: { type: SchemaType.NUMBER },
                installments: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            date: { type: SchemaType.STRING },
                            amount: { type: SchemaType.NUMBER },
                        },
                        required: ["date", "amount"]
                    }
                }
            },
            required: ["planName", "description", "installments", "totalAmount"]
        }
    } as any;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    });

    const retries = 3;

    for (let i = 0; i < retries; i++) {
        try {
            console.log(`[Test] Attempt ${i + 1}/${retries} with ${modelName}`);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log(`[Test] Success! Response length: ${response.text().length}`);
            return;
        } catch (error: any) {
            console.warn(`[Test] Attempt ${i + 1} failed: ${error.message}`);
            if (error.response) {
                console.warn(`Response status: ${error.response.status}`);
            }
            const waitTime = 1000 * (2 ** i);
            console.warn(`[Test] Retrying in ${waitTime}ms...`);
            await delay(waitTime);
        }
    }
    console.error("❌ Max retries exceeded locally.");
}

testGenerate();
