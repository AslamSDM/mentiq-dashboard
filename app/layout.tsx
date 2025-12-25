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
    default: "Mentiq - Cut Monthly Churn in Half Within 90 Days",
    template: "%s | Mentiq",
  },
  description:
    "The only analytics platform built for SaaS founders who want actionable retention insights. Identify churn risk, understand root causes, and get automated save strategies.",
  keywords: [
    "SaaS analytics",
    "churn prevention",
    "customer retention",
    "user analytics",
    "product analytics",
    "churn prediction",
    "retention platform",
    "SaaS metrics",
    "user behavior analytics",
    "customer success",
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
    title: "Mentiq - Cut Monthly Churn in Half Within 90 Days",
    description:
      "The only analytics platform built for SaaS founders who want actionable retention insights. Identify churn risk, understand root causes, and get automated save strategies.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mentiq - Churn Prevention Platform for SaaS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mentiq - Cut Monthly Churn in Half Within 90 Days",
    description:
      "The only analytics platform built for SaaS founders who want actionable retention insights.",
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
