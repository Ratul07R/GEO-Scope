"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (signUpError) {
        throw signUpError;
      }

      // If email confirmation is required, session will be null
      if (!data.session) {
        setNotice(
          "Check your email to confirm your account, then sign in."
        );
        setIsSubmitting(false);
        return;
      }

      // Email confirmation disabled → straight to dashboard
      window.location.href = "/dashboard";
    } catch (signUpError) {
      setError(
        signUpError instanceof Error
          ? signUpError.message
          : "Unable to create your account. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
        Create your account
      </h1>
      <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
        Start monitoring how AI search engines see your brand.
      </p>

      {error ? (
        <p
          role="alert"
          className="mt-4 border-l-2 border-[var(--color-danger)] pl-2.5 text-[12px] leading-relaxed text-[var(--color-danger)]"
        >
          {error}
        </p>
      ) : null}

      {notice ? (
        <p
          role="status"
          className="mt-4 border-l-2 border-[var(--color-success)] pl-2.5 text-[12px] leading-relaxed text-[var(--color-success)]"
        >
          {notice}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-[12px] font-medium text-[var(--color-text-secondary)]"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isSubmitting}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className="h-10 w-full rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 text-[13px] text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] disabled:opacity-60"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-[12px] font-medium text-[var(--color-text-secondary)]"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            maxLength={50}
            disabled={isSubmitting}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="h-10 w-full rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 text-[13px] text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] disabled:opacity-60"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-10 w-full rounded-md bg-[var(--color-accent)] text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-[12px] text-[var(--color-text-secondary)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}