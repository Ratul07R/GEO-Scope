"use client";

import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/marketing/Reveal";
import { useScrollY } from "@/components/marketing/useScrollY";
import { Logo } from "@/components/Logo";
import {
  ArrowRight,
  Radar,
  Target,
  TrendingUp,
  Zap,
  Building2,
} from "lucide-react";

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const scrollY = useScrollY();
  const heroCardsY = scrollY * -0.06;

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px 180px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, transparent 30%, rgba(0,0,0,0.5) 100%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-24 lg:px-6 lg:pb-28 lg:pt-36">
          <Reveal delay={0}>
            <h1 className="mx-auto max-w-4xl text-center text-[44px] font-semibold leading-[1.05] tracking-[-0.035em] text-[var(--color-text-primary)] sm:text-[60px] lg:text-[80px]">
              What does AI say
              <br />
              about you?
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="mx-auto mt-6 max-w-[540px] text-center text-[16px] leading-relaxed text-[var(--color-text-secondary)] lg:text-[18px]">
              ChatGPT, Perplexity, and Gemini have an opinion.
              <br className="hidden sm:block" />
              GeoScope shows you exactly what it is — before your customers see it.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-9 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <Link
                href="/signup"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 text-[14px] font-medium text-white shadow-[0_8px_24px_-8px_rgba(94,106,210,0.6)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-accent-hover)] hover:shadow-[0_12px_32px_-8px_rgba(94,106,210,0.9)]"
              >
                Check your brand free
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-5 text-[14px] font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-strong)]"
              >
                See how it works
              </Link>
            </div>
          </Reveal>
          <Reveal delay={280}>
            <p className="mt-4 text-center text-[12px] text-[var(--color-text-tertiary)]">
              No credit card required · Free for 1 brand
            </p>
          </Reveal>
          <Reveal delay={380}>
            <div className="relative mx-auto mt-24 max-w-4xl">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-accent)] opacity-[0.10] blur-[120px]"
              />
              <div className="relative grid grid-cols-1 items-center gap-4 md:grid-cols-5 md:gap-0">
                <div
                  className="md:col-span-2 md:-mr-6"
                  style={{ transform: `translate3d(0, ${heroCardsY * 0.7}px, 0)` }}
                >
                  <div className="relative rounded-xl border border-[var(--color-border-subtle)] bg-gradient-to-b from-[var(--color-bg-surface)] to-[var(--color-bg-elevated)] p-4 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)] md:rotate-[-3deg]">
                    <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
                      Query Result
                    </div>
                    <div className="mt-2 text-[13px] text-[var(--color-text-primary)]">
                      &ldquo;Top analytics platforms for SaaS&rdquo;
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
                      <span className="text-[11px] font-medium text-[var(--color-success)]">
                        Mentioned · #1
                      </span>
                      <span className="rounded-md bg-[var(--color-success)]/10 px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-success)]">
                        Positive
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className="z-10 md:col-span-2"
                  style={{ transform: `translate3d(0, ${heroCardsY * 1.3}px, 0)` }}
                >
                  <div className="relative rounded-2xl border border-[var(--color-border-strong)] bg-gradient-to-b from-[var(--color-bg-surface)] to-[var(--color-bg-elevated)] p-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)]">
                    <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="flex flex-col items-center">
                      <div className="relative h-32 w-32">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--color-bg-elevated)" strokeWidth="6" />
                          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--color-accent)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 44}`} strokeDashoffset={`${2 * Math.PI * 44 * (1 - 0.78)}`} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-[38px] font-semibold leading-none tracking-tight text-[var(--color-text-primary)]">
                            78
                          </span>
                          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
                            Score
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 text-center">
                        <div className="text-[13px] font-medium text-[var(--color-text-primary)]">
                          Visibility Score
                        </div>
                        <div className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
                          10 of 10 prompts analyzed
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="md:col-span-2 md:-ml-6"
                  style={{ transform: `translate3d(0, ${heroCardsY * 1.0}px, 0)` }}
                >
                  <div className="relative rounded-xl border border-[var(--color-border-subtle)] bg-gradient-to-b from-[var(--color-bg-surface)] to-[var(--color-bg-elevated)] p-4 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)] md:rotate-[2.5deg]">
                    <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
                      Brand Mentions
                    </div>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <span className="text-[32px] font-semibold leading-none tracking-tight text-[var(--color-text-primary)]">
                        31
                      </span>
                      <svg width="60" height="24" viewBox="0 0 60 24" className="opacity-70">
                        <polyline
                          points="0,18 10,14 20,16 30,10 40,12 50,6 60,4"
                          fill="none"
                          stroke="var(--color-accent)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="mt-2 text-[11px] text-[var(--color-text-tertiary)]">
                      +12 this week
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="border-y border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]">
        <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
          <Reveal>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {[
                { value: "4", label: "AI engines tracked" },
                { value: "10", label: "Queries per scan" },
                { value: "30s", label: "Average scan time" },
                { value: "0", label: "Setup required" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-[28px] font-semibold leading-none tracking-[-0.02em] text-[var(--color-text-primary)] lg:text-[32px]">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
      <section id="features" className="relative overflow-hidden py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-accent)]">
                Capabilities
              </p>
              <h2 className="mt-3 text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--color-text-primary)] lg:text-[48px]">
                Your entire AI presence,
                <br />
                in one place.
              </h2>
            </div>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
            <Reveal className="md:col-span-2">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6 transition-colors hover:border-[var(--color-border-strong)] lg:p-8">
                <div className="absolute right-0 top-0 h-[200px] w-[300px] rounded-full bg-[var(--color-accent)] opacity-[0.08] blur-[80px]" />
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                    <Radar size={17} />
                  </div>
                  <h3 className="mt-5 text-[19px] font-medium tracking-[-0.01em] text-[var(--color-text-primary)]">
                    Multi-engine coverage
                  </h3>
                  <p className="mt-2 max-w-md text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
                    We query ChatGPT, Perplexity, Gemini, and Claude simultaneously. See how
                    each engine ranks you — and where you&apos;re invisible.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {["ChatGPT", "Perplexity", "Gemini", "Claude"].map((e) => (
                      <span key={e} className="rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={80} className="md:col-span-1 md:row-span-1">
              <div className="relative h-full rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6 transition-colors hover:border-[var(--color-border-strong)]">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-success)]/10 text-[var(--color-success)]">
                  <Target size={17} />
                </div>
                <h3 className="mt-5 text-[16px] font-medium text-[var(--color-text-primary)]">
                  Competitor tracking
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                  Compare your visibility score to rivals — see exactly who AI recommends
                  instead of you.
                </p>
              </div>
            </Reveal>
            <Reveal delay={160} className="md:col-span-1 md:row-span-1">
              <div className="relative h-full rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6 transition-colors hover:border-[var(--color-border-strong)]">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-warning)]/10 text-[var(--color-warning)]">
                  <Building2 size={17} />
                </div>
                <h3 className="mt-5 text-[16px] font-medium text-[var(--color-text-primary)]">
                  Multi-brand workspace
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                  Track multiple brands from one account — with per-brand competitors
                  and score history.
                </p>
              </div>
            </Reveal>
            <Reveal delay={240} className="md:col-span-1 md:row-span-1">
              <div className="relative h-full rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6 transition-colors hover:border-[var(--color-border-strong)]">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                  <TrendingUp size={17} />
                </div>
                <h3 className="mt-5 text-[16px] font-medium text-[var(--color-text-primary)]">
                  Score history
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                  Track visibility trends over time. Measure what works, drop what
                  doesn&apos;t.
                </p>
              </div>
            </Reveal>
            <Reveal delay={320} className="md:col-span-1 md:row-span-1">
              <div className="relative h-full rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6 transition-colors hover:border-[var(--color-border-strong)]">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                  <Zap size={17} />
                </div>
                <h3 className="mt-5 text-[16px] font-medium text-[var(--color-text-primary)]">
                  Fast scans
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                  Ten AI queries, in under 30 seconds. No waiting, no queues.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
      {/* ══════════════════ WHY GEO MATTERS ══════════════════ */}
      <section className="border-t border-[var(--color-border-subtle)] py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-accent)]">The shift</p>
              <h2 className="mt-3 text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--color-text-primary)] lg:text-[48px]">
                Your customers are asking AI.
                <br />
                Is your brand in the answer?
              </h2>
            </div>
          </Reveal>

          {/* Two-column explainer */}
          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Old way */}
            <Reveal delay={0}>
              <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6">
                <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">How it used to work</div>
                <h3 className="mt-4 text-[18px] font-medium text-[var(--color-text-primary)]">Google gave you 10 links</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                  Customers searched, scrolled, compared 5 websites, and made a decision. You had many chances to be seen.
                </p>
                <div className="mt-5 space-y-1.5">
                  {["blue-link-1.com", "blue-link-2.com", "blue-link-3.com"].map((link) => (
                    <div key={link} className="flex items-center gap-2 text-[11px] text-[var(--color-text-tertiary)]">
                      <span className="h-1 w-1 rounded-full bg-[var(--color-text-tertiary)]" />{link}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* New way */}
            <Reveal delay={100}>
              <div className="rounded-2xl border border-[var(--color-accent)]/30 bg-gradient-to-br from-[var(--color-bg-surface)] to-[var(--color-bg-elevated)] p-6">
                <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-[var(--color-accent)]">How it works now</div>
                <h3 className="mt-4 text-[18px] font-medium text-[var(--color-text-primary)]">AI gives one recommendation</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                  Customers ask ChatGPT. It answers with 3-5 brand names. If you're not in that list, you don't exist for them.
                </p>
                <div className="mt-5 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-3">
                  <div className="text-[10px] text-[var(--color-text-tertiary)]">&ldquo;Best note apps for teams?&rdquo;</div>
                  <div className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
                    &ldquo;Try <span className="font-medium text-[var(--color-accent)]">Notion</span>,<span className="ml-1">Coda, or Obsidian</span>...&rdquo;
                  </div>
                </div>
              </div>
            </Reveal>

            {/* The gap */}
            <Reveal delay={200}>
              <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6">
                <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">The problem</div>
                <h3 className="mt-4 text-[18px] font-medium text-[var(--color-text-primary)]">40% start with AI now</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                  Yet most brands have no idea what AI says about them. No visibility. No tracking. No plan.
                </p>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="text-[28px] font-semibold tracking-tight text-[var(--color-text-primary)]">0%</span>
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">of brands know their AI visibility</span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Bottom explainer card */}
          <Reveal delay={300}>
            <div className="mt-8 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-6 lg:p-8">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,1.5fr] lg:items-center">
                <div>
                  <h3 className="text-[20px] font-semibold tracking-[-0.01em] text-[var(--color-text-primary)]">That&rsquo;s what GeoScope fixes.</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                    We track exactly what AI says about your brand across every major engine — then tell you precisely what to change to improve it.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Tracked engines", value: "4" },
                    { label: "Queries per scan", value: "10" },
                    { label: "Scan duration", value: "~2 min" },
                    { label: "Free scans", value: "1/day" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] p-3">
                      <div className="text-[20px] font-semibold tracking-tight text-[var(--color-text-primary)]">{stat.value}</div>
                      <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--color-text-tertiary)]">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative overflow-hidden border-t border-[var(--color-border-subtle)] py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-accent)]">
                How it works
              </p>
              <h2 className="mt-3 text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--color-text-primary)] lg:text-[48px]">
                Three steps from invisible
                <br />
                to unmissable.
              </h2>
            </div>
          </Reveal>
          <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {[
              { num: "01", title: "Add your brand", desc: "Enter your brand name, domain, and competitors. Takes 30 seconds." },
              { num: "02", title: "Run a scan", desc: "We query four AI engines with ten realistic questions about your space." },
              { num: "03", title: "Track and improve", desc: "See your visibility score, competitor comparison, and weekly changes." },
            ].map((step, i) => (
              <Reveal key={step.num} delay={i * 100}>
                <div className="relative">
                  <div className="text-[64px] font-semibold leading-none tracking-[-0.04em] text-[var(--color-bg-elevated)] lg:text-[80px]">{step.num}</div>
                  <div className="mt-2 h-px w-12 bg-[var(--color-accent)]" />
                  <h3 className="mt-5 text-[18px] font-medium text-[var(--color-text-primary)]">{step.title}</h3>
                  <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-[var(--color-text-secondary)]">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      {/* PERSONAL PROGRAM */}
      <section className="border-t border-[var(--color-border-subtle)] py-20">
        <div className="mx-auto max-w-4xl px-4 lg:px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-gradient-to-br from-[var(--color-bg-surface)] to-[var(--color-bg-elevated)] p-8 lg:p-12">
              <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-[var(--color-accent)] opacity-[0.08] blur-[100px]" />
              <div className="relative">
                <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-accent)]">Personal Program</p>
                <h2 className="mt-4 max-w-2xl text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--color-text-primary)] lg:text-[36px]">
                  Building something small today<br />that could be big tomorrow?
                </h2>
                <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
                  We were there once. Tell us about your project — we personally read every message and offer partner pricing to founders who need it.
                </p>
                <div className="mt-8">
                  <Link href="/personal-program" className="group inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg-base)] px-4 text-[13px] font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-accent)]">
                    Talk to us<ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      {/* PRICING */}
      <section id="pricing" className="border-t border-[var(--color-border-subtle)] py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <Reveal>
            <div className="text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-accent)]">Pricing</p>
              <h2 className="mx-auto mt-3 max-w-2xl text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--color-text-primary)] lg:text-[48px]">Simple pricing for every stage.</h2>
              <p className="mx-auto mt-5 max-w-md text-[15px] text-[var(--color-text-secondary)]">Start today. Cancel anytime. No hidden fees.</p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-10 flex justify-center">
              <div className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-1">
                <button type="button" onClick={() => setBillingCycle("monthly")} className={`rounded-md px-3.5 py-1.5 text-[12px] font-medium transition-colors ${billingCycle === "monthly" ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"}`}>Monthly</button>
                <button type="button" onClick={() => setBillingCycle("yearly")} className={`rounded-md px-3.5 py-1.5 text-[12px] font-medium transition-colors ${billingCycle === "yearly" ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"}`}>
                  Yearly<span className="ml-1.5 rounded bg-[var(--color-success)]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-success)]">-20%</span>
                </button>
              </div>
            </div>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { name: "Starter", monthly: 29, yearly: 23, desc: "For solo founders and freelancers.", features: ["1 brand", "10 queries per scan", "ChatGPT + Gemini", "Weekly automated scans", "30-day score history", "Email support"], cta: "Start with Starter", popular: false },
              { name: "Pro", monthly: 79, yearly: 63, desc: "For growing teams and brands.", features: ["5 brands", "50 queries per scan", "All 4 AI engines", "Daily automated scans", "Unlimited history", "Competitor comparison", "Priority email support"], cta: "Start with Pro", popular: true },
              { name: "Agency", monthly: 199, yearly: 159, desc: "For agencies managing multiple clients.", features: ["Unlimited brands", "250 queries per scan", "All 4 AI engines", "3× daily scans", "White-label reports", "5 team seats", "Dedicated support", "API access"], cta: "Start with Agency", popular: false },
            ].map((plan, i) => (
              <Reveal key={plan.name} delay={i * 100}>
                <div className={`relative flex h-full flex-col rounded-2xl border p-6 lg:p-7 ${plan.popular ? "border-[var(--color-accent)] bg-gradient-to-b from-[var(--color-bg-surface)] to-[var(--color-bg-elevated)]" : "border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]"}`}>
                  {plan.popular && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">Most popular</div>}
                  <div>
                    <h3 className="text-[17px] font-medium text-[var(--color-text-primary)]">{plan.name}</h3>
                    <p className="mt-1.5 text-[12px] text-[var(--color-text-tertiary)]">{plan.desc}</p>
                  </div>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-[var(--color-text-primary)]">${billingCycle === "monthly" ? plan.monthly : plan.yearly}</span>
                    <span className="text-[13px] text-[var(--color-text-tertiary)]">/month</span>
                  </div>
                  <div className="mt-1.5 text-[11px] text-[var(--color-text-tertiary)]">{billingCycle === "yearly" ? `Billed annually · $${plan.yearly * 12}/year` : "Billed monthly · Cancel anytime"}</div>
                  <Link href="/signup" className={`mt-6 inline-flex h-10 items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${plan.popular ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]" : "border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]"}`}>{plan.cta}</Link>
                  <ul className="mt-6 space-y-2.5 border-t border-[var(--color-border-subtle)] pt-6">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-[13px] text-[var(--color-text-secondary)]">
                        <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-success)]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      {/* FAQ */}
      <section id="faq" className="border-t border-[var(--color-border-subtle)] py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-4 lg:px-6">
          <Reveal>
            <div className="text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--color-accent)]">FAQ</p>
              <h2 className="mx-auto mt-3 max-w-2xl text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--color-text-primary)] lg:text-[48px]">Questions, answered.</h2>
            </div>
          </Reveal>
          <div className="mt-14 divide-y divide-[var(--color-border-subtle)]">
            {[
              { q: "What's the difference between GEO/AEO and SEO?", a: "SEO helps you rank in Google search results. GEO/AEO helps you get mentioned in AI answers from ChatGPT, Gemini, Claude, and Perplexity. When people ask AI for recommendations directly, GEO is what makes you show up." },
              { q: "Which AI engines do you support?", a: "We currently query ChatGPT, Gemini, Claude, and Perplexity. Every scan sends the same questions to all four, so you see exactly how each engine treats your brand." },
              { q: "How long does a scan take?", a: "Around 30 seconds for the full 10-query scan across all engines. You'll see your visibility score, per-engine breakdown, and competitor comparison immediately after." },
              { q: "Can I track multiple brands?", a: "Yes. Starter includes 1 brand. Pro includes 5. Agency includes unlimited brands with per-brand competitor tracking." },
              { q: "Is my data private?", a: "Yes. Your data is encrypted and only accessible to your account. We never share brand data with third parties, and never train models on your information." },
              { q: "Can I cancel anytime?", a: "Yes. All plans are month-to-month (or annual if you choose). Cancel from your billing settings any time — no exit fees, no questions asked." },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 50}>
                <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-start justify-between gap-6 py-5 text-left transition-colors hover:text-[var(--color-text-primary)]">
                  <span className="text-[15px] font-medium text-[var(--color-text-primary)]">{item.q}</span>
                  <svg className={`mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-tertiary)] transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="pr-10 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">{item.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      {/* FINAL CTA */}
      <section className="border-t border-[var(--color-border-subtle)] py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-6">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--color-text-primary)] lg:text-[56px]">Ready to see what AI says?</h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-10 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <Link href="/signup" className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 text-[14px] font-medium text-white shadow-[0_8px_24px_-8px_rgba(94,106,210,0.6)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-accent-hover)] hover:shadow-[0_12px_32px_-8px_rgba(94,106,210,0.9)]">
                Check your brand free<ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-4 text-[12px] text-[var(--color-text-tertiary)]">No credit card required · Free for 1 brand</p>
          </Reveal>
        </div>
      </section>
      {/* FOOTER */}
      <footer className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <Logo size={24} withWordmark />
              <p className="mt-4 max-w-xs text-[12px] leading-relaxed text-[var(--color-text-tertiary)]">AI visibility tracking for modern brands. See what ChatGPT, Gemini, Claude, and Perplexity say about you.</p>
            </div>
            <div>
              <h4 className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">Product</h4>
              <ul className="mt-4 space-y-2.5">
                {[["Features", "#features"], ["Pricing", "#pricing"], ["How it works", "#how-it-works"], ["FAQ", "#faq"]].map(([label, href]) => (
                  <li key={label}><a href={href} className="text-[13px] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]">{label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">Company</h4>
              <ul className="mt-4 space-y-2.5">
                {["About", "Blog", "Personal Program", "Contact"].map((link) => (
                  <li key={link}><a href="#" className="text-[13px] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">Legal</h4>
              <ul className="mt-4 space-y-2.5">
                {[
                  { label: "Privacy", href: "/privacy" },
                  { label: "Terms", href: "/terms" },
                  { label: "Security", href: "#" },
                  { label: "Status", href: "#" },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-[13px] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border-subtle)] pt-6 sm:flex-row">
            <p className="text-[12px] text-[var(--color-text-tertiary)]">© 2026 GeoScope. All rights reserved.</p>
            <p className="text-[12px] text-[var(--color-text-tertiary)]">Built for the AI era.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
