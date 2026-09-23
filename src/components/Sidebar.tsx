"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronsUpDown,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

type NavItem = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Brands", href: "/dashboard/brands", icon: Building2 },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { name: "Scans", href: "/dashboard/scans", icon: Search },
      { name: "Reports", href: "/dashboard/reports", icon: FileText },
    ],
  },
  {
    label: "Settings",
    items: [{ name: "Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

function WorkspaceSwitcher() {
  return (
    <button
      type="button"
      className="flex h-14 w-full shrink-0 items-center gap-2.5 border-b border-[var(--color-border-subtle)] px-3 text-left transition-colors hover:bg-[var(--color-bg-surface)] md:justify-center lg:justify-start"
    >
      <Logo size={22} />
      <span className="min-w-0 flex-1 md:hidden lg:block">
        <span className="block truncate text-[13px] font-medium text-[var(--color-text-primary)]">
          GeoScope
        </span>
        <span className="block truncate text-[11px] text-[var(--color-text-tertiary)]">
          Personal · Free
        </span>
      </span>
      <ChevronsUpDown
        size={14}
        className="shrink-0 text-[var(--color-text-tertiary)] md:hidden lg:block"
      />
    </button>
  );
}

function UpgradeCard() {
  return (
    <div className="hidden shrink-0 p-2 lg:block">
      <div className="rounded-lg border border-[var(--color-border-subtle)] bg-gradient-to-b from-[var(--color-bg-elevated)] to-[var(--color-bg-surface)] p-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
            <Sparkles size={14} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[12px] font-medium text-[var(--color-text-primary)]">
              Upgrade to Pro
            </span>
            <span className="block truncate text-[11px] text-[var(--color-text-tertiary)]">
              Unlimited scans
            </span>
          </span>
        </div>
        <button
          type="button"
          className="mt-3 h-9 w-full rounded-md bg-[var(--color-accent)] text-[12px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          Upgrade plan
        </button>
      </div>
    </div>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="relative shrink-0">
        <WorkspaceSwitcher />
        {typeof onClose === "function" ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="absolute right-2 top-4 flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] md:hidden"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4 last:mb-0">
            <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-tertiary)] md:hidden lg:block">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && Boolean(pathname?.startsWith(item.href)));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] transition-colors md:justify-center lg:justify-start ${
                      isActive
                        ? "bg-[var(--color-bg-elevated)] font-medium text-[var(--color-text-primary)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    {isActive ? (
                      <span
                        aria-hidden
                        className="absolute left-0 top-1/2 block h-4 w-[2px] -translate-y-1/2 rounded-full bg-[var(--color-accent)] md:hidden lg:block"
                      />
                    ) : null}
                    <Icon
                      size={16}
                      strokeWidth={isActive ? 2.2 : 1.8}
                      className={`shrink-0 ${isActive ? "text-[var(--color-accent)]" : ""}`}
                    />
                    <span className="truncate md:hidden lg:block">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <UpgradeCard />
    </>
  );
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  return (
    <>
      <aside className="hidden h-full shrink-0 flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] md:flex md:w-16 lg:w-[232px]">
        <SidebarContent />
      </aside>

      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] transition-transform duration-200 ease-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent onClose={onClose} />
      </aside>
    </>
  );
}