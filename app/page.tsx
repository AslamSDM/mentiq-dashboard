"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  MousePointerClick,
  Users,
  Activity,
  Zap,
  LineChart,
  PieChart,
  Loader2,
  Check,
} from "lucide-react";
import { AnimatedText, FadeIn } from "@/components/ui/animated-components";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// Waitlist Form Component
function WaitlistForm({ source = "landing_page" }: { source?: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    company: "",
    user_count: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) {
      toast({
        title: "Missing fields",
        description: "Please enter your name and email.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          user_count: formData.user_count ? parseInt(formData.user_count) : 0,
          source,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        toast({
          title: "You're on the list! 🎉",
          description: "Check your email for confirmation.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to join waitlist",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30 mb-4">
          <Check className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
        <p className="text-gray-400">We'll be in touch soon with early access.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-white">Full Name *</Label>
          <Input
            id="full_name"
            placeholder="John Doe"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company" className="text-white">Company Name</Label>
          <Input
            id="company"
            placeholder="Acme Inc."
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user_count" className="text-white">Expected Users</Label>
          <Input
            id="user_count"
            type="number"
            placeholder="e.g. 500"
            value={formData.user_count}
            onChange={(e) => setFormData({ ...formData, user_count: e.target.value })}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-white shadow-[0_0_30px_-5px_var(--primary)]"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Joining...
          </>
        ) : (
          <>
            Join the Waitlist <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
    </form>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white overflow-x-hidden selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-30 w-30">
              <img
                src="/logo.png"
                alt="Mentiq Logo"
                className={
                  "object-contain transition-all duration-300" + "h-30 w-30"
                }
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/signin"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

        <div className="container px-4 mx-auto text-center relative z-10">
          <FadeIn
            delay={0.2}
            className="inline-flex items-center justify-center px-4 py-1.5 mb-8 text-sm font-medium rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-white/90 shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)]"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse shadow-[0_0_10px_var(--primary)]"></span>
            Coming Soon - Join the Waitlist
          </FadeIn>

          <div className="mb-8 relative">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50">
                Mentiq
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Cut Monthly Churn in HALF{" "}
              <span className="text-white font-medium">Within 90 days</span>
            </p>
          </div>

          <FadeIn delay={0.4}>
            <p className="text-lg text-gray-400/80 max-w-2xl mx-auto mb-10">
              The only analytics platform built for founders who want actionable
              retention insights, not just data dumps.
            </p>
          </FadeIn>

          {/* Waitlist Form in Hero */}
          <FadeIn delay={0.6} className="max-w-xl mx-auto">
            <div className="relative group">
              {/* Animated gradient border */}
              <div className="absolute -inset-[2px] bg-gradient-to-r from-primary via-purple-500 to-primary rounded-2xl opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x"></div>
              <div className="absolute -inset-[2px] bg-gradient-to-r from-primary via-purple-500 to-primary rounded-2xl opacity-50 animate-gradient-x"></div>
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
              {/* Card content */}
              <div className="relative p-8 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 shadow-[0_0_50px_-12px_var(--primary)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                <h3 className="text-2xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">Get Early Access</h3>
                <p className="text-gray-400 text-sm mb-6">Be the first to kill churn with Mentiq</p>
                <WaitlistForm source="hero" />
              </div>
            </div>
          </FadeIn>

          {/* Dashboard Preview */}
          <FadeIn delay={0.8} className="mt-20 relative mx-auto max-w-5xl">
            <div className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm p-2 shadow-2xl shadow-primary/20">
              <div className="rounded-lg overflow-hidden bg-white/5 aspect-[16/9] relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                {/* Abstract representation of dashboard */}
                <div className="grid grid-cols-12 gap-4 p-6 h-full opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="col-span-3 space-y-4">
                    <div className="h-8 w-3/4 bg-white/10 rounded animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-white/5 rounded"></div>
                    <div className="h-4 w-2/3 bg-white/5 rounded"></div>
                    <div className="h-32 bg-white/5 rounded-xl mt-8 border border-white/5"></div>
                  </div>
                  <div className="col-span-9 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-24 bg-primary/10 rounded-xl border border-primary/20"></div>
                      <div className="h-24 bg-purple-500/10 rounded-xl border border-purple-500/20"></div>
                      <div className="h-24 bg-blue-500/10 rounded-xl border border-blue-500/20"></div>
                    </div>
                    <div className="h-64 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
                      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/20 to-transparent"></div>
                      <svg
                        className="w-full h-full absolute bottom-0"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M0,100 Q200,50 400,80 T800,40 T1200,90 V200 H0 Z"
                          fill="url(#gradient)"
                          opacity="0.3"
                        />
                        <defs>
                          <linearGradient
                            id="gradient"
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="var(--primary)"
                              stopOpacity="0.5"
                            />
                            <stop
                              offset="100%"
                              stopColor="var(--primary)"
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
                  <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium text-white">
                    Interactive Dashboard Preview
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-24 relative border-y border-white/5 bg-white/[0.02]">
        <div className="container px-4 mx-auto">
          <FadeIn direction="up" className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
              Who is Mentiq for?
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 leading-relaxed font-light">
              Built{" "}
              <span className="font-bold text-white bg-primary/20 px-2 py-0.5 rounded border border-primary/30">
                ONLY for SaaS founders
              </span>{" "}
              who are tired of complex analytics tools and want to focus on what
              matters: <span className="text-white">Retention & Revenue.</span>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* What You'll See */}
      <section className="py-32 relative">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        <div className="container px-4 mx-auto relative z-10">
          <FadeIn className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
              What You'll See
            </h2>
            <p className="text-gray-400 text-lg">
              Actionable insights delivered straight to your eyes.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FadeIn delay={0.2} direction="up" className="h-full">
              <SpotlightCard className="p-8 h-full bg-white/5 backdrop-blur-sm border-white/10 hover:border-red-500/50 transition-colors group">
                <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 text-red-500 group-hover:scale-110 transition-transform duration-300 border border-red-500/20">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">
                  Churn Risk
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Identify exactly who is about to leave before they do. Get a
                  list of at-risk users every morning.
                </p>
              </SpotlightCard>
            </FadeIn>

            <FadeIn delay={0.4} direction="up" className="h-full">
              <SpotlightCard className="p-8 h-full bg-white/5 backdrop-blur-sm border-white/10 hover:border-amber-500/50 transition-colors group">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 text-amber-500 group-hover:scale-110 transition-transform duration-300 border border-amber-500/20">
                  <Search className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">
                  Root Causes
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Understand the "Why". Is it a missing feature? Poor
                  onboarding? Pricing? We tell you.
                </p>
              </SpotlightCard>
            </FadeIn>

            <FadeIn delay={0.6} direction="up" className="h-full">
              <SpotlightCard className="p-8 h-full bg-white/5 backdrop-blur-sm border-white/10 hover:border-green-500/50 transition-colors group">
                <div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 text-green-500 group-hover:scale-110 transition-transform duration-300 border border-green-500/20">
                  <Zap className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">
                  Save Strategies
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Get automated playbooks to win them back. Trigger emails,
                  offers, or support outreach instantly.
                </p>
              </SpotlightCard>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* How Does Mentiq Work */}
      <section className="py-32 bg-white/[0.02] border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary-rgb),0.05),transparent_50%)]"></div>

        <div className="container px-4 mx-auto relative z-10">
          <FadeIn className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How does Mentiq Work?
            </h2>
            <p className="text-gray-400 text-lg">
              It's not magic, it's just smarter analytics.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div className="space-y-10">
              <FadeIn delay={0.2} direction="right">
                <div className="flex gap-6 group">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)] group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-white">
                      We map your product
                    </h3>
                    <p className="text-gray-400 text-lg">
                      We automatically identify every feature, button, and page
                      in your app.
                    </p>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.4} direction="right">
                <div className="flex gap-6 group">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)] group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-white">
                      We track user journeys
                    </h3>
                    <p className="text-gray-400 text-lg">
                      We monitor how every single user interacts with your
                      features in real-time.
                    </p>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.6} direction="right">
                <div className="flex gap-6 group">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)] group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-white">
                      Then we reveal:
                    </h3>
                    <ul className="space-y-4 text-gray-400">
                      {[
                        "Real adoption depth per user",
                        "Users who are slipping away",
                        "Features that drive retention",
                        "Actions that trigger upgrades",
                      ].map((item, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + i * 0.1 }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-primary/30 transition-colors"
                        >
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                          <span className="font-medium text-white/90">
                            {item}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </FadeIn>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FadeIn delay={0.3} className="col-span-2">
                <SpotlightCard className="bg-black/40 border border-white/10 rounded-2xl p-8 shadow-2xl aspect-[2/1] flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-colors relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Activity className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-lg font-bold text-white mb-1">
                    User Health Dash
                  </span>
                  <span className="text-sm text-gray-400">
                    Live health scores
                  </span>
                </SpotlightCard>
              </FadeIn>
              <FadeIn delay={0.5}>
                <SpotlightCard className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl aspect-square flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-colors relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <BarChart3 className="h-10 w-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-base font-bold text-white">
                    Churn by Channel
                  </span>
                </SpotlightCard>
              </FadeIn>
              <FadeIn delay={0.7}>
                <SpotlightCard className="bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl aspect-square flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-colors relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <MousePointerClick className="h-10 w-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-base font-bold text-white">
                    Heatmaps
                  </span>
                </SpotlightCard>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Why Mentiq is BETTER */}
      <section className="py-32 relative">
        <div className="container px-4 mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Mentiq is BETTER
            </h2>
            <p className="text-gray-400 text-lg">
              Stop settling for vanity metrics.
            </p>
          </FadeIn>

          <FadeIn
            delay={0.2}
            className="max-w-5xl mx-auto overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black/40 backdrop-blur-md"
          >
            <div className="grid grid-cols-2 bg-white/5 p-6 font-bold text-xl border-b border-white/10">
              <div className="text-gray-400 pl-4">Others show</div>
              <div className="text-primary pl-4">Mentiq Reveals</div>
            </div>

            {[
              { other: "% of Active users", mentiq: "Real adoption depth" },
              {
                other: "Feature usage heatmap",
                mentiq: "Retention driven feature importance",
              },
              { other: "Churn %", mentiq: "Who will churn, when and why" },
              {
                other: "Cancellation surveys",
                mentiq: "Behaviour before cancellation",
              },
              {
                other: "Product analytics",
                mentiq: "Product + Behaviour + Churn insights",
              },
            ].map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="grid grid-cols-2 p-6 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-4 text-gray-400 group-hover:text-white/70 transition-colors">
                  <XCircle className="h-6 w-6 text-red-500/50 group-hover:text-red-500 transition-colors" />
                  <span className="text-lg">{row.other}</span>
                </div>
                <div className="flex items-center gap-4 font-bold text-white">
                  <CheckCircle2 className="h-6 w-6 text-primary group-hover:scale-110 transition-transform shadow-[0_0_10px_var(--primary)]" />
                  <span className="text-lg">{row.mentiq}</span>
                </div>
              </motion.div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* Final CTA - Waitlist */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-primary/5 to-black"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

        <div className="container px-4 mx-auto text-center relative z-10">
          <FadeIn className="max-w-4xl mx-auto">
            <div className="mb-12 inline-block p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-8 text-white">
              A Note from the Founders
            </h2>
            <blockquote className="text-2xl md:text-3xl italic text-gray-400 mb-12 leading-relaxed font-light">
              "We built Mentiq because we struggled with one thing: <br />
              <span className="text-white font-normal not-italic">
                We could acquire users. We could activate them. But we couldn't
                keep them.
              </span>
              "
            </blockquote>
            <div className="space-y-6 mb-16">
              <h3 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-primary animate-gradient-x">
                Mentiq Simplifies that.
              </h3>
              <p className="text-2xl font-medium text-white/80">
                It turns retention into a system.
              </p>
            </div>
            
            {/* Waitlist Form */}
            <div className="max-w-xl mx-auto relative group">
              {/* Animated gradient border */}
              <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-500 via-primary to-purple-500 rounded-2xl opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x"></div>
              <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-500 via-primary to-purple-500 rounded-2xl opacity-50 animate-gradient-x"></div>
              {/* Glow effect */}
              <div className="absolute -inset-6 bg-primary/30 rounded-3xl blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
              {/* Card content */}
              <div className="relative p-8 rounded-2xl bg-black/90 backdrop-blur-xl border border-white/20 shadow-[0_0_60px_-12px_var(--primary)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                <h3 className="text-2xl font-bold text-white mb-2">Join the Waitlist</h3>
                <p className="text-gray-400 text-sm mb-6">Secure your spot for early access</p>
                <WaitlistForm source="footer_cta" />
              </div>
            </div>
            
            <p className="mt-6 text-sm text-gray-400">
              Be the first to know when we launch
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-black">
        <div className="container px-4 mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="relative  h-30 w-30 opacity-70">
              <Image
                src="/logo.png"
                alt="Mentiq Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Mentiq. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-gray-400 hover:text-primary transition-colors text-sm"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-primary transition-colors text-sm"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-gray-400 hover:text-primary transition-colors text-sm"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
