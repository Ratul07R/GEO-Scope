import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/Nav";

export const metadata: Metadata = {
  title: "What does AI say about you?",
  description: "ChatGPT, Perplexity, and Gemini have an opinion about your brand. GeoScope shows you exactly what it is — before your customers see it. Start free.",
  openGraph: {
    title: "What does AI say about you?",
    description: "Track your brand's visibility across ChatGPT, Gemini, Claude, and Perplexity.",
    url: "https://geoscope.io",
    images: ["/og-image.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "What does AI say about you?",
    images: ["/og-image.svg"],
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      <MarketingNav />
      <main>{children}</main>
    </div>
  );
}
