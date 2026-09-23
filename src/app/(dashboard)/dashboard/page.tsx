"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  ScanSearch,
  Target,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { PrimaryButton } from "@/components/ui/Buttons";
import { AreaChart, Sparkline } from "@/components/ui/Charts";
import { getDashboardStats, type DashboardStats } from "@/lib/db";
import { supabase } from "@/lib/supabase";

type Stat = {
  label: string;
  value: string;
  change: string;
  color: string;
  icon: typeof ScanSearch;
  spark: number[];
};

const SCAN_STATUS_META: Record<
  string,
  { label: string; pill: string; dot: string; pulse?: boolean }
> = {
  completed: {
    label: "Completed",
    pill: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    dot: "bg-[var(--color-success)]",
  },
  running: {
    label: "Running",
    pill: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
    dot: "bg-[var(--color-warning)]",
    pulse: true,
  },
  pending: {
    label: "Pending",
    pill: "bg-[var(--color-text-tertiary)]/10 text-[var(--color-text-secondary)]",
    dot: "bg-[var(--color-text-tertiary)]",
  },
  failed: {
    label: "Failed",
    pill: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
    dot: "bg-[var(--color-danger)]",
  },
};

const ROW_COLORS = ["#5e6ad2", "#4cb782", "#f2c94c", "#eb5757"];

function formatScanDay(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", { month: "short", day: "numeric" });
}

const engines = [
  { name: "ChatGPT", value: 72 },
  { name: "Perplexity", value: 64 },
  { name: "Gemini", value: 68 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const stats = await getDashboardStats(supabase, user.id);
        setStats(stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const trendScores = stats?.scoreTrend.map((day) => day.score) ?? [0, 0, 0, 0, 0, 0, 0];
  const latestScore = [...trendScores].reverse().find((value) => value > 0) ?? 0;
  const hasTrendData = trendScores.some((value) => value > 0);

  const statCards: Stat[] = [
    {
      label: "Total Scans",
      value: loading ? "—" : (stats?.totalScans ?? 0).toLocaleString(),
      change: "",
      color: "#5e6ad2",
      icon: ScanSearch,
      spark: stats?.scoreTrend.map((day) => day.score) ?? [20, 35, 28, 45, 42, 60, 72],
    },
    {
      label: "Brand Mentions",
      value: loading ? "—" : (stats?.totalMentions ?? 0).toLocaleString(),
      change: "",
      color: "#4cb782",
      icon: Building2,
      spark: [30, 42, 38, 55, 48, 62, 70, 78, 82],
    },
    {
      label: "Avg Position",
      value: loading || !stats?.avgPosition ? "—" : `#${stats.avgPosition.toFixed(1)}`,
      change: "",
      color: "#f2c94c",
      icon: Target,
      spark: [50, 45, 42, 40, 35, 32, 30, 28, 25],
    },
    {
      label: "Competitors",
      value: loading ? "—" : (stats?.totalCompetitors ?? 0).toLocaleString(),
      change: "",
      color: "#eb5757",
      icon: Users,
      spark: [5, 6, 7, 7, 8, 9, 10, 11, 12],
    },
  ];

  return (
    <div className="relative space-y-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/3 h-[300px] w-[min(560px,85vw)] -translate-x-1/2 rounded-full bg-[#5e6ad2] opacity-[0.07] blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-72 h-[260px] w-[min(420px,75vw)] rounded-full bg-[#4cb782] opacity-[0.05] blur-[120px]"
      />

      <div className="relative space-y-6">
        <PageHeader title="Dashboard" subtitle="Track your brand visibility across AI engines">
          <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-2 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-success)] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
            </span>
            Live
          </span>
          <PrimaryButton icon={<Plus size={15} />}>New Scan</PrimaryButton>
        </PageHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4 transition-colors hover:border-[var(--color-border-strong)]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(closest-side, ${stat.color}2e, transparent)`,
                  }}
                />
                <div className="relative flex items-start justify-between gap-2">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border-subtle)]"
                    style={{
                      color: stat.color,
                      backgroundColor: `${stat.color}1a`,
                      boxShadow: `0 0 22px -8px ${stat.color}`,
                    }}
                  >
                    <Icon size={16} strokeWidth={2} />
                  </span>
                </div>
                <div className="relative mt-4 flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
                      {stat.label}
                    </p>
                    <p className="mt-1.5 text-[24px] font-semibold leading-none tracking-tight text-[var(--color-text-primary)]">
                      {stat.value}
                    </p>
                  </div>
                  <Sparkline data={stat.spark} color={stat.color} animated />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <PanelHeader
              title="Recent Scans"
              meta={
                <span className="rounded-full bg-[var(--color-bg-elevated)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-secondary)]">
                  {stats?.recentScans.length ?? 0}
                </span>
              }
              action={
                <Link
                  href="/dashboard/scans"
                  className="text-[12px] font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
                >
                  View all →
                </Link>
              }
            />
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {loading ? (
                [0, 1, 2, 3].map((key) => (
                  <div
                    key={key}
                    aria-busy="true"
                    className="flex items-center gap-3 px-4 py-3 lg:px-5"
                  >
                    <span className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-[var(--color-bg-elevated)]" />
                    <span className="h-9 min-w-0 flex-1 animate-pulse rounded bg-[var(--color-bg-elevated)]" />
                  </div>
                ))
              ) : (stats?.recentScans.length ?? 0) === 0 ? (
                <p className="px-4 py-8 text-center text-[13px] text-[var(--color-text-tertiary)] lg:px-5">
                  No scans yet
                </p>
              ) : (
                stats?.recentScans.map((scan, index) => {
                  const status = SCAN_STATUS_META[scan.status] ?? SCAN_STATUS_META.pending;
                  const color = ROW_COLORS[index % ROW_COLORS.length];
                  return (
                    <div
                      key={scan.id}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-bg-elevated)] lg:px-5"
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[12px] font-semibold text-white"
                        style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}
                      >
                        {scan.brandName.charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-[var(--color-text-primary)]">
                          {scan.brandName}
                        </p>
                        <p className="truncate text-[11px] text-[var(--color-text-tertiary)]">
                          {formatScanDay(scan.createdAt)}
                        </p>
                      </div>
                      <span className="hidden shrink-0 text-[12px] text-[var(--color-text-secondary)] sm:block">
                        {scan.status === "completed"
                          ? `${scan.mentionedCount}/${scan.totalPrompts} mentions`
                          : scan.status === "failed"
                            ? "Scan failed"
                            : "Scanning..."}
                      </span>
                      <span
                        className={`flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium ${status.pill}`}
                      >
                        <span
                          className={`h-1 w-1 rounded-full ${status.dot} ${status.pulse ? "animate-pulse" : ""}`}
                        />
                        {status.label}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Visibility Trend"
              action={
                <span className="rounded bg-[var(--color-accent-muted)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-accent)]">
                  7-day trend
                </span>
              }
            />
            <div className="p-4 lg:p-5">
              <div className="flex flex-wrap items-baseline gap-2">
                <span
                  key={latestScore}
                  className="text-[32px] font-semibold leading-none tracking-[-0.02em] text-[var(--color-text-primary)] animate-soft-glow animate-roll-up"
                >
                  {latestScore}%
                </span>
              </div>
              <div className="mt-4">
                {hasTrendData ? (
                  <AreaChart data={trendScores} animated />
                ) : (
                  <p className="py-10 text-center text-[13px] text-[var(--color-text-tertiary)]">
                    No scans in last 7 days
                  </p>
                )}
              </div>
              <div className="mt-3 flex justify-between text-[10px] text-[var(--color-text-tertiary)]">
                <span>7 days ago</span>
                <span>Today</span>
              </div>
              <div className="mt-5 space-y-2.5 border-t border-[var(--color-border-subtle)] pt-4">
                {engines.map((engine) => (
                  <div key={engine.name} className="flex items-center gap-3 text-[11px]">
                    <span className="w-20 shrink-0 truncate text-[var(--color-text-tertiary)]">
                      {engine.name}
                    </span>
                    <span className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--color-bg-elevated)]">
                      <span
                        className="block h-full rounded-full bg-[var(--color-accent)] animate-grow-bar"
                        style={{ width: `${engine.value}%`, transformOrigin: "left" }}
                      />
                    </span>
                    <span className="w-8 shrink-0 text-right font-medium text-[var(--color-text-primary)]">
                      {engine.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}