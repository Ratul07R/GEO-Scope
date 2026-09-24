import type { MentionRecord } from "./db";

export type RecommendationStep = {
  action: string;
  detail: string;
  example?: string;
};

export type Recommendation = {
  id: string;
  priority: "critical" | "important" | "growth";
  severity: "critical" | "warning" | "success";
  title: string;
  description: string;
  whyMatters: string;
  steps: RecommendationStep[];
  timeEstimate: string;
  impactEstimate: string;
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
  missingPromptCount: number;
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

  const positiveCount = mentioned.filter((m) => m.sentiment === "positive").length;
  const negativeCount = mentioned.filter((m) => m.sentiment === "negative").length;
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
    missingPromptCount: totalPrompts - mentionedCount,
  };
}

export function generateRecommendations(
  mentions: MentionRecord[]
): Recommendation[] {
  const recs: Recommendation[] = [];
  const m = computeMetrics(mentions);

  if (m.totalPrompts === 0) return recs;

  // ── PRIORITY 1: Visibility level (CRITICAL if low) ──
  if (m.mentionRate < 0.5) {
    recs.push({
      id: "low-visibility",
      priority: "critical",
      severity: "critical",
      title: "Low AI visibility — immediate action needed",
      description: `Your brand appears in only ${m.mentionedCount} of ${m.totalPrompts} AI queries (${Math.round(m.mentionRate * 100)}%). Most customers asking AI won't find you.`,
      whyMatters:
        "AI recommendations directly drive purchase decisions. If you're invisible, you're losing customers to competitors who AI recommends instead.",
      steps: [
        {
          action: "Publish 3 comparison pages",
          detail:
            "AI engines heavily cite 'X vs Y' content when answering comparison queries. Create one page per major competitor.",
          example:
            "Example: 'Notion vs Obsidian: which is better for teams in 2026'",
        },
        {
          action: "Get listed on 5 industry directories",
          detail:
            "AI models pull brand info from authoritative sources. Being on G2, Crunchbase, and industry wikis signals legitimacy.",
          example:
            "For SaaS: G2, Capterra, Product Hunt, Crunchbase, Wikipedia",
        },
        {
          action: "Add FAQ schema to your homepage",
          detail:
            "Structured data (JSON-LD) helps AI engines quote your answers directly in their responses.",
          example:
            "Use schema.org/FAQPage markup on your top 10 customer questions",
        },
      ],
      timeEstimate: "1-2 weeks",
      impactEstimate: "+20 to +35 score in 4-8 weeks",
    });
  } else if (m.mentionRate < 0.8) {
    recs.push({
      id: "growing-visibility",
      priority: "important",
      severity: "warning",
      title: "Growing visibility — push to become the default",
      description: `You appear in ${m.mentionedCount} of ${m.totalPrompts} queries. You're in the conversation, but AI doesn't yet recommend you first.`,
      whyMatters:
        "Being mentioned is good. Being #1 is 10x more valuable. AI engines cite the top-ranked brand most often in follow-up answers.",
      steps: [
        {
          action: "Focus on missing queries",
          detail: `${m.missingPromptCount} queries didn't mention you. Check the Query Results — they reveal exactly which topics you need content for.`,
          example:
            "If 'affordable' queries miss you, publish pricing comparison content",
        },
        {
          action: "Publish 2 case studies with real outcomes",
          detail:
            "AI engines prioritize specific, quantifiable results over generic marketing copy.",
          example:
            "'How Acme Corp reduced churn 34% using [your product]'",
        },
        {
          action: "Get quoted in 3 industry publications",
          detail:
            "Even small mentions on respected sites improve your entity authority in AI training data.",
          example:
            "Pitch guest posts to niche blogs, podcast appearances, expert roundups",
        },
      ],
      timeEstimate: "3-6 weeks",
      impactEstimate: "+10 to +18 score in 3-6 weeks",
    });
  } else {
    recs.push({
      id: "strong-visibility",
      priority: "growth",
      severity: "success",
      title: "Strong visibility — defend and expand",
      description: `You appear in ${m.mentionedCount} of ${m.totalPrompts} queries (${Math.round(m.mentionRate * 100)}%). AI engines already recognize your brand.`,
      whyMatters:
        "Strong positions decay if you stop publishing. Consistency is how AI maintains its 'memory' of your authority.",
      steps: [
        {
          action: "Publish weekly, consistently",
          detail:
            "AI engines reward regular publishing. Even one quality article per week maintains your signals.",
          example:
            "Schedule 4 blog posts, 1 case study, 1 industry roundup per month",
        },
        {
          action: "Monitor competitors weekly",
          detail:
            "Watch for competitors entering your top queries. Early detection = faster response.",
          example:
            "Run competitor scans every Monday morning",
        },
        {
          action: "Build a 'press' or 'in the media' page",
          detail:
            "A concentrated page of third-party mentions boosts your citation rate significantly.",
          example:
            "Collect all interviews, quotes, and reviews in one /press URL",
        },
      ],
      timeEstimate: "Ongoing",
      impactEstimate: "Maintain 80%+ and grow defensively",
    });
  }

  // ── PRIORITY 2: Position gap ──
  if (m.avgPosition !== null && m.avgPosition > 2.0 && m.mentionRate >= 0.4) {
    recs.push({
      id: "position-gap",
      priority: "important",
      severity: "warning",
      title: `Ranking #${m.avgPosition.toFixed(1)} on average — competitors cited first`,
      description: `When AI answers a query, other brands are typically named before yours. This dramatically reduces the chance customers click through to you.`,
      whyMatters:
        "Studies show the first-mentioned brand in AI responses gets 3-5x more customer attention. Position matters more than presence.",
      steps: [
        {
          action: "Own a narrow category",
          detail:
            "Instead of competing broadly, become the #1 answer for a specific niche AI queries about.",
          example:
            "Instead of 'project management tools' → 'project management for remote design teams'",
        },
        {
          action: "Add FAQ schema markup",
          detail:
            "Structured Q&A on your site is heavily quoted by AI engines — often placed first in responses.",
          example:
            "Implement schema.org/FAQPage on homepage and top product pages",
        },
        {
          action: "Publish 'What is [Your Brand]?' page",
          detail:
            "AI engines pull brand definitions directly. A clear, factual page becomes the source of truth.",
          example:
            "'Notion is a productivity and note-taking app developed by Notion Labs...'",
        },
      ],
      timeEstimate: "2-4 weeks",
      impactEstimate: `Move from #${m.avgPosition.toFixed(1)} to #1.5 range`,
    });
  }

  // ── PRIORITY 3: Negative sentiment ──
  if (m.negativeCount > 0) {
    recs.push({
      id: "negative-sentiment",
      priority: "critical",
      severity: "critical",
      title: `${m.negativeCount} negative mention${m.negativeCount > 1 ? "s" : ""} detected`,
      description:
        "AI is describing your brand negatively in some responses. This is more damaging than silence — it actively turns customers away.",
      whyMatters:
        "Negative sentiment compounds. AI models weight recent sentiment heavily when generating new responses.",
      steps: [
        {
          action: "Identify the source",
          detail:
            "Open the Query Results and read the full AI responses with negative sentiment. Note which claims or topics trigger it.",
          example:
            "Look for specific complaints, outdated info, or competitor bias",
        },
        {
          action: "Publish a clarification or update page",
          detail:
            "Directly address the source of negativity with facts. AI engines can pick this up as updated context.",
          example:
            "'Update: [Brand] has fixed X, now supports Y' or 'Our refund policy explained'",
        },
        {
          action: "Collect 10 positive testimonials",
          detail:
            "Distributed positive reviews shift the overall sentiment signal in your favor.",
          example:
            "Request reviews from 10 happy customers on G2, Trustpilot, or industry sites",
        },
      ],
      timeEstimate: "1-2 weeks",
      impactEstimate: "Prevent score decay, restore positive balance",
    });
  }

  // ── PRIORITY 4: Citations ──
  if (m.mentionRate >= 0.4 && m.citationRate < 0.5 && m.mentionedCount > 0) {
    recs.push({
      id: "low-citations",
      priority: "growth",
      severity: "warning",
      title: "AI mentions you, but rarely cites a source",
      description: `Only ${m.citationCount} of ${m.mentionedCount} mentions include a source URL (${Math.round(m.citationRate * 100)}%). AI engines trust brands with clear source attribution.`,
      whyMatters:
        "Cited brands have stronger entity authority. Over time, citations compound into higher rankings across all AI engines.",
      steps: [
        {
          action: "Create a 'Press' or 'In the media' section",
          detail:
            "Centralize every external mention, interview, and review in one page on your site.",
          example:
            "yoursite.com/press with logos and links to 15+ publications",
        },
        {
          action: "Publish original research or data",
          detail:
            "Original data is the most-cited content type across AI engines. Even small surveys work.",
          example:
            "'2026 State of AI Search' — survey 100 customers, publish findings",
        },
        {
          action: "Get 3 authoritative directory listings",
          detail:
            "High-authority directories (Wikipedia, industry bodies, G2) are frequently cited in AI responses.",
          example:
            "Submit to Crunchbase, LinkedIn company page, and your industry's main directory",
        },
      ],
      timeEstimate: "2-4 weeks",
      impactEstimate: "+8 to +15 score from authority signals",
    });
  }

  // Sort by priority: critical → important → growth
  const priorityOrder = { critical: 0, important: 1, growth: 2 };
  return recs
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 4);
}


