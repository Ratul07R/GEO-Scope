import OpenAI from "openai";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error("OPENROUTER_API_KEY is not set in .env.local");
}

export const openrouter = new OpenAI({
  apiKey,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "GeoScope",
  },
});

// Auto-router: picks the best available free model
export const CHAT_MODEL = "openrouter/free";
