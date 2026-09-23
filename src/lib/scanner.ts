import type { SupabaseClient } from "@supabase/supabase-js";
import { openrouter, CHAT_MODEL } from "@/lib/openrouter";

const TOTAL_PROMPTS = 10;
const PROMPT_DELAY_MS = 200;
const CITATION_RADIUS = 300;

async function callAI(prompt: string): Promise<string> {
  const completion = await openrouter.chat.completions.create({
    model: CHAT_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  });
  return completion.choices[0]?.message?.content ?? "";
}

export type MentionSentiment = "positive" | "neutral" | "negative";

export type MentionAnalysis = {
  mentioned: boolean;
  position: number | null;
  sentiment: MentionSentiment | null;
  citation: string | null;
};

export type ScanResult = {
  scanId: string;
  score: number;
  totalPrompts: number;
  mentioned: number;
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function extractJsonArray(text: string): string[] | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("[");
  const end = candidate.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed: unknown = JSON.parse(candidate.slice(start, end + 1));
    if (!Array.isArray(parsed)) return null;
    const items = parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

function fallbackPrompts(brandName: string, competitors: string[]): string[] {
  const rival = competitors[0] ?? "its main competitor";
  return [
    `What is ${brandName} and what does it offer?`,
    `Is ${brandName} worth using?`,
    `How does ${brandName} compare to ${rival}?`,
    `What are the best alternatives to ${brandName}?`,
    `${brandName} pricing and plans explained`,
    `What are the pros and cons of ${brandName}?`,
    `Which is better: ${brandName} or ${rival}?`,
    `${brandName} reviews from real users`,
    `Does ${brandName} integrate with other tools?`,
    `Who should use ${brandName}?`,
  ];
}

function normalizePromptList(
  prompts: string[],
  brandName: string,
  competitors: string[]
): string[] {
  const unique = Array.from(
    new Set(prompts.map((prompt) => prompt.trim()).filter((prompt) => prompt.length > 0))
  );
  for (const fallback of fallbackPrompts(brandName, competitors)) {
    if (unique.length >= TOTAL_PROMPTS) break;
    if (!unique.includes(fallback)) unique.push(fallback);
  }
  return unique.slice(0, TOTAL_PROMPTS);
}

export async function generatePrompts(
  brandName: string,
  domain: string,
  competitors: string[]
): Promise<string[]> {
  const domainHint = domain ? ` The brand's website is ${domain}.` : "";
  const competitorHint =
    competitors.length > 0
      ? ` Known competitors to reference in comparison queries: ${competitors.join(", ")}.`
      : "";
  const instruction =
    `Generate exactly ${TOTAL_PROMPTS} realistic search queries that a real user might type into an AI assistant ` +
    `when researching the brand "${brandName}".${domainHint}${competitorHint} ` +
    `Return ONLY a raw JSON array of ${TOTAL_PROMPTS} strings — no markdown fences, no numbering, no commentary.`;

  try {
    const text = await callAI(instruction);
    const parsed = extractJsonArray(text);
    if (parsed) {
      return normalizePromptList(parsed, brandName, competitors);
    }
    console.error("generatePrompts: could not parse Gemini output, using fallback prompts");
  } catch (error) {
    console.error("generatePrompts: Gemini call failed, using fallback prompts", error);
  }
  return normalizePromptList(fallbackPrompts(brandName, competitors), brandName, competitors);
}

export function analyzeResponse(
  prompt: string,
  responseText: string,
  brandName: string,
  competitors: string[]
): MentionAnalysis {
  void prompt;

  const haystack = responseText.toLowerCase();
  const brand = brandName.trim().toLowerCase();
  const brandIndex = brand.length > 0 ? haystack.indexOf(brand) : -1;

  if (brandIndex === -1) {
    return { mentioned: false, position: null, sentiment: null, citation: null };
  }

  const candidates: Array<{ name: string; index: number }> = [{ name: brandName, index: brandIndex }];
  for (const competitor of competitors) {
    const name = competitor.trim().toLowerCase();
    if (name.length === 0) continue;
    const index = haystack.indexOf(name);
    if (index !== -1) candidates.push({ name: competitor, index });
  }
  candidates.sort((a, b) => a.index - b.index || a.name.length - b.name.length);
  const position = candidates.findIndex((candidate) => candidate.index === brandIndex) + 1;

  let sentiment: MentionSentiment = "neutral";
  if (position === 1) sentiment = "positive";
  else if (position > 1 && position <= 3) sentiment = "neutral";

  const windowStart = Math.max(0, brandIndex - CITATION_RADIUS);
  const window = responseText.slice(windowStart, brandIndex + CITATION_RADIUS);
  const citationMatch = window.match(/https?:\/\/[^\s\)\"']+/);
  const citation = citationMatch ? citationMatch[0] : null;

  return { mentioned: true, position, sentiment, citation };
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

    const prompts = await generatePrompts(brandName, domain, competitorNames);

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
