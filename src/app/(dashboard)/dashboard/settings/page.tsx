"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CreditCard, Key, Mail, User } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { supabase } from "@/lib/supabase";

const inputClassName =
  "h-9 w-full rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-2.5 text-[13px] text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)]";

type SectionProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

function Section({ icon, title, description, children }: SectionProps) {
  return (
    <Panel>
      <div className="flex items-start gap-3 border-b border-[var(--color-border-subtle)] px-4 py-4 lg:px-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-[14px] font-medium text-[var(--color-text-primary)]">{title}</h2>
          <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
            {description}
          </p>
        </div>
      </div>
      <div className="space-y-4 p-4 lg:p-5">{children}</div>
    </Panel>
  );
}

function ProfileSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (u) {
        setName((u.user_metadata?.full_name as string) ?? "");
        setEmail(u.email ?? "");
        setAvatarUrl((u.user_metadata?.avatar_url as string) ?? null);
      }
    }
    void loadUser();
  }, []);

  // Auto-dismiss the success banner after 3 seconds.
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(""), 3000);
    return () => clearTimeout(timer);
  }, [success]);

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Max 5MB");
      return;
    }
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const { error } = await supabase.auth.updateUser({
          data: { avatar_url: dataUrl },
        });
        if (error) {
          setError(error.message);
          setUploading(false);
          return;
        }
        setAvatarUrl(dataUrl);
        setSuccess("Photo updated");
        setUploading(false);
      };
      reader.onerror = () => {
        setError("Could not read photo.");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload photo.");
      setUploading(false);
    }
  }

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name cannot be empty.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: trimmed },
      });
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
      setName(trimmed);
      setSuccess("Profile updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2 text-[12px] text-[var(--color-danger)]"
        >
          {error}
        </p>
      ) : null}
      {success ? (
        <p
          role="status"
          className="rounded-md border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-3 py-2 text-[12px] text-[var(--color-success)]"
        >
          {success}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={name || "Profile photo"}
            className="h-16 w-16 shrink-0 rounded-full border border-[var(--color-border-subtle)] object-cover"
          />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7c85e8] to-[#5e6ad2] text-[22px] font-medium text-white">
            {(name || email || "U").charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => void handlePhotoChange(event)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? "Uploading..." : "Change photo"}
          </button>
          <p className="mt-1.5 text-[11px] text-[var(--color-text-tertiary)]">
            JPG or PNG, max 5MB.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block min-w-0">
          <span className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">
            Full name
          </span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClassName}
          />
        </label>
        <label className="block min-w-0">
          <span className="mb-1.5 block text-[12px] font-medium text-[var(--color-text-secondary)]">
            Email
          </span>
          <input
            type="text"
            value={email}
            disabled
            className={`${inputClassName} cursor-not-allowed opacity-70`}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-accent)] px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, API access and subscription"
      >
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=rutturat@gmail.com&su=GeoScope%20Support"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]"
        >
          <Mail size={14} />
          Contact support
        </a>
      </PageHeader>

      <Section
        icon={<User size={16} />}
        title="Profile"
        description="Your name and email appear on shared reports and scan notifications."
      >
        <ProfileSection />
      </Section>

      <Section
        icon={<Key size={16} />}
        title="API Keys"
        description="Use the GeoScope API to pull visibility data into your own product."
      >
        <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-4">
          <div>
            <div className="text-[13px] font-medium text-[var(--color-text-primary)]">
              API access
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
              Programmatic access to your GeoScope data. Coming soon for Pro and Agency plans.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[var(--color-bg-elevated)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Coming soon
          </span>
        </div>
      </Section>

      <Section
        icon={<CreditCard size={16} />}
        title="Billing"
        description="You are on the Free plan. Upgrade to unlock unlimited scans and more engines."
      >
        <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
                  Free plan
                </span>
                <span className="rounded-full bg-[var(--color-accent)]/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--color-accent)]">
                  Current
                </span>
              </div>
              <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
                1 scan per day · 10 scans per month · 1 brand
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[13px] font-medium text-[var(--color-text-primary)]">
                Upgrade to Pro
              </div>
              <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
                More scans, unlimited history, more brands, PDF reports.
              </p>
            </div>
            <button
              type="button"
              disabled
              title="Paid plans launching soon"
              className="shrink-0 inline-flex h-8 items-center justify-center rounded-md bg-[var(--color-bg-elevated)] px-3 text-[12px] font-medium text-[var(--color-text-tertiary)] cursor-not-allowed opacity-60"
            >
              Coming soon
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}