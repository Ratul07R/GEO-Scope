"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { getScanWithMentions, type MentionRecord, type ScanRecord } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { generateRecommendations } from "@/lib/recommendations";
import { AlertTriangle, CheckCircle2, XCircle, Lightbulb } from "lucide-react";

type ScanData = {
  scan: ScanRecord;
  mentions: MentionRecord[];
};

function formatScanDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function scoreTone(score: number): string {
  if (score >= 80) return "var(--color-success)";
  if (score >= 50) return "var(--color-warning)";
  return "var(--color-danger)";
}

function sentimentBadgeClass(sentiment: string): string {
  if (sentiment === "positive") return "bg-[var(--color-success)]/10 text-[var(--color-success)]";
  if (sentiment === "negative") return "bg-[var(--color-danger)]/10 text-[var(--color-danger)]";
  return "bg-[var(--color-text-tertiary)]/10 text-[var(--color-text-secondary)]";
}

const STATUS_META: Record<string, { label: string; className: string }> = {
  completed: {
    label: "Completed",
    className: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  },
  failed: {
    label: "Failed",
    className: "bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  },
  running: {
    label: "Running",
    className: "bg-[var(--color-warning)]/10 text-[var(--color-warning)]",
  },
  pending: {
    label: "Pending",
    className: "bg-[var(--color-text-tertiary)]/10 text-[var(--color-text-secondary)]",
  },
};

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function ScanDetailPage() {
  const params = useParams<{ scanId: string }>();
  const scanId = typeof params.scanId === "string" ? params.scanId : "";
  const [data, setData] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!scanId) return;
    let active = true;
    setLoading(true);
    setError("");
    getScanWithMentions(supabase, scanId)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load scan.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [scanId]);

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <span className="sr-only">Loading scan</span>
        <div className="h-5 w-40 animate-pulse rounded bg-[var(--color-bg-surface)]" />
        <Panel className="p-6">
          <div className="mx-auto h-28 w-28 animate-pulse rounded-full bg-[var(--color-bg-surface)]" />
          <div className="mx-auto mt-4 h-4 w-48 animate-pulse rounded bg-[var(--color-bg-surface)]" />
        </Panel>
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((key) => (
            <div
              key={key}
              className="h-14 animate-pulse rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/scans"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={14} />
          Back to scans
        </Link>
        <div
          role="alert"
          className="rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2 text-[12px] text-[var(--color-danger)]"
        >
          {error || "Scan not found."}
        </div>
      </div>
    );
  }

  const { scan, mentions } = data;
  const brandName = scan.brand?.name ?? "Unknown brand";
  const score = typeof scan.score === "number" ? scan.score : 0;
  const recommendations = generateRecommendations(mentions);
  const mentionedMentions = mentions.filter(
    (mention) => mention.mentioned && typeof mention.position === "number"
  );
  const mentionedCount = mentions.filter((mention) => mention.mentioned).length;

  const positionValues = mentionedMentions.map(
    (mention) => mention.position as number
  );
  const avgPosition =
    positionValues.length > 0
      ? positionValues.reduce((sum, value) => sum + value, 0) / positionValues.length
      : null;
  const avgPositionLabel =
    avgPosition !== null ? `#${avgPosition.toFixed(1)}` : "—";

  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 } as Record<string, number>;
  for (const mention of mentions) {
    if (!mention.mentioned) continue;
    const key = mention.sentiment ?? "";
    if (key in sentimentCounts) sentimentCounts[key] += 1;
  }
  const dominantSentiment =
    sentimentCounts.positive > 0 || sentimentCounts.neutral > 0 || sentimentCounts.negative > 0
      ? sentimentCounts.positive >= sentimentCounts.neutral &&
        sentimentCounts.positive >= sentimentCounts.negative
        ? "Positive"
        : sentimentCounts.negative >= sentimentCounts.neutral
          ? "Negative"
          : "Neutral"
      : "—";

  const headline =
    score >= 80
      ? "Excellent visibility"
      : score >= 50
        ? "Moderate visibility"
        : "Low visibility";

  const status = STATUS_META[scan.status] ?? STATUS_META.pending;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/scans"
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
      >
        <ArrowLeft size={14} />
        Back to scans
      </Link>

      <div className="min-w-0">
        <h1 className="truncate text-[20px] font-semibold text-[var(--color-text-primary)]">
          {brandName}
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[var(--color-text-tertiary)]">
          <span>{formatScanDate(scan.completed_at || scan.created_at)}</span>
          <span
            className={`inline-flex h-5 items-center rounded px-1.5 text-[10px] font-medium uppercase tracking-[0.06em] ${status.className}`}
          >
            {status.label}
          </span>
        </p>
      </div>

      <Panel className="p-6">
        <div className="flex flex-col gap-6 items-center lg:flex-row lg:items-stretch">
          <div className="flex shrink-0 items-center justify-center">
            <div className="relative h-40 w-40">
              <svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90" aria-hidden>
                <circle
                  cx="60"
                  cy="60"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="var(--color-bg-elevated)"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={RING_RADIUS}
                  fill="none"
                  stroke={scoreTone(score)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={
                    RING_CIRCUMFERENCE * (1 - Math.min(Math.max(score, 0), 100) / 100)
                  }
                  className="animate-ring-draw"
                  style={
                    {
                      transition: "stroke-dashoffset 800ms ease-out",
                      "--ring-circumference": String(2 * Math.PI * RING_RADIUS),
                    } as CSSProperties
                  }
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[52px] font-semibold leading-none tracking-tight text-[var(--color-text-primary)]">
                  {score}
                </span>
                <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
                  out of 100
                </span>
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
              Visibility Score
            </p>
            <h2 className="mt-1 text-[17px] font-semibold text-[var(--color-text-primary)]">
              {headline}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { label: "Prompts analyzed", value: String(scan.total_prompts) },
                { label: "Brand mentioned", value: String(mentionedCount) },
                { label: "Avg position", value: avgPositionLabel },
                { label: "Sentiment", value: dominantSentiment },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3"
                >
                  <p className="text-[11px] text-[var(--color-text-tertiary)]">{stat.label}</p>
                  <p className="mt-1 text-[15px] font-semibold text-[var(--color-text-primary)]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="border-b border-[var(--color-border-subtle)] px-4 py-3.5 lg:px-5">
          <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)]">
            Query Results
          </h2>
          <p className="mt-0.5 text-[12px] text-[var(--color-text-tertiary)]">
            {mentions.length} prompts analyzed
          </p>
        </div>
        <ul className="divide-y divide-[var(--color-border-subtle)]">
            {mentions.map((mention, index) => (
              <li
                key={mention.id}
                className={`px-4 py-3 lg:px-5 ${index % 2 === 1 ? "bg-[var(--color-bg-elevated)]/40" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-label={mention.mentioned ? "Mentioned" : "Not mentioned"}
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      mention.mentioned
                        ? "bg-[var(--color-success)]"
                        : "bg-[var(--color-border-strong)]"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-relaxed text-[var(--color-text-primary)]">
                      {mention.prompt}
                    </p>
                    {mention.citation && mention.citation.length > 0 ? (
                      <a
                        href={mention.citation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 flex items-center gap-1 text-[11px] text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
                      >
                        <ExternalLink size={10} className="shrink-0" />
                        <span className="truncate">{mention.citation}</span>
                      </a>
                    ) : null}
                  </div>
                  {mention.mentioned ? (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className="inline-flex h-5 items-center rounded bg-[var(--color-accent-muted)] px-1.5 text-[10px] font-semibold text-[var(--color-accent)]">
                        #{mention.position ?? "?"}
                      </span>
                      {mention.sentiment ? (
                        <span
                          className={`inline-flex h-5 items-center rounded px-1.5 text-[10px] font-medium capitalize ${sentimentBadgeClass(mention.sentiment)}`}
                        >
                          {mention.sentiment}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
      </Panel>

      {recommendations.length > 0 && (
        <Panel className="p-6">
          <div className="flex items-center gap-2">
            <Lightbulb size={16} className="text-[var(--color-accent)]" />
            <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
              Recommendations
            </h2>
            <span className="rounded-full bg-[var(--color-bg-elevated)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-secondary)]">
              {recommendations.length} actions
            </span>
          </div>
          <p className="mt-1 text-[12px] text-[var(--color-text-tertiary)]">
            Based on your scan results — how to improve your AI visibility.
          </p>

          <div className="mt-5 space-y-3">
            {recommendations.map((rec) => {
              const Icon =
                rec.severity === "critical"
                  ? XCircle
                  : rec.severity === "warning"
                    ? AlertTriangle
                    : CheckCircle2;
              const iconColor =
                rec.severity === "critical"
                  ? "text-[var(--color-danger)]"
                  : rec.severity === "warning"
                    ? "text-[var(--color-warning)]"
                    : "text-[var(--color-success)]";
              const borderColor =
                rec.severity === "critical"
                  ? "border-l-[var(--color-danger)]"
                  : rec.severity === "warning"
                    ? "border-l-[var(--color-warning)]"
                    : "border-l-[var(--color-success)]";

              return (
                <div
                  key={rec.id}
                  className={`rounded-lg border border-[var(--color-border-subtle)] border-l-2 ${borderColor} bg-[var(--color-bg-base)] p-4`}
                >
                  <div className="flex items-start gap-3">
                    <Icon size={16} className={`mt-0.5 shrink-0 ${iconColor}`} />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[13px] font-medium text-[var(--color-text-primary)]">
                        {rec.title}
                      </h3>
                      <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
                        {rec.description}
                      </p>
                      <div className="mt-3 space-y-1.5">
                        {rec.actions.map((action, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11px]">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[var(--color-accent)]" />
                            <span className="text-[var(--color-text-secondary)]">{action}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 rounded-md bg-[var(--color-bg-elevated)] px-2.5 py-1.5 text-[10px] font-medium text-[var(--color-text-tertiary)]">
                        💡 {rec.estimatedImpact}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </div>
  );
}
