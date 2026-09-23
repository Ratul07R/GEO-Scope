"use client";

import { useEffect, useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  // Populated from the auth store on the client; null on first render so the
  // server render never crashes before auth hydrates.
  const [user, setUser] = useState<{
    email: string;
    name: string;
    avatarUrl: string | null;
  } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      const email = u.email ?? "";
      const name =
        (u.user_metadata?.full_name as string) ||
        email.split("@")[0] ||
        "User";
      const avatarUrl = (u.user_metadata?.avatar_url as string) || null;
      setUser({ email, name, avatarUrl });
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user;
        if (!u) {
          setUser(null);
          return;
        }
        const email = u.email ?? "";
        const name =
          (u.user_metadata?.full_name as string) ||
          email.split("@")[0] ||
          "User";
        const avatarUrl = (u.user_metadata?.avatar_url as string) || null;
        setUser({ email, name, avatarUrl });
      }
    );
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]/80 px-3 backdrop-blur-xl lg:px-4">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)] md:hidden"
      >
        <Menu size={17} />
      </button>

      <div className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-2.5 transition-colors focus-within:border-[var(--color-accent)] sm:max-w-[280px]">
        <Search size={13} className="shrink-0 text-[var(--color-text-tertiary)]" />
        <input
          type="text"
          placeholder="Search brands, scans..."
          className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
        />
        <kbd className="hidden shrink-0 items-center rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-1.5 py-0.5 font-sans text-[10px] leading-none text-[var(--color-text-tertiary)] sm:flex">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={handleSignOut}
          className="h-8 shrink-0 rounded-md px-2 text-[12px] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
        >
          Sign out
        </button>

        <span
          aria-hidden
          className="hidden h-5 w-px bg-[var(--color-border-subtle)] sm:block"
        />

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
        >
          <Bell size={16} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] ring-2 ring-[var(--color-bg-base)]" />
        </button>

        <span aria-hidden className="hidden h-5 w-px bg-[var(--color-border-subtle)] sm:block" />

        <button
          type="button"
          title={user?.email ?? ""}
          className="flex h-9 min-w-0 items-center gap-2 rounded-md px-1.5 transition-colors hover:bg-[var(--color-bg-surface)]"
        >
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-6 w-6 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7c85e8] to-[#5e6ad2] text-[11px] font-medium text-white">
              {user ? user.name.charAt(0).toUpperCase() : ""}
            </span>
          )}
          <span className="hidden truncate text-[13px] text-[var(--color-text-secondary)] sm:block">
            {user?.name ?? ""}
          </span>
        </button>
      </div>
    </header>
  );
}
