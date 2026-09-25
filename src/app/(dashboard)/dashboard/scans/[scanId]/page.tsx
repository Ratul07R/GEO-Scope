"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
  const [expandedMentionId, setExpandedMentionId] = useState<string | null>(null);

  useEffect(() => {
    if (!scanId) return;
    setLoading(true);
    setError("");

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(scanId)) {
      setError("not_found");
      setLoading(false);
      return;
    }

    let active = true;
    getScanWithMentions(supabase, scanId)
      .then((result) => {
        if (!active) return;
        if (result === null) {
          setError("not_found");
        } else {
          setData(result);
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Could not load scan.");
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

  if (error === "not_found") {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-elevated)]">
          <svg
            className="h-5 w-5 text-[var(--color-text-tertiary)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
            <path d="M11 8v4" />
            <path d="M11 16h.01" />
          </svg>
        </div>
        <h2 className="mt-4 text-[15px] font-medium text-[var(--color-text-primary)]">
          Scan not found
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          This scan may have been deleted, or the link is incorrect.
        </p>
        <Link
          href="/dashboard/scans"
          className="mt-5 inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-accent)] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          Back to scans
        </Link>
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

      <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] px-4 py-3.5 lg:px-5">
          <div>
            <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)]">Query Results</h2>
            <p className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">{mentions.length} prompts analyzed · click any row to see AI response</p>
          </div>
          <div className="hidden shrink-0 items-center gap-3 text-[10px] text-[var(--color-text-tertiary)] md:flex">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />Mentioned</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--color-text-tertiary)]" />Not mentioned</span>
          </div>
        </div>
        <div className="divide-y divide-[var(--color-border-subtle)]">
          {mentions.map((mention) => {
            const isExpanded = expandedMentionId === mention.id;
            const isMentioned = mention.mentioned === true;
            return (
              <div key={mention.id}>
                <button type="button" onClick={() => setExpandedMentionId(isExpanded ? null : mention.id)} className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-bg-base)] lg:px-5">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isMentioned ? "bg-[var(--color-success)]" : "bg-[var(--color-text-tertiary)]"}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] text-[var(--color-text-primary)]">
                      {mention.prompt}
                    </span>
                    {mention.citation && (
                      <span className="mt-1 flex items-center gap-1 text-[11px] text-[var(--color-text-tertiary)]">
                        <svg
                          className="h-3 w-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        <span className="truncate">{mention.citation}</span>
                      </span>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {isMentioned && mention.position !== null && (
                      <span
                        title="Position among all brands mentioned in the response"
                        className="rounded-md bg-[var(--color-bg-elevated)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-secondary)]"
                      >
                        #{mention.position}
                      </span>
                    )}
                    {isMentioned && mention.sentiment && (
                      <span
                        title="AI's tone about your brand in this response"
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                          mention.sentiment === "positive"
                            ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                            : mention.sentiment === "negative"
                              ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                              : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {mention.sentiment.charAt(0).toUpperCase() +
                          mention.sentiment.slice(1)}
                      </span>
                    )}
                    <svg
                      className={`h-3.5 w-3.5 text-[var(--color-text-tertiary)] transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </button>
                {isExpanded && <div className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-4 py-3 lg:px-5">{isMentioned ? <><div className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">What the AI said</div><p className="mt-1.5 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">{mention.response_snippet ? <>…{mention.response_snippet}…</> : "Response snippet not available for this scan."}</p>{mention.response_text && <details className="mt-3 group"><summary className="cursor-pointer text-[11px] font-medium text-[var(--color-accent)] hover:underline">View full response</summary><pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-2.5 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">{mention.response_text}</pre></details>}</> : <><div className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">Why this matters</div><p className="mt-1.5 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">AI did not mention your brand when answering this query. This is a visibility gap — a competitor may have been recommended instead.</p>{mention.response_text && <details className="mt-3 group"><summary className="cursor-pointer text-[11px] font-medium text-[var(--color-accent)] hover:underline">See what AI answered instead</summary><pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-2.5 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">{mention.response_text}</pre></details>}</>}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] px-4 py-3.5 lg:px-5">
            <div>
              <div className="flex items-center gap-2">
                <Lightbulb size={14} className="text-[var(--color-accent)]" />
                <h2 className="text-[13px] font-semibold text-[var(--color-text-primary)]">Recommendations</h2>
                <span className="rounded-full bg-[var(--color-bg-elevated)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-secondary)]">{recommendations.length} actions</span>
              </div>
              <p className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">Prioritized roadmap to improve your AI visibility</p>
            </div>
          </div>
          <div className="divide-y divide-[var(--color-border-subtle)]">
            {recommendations.map((rec, index) => {
              const Icon = rec.severity === "critical" ? XCircle : rec.severity === "warning" ? AlertTriangle : CheckCircle2;
              const iconColor = rec.severity === "critical" ? "text-[var(--color-danger)]" : rec.severity === "warning" ? "text-[var(--color-warning)]" : "text-[var(--color-success)]";
              const priorityLabel = rec.priority === "critical" ? "Do first" : rec.priority === "important" ? "Next" : "Ongoing";
              const priorityClass = rec.priority === "critical" ? "bg-[var(--color-danger)]/10 text-[var(--color-danger)]" : rec.priority === "important" ? "bg-[var(--color-warning)]/10 text-[var(--color-warning)]" : "bg-[var(--color-accent)]/10 text-[var(--color-accent)]";
              return (
                <div key={rec.id} className="px-4 py-4 lg:px-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--color-bg-elevated)] text-[10px] font-semibold text-[var(--color-text-tertiary)]">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><Icon size={13} className={`shrink-0 ${iconColor}`} /><h3 className="text-[13px] font-medium text-[var(--color-text-primary)]">{rec.title}</h3><span className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${priorityClass}`}>{priorityLabel}</span></div>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">{rec.description}</p>
                    </div>
                  </div>
                  <div className="ml-9 mt-3 rounded-md border-l-2 border-[var(--color-accent)]/40 bg-[var(--color-bg-base)] px-3 py-2"><div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">Why this matters</div><p className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">{rec.whyMatters}</p></div>
                  <div className="ml-9 mt-3 space-y-2">{rec.steps.map((step, i) => <div key={i} className="rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-3"><div className="flex items-start gap-2"><span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/15 text-[9px] font-semibold text-[var(--color-accent)]">{i + 1}</span><div className="min-w-0 flex-1"><div className="text-[12px] font-medium text-[var(--color-text-primary)]">{step.action}</div><p className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">{step.detail}</p>{step.example && <p className="mt-1.5 text-[10px] italic leading-relaxed text-[var(--color-text-tertiary)]">{step.example}</p>}</div></div></div>)}</div>
                  <div className="ml-9 mt-3 flex flex-wrap items-center gap-2"><div className="flex items-center gap-1.5 rounded-md bg-[var(--color-bg-elevated)] px-2 py-1"><svg className="h-3 w-3 text-[var(--color-text-tertiary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg><span className="text-[10px] font-medium text-[var(--color-text-secondary)]">{rec.timeEstimate}</span></div><div className="flex items-center gap-1.5 rounded-md bg-[var(--color-success)]/10 px-2 py-1"><svg className="h-3 w-3 text-[var(--color-success)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 7 13.5 15.5 8.5 10.5 2 17" /><path d="M16 7h6v6" /></svg><span className="text-[10px] font-medium text-[var(--color-success)]">{rec.impactEstimate}</span></div></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
