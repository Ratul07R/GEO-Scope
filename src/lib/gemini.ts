import OpenAI from "openai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in .env.local");
}

export const gemini = new OpenAI({
  apiKey,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const GEMINI_MODEL = "gemini-2.5-flash";

