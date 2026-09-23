"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, X } from "lucide-react";
import { createBrand } from "@/lib/db";
import { supabase } from "@/lib/supabase";

type AddBrandModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
};

const inputClass =
  "h-10 w-full rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 text-[13px] text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)]";

const labelClass = "text-[12px] font-medium text-[var(--color-text-secondary)]";

export function AddBrandModal({ isOpen, onClose, onCreated }: AddBrandModalProps) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [competitors, setCompetitors] = useState<string[]>(["", "", ""]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset the form every time the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setDomain("");
    setCompetitors(["", "", ""]);
    setError("");
    setSubmitting(false);
  }, [isOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  function updateCompetitor(index: number, value: string) {
    setCompetitors((current) => current.map((entry, i) => (i === index ? value : entry)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Brand name is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const entries = competitors
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
        .map((value) => ({ name: value }));

      await createBrand(supabase, user.id, {
        name: trimmedName,
        domain: domain.trim(),
        competitors: entries,
      });

      onCreated();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create brand. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-brand-title"
        className="w-full max-w-md animate-[fadeUp_0.2s_ease-out] rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border-subtle)] px-5 py-4">
          <div className="min-w-0">
            <h2
              id="add-brand-title"
              className="text-[14px] font-semibold text-[var(--color-text-primary)]"
            >
              Add brand
            </h2>
            <p className="mt-0.5 text-[12px] text-[var(--color-text-secondary)]">
              Track a brand and its competitors across AI engines.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          {error ? (
            <p
              role="alert"
              className="rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2 text-[12px] text-[var(--color-danger)]"
            >
              {error}
            </p>
          ) : null}

          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="brand-name">
              Brand name
            </label>
            <input
              id="brand-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Acme Corp"
              autoFocus
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="brand-domain">
              Domain <span className="text-[var(--color-text-tertiary)]">(optional)</span>
            </label>
            <input
              id="brand-domain"
              type="text"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder="example.com"
              className={inputClass}
            />
          </div>

          <div className="space-y-2 border-t border-[var(--color-border-subtle)] pt-4">
            <p className={labelClass}>
              Competitors <span className="text-[var(--color-text-tertiary)]">(optional)</span>
            </p>
            {competitors.map((value, index) => (
              <input
                key={index}
                type="text"
                value={value}
                onChange={(event) => updateCompetitor(index, event.target.value)}
                placeholder={`Competitor ${index + 1} name`}
                aria-label={`Competitor ${index + 1} name`}
                className={inputClass}
              />
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[var(--color-border-subtle)] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
              {submitting ? "Creating..." : "Create brand"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}