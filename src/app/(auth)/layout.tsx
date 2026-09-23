import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-bg-base)] px-4 py-10 text-[var(--color-text-primary)]">
      <Logo size={30} withWordmark />

      <div className="mt-6 w-full max-w-sm animate-[fadeUp_0.4s_ease-out]">
        <section className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-5 sm:p-6">
          {children}
        </section>
      </div>
    </div>
  );
}
