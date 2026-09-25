import type { SupabaseClient } from "@supabase/supabase-js";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type Brand = {
  id: string;
  name: string;
  domain?: string;
  user_id: string;
  created_at: string;
  competitors?: Competitor[];
};

// ═══════════════════════════════════════════════════════════════
// Brands
// ═══════════════════════════════════════════════════════════════

export async function listBrands(
  client: SupabaseClient,
  userId: string
): Promise<Brand[]> {
  const { data, error } = await client
    .from("brands")
    .select("*, competitors(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Brand[];
}

export async function createBrand(
  client: SupabaseClient,
  userId: string,
  input: {
    name: string;
    domain?: string;
    competitors?: Array<{ name: string; domain?: string }>;
  }
): Promise<Brand> {
  const { data: brand, error: brandError } = await client
    .from("brands")
    .insert({
      name: input.name,
      domain: input.domain ?? "",
      user_id: userId,
    })
    .select()
    .single();

  if (brandError) throw new Error(brandError.message);
  if (!brand) throw new Error("Failed to create brand");

  if (input.competitors && input.competitors.length > 0) {
    const rows = input.competitors.map((c) => ({
      name: c.name,
      domain: c.domain ?? "",
      brand_id: brand.id,
    }));
    const { error: compError } = await client.from("competitors").insert(rows);
    if (compError) throw new Error(compError.message);
  }

  return brand as Brand;
}

export async function deleteBrand(
  client: SupabaseClient,
  brandId: string
): Promise<void> {
  // Competitors cascade via FK; scans/mentions cascade from brand too
  const { error } = await client.from("brands").delete().eq("id", brandId);
  if (error) throw new Error(error.message);
}

// ═══════════════════════════════════════════════════════════════
// Competitors
// ═══════════════════════════════════════════════════════════════

export type Competitor = {
  id: string;
  name: string;
  domain?: string;
  brand_id: string;
  created_at: string;
};

export async function listCompetitors(
  client: SupabaseClient,
  brandId: string
): Promise<Competitor[]> {
  const { data, error } = await client
    .from("competitors")
    .select("*")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Competitor[];
}

export async function addCompetitor(
  client: SupabaseClient,
  brandId: string,
  name: string,
  domain?: string
): Promise<Competitor> {
  const { data, error } = await client
    .from("competitors")
    .insert({ name, domain: domain ?? "", brand_id: brandId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Competitor;
}

export async function deleteCompetitor(
  client: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await client.from("competitors").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ═══════════════════════════════════════════════════════════════
// Scans + Mentions
// ═══════════════════════════════════════════════════════════════

export type ScanRecord = {
  id: string;
  brand_id: string;
  status: string;
  score: number | null;
  total_prompts: number | null;
  completed_at: string | null;
  created_at: string;
  brand?: { name: string };
};

export type MentionRecord = {
  id: string;
  scan_id: string;
  engine: string;
  prompt: string;
  mentioned: boolean | null;
  position: number | null;
  sentiment: string | null;
  citation: string | null;
  response_text?: string | null;
  response_snippet?: string | null;
  created_at: string;
};

export async function listScans(
  client: SupabaseClient,
  userId: string
): Promise<ScanRecord[]> {
  // Get user's brand IDs first
  const { data: brands, error: brandErr } = await client
    .from("brands")
    .select("id")
    .eq("user_id", userId);
  if (brandErr) throw new Error(brandErr.message);
  const brandIds = (brands ?? []).map((b) => b.id);
  if (brandIds.length === 0) return [];

  const { data, error } = await client
    .from("scans")
    .select("*, brand:brands(name)")
    .in("brand_id", brandIds)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ScanRecord[];
}

export async function getScanWithMentions(
  client: SupabaseClient,
  scanId: string
): Promise<{ scan: ScanRecord; mentions: MentionRecord[] } | null> {
  const { data: scan, error: scanErr } = await client
    .from("scans")
    .select("*, brand:brands(name)")
    .eq("id", scanId)
    .maybeSingle();

  if (scanErr) throw new Error(scanErr.message);
  if (!scan) return null;

  const { data: mentions, error: mentionErr } = await client
    .from("mentions")
    .select("*")
    .eq("scan_id", scanId)
    .order("created_at", { ascending: true });
  if (mentionErr) throw new Error(mentionErr.message);

  return {
    scan: scan as unknown as ScanRecord,
    mentions: (mentions ?? []) as MentionRecord[],
  };
}

export type DashboardStats = {
  totalScans: number;
  totalMentions: number;
  avgPosition: number | null;
  totalCompetitors: number;
  recentScans: Array<{
    id: string;
    brandName: string;
    score: number;
    status: string;
    createdAt: string;
    mentionedCount: number;
    totalPrompts: number;
  }>;
  scoreTrend: Array<{ date: string; score: number }>;
};

export type ScanQuotaCheck = {
  ok: boolean;
  reason?: "daily" | "monthly" | "global_daily" | "global_hourly";
  userScansToday: number;
  userScansThisMonth: number;
  globalScansToday: number;
  globalScansThisHour: number;
  userDailyLimit: number;
  userMonthlyLimit: number;
  globalDailyLimit: number;
  globalHourlyLimit: number;
};

// Per-user limits
const USER_DAILY_LIMIT = 1;
const USER_MONTHLY_LIMIT = 10;
// Global limits (across ALL users — protects OpenRouter API key)
const GLOBAL_DAILY_LIMIT = 30;
const GLOBAL_HOURLY_LIMIT = 15;

// ═══════════════════════════════════════════════════════════════
// Dashboard stats
// ═══════════════════════════════════════════════════════════════

export async function getDashboardStats(
  client: SupabaseClient,
  userId: string
): Promise<DashboardStats> {
  const empty: DashboardStats = {
    totalScans: 0,
    totalMentions: 0,
    avgPosition: null,
    totalCompetitors: 0,
    recentScans: [],
    scoreTrend: [],
  };

  // Brands + competitors
  const { data: brands, error: brandErr } = await client
    .from("brands")
    .select("id, competitors(id)")
    .eq("user_id", userId);
  if (brandErr) throw new Error(brandErr.message);
  if (!brands || brands.length === 0) return empty;

  const totalCompetitors = brands.reduce(
    (sum, b) => sum + ((b.competitors as unknown[])?.length ?? 0),
    0
  );

  const brandIds = brands.map((b) => b.id);

  // All scans for user's brands
  const { data: scans, error: scanErr } = await client
    .from("scans")
    .select("*, brand:brands(name)")
    .in("brand_id", brandIds)
    .order("created_at", { ascending: false });
  if (scanErr) throw new Error(scanErr.message);

  const allScans = (scans ?? []) as unknown as ScanRecord[];
  const totalScans = allScans.length;
  const scanIds = allScans.map((s) => s.id);

  // All mentions for these scans
  let allMentions: MentionRecord[] = [];
  if (scanIds.length > 0) {
    const { data: mentions, error: mentionErr } = await client
      .from("mentions")
      .select("*")
      .in("scan_id", scanIds);
    if (mentionErr) throw new Error(mentionErr.message);
    allMentions = (mentions ?? []) as MentionRecord[];
  }

  const mentionedRows = allMentions.filter((m) => m.mentioned === true);
  const totalMentions = mentionedRows.length;

  const positions = mentionedRows
    .map((m) => m.position)
    .filter((p): p is number => typeof p === "number");
  const avgPosition =
    positions.length > 0
      ? positions.reduce((a, b) => a + b, 0) / positions.length
      : null;

  const recentScans = allScans.slice(0, 4).map((s) => {
    const scanMentions = allMentions.filter((m) => m.scan_id === s.id);
    const mentionedCount = scanMentions.filter((m) => m.mentioned === true).length;
    return {
      id: s.id,
      brandName: s.brand?.name ?? "Unknown",
      score: s.score ?? 0,
      status: s.status ?? "pending",
      createdAt: s.created_at,
      mentionedCount,
      totalPrompts: s.total_prompts ?? 0,
    };
  });

  // 7-day trend
  const now = new Date();
  const days: Array<{ date: string; score: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayKey = d.toISOString().slice(0, 10);
    const dayScans = allScans.filter((s) => {
      const created = s.created_at.slice(0, 10);
      return created === dayKey && s.status === "completed";
    });
    const avgScore =
      dayScans.length > 0
        ? Math.round(
            dayScans.reduce((sum, s) => sum + (s.score ?? 0), 0) / dayScans.length
          )
        : 0;
    days.push({ date: dayKey, score: avgScore });
  }

  return {
    totalScans,
    totalMentions,
    avgPosition,
    totalCompetitors,
    recentScans,
    scoreTrend: days,
  };
}

// ═══════════════════════════════════════════════════════════════
// Scan quota (rate limiting)
// ═══════════════════════════════════════════════════════════════

export async function checkScanQuota(
  client: SupabaseClient,
  userId: string
): Promise<ScanQuotaCheck> {
  const now = Date.now();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const oneHourAgo = new Date(now - 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  // ─── GLOBAL checks first (cheapest, fail-fast) ───
  const { count: globalTodayCount, error: gdErr } = await client
    .from("scans")
    .select("*", { count: "exact", head: true })
    .gte("created_at", oneDayAgo);
  if (gdErr) throw new Error(gdErr.message);

  const { count: globalHourCount, error: ghErr } = await client
    .from("scans")
    .select("*", { count: "exact", head: true })
    .gte("created_at", oneHourAgo);
  if (ghErr) throw new Error(ghErr.message);

  const globalScansToday = globalTodayCount ?? 0;
  const globalScansThisHour = globalHourCount ?? 0;

  // Get user's brand IDs (needed for user-level checks)
  const { data: brands, error: brandErr } = await client
    .from("brands")
    .select("id")
    .eq("user_id", userId);
  if (brandErr) throw new Error(brandErr.message);

  const brandIds = (brands ?? []).map((b) => b.id);

  // ─── USER checks ───
  let userScansToday = 0;
  let userScansThisMonth = 0;

  if (brandIds.length > 0) {
    const { count: udCount, error: udErr } = await client
      .from("scans")
      .select("*", { count: "exact", head: true })
      .in("brand_id", brandIds)
      .gte("created_at", oneDayAgo);
    if (udErr) throw new Error(udErr.message);

    const { count: umCount, error: umErr } = await client
      .from("scans")
      .select("*", { count: "exact", head: true })
      .in("brand_id", brandIds)
      .gte("created_at", thirtyDaysAgo);
    if (umErr) throw new Error(umErr.message);

    userScansToday = udCount ?? 0;
    userScansThisMonth = umCount ?? 0;
  }

  // ─── Enforce in priority order ───

  // Global hourly first (most urgent)
  if (globalScansThisHour >= GLOBAL_HOURLY_LIMIT) {
    return {
      ok: false,
      reason: "global_hourly",
      userScansToday, userScansThisMonth,
      globalScansToday, globalScansThisHour,
      userDailyLimit: USER_DAILY_LIMIT,
      userMonthlyLimit: USER_MONTHLY_LIMIT,
      globalDailyLimit: GLOBAL_DAILY_LIMIT,
      globalHourlyLimit: GLOBAL_HOURLY_LIMIT,
    };
  }

  // Global daily
  if (globalScansToday >= GLOBAL_DAILY_LIMIT) {
    return {
      ok: false,
      reason: "global_daily",
      userScansToday, userScansThisMonth,
      globalScansToday, globalScansThisHour,
      userDailyLimit: USER_DAILY_LIMIT,
      userMonthlyLimit: USER_MONTHLY_LIMIT,
      globalDailyLimit: GLOBAL_DAILY_LIMIT,
      globalHourlyLimit: GLOBAL_HOURLY_LIMIT,
    };
  }

  // User daily
  if (userScansToday >= USER_DAILY_LIMIT) {
    return {
      ok: false,
      reason: "daily",
      userScansToday, userScansThisMonth,
      globalScansToday, globalScansThisHour,
      userDailyLimit: USER_DAILY_LIMIT,
      userMonthlyLimit: USER_MONTHLY_LIMIT,
      globalDailyLimit: GLOBAL_DAILY_LIMIT,
      globalHourlyLimit: GLOBAL_HOURLY_LIMIT,
    };
  }

  // User monthly
  if (userScansThisMonth >= USER_MONTHLY_LIMIT) {
    return {
      ok: false,
      reason: "monthly",
      userScansToday, userScansThisMonth,
      globalScansToday, globalScansThisHour,
      userDailyLimit: USER_DAILY_LIMIT,
      userMonthlyLimit: USER_MONTHLY_LIMIT,
      globalDailyLimit: GLOBAL_DAILY_LIMIT,
      globalHourlyLimit: GLOBAL_HOURLY_LIMIT,
    };
  }

  return {
    ok: true,
    userScansToday, userScansThisMonth,
    globalScansToday, globalScansThisHour,
    userDailyLimit: USER_DAILY_LIMIT,
    userMonthlyLimit: USER_MONTHLY_LIMIT,
    globalDailyLimit: GLOBAL_DAILY_LIMIT,
    globalHourlyLimit: GLOBAL_HOURLY_LIMIT,
  };
}

export async function markStuckScansAsFailed(
  client: SupabaseClient,
  brandId: string
): Promise<void> {
  // Mark any "running" scans older than 5 minutes as failed
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  await client
    .from("scans")
    .update({ status: "failed" })
    .eq("brand_id", brandId)
    .eq("status", "running")
    .lt("created_at", fiveMinAgo);
}
