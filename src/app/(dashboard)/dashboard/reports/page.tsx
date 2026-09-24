import { Calendar, ChevronDown, FileChartColumn, Mail, Plus } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { EmptyState } from "@/components/ui/EmptyState";

const selectClassName =
  "h-9 w-full appearance-none rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] pl-8 pr-8 text-[13px] text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-accent)]";

const primaryButtonClass =
  "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-3.5 text-[13px] font-medium text-white shadow-[0_0_0_1px_rgba(94,106,210,0.35),0_12px_28px_-14px_rgba(94,106,210,0.95)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-accent-hover)] cursor-not-allowed opacity-60";

const ghostButtonClass =
  "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] cursor-not-allowed opacity-60";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center">
            <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[var(--color-text-primary)]">
              Reports
            </h1>
            <span className="ml-3 inline-flex items-center rounded-full bg-[var(--color-bg-elevated)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Coming soon
            </span>
          </div>
          <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
            Generate shareable visibility reports for your team and clients
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            disabled
            title="Report generation coming soon"
            className={primaryButtonClass}
          >
            <Plus size={15} />
            Generate report
          </button>
        </div>
      </div>

      <Panel className="flex flex-wrap items-center gap-2 p-3">
        <label className="relative flex min-w-0 flex-1 items-center sm:max-w-[200px]">
          <span className="sr-only">Date range</span>
          <Calendar
            size={13}
            className="pointer-events-none absolute left-2.5 text-[var(--color-text-tertiary)]"
          />
          <select defaultValue="30d" disabled className={selectClassName}>
            <option value="7d" className="bg-[var(--color-bg-base)]">
              Last 7 days
            </option>
            <option value="30d" className="bg-[var(--color-bg-base)]">
              Last 30 days
            </option>
            <option value="90d" className="bg-[var(--color-bg-base)]">
              Last 90 days
            </option>
          </select>
          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-2.5 text-[var(--color-text-tertiary)]"
          />
        </label>

        <label className="relative flex min-w-0 flex-1 items-center sm:max-w-[200px]">
          <span className="sr-only">AI engine</span>
          <select
            defaultValue="all"
            disabled
            className={`${selectClassName} pl-2.5`}
          >
            <option value="all" className="bg-[var(--color-bg-base)]">
              All engines
            </option>
            <option value="chatgpt" className="bg-[var(--color-bg-base)]">
              ChatGPT
            </option>
            <option value="perplexity" className="bg-[var(--color-bg-base)]">
              Perplexity
            </option>
            <option value="gemini" className="bg-[var(--color-bg-base)]">
              Gemini
            </option>
          </select>
          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-2.5 text-[var(--color-text-tertiary)]"
          />
        </label>

        <span className="hidden text-[11px] text-[var(--color-text-tertiary)] sm:block">
          Filters are placeholders
        </span>
      </Panel>

      <Panel>
        <EmptyState
          icon={<FileChartColumn size={20} />}
          title="No reports available"
          description="Reports summarise your visibility across engines into a single document you can share. Generate one to see it here."
        >
          <button
            type="button"
            disabled
            title="Report generation coming soon"
            className={`${primaryButtonClass} w-full sm:w-auto`}
          >
            <FileChartColumn size={15} />
            Generate report
          </button>
          <button
            type="button"
            disabled
            title="Report generation coming soon"
            className={ghostButtonClass}
          >
            <Mail size={14} />
            Schedule weekly
          </button>
        </EmptyState>
      </Panel>
    </div>
  );
}