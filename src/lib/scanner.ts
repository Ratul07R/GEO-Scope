import type { SupabaseClient } from "@supabase/supabase-js";
import { groq, GROQ_MODEL } from "@/lib/groq";
import { openrouter, CHAT_MODEL } from "@/lib/openrouter";
import { gemini, GEMINI_MODEL } from "@/lib/gemini";

const TOTAL_PROMPTS = 10;
const CITATION_RADIUS = 300;

export type ScanResult = {
  scanId: string;
  score: number;
  totalPrompts: number;
  mentioned: number;
};

async function callAI(prompt: string): Promise<string> {
  const messages = [{ role: "user" as const, content: prompt }];

  // Provider 1: Groq (most generous free tier)
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    });
    return completion.choices[0]?.message?.content ?? "";
  } catch (groqError) {
    console.error(
      "[scanner] Groq failed, falling back to Gemini:",
      groqError instanceof Error ? groqError.message : String(groqError)
    );
  }

  // Provider 2: Gemini
  try {
    const completion = await gemini.chat.completions.create({
      model: GEMINI_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    });
    return completion.choices[0]?.message?.content ?? "";
  } catch (geminiError) {
    console.error(
      "[scanner] Gemini failed, falling back to OpenRouter:",
      geminiError instanceof Error ? geminiError.message : String(geminiError)
    );
  }

  // Provider 3: OpenRouter
  try {
    const completion = await openrouter.chat.completions.create({
      model: CHAT_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    });
    return completion.choices[0]?.message?.content ?? "";
  } catch (openRouterError) {
    console.error(
      "[scanner] OpenRouter failed too:",
      openRouterError instanceof Error
        ? openRouterError.message
        : String(openRouterError)
    );
    throw new Error("All three AI providers failed for this prompt");
  }
}

function extractJsonArray(text: string): string[] {
  const fenceMatch = text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
  const rawMatch = text.match(/\[[\s\S]*\]/);
  const candidate = fenceMatch?.[1] ?? rawMatch?.[0];
  if (!candidate) return [];
  try {
    const parsed: unknown = JSON.parse(candidate);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p): p is string => typeof p === "string");
  } catch {
    return [];
  }
}

// Generate category-based discovery prompts. NO brand name in prompts.
async function generatePrompts(
  client: SupabaseClient,
  brandId: string,
  brandName: string,
  domain: string,
  competitorNames: string[]
): Promise<string[]> {
  // Check cache first
  const { data: cached, error: cacheError } = await client
    .from("brand_prompts")
    .select("prompt")
    .eq("brand_id", brandId)
    .limit(TOTAL_PROMPTS);

  if (!cacheError && cached && cached.length >= TOTAL_PROMPTS) {
    console.log("[scanner] using cached prompts");
    return cached.map((row) => row.prompt);
  }

  const instruction = `You are generating search queries for an AI visibility study.

Brand being studied: ${brandName}
Industry/category: infer from the domain "${domain}" and the competitors below.
Known competitors: ${competitorNames.join(", ") || "none provided"}

TASK: Generate exactly 10 realistic questions a potential customer would ask 
an AI assistant when researching this category.

STRICT RULES:
1. DO NOT include the brand name "${brandName}" anywhere.
2. DO NOT include competitor names either.
3. Prompts must be category-level discovery questions. Examples of STYLE:
   - "best project management tools for remote teams"
   - "how to organize personal notes efficiently"
   - "top CRM software for small businesses in 2026"
   - "which note-taking app has the best collaboration features"
4. Vary angles: use cases, comparisons by category, buying guides, 
   how-to questions, recommendations.
5. Each prompt must be a complete, natural question.

Return ONLY a JSON array of 10 strings. No markdown, no explanation.

Example: ["best tools for X", "which platform is easiest for Y", ...]`;

  let promptsToUse: string[] | null = null;
  try {
    const response = await callAI(instruction);
    const prompts = extractJsonArray(response);
    if (prompts.length >= TOTAL_PROMPTS) {
      promptsToUse = prompts.slice(0, TOTAL_PROMPTS);
    }
  } catch (err) {
    console.error("[scanner] prompt generation failed:", err);
  }

  if (!promptsToUse) {
    promptsToUse = [
      "best tools in this category for small teams",
      "top rated platforms for this use case",
      "which software do professionals recommend",
      "comparison of leading solutions in this space",
      "affordable options for startups",
      "enterprise grade platforms reviewed",
      "most popular tools used by teams in 2026",
      "beginner friendly tools for this category",
      "tools with best customer reviews",
      "which platform has the best free plan",
    ];
  }

  try {
    const rows = promptsToUse.map((prompt) => ({
      brand_id: brandId,
      prompt,
    }));
    const { error: saveError } = await client
      .from("brand_prompts")
      .insert(rows);
    if (saveError) {
      console.error("[scanner] failed to cache prompts:", saveError.message);
    } else {
      console.log("[scanner] cached prompts for brand", brandId);
    }
  } catch (err) {
    console.error("[scanner] prompt cache save threw:", err);
  }

  return promptsToUse;
}

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function runner() {
    while (true) {
      const current = nextIndex++;
      if (current >= items.length) return;
      results[current] = await worker(items[current], current);
    }
  }

  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => runner()
  );
  await Promise.all(runners);
  return results;
}

type AnalysisResult = {
  mentioned: boolean;
  position: number | null;
  sentiment: "positive" | "neutral" | "negative" | null;
  citation: string | null;
  snippet: string | null;
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function analyzeResponse(
  prompt: string,
  responseText: string,
  brandName: string,
  competitorNames: string[]
): AnalysisResult {
  void prompt;
  const lowerResponse = responseText.toLowerCase();
  const brandRegex = new RegExp(`\\b${escapeRegex(brandName.toLowerCase())}\\b`, "i");
  const mentioned = brandRegex.test(responseText);

  if (!mentioned) {
    return {
      mentioned: false,
      position: null,
      sentiment: null,
      citation: null,
      snippet: null,
    };
  }

  const matchIndex = lowerResponse.search(brandRegex);
  const snippetStart = Math.max(0, matchIndex - 150);
  const snippetEnd = Math.min(responseText.length, matchIndex + 150);
  const snippet = responseText.slice(snippetStart, snippetEnd).trim();

  const brandFirstIndex = matchIndex;
  const competitorFirstIndices: number[] = [];
  for (const comp of competitorNames) {
    const compRegex = new RegExp(`\\b${escapeRegex(comp.toLowerCase())}\\b`, "i");
    const idx = lowerResponse.search(compRegex);
    if (idx >= 0) competitorFirstIndices.push(idx);
  }
  const allFirstIndices = [brandFirstIndex, ...competitorFirstIndices].sort(
    (a, b) => a - b
  );
  const position = allFirstIndices.indexOf(brandFirstIndex) + 1;

  const context = lowerResponse.slice(snippetStart, snippetEnd);
  const positiveWords = ["best", "top", "leading", "popular", "recommend", "excellent", "powerful", "great", "ideal", "strong"];
  const negativeWords = ["worst", "poor", "avoid", "lacking", "expensive", "buggy", "slow", "difficult", "issue", "problem"];
  let positiveScore = 0;
  let negativeScore = 0;
  for (const w of positiveWords) if (context.includes(w)) positiveScore++;
  for (const w of negativeWords) if (context.includes(w)) negativeScore++;
  const sentiment: "positive" | "neutral" | "negative" =
    positiveScore > negativeScore
      ? "positive"
      : negativeScore > positiveScore
        ? "negative"
        : "neutral";

  const urlRegex = /https?:\/\/[^\s)"']+/g;
  const citationCandidates = responseText.match(urlRegex) ?? [];
  const citation = citationCandidates[0] ?? null;

  return { mentioned, position, sentiment, citation, snippet };
}

export async function runScan(
  client: SupabaseClient,
  brandId: string,
  brandName: string,
  domain: string,
  competitorNames: string[]
): Promise<ScanResult> {
  let scanId = "";
  let succeeded = 0;
  let mentionedCount = 0;

  try {
    const { data: scan, error: scanError } = await client
      .from("scans")
      .insert({
        brand_id: brandId,
        status: "running",
        total_prompts: TOTAL_PROMPTS,
      })
      .select()
      .single();
    if (scanError) throw new Error(scanError.message);
    scanId = scan.id;

    const prompts = await generatePrompts(
      client,
      brandId,
      brandName,
      domain,
      competitorNames
    );

    const CONCURRENCY = 4;
    const startTime = Date.now();

    await runWithConcurrency(prompts, CONCURRENCY, async (prompt, i) => {
      const t0 = Date.now();
      try {
        const responseText = await callAI(prompt);
        const elapsed = Date.now() - t0;
        console.log(`[scanner] prompt ${i + 1}/${prompts.length} took ${elapsed}ms`);
        const analysis = analyzeResponse(
          prompt,
          responseText,
          brandName,
          competitorNames
        );
        const { error: mentionError } = await client.from("mentions").insert({
          scan_id: scanId,
          engine: "gemini",
          prompt,
          mentioned: analysis.mentioned,
          position: analysis.position,
          sentiment: analysis.sentiment,
          citation: analysis.citation,
          response_text: responseText.slice(0, 4000),
          response_snippet: analysis.snippet,
        });
        if (mentionError) throw new Error(mentionError.message);
        if (analysis.mentioned) mentionedCount += 1;
        succeeded += 1;
      } catch (error) {
        console.error(
          `[scanner] prompt ${i + 1} failed after ${Date.now() - t0}ms:`,
          error
        );
        await client.from("mentions").insert({
          scan_id: scanId,
          engine: "gemini",
          prompt,
          mentioned: false,
          position: null,
          sentiment: null,
          citation: null,
        });
      }
    });

    console.log(`[scanner] total scan took ${Date.now() - startTime}ms`);

    if (succeeded === 0) {
      throw new Error("All prompt calls failed");
    }

    const score = Math.round((mentionedCount / TOTAL_PROMPTS) * 100);
    const { error: updateError } = await client
      .from("scans")
      .update({
        status: "completed",
        score,
        completed_at: new Date().toISOString(),
      })
      .eq("id", scanId);
    if (updateError) throw new Error(updateError.message);

    return { scanId, score, totalPrompts: TOTAL_PROMPTS, mentioned: mentionedCount };
  } catch (error) {
    if (scanId) {
      try {
        await client.from("scans").update({ status: "failed" }).eq("id", scanId);
      } catch (updateError) {
        console.error("runScan: failed to mark scan as failed", updateError);
      }
    }
    throw error;
  }
}
