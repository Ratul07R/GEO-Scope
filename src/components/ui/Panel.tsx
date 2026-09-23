import type { ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  className?: string;
};

export function Panel({ children, className = "" }: PanelProps) {
  return (
    <section
      className={`rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] ${className}`}
    >
      {children}
    </section>
  );
}

type PanelHeaderProps = {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
};

export function PanelHeader({ title, meta, action }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] px-4 py-3.5 lg:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <h2 className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">
          {title}
        </h2>
        {meta}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}