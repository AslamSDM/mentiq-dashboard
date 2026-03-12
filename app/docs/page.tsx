"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Copy,
  Check,
  Terminal,
  Code2,
  Zap,
  Package,
  BookOpen,
  Users,
  ListChecks,
  Activity,
  Settings,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

/* ─── Code Block ─── */
function CodeBlock({
  code,
  language = "javascript",
  title,
}: {
  code: string;
  language?: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-[#1e1e1e]">
      {title && (
        <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-sm text-gray-400 ml-2">{title}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
      <SyntaxHighlighter
        language={language === "tsx" ? "typescript" : language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent",
          fontSize: "0.875rem",
        }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

/* ─── Section ─── */
function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <div className="h-8 w-1 bg-primary rounded-full" />
        {title}
      </h2>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

/* ─── Step Card ─── */
function StepCard({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative pl-10 pb-8 border-l-2 border-white/10 last:border-l-0 last:pb-0">
      <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
        <span className="text-xs font-bold text-primary">{step}</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <div className="space-y-4 text-gray-400">{children}</div>
    </div>
  );
}

/* ─── Callout ─── */
function Callout({
  type = "tip",
  children,
}: {
  type?: "tip" | "warning" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    tip: "bg-primary/10 border-primary/20 text-primary",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  };
  const labels = { tip: "💡 Tip", warning: "⚠️ Note", info: "ℹ️ Info" };

  return (
    <div className={`rounded-xl p-4 border ${styles[type]}`}>
      <p className="text-sm">
        <strong>{labels[type]}:</strong> {children}
      </p>
    </div>
  );
}

/* ─── Sidebar Items ─── */
const navItems = [
  { id: "installation", label: "Installation", icon: Package },
  { id: "quick-start", label: "Quick Start", icon: Zap },
  { id: "identify-users", label: "Identify Users", icon: Users },
  { id: "onboarding", label: "Onboarding Flow", icon: ListChecks },
  { id: "feature-tracking", label: "Feature & Funnel Tracking", icon: BarChart3 },
  { id: "custom-events", label: "Custom Events", icon: Activity },
  { id: "api-reference", label: "Hooks & API Reference", icon: Code2 },
  { id: "configuration", label: "Configuration", icon: Settings },
];

/* ─── Page ─── */
export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("installation");

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                <Image
                  src="/logo.png"
                  alt="Mentiq Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-gray-400">SDK Documentation</span>
          </div>
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 fixed left-0 top-16 bottom-0 border-r border-white/10 bg-black/50 overflow-y-auto">
          <nav className="p-6 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Getting Started
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === item.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64 px-6 lg:px-12 py-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-16"
          >
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-4">
                <Package className="h-4 w-4" />
                mentiq-sdk v1.0.6
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Mentiq SDK
              </h1>
              <p className="text-xl text-gray-400">
                Analytics for React &amp; Next.js — track onboarding, feature
                adoption, funnels, and more in minutes.
              </p>
            </div>

            {/* ───────────────────── 1. Installation ───────────────────── */}
            <Section id="installation" title="Installation">
              <CodeBlock
                language="bash"
                title="Terminal"
                code={`npm install mentiq-sdk

# or
yarn add mentiq-sdk`}
              />
              <Callout type="warning">
                Requires <code className="text-amber-300">React&nbsp;16.8+</code>.
                If you plan to use session recording, also install{" "}
                <code className="text-amber-300">rrweb&nbsp;2.0+</code> as a
                peer dependency.
              </Callout>
            </Section>

            {/* ───────────────────── 2. Quick Start ───────────────────── */}
            <Section id="quick-start" title="Quick Start">
              <p className="text-gray-400">
                Wrap your app with the provider. Only{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  apiKey
                </code>{" "}
                and{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  projectId
                </code>{" "}
                are required — everything else has sensible defaults.
              </p>
              <CodeBlock
                language="tsx"
                title="app/layout.tsx"
                code={`import { MentiqAnalyticsProvider } from "mentiq-sdk";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MentiqAnalyticsProvider
          config={{
            apiKey: "mentiq_live_your_api_key",
            projectId: "your-project-id",
          }}
        >
          {children}
        </MentiqAnalyticsProvider>
      </body>
    </html>
  );
}`}
              />
              <Callout type="tip">
                Find your API key in the{" "}
                <Link href="/dashboard/projects" className="underline">
                  Projects page
                </Link>{" "}
                of your dashboard. A key is created automatically with every new
                project.
              </Callout>

              <div className="mt-2">
                <h3 className="text-lg font-semibold text-white mb-3">
                  What happens automatically
                </h3>
                <div className="grid gap-2">
                  {[
                    "Anonymous ID & session created in localStorage",
                    "Page views tracked on every navigation (SPA-aware)",
                    "Session duration, scroll depth & click count recorded",
                    "Email auto-detected from NextAuth, Supabase, Firebase, Clerk, Auth0",
                    "Events batched (20 per batch) and flushed every 10 s",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-green-500/5 border border-green-500/20"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* ───────────────────── 3. Identify Users ───────────────────── */}
            <Section id="identify-users" title="Identify Users">
              <p className="text-gray-400">
                Until you call{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  identify()
                </code>
                , events are anonymous. Call it after login to link all past and
                future events to a known user.
              </p>
              <CodeBlock
                language="tsx"
                title="after-login.tsx"
                code={`import { useAnalytics } from "mentiq-sdk";

function AfterLogin({ user }) {
  const { identify, reset } = useAnalytics();

  // Call once after login
  identify(user.id, {
    email: user.email,
    name: user.name,
    plan: user.plan,        // optional traits
    created_at: user.createdAt,
  });

  // On logout — clears userId, empties queue, starts fresh session
  const handleLogout = () => reset();
}`}
              />
              <Callout type="info">
                Email is also auto-detected from common auth providers
                (NextAuth, Supabase, Firebase, Clerk, Auth0). Passing it in{" "}
                <code className="text-blue-300">identify()</code> is still
                recommended for reliability.
              </Callout>
            </Section>

            {/* ───────────────────── 4. Onboarding Flow ⭐ ───────────────────── */}
            <Section id="onboarding" title="Onboarding Flow">
              <p className="text-gray-400 mb-2">
                Track every step of your user onboarding with the built-in{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  OnboardingTracker
                </code>
                . Nothing runs automatically — you define the steps and call
                methods at the right points in your UI.
              </p>

              {/* Step 1 */}
              <StepCard step={1} title="Define your onboarding steps">
                <p>
                  Create a tracker by passing the analytics instance and an
                  array of steps. Mark steps as{" "}
                  <code className="text-white">required</code> or optional.
                </p>
                <CodeBlock
                  language="tsx"
                  title="hooks/use-onboarding.ts"
                  code={`import { OnboardingTracker, useAnalytics } from "mentiq-sdk";

export function useOnboarding() {
  const { analytics } = useAnalytics();

  const tracker = new OnboardingTracker(analytics, {
    steps: [
      { name: "create_account",   index: 0, required: true  },
      { name: "complete_profile", index: 1, required: true  },
      { name: "invite_team",      index: 2, required: false }, // optional
      { name: "create_project",   index: 3, required: true  },
      { name: "install_sdk",      index: 4, required: true  },
    ],
  });

  return tracker;
}`}
                />
              </StepCard>

              {/* Step 2 */}
              <StepCard step={2} title="Start the onboarding">
                <p>
                  Call <code className="text-white">start()</code> when the user
                  begins onboarding. This fires an{" "}
                  <code className="text-primary">onboarding_started</code>{" "}
                  event.
                </p>
                <CodeBlock
                  language="tsx"
                  title="OnboardingWizard.tsx"
                  code={`function OnboardingWizard() {
  const tracker = useOnboarding();

  useEffect(() => {
    tracker.start(); // → fires "onboarding_started" { total_steps: 5 }
  }, []);

  // ...
}`}
                />
              </StepCard>

              {/* Step 3 */}
              <StepCard step={3} title="Complete or skip steps">
                <p>
                  Call{" "}
                  <code className="text-white">completeStep(&quot;step_name&quot;)</code>{" "}
                  when the user finishes a step. For optional steps you can call{" "}
                  <code className="text-white">
                    skipStep(&quot;step_name&quot;, &quot;reason&quot;)
                  </code>
                  .
                </p>
                <CodeBlock
                  language="tsx"
                  title="Step handlers"
                  code={`// User finished their profile
tracker.completeStep("complete_profile");
// → fires "onboarding_step_completed" {
//     step_name: "complete_profile",
//     step_index: 1,
//     progress: 40,            // percentage
//     time_since_start: 23000  // ms since start()
//   }

// User skips the optional "invite_team" step
tracker.skipStep("invite_team", "will do later");
// → fires "onboarding_step_skipped" {
//     step_name: "invite_team",
//     reason: "will do later"
//   }
// Note: skipStep() is ignored for required steps.`}
                />
              </StepCard>

              {/* Step 4 */}
              <StepCard step={4} title="Completion & abandonment">
                <p>
                  When the last step is completed,{" "}
                  <code className="text-primary">onboarding_completed</code>{" "}
                  fires <strong className="text-white">automatically</strong>.
                  If the user leaves early, call{" "}
                  <code className="text-white">abandon()</code>.
                </p>
                <CodeBlock
                  language="tsx"
                  title="Completion & abandon"
                  code={`// Last required step done → auto-fires "onboarding_completed"
tracker.completeStep("install_sdk");
// → "onboarding_completed" {
//     completion_rate: 100,
//     duration_seconds: 142
//   }

// If user closes the wizard early
tracker.abandon("closed_modal");
// → "onboarding_abandoned" {
//     step_name: "create_project",
//     progress: 60,
//     reason: "closed_modal"
//   }`}
                />
              </StepCard>

              {/* Step 5 */}
              <StepCard step={5} title="Read progress anytime">
                <CodeBlock
                  language="tsx"
                  title="Reading state"
                  code={`const progress = tracker.getProgress();
// {
//   currentStep: "complete_profile",
//   currentStepIndex: 1,
//   completedSteps: ["create_account", "complete_profile"],
//   totalSteps: 5,
//   progressPercent: 40,
//   duration: 23000  // ms
// }

tracker.isStepCompleted("invite_team"); // → false
tracker.reset();                        // clear all state`}
                />
              </StepCard>

              {/* Events table */}
              <h3 className="text-lg font-semibold text-white mt-4 mb-3">
                Events fired by OnboardingTracker
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Event
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Key properties
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {[
                      {
                        event: "onboarding_started",
                        props: "total_steps",
                      },
                      {
                        event: "onboarding_step_completed",
                        props:
                          "step_name, step_index, required, progress (%), time_since_start",
                      },
                      {
                        event: "onboarding_step_skipped",
                        props:
                          "step_name, step_index, reason — only fires for optional steps",
                      },
                      {
                        event: "onboarding_completed",
                        props:
                          "completion_rate (%), duration_ms, duration_seconds",
                      },
                      {
                        event: "onboarding_abandoned",
                        props:
                          "step_name, step_index, progress (%), duration_ms, reason",
                      },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-3 px-4 font-mono text-primary whitespace-nowrap">
                          {row.event}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {row.props}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* React hook shortcut */}
              <h3 className="text-lg font-semibold text-white mt-6 mb-3">
                React hook shortcut
              </h3>
              <p className="text-gray-400 mb-3">
                The SDK also exports{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  useOnboardingTracker
                </code>{" "}
                if you prefer a more concise setup:
              </p>
              <CodeBlock
                language="tsx"
                title="Using the hook"
                code={`import { useOnboardingTracker, useAnalytics } from "mentiq-sdk";

function Onboarding() {
  const { analytics } = useAnalytics();

  const tracker = useOnboardingTracker(analytics, {
    steps: [
      { name: "profile", index: 0, required: true },
      { name: "team",    index: 1, required: false },
      { name: "project", index: 2, required: true },
    ],
  });

  // tracker is null if analytics isn't ready yet
  if (!tracker) return <Loading />;

  return <OnboardingUI tracker={tracker} />;
}`}
              />
            </Section>

            {/* ───────────────── 5. Feature & Funnel Tracking ⭐ ───────────────── */}
            <Section id="feature-tracking" title="Feature & Funnel Tracking">
              {/* Feature Usage */}
              <h3 className="text-lg font-semibold text-white mb-3">
                Track feature usage
              </h3>
              <p className="text-gray-400 mb-4">
                Call{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  trackFeatureUsage()
                </code>{" "}
                every time a user interacts with a key feature. This fires a{" "}
                <code className="text-primary">feature_used</code> event and
                feeds into the churn-risk feature-adoption score.
              </p>
              <CodeBlock
                language="tsx"
                title="FeatureTracking.tsx"
                code={`import { useAnalytics } from "mentiq-sdk";

function ExportButton() {
  const { analytics } = useAnalytics();

  const handleExport = () => {
    analytics.trackFeatureUsage("export_report", {
      format: "pdf",
      row_count: 150,
    });
    // → fires "feature_used" { feature_name: "export_report", format: "pdf", ... }
  };

  return <button onClick={handleExport}>Export PDF</button>;
}

function AIAssistant() {
  const { analytics } = useAnalytics();

  const handleAsk = (question: string) => {
    analytics.trackFeatureUsage("ai_assistant", {
      question_length: question.length,
      category: "support",
    });
  };
}`}
              />

              {/* Funnel Tracking */}
              <h3 className="text-lg font-semibold text-white mt-8 mb-3">
                Conversion funnels
              </h3>
              <p className="text-gray-400 mb-4">
                Track multi-step flows like checkout, upgrade, or signup. The
                SDK manages funnel state and auto-abandons after 5 minutes of
                inactivity.
              </p>
              <CodeBlock
                language="tsx"
                title="CheckoutFunnel.tsx"
                code={`import { useAnalytics } from "mentiq-sdk";

function Checkout() {
  const { analytics } = useAnalytics();

  // 1. Start the funnel (sets a 5-min auto-abandon timer)
  const beginCheckout = () => {
    analytics.startFunnel("checkout");
    // → fires "funnel_step" { funnel_name: "checkout", step_name: "start", step_index: 0 }
  };

  // 2. Advance through steps
  const selectPlan = (plan: string) => {
    analytics.advanceFunnel("checkout", "select_plan", { plan });
    // → fires "funnel_step" { step_name: "select_plan", step_index: 1, time_in_funnel: 12000 }
  };

  const enterPayment = () => {
    analytics.advanceFunnel("checkout", "payment_info");
  };

  // 3. Complete or abandon
  const confirmPurchase = () => {
    analytics.completeFunnel("checkout", { total: 4900 });
    // → fires "funnel_completed" { funnel_name: "checkout", total: 4900 }
  };

  const cancel = () => {
    analytics.abandonFunnel("checkout", "user_cancelled");
    // → fires "funnel_abandoned" { abandoned_at_step: 2, abandon_reason: "user_cancelled" }
  };
}`}
              />

              <Callout type="tip">
                Use{" "}
                <code className="text-primary">analytics.getFunnelState(&quot;checkout&quot;)</code>{" "}
                to read the current step, time in funnel, and step history at
                any point.
              </Callout>

              {/* Funnel events reference */}
              <h3 className="text-lg font-semibold text-white mt-6 mb-3">
                Funnel events reference
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Event
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Key properties
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {[
                      {
                        event: "funnel_step",
                        props:
                          "funnel_name, step_name, step_index, time_in_funnel, previous_step",
                      },
                      {
                        event: "funnel_completed",
                        props: "funnel_name, + your custom props",
                      },
                      {
                        event: "funnel_abandoned",
                        props:
                          "funnel_name, abandoned_at_step, abandon_reason, time_before_abandon, completion_percentage",
                      },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-3 px-4 font-mono text-primary whitespace-nowrap">
                          {row.event}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {row.props}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* ───────────────────── 6. Custom Events ───────────────────── */}
            <Section id="custom-events" title="Custom Events">
              <p className="text-gray-400 mb-4">
                Use{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  track()
                </code>{" "}
                for any event not covered by the built-in methods:
              </p>
              <CodeBlock
                language="tsx"
                title="Component.tsx"
                code={`import { useAnalytics } from "mentiq-sdk";

function SignupButton() {
  const { track } = useAnalytics();

  return (
    <button
      onClick={() =>
        track("button_clicked", {
          button: "signup_cta",
          page: "hero",
          variant: "blue",
        })
      }
    >
      Sign Up Free
    </button>
  );
}`}
              />
              <Callout type="info">
                Events are batched (20 per batch) and flushed automatically
                every 10 seconds. Call{" "}
                <code className="text-blue-300">flush()</code> to send
                immediately.
              </Callout>
            </Section>

            {/* ───────────────────── 7. Hooks & API Reference ───────────────────── */}
            <Section id="api-reference" title="Hooks & API Reference">
              <h3 className="text-lg font-semibold text-white mb-3">
                React Hooks
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Hook
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Returns
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {[
                      {
                        hook: "useAnalytics()",
                        returns:
                          "track, page, identify, reset, flush, analytics instance",
                      },
                      {
                        hook: "usePageTracking()",
                        returns: "Auto-fires page_view on mount",
                      },
                      {
                        hook: "useInteractionTracking()",
                        returns: "trackClick, trackHover, trackView helpers",
                      },
                      {
                        hook: "useElementTracking(ref)",
                        returns:
                          "IntersectionObserver visibility tracking",
                      },
                      {
                        hook: "useSessionTracking()",
                        returns:
                          "duration, pageViews, clicks, scrollDepth",
                      },
                      {
                        hook: "useErrorTracking()",
                        returns: "trackJavaScriptError, trackCustomError",
                      },
                      {
                        hook: "usePerformanceTracking()",
                        returns: "Web Vitals + measureCustomPerformance",
                      },
                      {
                        hook: "useSubscriptionTracking()",
                        returns:
                          "Subscription event helpers (started, upgraded, canceled …)",
                      },
                      {
                        hook: "useChurnRisk()",
                        returns:
                          "risk_score (0–100), risk_category, intervention_recommended",
                      },
                      {
                        hook: "useSyncSubscription(sub)",
                        returns:
                          "Syncs subscription state; auto-fires upgrade/downgrade",
                      },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-3 px-4 font-mono text-primary text-xs whitespace-nowrap">
                          {row.hook}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {row.returns}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-white mt-8 mb-3">
                Analytics instance methods
              </h3>
              <div className="space-y-2">
                {[
                  {
                    method: "track(event, props?)",
                    desc: "Track a custom event",
                  },
                  {
                    method: "page(props?)",
                    desc: "Manual page view",
                  },
                  {
                    method: "identify(userId, traits?)",
                    desc: "Link events to a known user",
                  },
                  {
                    method: "reset()",
                    desc: "Clear user, empty queue, new session",
                  },
                  {
                    method: "flush()",
                    desc: "Send queued events immediately",
                  },
                  {
                    method: "trackFeatureUsage(name, props?)",
                    desc: "Fires feature_used — feeds churn risk",
                  },
                  {
                    method: "startFunnel(name)",
                    desc: "Begin a funnel (5-min auto-abandon)",
                  },
                  {
                    method: "advanceFunnel(name, step)",
                    desc: "Move to next funnel step",
                  },
                  {
                    method: "completeFunnel(name)",
                    desc: "Mark funnel as completed",
                  },
                  {
                    method: "abandonFunnel(name, reason?)",
                    desc: "Mark funnel as abandoned",
                  },
                  {
                    method: "calculateChurnRisk()",
                    desc: "Returns risk_score, risk_category, factors",
                  },
                  {
                    method: "getActiveSession()",
                    desc: "Session metrics (duration, pageViews, clicks, scrollDepth)",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <code className="font-mono text-sm text-primary bg-primary/10 px-2 py-1 rounded whitespace-nowrap">
                      {item.method}
                    </code>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* ───────────────────── 8. Configuration ───────────────────── */}
            <Section id="configuration" title="Configuration">
              <p className="text-gray-400 mb-4">
                All config options with defaults. Only{" "}
                <code className="text-primary bg-primary/10 px-1 rounded">
                  apiKey
                </code>{" "}
                and{" "}
                <code className="text-primary bg-primary/10 px-1 rounded">
                  projectId
                </code>{" "}
                are required.
              </p>
              <CodeBlock
                language="tsx"
                title="Full config reference"
                code={`<MentiqAnalyticsProvider
  config={{
    // Required
    apiKey: "mentiq_live_abc123",
    projectId: "my-project",

    // Optional — defaults shown
    endpoint: "https://api.mentiq.io",
    debug: false,
    sessionTimeout: 1800000,           // 30 min

    // Batching
    batchSize: 20,
    flushInterval: 10000,              // 10 s
    maxQueueSize: 1000,

    // Retry
    retryAttempts: 3,
    retryDelay: 1000,                  // exponential backoff base

    // Feature flags (all default to false except autoPageTracking)
    enableAutoPageTracking: true,
    enableHeatmapTracking: false,
    enableSessionRecording: false,
    enablePerformanceTracking: false,
    enableErrorTracking: false,
    enableABTesting: false,
  }}
>
  <App />
</MentiqAnalyticsProvider>`}
              />
            </Section>

            {/* Need Help */}
            <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent border border-primary/20">
              <h3 className="text-2xl font-bold text-white mb-2">
                Need Help?
              </h3>
              <p className="text-gray-400 mb-6">
                Check out the SDK source on GitHub or reach out to support.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://github.com/AslamSDM/mentiq-sdk"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    View on GitHub
                  </Button>
                </a>
                <Button className="bg-primary hover:bg-primary/90">
                  Contact Support
                </Button>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
