import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
};

export function EmptyState({ icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
        {icon}
      </span>
      <h3 className="mt-4 text-[15px] font-medium text-[var(--color-text-primary)]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
        {description}
      </p>
      {children ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}