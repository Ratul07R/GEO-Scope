import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[var(--color-text-primary)]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{subtitle}</p>
        ) : null}
      </div>
      {children ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}
