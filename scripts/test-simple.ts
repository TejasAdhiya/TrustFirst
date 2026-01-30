
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

console.log("Using Key:", GEMINI_API_KEY);

async function listModels() {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Response:", result.response.text());
    } catch (error: any) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Body:", await error.response.json());
        }
    }
}

listModels();
