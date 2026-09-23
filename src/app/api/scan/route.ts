import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { checkScanQuota, markStuckScansAsFailed } from "@/lib/db";
import { runScan } from "@/lib/scanner";

export const maxDuration = 300;

type ScanRequestBody = { brandId?: unknown };

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let body: ScanRequestBody;
    try {
      body = (await request.json()) as ScanRequestBody;
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const brandId = typeof body.brandId === "string" ? body.brandId : "";
    if (!brandId) {
      return NextResponse.json(
        { ok: false, error: "brandId is required" },
        { status: 400 }
      );
    }

    // Quota check (uses user.id)
    const quota = await checkScanQuota(supabase, user.id);
    if (!quota.ok) {
      const message = (() => {
        switch (quota.reason) {
          case "daily":
            return "You've used today's free scan. Come back tomorrow, or upgrade for more scans per day.";
          case "monthly":
            return "You've hit your monthly limit (10 scans/month on free plan). Upgrade to Pro for unlimited history.";
          case "global_hourly":
            return "The system is busy right now. Please try again in a few minutes.";
          case "global_daily":
            return "Today's scan capacity is full. Please try again tomorrow.";
          default:
            return "Unable to scan right now.";
        }
      })();

      return NextResponse.json(
        {
          ok: false,
          error: message,
          reason: quota.reason,
          userScansToday: quota.userScansToday,
          userScansThisMonth: quota.userScansThisMonth,
          userDailyLimit: quota.userDailyLimit,
          userMonthlyLimit: quota.userMonthlyLimit,
        },
        { status: 429 }
      );
    }

    // Fetch brand (RLS ensures user owns it)
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id, name, domain")
      .eq("id", brandId)
      .single();

    if (brandError || !brand) {
      return NextResponse.json(
        { ok: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    // Fetch competitors
    const { data: competitors, error: compError } = await supabase
      .from("competitors")
      .select("name")
      .eq("brand_id", brand.id);

    if (compError) {
      return NextResponse.json(
        { ok: false, error: compError.message },
        { status: 500 }
      );
    }

    const competitorNames = (competitors ?? []).map((c) => c.name);

    await markStuckScansAsFailed(supabase, brandId);

    const result = await runScan(
      supabase,
      brand.id,
      brand.name,
      brand.domain ?? "",
      competitorNames
    );

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
