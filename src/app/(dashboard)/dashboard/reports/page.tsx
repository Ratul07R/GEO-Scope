import { Calendar, ChevronDown, FileChartColumn, Mail, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { GhostButton, PrimaryButton } from "@/components/ui/Buttons";
import { EmptyState } from "@/components/ui/EmptyState";

const selectClassName =
  "h-9 w-full appearance-none rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] pl-8 pr-8 text-[13px] text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-accent)]";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Generate shareable visibility reports for your team and clients"
      >
        <PrimaryButton icon={<Plus size={15} />}>Generate report</PrimaryButton>
      </PageHeader>

      <Panel className="flex flex-wrap items-center gap-2 p-3">
        <label className="relative flex min-w-0 flex-1 items-center sm:max-w-[200px]">
          <span className="sr-only">Date range</span>
          <Calendar
            size={13}
            className="pointer-events-none absolute left-2.5 text-[var(--color-text-tertiary)]"
          />
          <select defaultValue="30d" className={selectClassName}>
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
          <PrimaryButton icon={<FileChartColumn size={15} />} fullWidth>
            Generate report
          </PrimaryButton>
          <GhostButton icon={<Mail size={14} />}>Schedule weekly</GhostButton>
        </EmptyState>
      </Panel>
    </div>
  );
}