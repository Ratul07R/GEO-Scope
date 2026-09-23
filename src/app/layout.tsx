import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GeoScope — What does AI say about you?",
    template: "%s — GeoScope",
  },
  description:
    "ChatGPT, Perplexity, and Gemini have an opinion about your brand. GeoScope shows you exactly what it is — before your customers see it.",
  keywords: [
    "GEO",
    "AEO",
    "AI visibility",
    "AI search optimization",
    "ChatGPT SEO",
    "brand monitoring",
    "Perplexity tracking",
  ],
  authors: [{ name: "GeoScope" }],
  creator: "GeoScope",
  metadataBase: new URL("https://geoscope.io"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://geoscope.io",
    siteName: "GeoScope",
    title: "What does AI say about you?",
    description:
      "ChatGPT, Perplexity, and Gemini have an opinion about your brand. See exactly what it is — before your customers see it.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "GeoScope — What does AI say about you?",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "What does AI say about you?",
    description:
      "ChatGPT, Perplexity, and Gemini have an opinion about your brand. See exactly what it is.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
