"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, RefreshCw, ScanSearch } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { EmptyState } from "@/components/ui/EmptyState";
import { listScans, type ScanRecord } from "@/lib/db";
import { supabase } from "@/lib/supabase";

const retryButtonClass =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-2.5 text-[12px] font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]";

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

function scoreBadgeClass(score: number): string {
  if (score >= 80) return "bg-[var(--color-success)]/10 text-[var(--color-success)]";
  if (score >= 50) return "bg-[var(--color-warning)]/10 text-[var(--color-warning)]";
  return "bg-[var(--color-danger)]/10 text-[var(--color-danger)]";
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

export default function ScansPage() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadScans = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setScans([]);
        setLoading(false);
        return;
      }
      const records = await listScans(supabase, user.id);
      setScans(records);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load scans.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadScans();
  }, [loadScans]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scans"
        subtitle="Run prompts against AI engines and capture how your brand shows up"
      />

      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3">
          <p className="text-[13px] text-[var(--color-danger)]">{error}</p>
          <button type="button" onClick={() => void loadScans()} className={retryButtonClass}>
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-2" aria-busy="true">
          <span className="sr-only">Loading scans</span>
          {[0, 1, 2, 3].map((key) => (
            <div
              key={key}
              className="h-16 animate-pulse rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]"
            />
          ))}
        </div>
      ) : scans.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<ScanSearch size={20} />}
            title="No scans yet"
            description="No scans yet. Run a scan from a brand."
          />
        </Panel>
      ) : (
        <Panel>
          <ul className="divide-y divide-[var(--color-border-subtle)]">
            {scans.map((scan, index) => {
              const status = STATUS_META[scan.status] ?? STATUS_META.pending;
              const score = typeof scan.score === "number" ? scan.score : 0;
              return (
                <li key={scan.id}>
                  <Link
                    href={`/dashboard/scans/${scan.id}`}
                    className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--color-bg-elevated)] lg:px-5 ${
                      index % 2 === 1 ? "bg-[var(--color-bg-elevated)]/40" : ""
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-[var(--color-text-primary)]">
                        {scan.brand?.name ?? "Unknown brand"}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-[var(--color-text-tertiary)]">
                        {formatScanDate(scan.completed_at || scan.created_at)}
                      </span>
                    </span>
                    <span
                      className={`inline-flex h-6 shrink-0 items-center rounded-md px-2 text-[11px] font-semibold ${scoreBadgeClass(score)}`}
                    >
                      {score}/100
                    </span>
                    <span
                      className={`inline-flex h-6 shrink-0 items-center rounded-md px-2 text-[10px] font-medium uppercase tracking-[0.06em] ${status.className}`}
                    >
                      {status.label}
                    </span>
                    <ChevronRight size={15} className="shrink-0 text-[var(--color-text-tertiary)]" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </div>
  );
}
