import Link from "next/link";
import Image from "next/image";
import {
  Search,
  AlertTriangle,
  Zap,
  Users,
} from "lucide-react";
import { FadeIn } from "@/components/ui/animated-components";
import { SpotlightCard } from "@/components/ui/spotlight-card";

// Client components
import { WaitlistForm } from "@/components/landing/waitlist-form";
import { FAQAccordion } from "@/components/landing/faq-accordion";
import { AuthLoadingCheck, AuthRedirect } from "@/components/landing/auth-redirect";
import { ComparisonTable } from "@/components/landing/comparison-table";
import { HowItWorksSection } from "@/components/landing/how-it-works";

// Structured Data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.trymentiq.com/#organization",
      "name": "Mentiq",
      "url": "https://www.trymentiq.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.trymentiq.com/logo.png"
      },
      "description": "SaaS retention analytics platform to reduce churn by 50%. Customer retention software with health scores and product usage analytics.",
      "sameAs": [
        "https://twitter.com/mentiq"
      ]
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://www.trymentiq.com/#software",
      "name": "Mentiq",
      "applicationCategory": "BusinessApplication",
      "applicationSubCategory": "Analytics Software",
      "operatingSystem": "Web Browser",
      "softwareVersion": "1.0 (Beta)",
      "datePublished": "2024-12-01",
      "author": {
        "@type": "Organization",
        "@id": "https://www.trymentiq.com/#organization"
      },
      "offers": {
        "@type": "Offer",
        "price": "Contact for pricing",
        "priceCurrency": "USD",
        "availability": "https://schema.org/PreOrder",
        "description": "Early access available for waitlist members. Tiered pricing based on monthly tracked users."
      },
      "description": "Mentiq is a SaaS retention analytics platform that helps software-as-a-service companies reduce customer churn by up to 50% within 90 days. The platform combines real-time customer health scoring, product usage analytics, and automated retention playbooks to identify at-risk customers before they cancel. Built specifically for SaaS founders, product managers, and customer success teams at companies with $10K-$500K MRR.",
      "featureList": [
        "Real-time customer health score tracking with predictive analytics",
        "Product usage analytics for SaaS with feature adoption monitoring",
        "SaaS user analytics and behavioral pattern detection",
        "Churn prediction 30-60 days before cancellation using machine learning",
        "Automated retention playbooks with personalized interventions",
        "Session recordings and heatmaps for user journey analysis",
        "A/B testing for retention experiments",
        "Cohort analysis and retention curves"
      ],
      "screenshot": "https://www.trymentiq.com/og-image.png",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "150",
        "bestRating": "5",
        "worstRating": "1"
      },
      "releaseNotes": "Private beta launch. Key features include customer health scoring, churn prediction, and automated retention playbooks.",
      "softwareHelp": {
        "@type": "WebPage",
        "url": "https://www.trymentiq.com/docs"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://www.trymentiq.com/#website",
      "url": "https://www.trymentiq.com",
      "name": "Mentiq - SaaS Retention Analytics Platform",
      "description": "Reduce SaaS churn by 50% with customer retention software, health scores, and product usage analytics",
      "publisher": {
        "@id": "https://www.trymentiq.com/#organization"
      }
    },
    {
      "@type": "Product",
      "@id": "https://www.trymentiq.com/#product",
      "name": "Mentiq SaaS Retention Analytics Platform",
      "description": "Customer retention software for SaaS companies. Reduce churn by 50% with health scores, product usage analytics, and automated playbooks.",
      "brand": {
        "@type": "Brand",
        "name": "Mentiq"
      },
      "category": "SaaS Analytics Software",
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "lowPrice": "Contact for pricing",
        "availability": "https://schema.org/PreOrder"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "150"
      },
      "audience": {
        "@type": "Audience",
        "audienceType": "SaaS Founders, Product Managers, Customer Success Teams",
        "geographicArea": "Global"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is SaaS churn?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SaaS churn refers to the percentage of customers who cancel or stop using a software-as-a-service product over a given period. There are two common types: customer churn (how many customers leave) and revenue churn (how much recurring revenue is lost). High SaaS churn often signals problems with product adoption, customer experience, onboarding, or perceived value."
          }
        },
        {
          "@type": "Question",
          "name": "How do SaaS companies reduce churn?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SaaS companies reduce churn by proactively understanding how users interact with their product through: tracking user behavior and feature adoption, identifying at-risk users using customer health scores, improving onboarding and time-to-value, triggering retention playbooks based on real usage data, and continuously optimizing the product based on engagement patterns. High-performing SaaS companies use churn analytics software to predict churn early and take action while customers are still active."
          }
        },
        {
          "@type": "Question",
          "name": "What is a good churn rate for SaaS?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The average churn rate for SaaS is typically 10-14% annually. An annual churn rate of under 5% is widely considered the benchmark for a strong, healthy SaaS business. However, it's estimated that 60-70% of SaaS companies fail to hit this benchmark. Even small improvements in churn can dramatically increase lifetime value, stabilize monthly recurring revenue, and compound growth over time."
          }
        }
      ]
    }
  ]
};

export default function Home() {
  return (
    <>
      {/* Client-side auth check and redirect */}
      <AuthLoadingCheck>
        <AuthRedirect />
        <div className="min-h-screen flex flex-col bg-[#F4F7FE] text-[#2B3674] overflow-x-hidden selection:bg-primary/30">
          {/* AI-Readable Summary (Hidden from users but visible to crawlers) */}
          <div className="sr-only" aria-hidden="true">
            <h1>Mentiq - SaaS Retention Analytics Platform</h1>
            <p>
              Mentiq is a customer retention software platform designed for SaaS companies.
              It helps reduce customer churn by up to 50% within 90 days through real-time customer health scoring,
              product usage analytics, and automated retention playbooks.
            </p>
            <h2>Key Features</h2>
            <ul>
              <li>Real-time SaaS customer health scores with predictive analytics</li>
              <li>Product usage analytics for SaaS to track feature adoption</li>
              <li>SaaS user analytics and behavioral pattern detection</li>
              <li>Churn prediction 30-60 days before cancellation using ML</li>
              <li>Automated retention playbooks and personalized interventions</li>
              <li>Session recordings and heatmaps for user journey analysis</li>
            </ul>
            <h2>Target Audience</h2>
            <p>
              Built for SaaS founders, product managers, and customer success teams at B2B and B2C
              software companies with MRR between $10K-$500K.
            </p>
            <h2>Pricing</h2>
            <p>
              Status: Private beta (December 2024). Contact for early access pricing.
              Tiered plans based on monthly tracked users and events.
            </p>
            <h2>Industry Context</h2>
            <p>
              Average SaaS churn rate: 10-14% annually.
              Healthy SaaS companies maintain churn below 5% annually.
              60-70% of SaaS businesses fail to achieve optimal churn rates.
            </p>
          </div>

          {/* Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />

          {/* Navbar */}
          <nav className="fixed top-0 w-full z-50 border-b border-[#E0E5F2] bg-white/50 backdrop-blur-xl">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative h-30 w-30">
                  <img
                    src="/logo.png"
                    alt="Mentiq Logo"
                    className="object-contain transition-all duration-300 h-30 w-30"
                  />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <Link
                  href="/docs"
                  className="text-sm font-medium text-[#4363C7] hover:text-[#2B3674] transition-colors"
                >
                  Docs
                </Link>
                <Link
                  href="/signin"
                  className="text-sm font-medium text-[#4363C7] hover:text-[#2B3674] transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="relative pt-32 pb-32 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e0e5f2_1px,transparent_1px),linear-gradient(to_bottom,#e0e5f2_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>

            <div className="container px-4 mx-auto text-center relative z-10">
              <FadeIn
                delay={0.2}
                className="inline-flex items-center justify-center px-4 py-1.5 mb-8 text-sm font-medium rounded-full bg-white border border-[#E0E5F2] backdrop-blur-sm text-[#2B3674] shadow-sm"
              >
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse shadow-[0_0_10px_var(--primary)]"></span>
                Coming Soon - Join the Waitlist
              </FadeIn>

              <div className="mb-8 relative">
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-[#2B3674] mb-2">
                  <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#2B3674] via-[#2B3674] to-[#4318FF]">
                    Mentiq
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-[#4363C7] max-w-3xl mx-auto leading-relaxed">
                  SaaS Retention Analytics Platform to{" "}
                  <span className="text-[#2B3674] font-medium">Reduce SaaS Churn by 50%</span>
                </p>
              </div>

              <FadeIn delay={0.4}>
                <p className="text-lg text-[#4363C7] max-w-2xl mx-auto mb-10">
                  Complete customer retention software with SaaS customer health scores, product usage analytics, and SaaS user analytics to prevent churn before it happens.
                </p>
              </FadeIn>

              {/* Waitlist Form in Hero */}
              <FadeIn delay={0.6} className="max-w-xl mx-auto">
                <div className="relative group">
                  {/* Animated gradient border */}
                  <div className="absolute -inset-[2px] bg-gradient-to-r from-primary via-purple-500 to-primary rounded-2xl opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x"></div>
                  <div className="absolute -inset-[2px] bg-gradient-to-r from-primary via-purple-500 to-primary rounded-2xl opacity-50 animate-gradient-x"></div>
                  {/* Glow effect */}
                  <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                  {/* Card content */}
                  <div className="relative p-8 rounded-2xl bg-white backdrop-blur-xl border border-[#E0E5F2] shadow-xl">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                    <h3 className="text-2xl font-bold text-[#2B3674] mb-2">Get Early Access</h3>
                    <p className="text-[#4363C7] text-sm mb-6">Be the first to kill churn with Mentiq</p>
                    <WaitlistForm source="hero" />
                  </div>
                </div>
              </FadeIn>
            </div>
          </section>

          {/* What You'll See */}
          <section className="py-32 relative">
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] opacity-40 pointer-events-none"></div>
            <div className="container px-4 mx-auto relative z-10">
              <FadeIn className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#2B3674] via-[#4318FF] to-[#2B3674]">
                  SaaS User Analytics That Drive Action
                </h2>
                <p className="text-[#4363C7] text-lg">
                  Our SaaS retention analytics platform gives you product usage analytics and customer health scores that actually help you reduce churn.
                </p>
              </FadeIn>

              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <FadeIn delay={0.2} direction="up" className="h-full">
                  <SpotlightCard className="p-8 h-full bg-white backdrop-blur-sm border-[#E0E5F2] hover:border-red-500/50 transition-colors group shadow-lg">
                    <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 text-red-500 group-hover:scale-110 transition-transform duration-300 border border-red-500/20">
                      <AlertTriangle className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-[#2B3674]">
                      SaaS Customer Health Score
                    </h3>
                    <p className="text-[#4363C7] leading-relaxed">
                      Track customer health scores in real-time to reduce SaaS churn. Identify exactly who is about to leave before they do with predictive analytics.
                    </p>
                  </SpotlightCard>
                </FadeIn>

                <FadeIn delay={0.4} direction="up" className="h-full">
                  <SpotlightCard className="p-8 h-full bg-white backdrop-blur-sm border-[#E0E5F2] hover:border-amber-500/50 transition-colors group shadow-lg">
                    <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 text-amber-500 group-hover:scale-110 transition-transform duration-300 border border-amber-500/20">
                      <Search className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-[#2B3674]">
                      Product Usage Analytics
                    </h3>
                    <p className="text-[#4363C7] leading-relaxed">
                      Deep product usage analytics for SaaS reveal why users churn. Understand feature adoption, engagement patterns, and behavioral signals.
                    </p>
                  </SpotlightCard>
                </FadeIn>

                <FadeIn delay={0.6} direction="up" className="h-full">
                  <SpotlightCard className="p-8 h-full bg-white backdrop-blur-sm border-[#E0E5F2] hover:border-green-500/50 transition-colors group shadow-lg">
                    <div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 text-green-500 group-hover:scale-110 transition-transform duration-300 border border-green-500/20">
                      <Zap className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-[#2B3674]">
                      Automated Retention Playbooks
                    </h3>
                    <p className="text-[#4363C7] leading-relaxed">
                      Our customer retention software triggers automated playbooks to prevent churn. Win back at-risk customers with timely interventions.
                    </p>
                  </SpotlightCard>
                </FadeIn>
              </div>
            </div>
          </section>

          {/* How Does Mentiq Work */}
          <section className="py-32 bg-white/50 border-y border-[#E0E5F2] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary-rgb),0.05),transparent_50%)]"></div>

            <div className="container px-4 mx-auto relative z-10 ">
              <FadeIn className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#2B3674]">
                  How does Mentiq Work?
                </h2>
                <p className="text-[#4363C7] text-lg">
                  It&apos;s not magic, it&apos;s just smarter analytics.
                </p>
              </FadeIn>

              <div className="items-center max-w-6xl mx-auto items-center justify-center">
                <HowItWorksSection />
              </div>
            </div>
          </section>

          {/* Why Mentiq is BETTER */}
          <section className="py-32 relative">
            <div className="container px-4 mx-auto">
              <FadeIn className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#2B3674]">
                  Why Mentiq is BETTER
                </h2>
                <p className="text-[#4363C7] text-lg">
                  Stop settling for vanity metrics.
                </p>
              </FadeIn>

              <ComparisonTable />
            </div>
          </section>

          {/* Final CTA - Waitlist */}
          <section className="py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#F4F7FE] via-primary/5 to-[#F4F7FE]"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

            <div className="container px-4 mx-auto text-center relative z-10">
              <FadeIn className="max-w-4xl mx-auto">
                <div className="mb-12 inline-block p-3 rounded-full bg-white border border-[#E0E5F2] backdrop-blur-sm shadow-sm">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-8 text-[#2B3674]">
                  A Note from the Founders
                </h2>
                <blockquote className="text-2xl md:text-3xl italic text-[#4363C7] mb-12 leading-relaxed font-light">
                  &quot;We built Mentiq because we struggled with one thing: <br />
                  <span className="text-[#2B3674] font-normal not-italic">
                    We could acquire users. We could activate them. But we couldn&apos;t
                    keep them.
                  </span>
                  &quot;
                </blockquote>
                <div className="space-y-6 mb-16">
                  <h3 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-primary animate-gradient-x">
                    Mentiq Simplifies that.
                  </h3>
                  <p className="text-2xl font-medium text-[#2B3674]/80">
                    It turns retention into a system.
                  </p>
                </div>
                
                {/* Waitlist Form */}
                <div className="max-w-xl mx-auto relative group">
                  {/* Animated gradient border */}
                  <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-500 via-primary to-purple-500 rounded-2xl opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x"></div>
                  <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-500 via-primary to-purple-500 rounded-2xl opacity-50 animate-gradient-x"></div>
                  {/* Glow effect */}
                  <div className="absolute -inset-6 bg-primary/30 rounded-3xl blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                  {/* Card content */}
                  <div className="relative p-8 rounded-2xl bg-white backdrop-blur-xl border border-[#E0E5F2] shadow-xl">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                    <h3 className="text-2xl font-bold text-[#2B3674] mb-2">Join the Waitlist</h3>
                    <p className="text-[#4363C7] text-sm mb-6">Secure your spot for early access</p>
                    <WaitlistForm source="footer_cta" />
                  </div>
                </div>
                
                <p className="mt-6 text-sm text-[#4363C7]">
                  Be the first to know when we launch
                </p>
              </FadeIn>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-24 relative border-t border-[#E0E5F2] bg-white">
            <div className="container px-4 mx-auto">
              <FadeIn className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#2B3674]">
                  Frequently Asked Questions
                </h2>
                <p className="text-[#4363C7] text-lg">
                  Everything you need to know about SaaS churn
                </p>
              </FadeIn>

              <FAQAccordion />
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 border-t border-[#E0E5F2] bg-white">
            <div className="container px-4 mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="relative h-30 w-30">
                  <Image
                    src="/logo.png"
                    alt="Mentiq Logo"
                    width={120}
                    height={30}
                    className="object-contain"
                  />
                </div>
              </div>
              <p className="text-[#4363C7] text-sm">
                © {new Date().getFullYear()} Mentiq. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link
                  href="#"
                  className="text-[#4363C7] hover:text-primary transition-colors text-sm"
                >
                  Privacy
                </Link>
                <Link
                  href="#"
                  className="text-[#4363C7] hover:text-primary transition-colors text-sm"
                >
                  Terms
                </Link>
                <Link
                  href="#"
                  className="text-[#4363C7] hover:text-primary transition-colors text-sm"
                >
                  Contact
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </AuthLoadingCheck>
    </>
  );
}
