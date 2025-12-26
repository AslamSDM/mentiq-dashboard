import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.trymentiq.com";

  return {
    rules: [
      // Allow all AI crawlers explicitly
      {
        userAgent: "GPTBot", // OpenAI ChatGPT
        allow: ["/", "/pricing", "/docs"],
        disallow: ["/dashboard/", "/api/"],
      },
      {
        userAgent: "ChatGPT-User", // ChatGPT user requests
        allow: ["/", "/pricing", "/docs"],
        disallow: ["/dashboard/", "/api/"],
      },
      {
        userAgent: "Google-Extended", // Google Bard/Gemini
        allow: ["/", "/pricing", "/docs"],
        disallow: ["/dashboard/", "/api/"],
      },
      {
        userAgent: "anthropic-ai", // Claude
        allow: ["/", "/pricing", "/docs"],
        disallow: ["/dashboard/", "/api/"],
      },
      {
        userAgent: "ClaudeBot", // Claude web crawler
        allow: ["/", "/pricing", "/docs"],
        disallow: ["/dashboard/", "/api/"],
      },
      {
        userAgent: "PerplexityBot", // Perplexity AI
        allow: ["/", "/pricing", "/docs"],
        disallow: ["/dashboard/", "/api/"],
      },
      {
        userAgent: "Applebot-Extended", // Apple Intelligence
        allow: ["/", "/pricing", "/docs"],
        disallow: ["/dashboard/", "/api/"],
      },
      {
        userAgent: "CCBot", // Common Crawl (used by many AI)
        allow: ["/", "/pricing", "/docs"],
        disallow: ["/dashboard/", "/api/"],
      },
      {
        userAgent: "FacebookBot", // Meta AI
        allow: ["/", "/pricing", "/docs"],
        disallow: ["/dashboard/", "/api/"],
      },
      // General crawlers
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/docs", "/signin", "/signup"],
        disallow: [
          "/dashboard/",
          "/api/",
          "/verify-email",
          "/reset-password",
          "/accept-invitation",
          "/verify-pending",
          "/forgot-password"
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
