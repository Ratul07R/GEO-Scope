"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabase";

export function MarketingNav() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthed(Boolean(data.user));
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(Boolean(session?.user));
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]/80 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 lg:px-6">
        <Link href="/" className="flex items-center" aria-label="GeoScope home">
          <Logo size={24} withWordmark />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="#features"
            className="rounded-md px-3 py-1.5 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-md px-3 py-1.5 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
          >
            How it works
          </Link>
          <Link
            href="#pricing"
            className="rounded-md px-3 py-1.5 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
          >
            Pricing
          </Link>
          <Link
            href="#faq"
            className="rounded-md px-3 py-1.5 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
          >
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthed ? (
            <Link
              href="/dashboard"
              className="inline-flex h-8 items-center rounded-md bg-[var(--color-accent)] px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden h-8 items-center rounded-md px-3 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-8 items-center rounded-md bg-[var(--color-accent)] px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
