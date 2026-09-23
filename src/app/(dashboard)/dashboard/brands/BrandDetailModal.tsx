"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import {
  addCompetitor,
  deleteCompetitor,
  listCompetitors,
  type Brand,
  type Competitor,
} from "@/lib/db";
import { supabase } from "@/lib/supabase";

type BrandDetailModalProps = {
  brand: Brand | null;
  onClose: () => void;
  onChanged: () => void;
};

const inputClass =
  "h-10 w-full rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 text-[13px] text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)]";

const avatarClass =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-hover)] text-[11px] font-semibold text-white";

const SCAN_STATUS_MESSAGES = [
  "Warming up AI engines...",
  "Asking ChatGPT about your brand...",
  "Checking Perplexity's sources...",
  "Analyzing sentiment across responses...",
  "Comparing you against your competitors...",
  "Reviewing citation patterns...",
  "Aggregating visibility scores...",
  "Cross-referencing brand mentions...",
  "Detecting sentiment shifts...",
  "Finalizing your report...",
];

const SCAN_FACTS = [
  "AI engines mention brands 4× more when they have structured data.",
  "43% of AI answers cite the top 3 ranked brands.",
  "Perplexity citations carry more weight than ChatGPT mentions.",
  "Brands mentioned in the first 200 tokens get 3× more clicks.",
  "AI assistants quote sources with clear authorship signals.",
  "GEO matters 8× more for B2B brands than traditional SEO.",
];

export function BrandDetailModal({ brand, onClose, onChanged }: BrandDetailModalProps) {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanStartTime, setScanStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [rotateIndex, setRotateIndex] = useState(0);

  const loadCompetitors = useCallback(async (brandId: string) => {
    setLoading(true);
    setError("");
    try {
      const records = await listCompetitors(supabase, brandId);
      setCompetitors(records);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load competitors.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload competitors (and reset the form) whenever the modal opens for a brand.
  useEffect(() => {
    if (!brand) return;
    setName("");
    setDomain("");
    setError("");
    void loadCompetitors(brand.id);
  }, [brand, loadCompetitors]);

  // Close on Escape (disabled while a scan is running).
  useEffect(() => {
    if (!brand) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !scanning) onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [brand, onClose, scanning]);

  useEffect(() => {
    if (!scanning) {
      setScanStartTime(null);
      setElapsed(0);
      setRotateIndex(0);
      return;
    }
    const startedAt = Date.now();
    setScanStartTime(startedAt);
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [scanning]);

  useEffect(() => {
    if (!scanning) return;
    const rotate = setInterval(() => setRotateIndex((i) => i + 1), 5000);
    return () => clearInterval(rotate);
  }, [scanning]);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!brand) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Competitor name is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await addCompetitor(supabase, brand.id, trimmedName, domain.trim());
      setName("");
      setDomain("");
      await loadCompetitors(brand.id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add competitor. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(competitor: Competitor) {
    if (!brand) return;

    setDeletingId(competitor.id);
    setError("");

    try {
      await deleteCompetitor(supabase, competitor.id);
      await loadCompetitors(brand.id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete competitor.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleScan() {
    if (!brand) return;
    setScanning(true);
    setScanError("");
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: brand.id }),
      });

      // Handle non-JSON responses (e.g., Vercel 504 timeout HTML page)
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          "Scan took too long and timed out. Please try again — the system has been configured for longer scans."
        );
      }

      const data: unknown = await res.json();
      if (!data || typeof data !== "object" || (data as { ok?: unknown }).ok !== true) {
        const message =
          data && typeof data === "object"
            ? (data as { error?: unknown }).error
            : null;
        throw new Error(
          typeof message === "string" && message.length > 0 ? message : "Scan failed"
        );
      }
      const result = data as {
        scanId?: unknown;
        score?: unknown;
        mentioned?: unknown;
        totalPrompts?: unknown;
      };
      // Navigate to the full result page; onChanged/onClose still fire first.
      window.location.href = `/dashboard/scans/${String(result.scanId)}`;
      onChanged();
      onClose();
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }

  if (!brand) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !scanning) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="brand-detail-title"
        className="w-full max-w-md animate-[fadeUp_0.2s_ease-out] rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border-subtle)] px-5 py-4">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className={avatarClass}>{brand.name.charAt(0).toUpperCase()}</span>
            <div className="min-w-0">
              <h2
                id="brand-detail-title"
                className="truncate text-[14px] font-semibold text-[var(--color-text-primary)]"
              >
                {brand.name}
              </h2>
              <p className="mt-0.5 truncate text-[12px] text-[var(--color-text-tertiary)]">
                {brand.domain && brand.domain.length > 0 ? brand.domain : "No domain"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (scanning) return;
              onClose();
            }}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={scanning}
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          {scanError ? (
            <p
              role="alert"
              className="rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2 text-[12px] text-[var(--color-danger)]"
            >
              {scanError}
            </p>
          ) : null}

          {scanning ? (
            <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-4">
              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 10 }).map((_, i) => {
                  const estimatedProgress = Math.min(10, Math.floor((elapsed / 90) * 10));
                  const filled = i < estimatedProgress;
                  return (
                    <span
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                        filled
                          ? "bg-[var(--color-accent)]"
                          : "bg-[var(--color-bg-elevated)]"
                      }`}
                    />
                  );
                })}
              </div>

              {/* Counter + timer */}
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="font-medium text-[var(--color-text-secondary)]">
                  {Math.min(10, Math.floor((elapsed / 90) * 10))} / 10 queries
                </span>
                <span className="font-mono text-[var(--color-text-tertiary)]">
                  {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
                  {String(elapsed % 60).padStart(2, "0")}
                </span>
              </div>

              {/* Rotating status */}
              <div className="mt-4 flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[var(--color-accent)]" />
                <p className="text-[12px] leading-relaxed text-[var(--color-text-primary)]">
                  {SCAN_STATUS_MESSAGES[rotateIndex % SCAN_STATUS_MESSAGES.length]}
                </p>
              </div>

              {/* Rotating fact */}
              <div className="mt-3 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-2.5">
                <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
                  Did you know?
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
                  {SCAN_FACTS[rotateIndex % SCAN_FACTS.length]}
                </p>
              </div>

              {/* Warning line — do not close */}
              <p className="mt-3 text-center text-[10px] text-[var(--color-text-tertiary)]">
                Please don&apos;t close this window — your scan is running.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void handleScan()}
              className="h-10 w-full rounded-md bg-[var(--color-accent)] text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              Run scan
            </button>
          )}
          {!scanning ? (
            <p className="-mt-2 text-center text-[11px] text-[var(--color-text-tertiary)]">
              Takes ~30 seconds. Each scan uses 10 AI queries.
            </p>
          ) : null}

          <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">
            Competitors
          </p>

          {loading ? (
            <div className="space-y-2" aria-busy="true">
              <span className="sr-only">Loading competitors</span>
              {[0, 1, 2].map((key) => (
                <div
                  key={key}
                  className="h-11 animate-pulse rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]"
                />
              ))}
            </div>
          ) : competitors.length === 0 ? (
            <p className="py-4 text-center text-[12px] text-[var(--color-text-tertiary)]">
              No competitors yet. Add one below.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {competitors.map((competitor) => (
                <li
                  key={competitor.id}
                  className="flex items-center gap-2.5 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2"
                >
                  <span className={avatarClass}>{competitor.name.charAt(0).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-[var(--color-text-primary)]">
                      {competitor.name}
                    </p>
                    {competitor.domain && competitor.domain.length > 0 ? (
                      <p className="truncate text-[11px] text-[var(--color-text-tertiary)]">
                        {competitor.domain}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDelete(competitor)}
                    disabled={deletingId !== null || scanning}
                    aria-label={`Delete ${competitor.name}`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === competitor.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error ? (
            <p
              role="alert"
              className="rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2 text-[12px] text-[var(--color-danger)]"
            >
              {error}
            </p>
          ) : null}

          <form
            onSubmit={handleAdd}
            className="flex items-center gap-2 border-t border-[var(--color-border-subtle)] pt-4"
          >
            <input
              id="competitor-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Competitor name"
              aria-label="Competitor name"
              autoFocus
              disabled={scanning}
              className={inputClass}
            />
            <input
              id="competitor-domain"
              type="text"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder="example.com"
              aria-label="Competitor domain (optional)"
              disabled={scanning}
              className={inputClass}
            />
            <button
              type="submit"
              disabled={submitting || scanning}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-md bg-[var(--color-accent)] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {submitting ? "Adding..." : "Add"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
