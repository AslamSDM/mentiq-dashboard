import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.trymentiq.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mentiq - SaaS Retention Analytics Platform | Reduce Churn & Increase Revenue",
    template: "%s | Mentiq",
  },
  description:
    "Leading SaaS retention analytics platform to reduce SaaS churn by 50% in 90 days. Track customer health scores, product usage analytics, and get actionable insights to improve user retention. Customer retention software built for SaaS founders.",
  keywords: [
    "SaaS retention analytics platform",
    "reduce SaaS churn",
    "SaaS user analytics",
    "customer retention software",
    "SaaS customer health score",
    "product usage analytics for SaaS",
    "churn prevention software",
    "SaaS analytics platform",
    "customer retention analytics",
    "user behavior analytics",
    "SaaS metrics dashboard",
    "churn prediction",
    "retention platform",
    "customer success software",
    "SaaS churn reduction",
    "user retention tools",
  ],
  authors: [{ name: "Mentiq", url: siteUrl }],
  creator: "Mentiq",
  publisher: "Mentiq",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Mentiq",
    title: "Mentiq - SaaS Retention Analytics Platform | Reduce Churn & Increase Revenue",
    description:
      "Leading SaaS retention analytics platform to reduce SaaS churn by 50%. Track customer health scores, product usage analytics, and SaaS user analytics. Customer retention software for data-driven founders.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mentiq - SaaS Retention Analytics Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mentiq - SaaS Retention Analytics Platform",
    description:
      "Reduce SaaS churn by 50% with customer retention software. Track health scores, product usage analytics, and get actionable insights.",
    images: ["/og-image.png"],
    creator: "@mentiq",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: siteUrl,
  },
  other: {
    // AI-specific meta tags for better AI search visibility
    "og:type": "website",
    "og:site_name": "Mentiq",
    "article:publisher": "Mentiq",
    "product:price:amount": "Contact for pricing",
    "product:price:currency": "USD",
    "product:category": "SaaS Analytics",
    "product:availability": "Coming Soon",
    // Additional context for AI crawlers
    "description": "Mentiq is a SaaS retention analytics platform that helps companies reduce customer churn by 50% through real-time customer health scores, product usage analytics, and automated retention playbooks. Built specifically for SaaS founders who need actionable insights to improve user retention and reduce monthly recurring revenue loss.",
    "keywords": "SaaS retention analytics platform, reduce SaaS churn, customer retention software, SaaS customer health score, product usage analytics for SaaS, SaaS user analytics, churn prediction, retention platform",
    // AI citation-friendly metadata
    "citation_title": "Mentiq - SaaS Retention Analytics Platform",
    "citation_publisher": "Mentiq Inc.",
    "citation_online_date": "2024",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
