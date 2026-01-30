"use server"

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export interface Installment {
    date: string
    amount: number
    note?: string
}

export interface InstallmentPlan {
    planName: string
    description: string
    durationMonths: number
    totalAmount: number
    installments: Installment[]
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateInstallmentPlans(
    amount: number,
    currency: string = "INR",
    dueDate: string,
    borrowerName: string = "Borrower"
): Promise<{ plans?: InstallmentPlan[]; error?: string }> {
    if (!GEMINI_API_KEY) {
        console.error("Server Action: Missing GEMINI_API_KEY")
        return { error: "Gemini API key is not configured environment variable." }
    }

    // Use the premium model
    const modelName = "gemini-2.5-pro"; // Premium version requested

    const prompt = `
    You are an empathetic but professional financial mediator assistant for an app called Setu.
    Your goal is to generate 3 distinct, realistic, and fair installment repayment plans for a debt.
    
    CONTEXT:
    - Debt Amount: ${amount} ${currency}
    - Original Due Date: ${dueDate}
    - Borrower Name: ${borrowerName}
    - Today's Date: ${new Date().toISOString().split('T')[0]}

    REQUIREMENTS:
    1. Generate exactly 3 plans:
       - Plan A: "Aggressive Repayment" (Shortest time, higher installments, clears debt fast).
       - Plan B: "Balanced Approach" (Moderate installment amounts and duration).
       - Plan C: "Flexible/Ease-of-Mind" (Smaller installments over a longer period, prioritizing manageability).
    2. The sum of all 'amount' fields in 'installments' MUST equal exactly ${amount}.
    3. Installment dates should be logical (e.g., Monthly or Bi-weekly). Start the first installment soon (e.g., within 7-30 days).
    4. Provide a helpful description for each plan explaining who it's best for.
    
    OUTPUT FORMAT:
    Return strictly JSON matching the schema.
  `

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
                            date: { type: SchemaType.STRING, description: "ISO Date string YYYY-MM-DD" },
                            amount: { type: SchemaType.NUMBER },
                            note: { type: SchemaType.STRING }
                        },
                        required: ["date", "amount"]
                    }
                }
            },
            required: ["planName", "description", "installments", "totalAmount"]
        }
    } as any

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.7,
        }
    })

    // Retry Logic with Exponential Backoff
    const retries = 3;
    let lastError: any = null;

    for (let i = 0; i < retries; i++) {
        try {
            console.log(`[GeneratePlans] Attempt ${i + 1}/${retries} with ${modelName}`);

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            console.log(`[GeneratePlans] Success!`);

            try {
                const plans = JSON.parse(text) as InstallmentPlan[];
                return { plans };
            } catch (parseError) {
                console.error(`[GeneratePlans] JSON Parse error:`, parseError);
                throw new Error("Failed to parse AI response as JSON");
            }

        } catch (error: any) {
            lastError = error;
            console.warn(`[GeneratePlans] Attempt ${i + 1} failed: ${error.message}`);

            // Check if it's a 429 (Too Many Requests) or 503 (Service Unavailable)
            const isQuotaError = error.message?.includes('429') || error.status === 429;
            const isServiceError = error.message?.includes('503') || error.status === 503;

            if ((isQuotaError || isServiceError) && i < retries - 1) {
                const waitTime = 1000 * (2 ** i); // 1s, 2s, 4s...
                console.warn(`[GeneratePlans] Retrying in ${waitTime}ms...`);
                await delay(waitTime);
            } else {
                // If it's not a retryable error or we ran out of retries, we stop here (loop continues effectively, but logic dictates we re-throw if critical)
                // Actually, let's allow the loop to continue if it's a transient error, but break if it's a hard error? 
                // For simplicity as per user request: "if quota hit, retry".
                if (!isQuotaError && !isServiceError) {
                    break; // Don't retry specifically logic errors
                }
            }
        }
    }

    return { error: `Unable to generate plans. (Last Error: ${lastError?.message || 'Unknown'})` }
}
