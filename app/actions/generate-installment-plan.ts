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

// Validation function to ensure all installments are before due date
function validateInstallmentDates(plans: InstallmentPlan[], dueDate: string): boolean {
    const dueDateObj = new Date(dueDate)
    dueDateObj.setHours(23, 59, 59, 999) // End of due date
    
    for (const plan of plans) {
        for (const installment of plan.installments) {
            const installmentDate = new Date(installment.date)
            if (installmentDate > dueDateObj) {
                console.error(`Invalid installment date: ${installment.date} is after due date ${dueDate}`)
                return false
            }
        }
    }
    return true
}

// Function to fix installment dates if they exceed due date
function fixInstallmentDates(plans: InstallmentPlan[], dueDate: string): InstallmentPlan[] {
    const dueDateObj = new Date(dueDate)
    const today = new Date()
    
    return plans.map(plan => {
        const fixedInstallments = plan.installments.map((installment, index) => {
            const installmentDate = new Date(installment.date)
            
            // If installment date is after due date, recalculate
            if (installmentDate > dueDateObj) {
                // Distribute installments evenly between today and due date
                const totalInstallments = plan.installments.length
                const timeSpan = dueDateObj.getTime() - today.getTime()
                const intervalMs = timeSpan / (totalInstallments + 1)
                
                const newDate = new Date(today.getTime() + (intervalMs * (index + 1)))
                
                return {
                    ...installment,
                    date: newDate.toISOString().split('T')[0]
                }
            }
            
            return installment
        })
        
        return {
            ...plan,
            installments: fixedInstallments
        }
    })
}

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

    // Calculate days until due date
    const today = new Date()
    const dueDateObj = new Date(dueDate)
    const daysUntilDue = Math.ceil((dueDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const monthsUntilDue = Math.floor(daysUntilDue / 30)

    const prompt = `
    You are an empathetic but professional financial mediator assistant for an app called TrustFirst.
    Your goal is to generate 3 distinct, realistic, and fair installment repayment plans for a debt.
    
    CONTEXT:
    - Debt Amount: ${amount} ${currency}
    - Original Due Date: ${dueDate}
    - Days Until Due Date: ${daysUntilDue} days
    - Borrower Name: ${borrowerName}
    - Today's Date: ${new Date().toISOString().split('T')[0]}

    CRITICAL REQUIREMENTS:
    1. ALL INSTALLMENT DATES MUST BE ON OR BEFORE THE DUE DATE: ${dueDate}
       - This is MANDATORY. No installment can have a date after ${dueDate}.
       - The final installment MUST be on or before ${dueDate}.
    
    2. Generate exactly 3 plans based on available time until due date:
       - Plan A: "Aggressive Repayment" (${Math.max(2, Math.ceil(monthsUntilDue * 0.4))} months - Shortest time, higher installments, clears debt fast).
       - Plan B: "Balanced Approach" (${Math.max(3, Math.ceil(monthsUntilDue * 0.7))} months - Moderate installment amounts and duration).
       - Plan C: "Flexible Repayment" (${Math.max(4, monthsUntilDue)} months - Smaller installments spread over maximum available time).
    
    3. The sum of all 'amount' fields in 'installments' MUST equal exactly ${amount}.
    
    4. Installment dates should be logical:
       - Start the first installment within 7-14 days from today
       - Space installments evenly (monthly or bi-weekly depending on plan duration)
       - Ensure the LAST installment date is on or before ${dueDate}
    
    5. Provide a helpful description for each plan explaining who it's best for.
    
    6. Set durationMonths accurately based on the actual time span of installments.
    
    OUTPUT FORMAT:
    Return strictly JSON matching the schema. Remember: NO dates after ${dueDate}!
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
                let plans = JSON.parse(text) as InstallmentPlan[];
                
                // Validate that all installment dates are before due date
                const isValid = validateInstallmentDates(plans, dueDate)
                
                if (!isValid) {
                    console.warn(`[GeneratePlans] AI generated dates beyond due date. Fixing...`)
                    plans = fixInstallmentDates(plans, dueDate)
                    console.log(`[GeneratePlans] Dates fixed to respect due date: ${dueDate}`)
                }
                
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
