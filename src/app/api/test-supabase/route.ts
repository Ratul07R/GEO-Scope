import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const client = getServiceClient();
    const results: Record<string, unknown> = {};

    // Test 1: Connection (list tables)
    const { error: brandErr, count: brandCount } = await client
      .from("brands")
      .select("*", { count: "exact", head: true });
    results.brands = brandErr ? { error: brandErr.message } : { count: brandCount };

    const { error: scanErr, count: scanCount } = await client
      .from("scans")
      .select("*", { count: "exact", head: true });
    results.scans = scanErr ? { error: scanErr.message } : { count: scanCount };

    const { error: profileErr, count: profileCount } = await client
      .from("profiles")
      .select("*", { count: "exact", head: true });
    results.profiles = profileErr ? { error: profileErr.message } : { count: profileCount };

    return NextResponse.json({
      ok: !brandErr && !scanErr && !profileErr,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      results,
    });
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
