"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Loader2, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { EmptyState } from "@/components/ui/EmptyState";
import { deleteBrand, deleteCompetitor, listBrands, type Brand } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { AddBrandModal } from "./AddBrandModal";
import { BrandDetailModal } from "./BrandDetailModal";

const accentButtonClass =
  "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-3.5 text-[13px] font-medium text-white shadow-[0_0_0_1px_rgba(94,106,210,0.35),0_12px_28px_-14px_rgba(94,106,210,0.95)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-accent-hover)]";

const ghostButtonClass =
  "inline-flex h-9 items-center justify-center rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] disabled:opacity-60";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const loadBrands = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setBrands([]);
        return;
      }
      const records = await listBrands(supabase, user.id);
      setBrands(records);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load brands.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBrands();
  }, [loadBrands]);

  function openDeleteDialog(brand: Brand) {
    setDeleteError("");
    setPendingDelete(brand);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    setDeleteError("");

    try {
      const competitors = pendingDelete.competitors ?? [];
      for (const c of competitors) {
        await deleteCompetitor(supabase, c.id);
      }
      await deleteBrand(supabase, pendingDelete.id);
      setPendingDelete(null);
      await loadBrands();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete brand.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brands"
        subtitle="Define the brands and competitors you want AI engines to track"
      >
        <button type="button" onClick={() => setModalOpen(true)} className={accentButtonClass}>
          <Plus size={15} />
          Add Brand
        </button>
      </PageHeader>

      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3">
          <p className="text-[13px] text-[var(--color-danger)]">{error}</p>
          <button type="button" onClick={() => void loadBrands()} className={ghostButtonClass}>
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          <span className="sr-only">Loading brands</span>
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className="h-[106px] animate-pulse rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]"
            />
          ))}
        </div>
      ) : brands.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<Building2 size={20} />}
            title="No brands yet"
            description="Add your first brand to start tracking"
          >
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className={`${accentButtonClass} w-full sm:w-auto`}
            >
              <Plus size={15} />
              Add your first brand
            </button>
          </EmptyState>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => {
            return (
              <Panel
                key={brand.id}
                className="group relative p-4 transition-colors hover:border-[var(--color-border-strong)]"
              >
                <div
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedBrand(brand)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") setSelectedBrand(brand);
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-[14px] font-medium text-[var(--color-text-primary)]">
                        {brand.name}
                      </h3>
                      <p className="mt-0.5 truncate text-[12px] text-[var(--color-text-tertiary)]">
                        {brand.domain && brand.domain.length > 0 ? brand.domain : "No domain"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openDeleteDialog(brand);
                      }}
                      aria-label={`Delete ${brand.name}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--color-text-tertiary)] opacity-0 transition-opacity hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)] focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    {(brand.competitors ?? []).length === 0 ? (
                      <span className="text-[11px] text-[var(--color-text-tertiary)]">
                        No competitors yet
                      </span>
                    ) : (
                      <>
                        {(brand.competitors ?? []).slice(0, 3).map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-text-secondary)]"
                          >
                            {c.name}
                          </span>
                        ))}
                        {(brand.competitors ?? []).length > 3 ? (
                          <span className="text-[10px] text-[var(--color-text-tertiary)]">
                            +{(brand.competitors ?? []).length - 3} more
                          </span>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      <AddBrandModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => void loadBrands()}
      />

      <BrandDetailModal
        brand={selectedBrand}
        onClose={() => setSelectedBrand(null)}
        onChanged={() => void loadBrands()}
      />

      {pendingDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) setPendingDelete(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-brand-title"
            className="w-full max-w-sm animate-[fadeUp_0.2s_ease-out] rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)]"
          >
            <h2
              id="delete-brand-title"
              className="text-[14px] font-semibold text-[var(--color-text-primary)]"
            >
              Delete brand?
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
              <span className="text-[var(--color-text-primary)]">{pendingDelete.name}</span> will
              be permanently removed from your tracked brands.
            </p>
            {deleteError ? (
              <p
                role="alert"
                className="mt-3 rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2 text-[12px] text-[var(--color-danger)]"
              >
                {deleteError}
              </p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className={ghostButtonClass}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deleting}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[var(--color-danger)] px-3.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : null}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}