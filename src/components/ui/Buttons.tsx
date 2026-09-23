import type { ReactNode } from "react";

type PrimaryButtonProps = {
  children: ReactNode;
  icon?: ReactNode;
  fullWidth?: boolean;
};

export function PrimaryButton({ children, icon, fullWidth = false }: PrimaryButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-3.5 text-[13px] font-medium text-white shadow-[0_0_0_1px_rgba(94,106,210,0.35),0_12px_28px_-14px_rgba(94,106,210,0.95)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-accent-hover)] ${
        fullWidth ? "w-full sm:w-auto" : ""
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

type GhostButtonProps = {
  children: ReactNode;
  icon?: ReactNode;
};

export function GhostButton({ children, icon }: GhostButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]"
    >
      {icon}
      {children}
    </button>
  );
}