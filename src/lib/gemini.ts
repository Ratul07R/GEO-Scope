import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in .env.local");
}

export const genAI = new GoogleGenerativeAI(apiKey);

export const geminiFlash = genAI.getGenerativeModel({
  model: "gemini-3.6-flash",
});
