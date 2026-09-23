import type { MentionRecord } from "./db";

export type Recommendation = {
  id: string;
  severity: "critical" | "warning" | "success";
  title: string;
  description: string;
  actions: string[];
  estimatedImpact: string;
};

type ScanMetrics = {
  totalPrompts: number;
  mentionedCount: number;
  mentionRate: number;
  avgPosition: number | null;
  positiveCount: number;
  negativeCount: number;
  citationCount: number;
  citationRate: number;
};

function computeMetrics(mentions: MentionRecord[]): ScanMetrics {
  const totalPrompts = mentions.length;
  const mentioned = mentions.filter((m) => m.mentioned === true);
  const mentionedCount = mentioned.length;
  const mentionRate = totalPrompts > 0 ? mentionedCount / totalPrompts : 0;

  const positions = mentioned
    .map((m) => m.position)
    .filter((p): p is number => typeof p === "number");
  const avgPosition =
    positions.length > 0
      ? positions.reduce((a, b) => a + b, 0) / positions.length
      : null;

  const positiveCount = mentioned.filter(
    (m) => m.sentiment === "positive"
  ).length;
  const negativeCount = mentioned.filter(
    (m) => m.sentiment === "negative"
  ).length;

  const citationCount = mentioned.filter((m) => m.citation).length;
  const citationRate = mentionedCount > 0 ? citationCount / mentionedCount : 0;

  return {
    totalPrompts,
    mentionedCount,
    mentionRate,
    avgPosition,
    positiveCount,
    negativeCount,
    citationCount,
    citationRate,
  };
}

export function generateRecommendations(
  mentions: MentionRecord[]
): Recommendation[] {
  const recs: Recommendation[] = [];
  const m = computeMetrics(mentions);

  if (m.totalPrompts === 0) return recs;

  // ── Visibility level ──
  if (m.mentionRate < 0.5) {
    recs.push({
      id: "low-visibility",
      severity: "critical",
      title: "Low AI visibility",
      description: `Your brand appears in only ${m.mentionedCount} of ${m.totalPrompts} AI queries. AI engines don't recognize you as a leader yet.`,
      actions: [
        "Publish comparison pages: 'YourBrand vs [Competitor]' — AI engines cite these heavily",
        "Get listed on 3-5 industry directories (G2, Crunchbase, industry-specific wikis)",
        "Add structured data (schema.org) to your website with clear brand info",
      ],
      estimatedImpact: "Potential +20 to +35 score in 4-8 weeks",
    });
  } else if (m.mentionRate >= 0.5 && m.mentionRate < 0.8) {
    recs.push({
      id: "growing-visibility",
      severity: "warning",
      title: "Growing visibility — room to lead",
      description: `You appear in ${m.mentionedCount} of ${m.totalPrompts} queries. You're in the conversation, but not yet the default choice.`,
      actions: [
        "Focus on the prompts where you're missing — see 'Query Results' above",
        "Publish case studies and success stories — AI engines value specific outcomes",
        "Get quoted in 2-3 industry publications (even small ones help)",
      ],
      estimatedImpact: "Potential +10 to +18 score in 3-6 weeks",
    });
  } else {
    recs.push({
      id: "strong-visibility",
      severity: "success",
      title: "Strong AI visibility",
      description: `You appear in ${m.mentionedCount} of ${m.totalPrompts} queries. AI engines recognize your brand. Focus on defending this position.`,
      actions: [
        "Keep publishing — consistency signals authority to AI engines",
        "Monitor competitor mentions weekly to detect threats early",
        "Deepen citations: link to authoritative external sources in your content",
      ],
      estimatedImpact: "Maintain current score and grow defensively",
    });
  }

  // ── Position quality ──
  if (m.avgPosition !== null && m.avgPosition > 2.0 && m.mentionRate >= 0.4) {
    recs.push({
      id: "position-gap",
      severity: "warning",
      title: "Ranking below #1 in AI answers",
      description: `Average mention position: #${m.avgPosition.toFixed(1)}. When AI answers questions, competitors are cited first.`,
      actions: [
        "Strengthen your brand's category positioning: own a specific niche",
        "Add FAQ schema markup to your homepage — this gets quoted by AI",
        "Publish a 'What is [Your Brand]?' page — AI engines pull these directly",
      ],
      estimatedImpact: `Move from #${m.avgPosition.toFixed(1)} to #1.5 range`,
    });
  }

  // ── Negative sentiment ──
  if (m.negativeCount > 0) {
    recs.push({
      id: "negative-sentiment",
      severity: "critical",
      title: "Negative sentiment detected",
      description: `${m.negativeCount} of your mentions carry negative sentiment. This impacts trust signals for AI engines.`,
      actions: [
        "Identify the sources of negative mentions in Query Results",
        "Publish a response or clarification piece if warranted",
        "Collect and highlight 5-10 positive customer testimonials on your site",
      ],
      estimatedImpact: "Prevent score decay; restore positive sentiment balance",
    });
  }

  // ── Citations ──
  if (m.mentionRate >= 0.5 && m.citationRate < 0.4) {
    recs.push({
      id: "low-citations",
      severity: "warning",
      title: "Few citations link to your brand",
      description: `Only ${m.citationCount} of ${m.mentionedCount} mentions include a source link. AI engines prioritize brands with clear source attribution.`,
      actions: [
        "Add a 'Press' or 'In the media' section to your site",
        "Submit your brand to 3-5 authoritative directories",
        "Publish original research or data — these get cited heavily",
      ],
      estimatedImpact: "+8 to +15 score from improved authority signals",
    });
  }

  return recs.slice(0, 4);
}