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
  Settings,
  Eye,
  Activity,
  Shield,
  Cpu,
  Users,
  ListChecks,
} from "lucide-react";
import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// Code block component with syntax highlighting
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

// Section component
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

// Badge component for auto/manual labels
function Badge({ type }: { type: "auto" | "manual" | "opt-in" }) {
  const styles = {
    auto: "bg-green-500/15 text-green-400 border-green-500/30",
    manual: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    "opt-in": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };
  const labels = { auto: "Auto", manual: "Manual", "opt-in": "Opt-in flag" };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${styles[type]}`}
    >
      {labels[type]}
    </span>
  );
}

// Navigation items for sidebar
const navItems = [
  { id: "installation", label: "Installation", icon: Package },
  { id: "quick-start", label: "Quick Start", icon: Zap },
  { id: "provider-setup", label: "Provider Setup", icon: Settings },
  { id: "auto-setup", label: "What's Auto Set Up", icon: Cpu },
  { id: "tracking-events", label: "Tracking Events", icon: Activity },
  { id: "user-identification", label: "User Identification", icon: Users },
  { id: "onboarding-tracking", label: "Onboarding Tracking", icon: ListChecks },
  { id: "page-tracking", label: "Page Tracking", icon: Eye },
  { id: "heatmaps", label: "Heatmap Tracking", icon: Activity },
  { id: "session-recording", label: "Session Recording", icon: Terminal },
  { id: "configuration", label: "Configuration", icon: Settings },
  { id: "api-reference", label: "API Reference", icon: Code2 },
];

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
              Documentation
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
                Mentiq SDK Documentation
              </h1>
              <p className="text-xl text-gray-400">
                A comprehensive analytics SDK for React and Next.js with event
                tracking, session monitoring, heatmaps, and session recording.
              </p>
            </div>

            {/* Installation */}
            <Section id="installation" title="Installation">
              <p className="text-gray-400 mb-4">
                Install the Mentiq SDK using npm or yarn:
              </p>
              <CodeBlock
                language="bash"
                title="Terminal"
                code={`$ npm install mentiq-sdk

# or with yarn
$ yarn add mentiq-sdk`}
              />
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mt-4">
                <p className="text-sm text-amber-400">
                  <strong>Note:</strong> The SDK requires React 16.8+ and rrweb
                  2.0+ as peer dependencies for session recording.
                </p>
              </div>
            </Section>

            {/* Quick Start */}
            <Section id="quick-start" title="Quick Start">
              <p className="text-gray-400 mb-4">
                Wrap your app with the{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  MentiqAnalyticsProvider
                </code>{" "}
                and start tracking in minutes. Only{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  apiKey
                </code>{" "}
                and{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  projectId
                </code>{" "}
                are required.
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
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-4">
                <p className="text-sm text-primary">
                  <strong>💡 Tip:</strong> Find your API key in the{" "}
                  <Link href="/dashboard/projects" className="underline">
                    Projects page
                  </Link>{" "}
                  of your dashboard. An API key is automatically created when
                  you create a project.
                </p>
              </div>
            </Section>

            {/* Provider Setup */}
            <Section id="provider-setup" title="Provider Setup">
              <p className="text-gray-400 mb-4">
                The provider accepts a full config object. Here is an example
                with all available options:
              </p>
              <CodeBlock
                language="tsx"
                title="app/layout.tsx — Full config"
                code={`<MentiqAnalyticsProvider
  config={{
    // Required
    apiKey: "mentiq_live_abc123",
    projectId: "my-project",

    // Optional — defaults shown
    endpoint: "https://api.mentiq.io",   // Backend URL
    debug: false,                         // Console logs
    sessionTimeout: 1800000,              // 30 min inactivity resets session

    // Batching
    batchSize: 20,                        // Events per batch
    flushInterval: 10000,                 // Auto-flush every 10 s
    maxQueueSize: 1000,                   // Max queued events

    // Retry
    retryAttempts: 3,
    retryDelay: 1000,                     // Exponential backoff base

    // Feature flags (all false by default)
    enableAutoPageTracking: true,         // On by default — set false to disable
    enablePerformanceTracking: false,
    enableHeatmapTracking: false,
    enableSessionRecording: false,
    enableErrorTracking: false,
    enableABTesting: false,
  }}
>
  <App />
</MentiqAnalyticsProvider>`}
              />
            </Section>

            {/* Auto Setup */}
            <Section id="auto-setup" title="What's Automatically Set Up">
              <p className="text-gray-400">
                The moment the provider mounts on the client, the following
                happen with{" "}
                <strong className="text-white">zero extra config</strong>:
              </p>

              <div className="space-y-3">
                {[
                  {
                    title: "Anonymous ID & Session ID",
                    desc: "A persistent UUID is created in localStorage as mentiq_anonymous_id. A fresh session UUID is created per session.",
                  },
                  {
                    title: "Session Tracking",
                    desc: "Listens to mousedown, mousemove, keypress, scroll, touchstart to track duration, scroll depth, click count and page changes. After 30 min of inactivity a session_end event is fired and a new session begins.",
                  },
                  {
                    title: "Auto Page Tracking",
                    desc: "Fires a page_view on mount, patches history.pushState / replaceState for SPA navigation, and listens to popstate. Disable with enableAutoPageTracking: false.",
                  },
                  {
                    title: "Event Queue & Batching",
                    desc: "Events are queued and auto-flushed every 10 s or when the queue hits 20 events. Failed batches retry up to 3 times with exponential backoff.",
                  },
                  {
                    title: "Email Auto-Detection",
                    desc: "Scans NextAuth, Supabase, Firebase, Clerk, Auth0, generic localStorage keys, and cookies for the current user's email. If found, it's appended to every event automatically.",
                  },
                  {
                    title: "Subscription Auto-Detection",
                    desc: "1 second after mount, scans window globals and localStorage for Stripe, Paddle, or Chargebee subscription data. Detected plan/status/MRR is cached and enriched into every event.",
                  },
                  {
                    title: "SSR Safety",
                    desc: "The Analytics class is dynamically imported — on the server the provider renders children transparently with no side effects.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 rounded-xl bg-green-500/5 border border-green-500/20"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {item.title}
                      </p>
                      <p className="text-gray-400 text-sm mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-white mt-8 mb-3">
                Opt-in Features (disabled by default)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Flag
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        What it enables
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {[
                      {
                        flag: "enablePerformanceTracking",
                        desc: "Fires page_performance event with load_time, dom_ready, first_byte, dns_lookup on page load",
                      },
                      {
                        flag: "enableHeatmapTracking",
                        desc: "Global click, mousemove (500 ms debounce), and scroll (1 s debounce) listeners — sends heatmap events with coordinates and element selectors",
                      },
                      {
                        flag: "enableErrorTracking",
                        desc: "Global error and unhandledrejection listeners — fires javascript_error and unhandled_rejection events",
                      },
                      {
                        flag: "enableSessionRecording",
                        desc: "Starts SessionRecorder (rrweb) automatically and streams DOM mutations to the backend",
                      },
                      {
                        flag: "enableABTesting",
                        desc: "Activates the A/B testing system — requires abTestConfig",
                      },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-3 px-4 font-mono text-primary whitespace-nowrap">
                          {row.flag}
                        </td>
                        <td className="py-3 px-4">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Tracking Events */}
            <Section id="tracking-events" title="Tracking Events">
              <p className="text-gray-400 mb-4">
                Use the{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  useAnalytics
                </code>{" "}
                hook to track custom events anywhere in your app:
              </p>
              <CodeBlock
                language="tsx"
                title="Component.tsx"
                code={`import { useAnalytics } from "mentiq-sdk";

function SignupButton() {
  const { track } = useAnalytics();

  return (
    <button onClick={() => track("button_clicked", { button: "signup_cta", page: "hero" })}>
      Sign Up
    </button>
  );
}

// Feature usage — feeds churn risk calculation
function ExportButton() {
  const { analytics } = useAnalytics();

  const handleExport = () => {
    analytics.trackFeatureUsage("export_report", {
      format: "pdf",
      row_count: 150,
    });
  };

  return <button onClick={handleExport}>Export PDF</button>;
}`}
              />

              <h3 className="text-lg font-semibold text-white mt-8 mb-4">
                How Event Batching Works
              </h3>
              <div className="text-gray-400 space-y-2">
                <p>Events are automatically batched for optimal performance:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong className="text-white">By size:</strong> When queue
                    reaches batchSize (default: 20 events)
                  </li>
                  <li>
                    <strong className="text-white">By time:</strong> Every
                    flushInterval (default: 10 seconds)
                  </li>
                  <li>
                    <strong className="text-white">On destroy:</strong> When the
                    provider unmounts
                  </li>
                  <li>
                    <strong className="text-white">Manual:</strong> When you
                    call{" "}
                    <code className="text-primary bg-primary/10 px-1 rounded">
                      flush()
                    </code>
                  </li>
                </ul>
              </div>
            </Section>

            {/* User Identification */}
            <Section id="user-identification" title="User Identification">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 mb-6">
                <Shield className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p className="font-medium text-white mb-1">
                    Identification is split — email is auto-detected, userId is
                    always manual.
                  </p>
                  <p className="text-gray-400">
                    The SDK cannot know your internal user ID (database UUID
                    etc.). Until{" "}
                    <code className="text-primary bg-primary/10 px-1 rounded">
                      identify()
                    </code>{" "}
                    is called, all events are sent under{" "}
                    <code className="text-primary bg-primary/10 px-1 rounded">
                      anonymousId
                    </code>{" "}
                    and won't be linked to a user in the dashboard.
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                Email Auto-Detection <Badge type="auto" />
              </h3>
              <p className="text-gray-400 mb-4">
                On every mount and on every event, the SDK scans for the current
                user's email in this priority order:
              </p>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium w-8">
                        #
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Auth Provider
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Where it looks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {[
                      {
                        src: "mentiq_user_email",
                        where:
                          "localStorage — set by a previous identify() call",
                      },
                      {
                        src: "NextAuth / Auth.js",
                        where:
                          "sessionStorage.__next_auth_session__ → .user.email",
                      },
                      {
                        src: "Supabase",
                        where: "localStorage sb-*-auth-token → .user.email",
                      },
                      {
                        src: "Firebase",
                        where: "localStorage firebase:authUser:* → .email",
                      },
                      {
                        src: "Clerk",
                        where:
                          "sessionStorage clerk user keys → .primaryEmailAddress.emailAddress",
                      },
                      {
                        src: "Auth0",
                        where:
                          "localStorage @@auth0* → .body.decodedToken.user.email",
                      },
                      {
                        src: "Generic patterns",
                        where:
                          "localStorage/sessionStorage: user, currentUser, auth, session → .email",
                      },
                      { src: "Cookies", where: "email= in document.cookie" },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-3 px-4 text-gray-500">{i + 1}</td>
                        <td className="py-3 px-4 font-medium text-white">
                          {row.src}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-400">
                          {row.where}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-amber-400">
                  <strong>Caveat:</strong> This only works if your auth provider
                  persists session data to localStorage / sessionStorage /
                  cookies. JWTs in httpOnly cookies (server-side Next.js
                  sessions) are invisible to the SDK.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                Subscription Auto-Detection <Badge type="auto" />
              </h3>
              <p className="text-gray-400 mb-6">
                1 second after mount, the SDK scans{" "}
                <code className="text-primary bg-primary/10 px-1 rounded">
                  window.Stripe
                </code>
                ,{" "}
                <code className="text-primary bg-primary/10 px-1 rounded">
                  window.Paddle
                </code>
                ,{" "}
                <code className="text-primary bg-primary/10 px-1 rounded">
                  window.Chargebee
                </code>{" "}
                and related localStorage keys to read plan, status, MRR, and
                billing interval. The result is cached and automatically
                enriched into every event as{" "}
                <code className="text-primary bg-primary/10 px-1 rounded">
                  subscription_status
                </code>
                ,{" "}
                <code className="text-primary bg-primary/10 px-1 rounded">
                  subscription_plan
                </code>
                ,{" "}
                <code className="text-primary bg-primary/10 px-1 rounded">
                  is_paid_user
                </code>
                , etc.
              </p>

              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                Calling identify() <Badge type="manual" />
              </h3>
              <p className="text-gray-400 mb-4">
                Call this after login to link events to a known user in the
                dashboard:
              </p>
              <CodeBlock
                language="tsx"
                title="auth.tsx"
                code={`import { useAnalytics } from "mentiq-sdk";

function LoginHandler() {
  const { identify, reset } = useAnalytics();

  const handleLogin = async (user) => {
    identify(user.id, {
      email: user.email,         // safe to pass even if auto-detected
      name: user.name,
      plan: user.subscription.plan,
      created_at: user.createdAt,
      // Pass full subscription object for enrichment
      subscription: {
        status: "active",
        plan_name: "Pro",
        mrr: 4900,
        provider: "stripe",
      },
    });
  };

  const handleLogout = () => {
    reset(); // Clears userId, empties queue, starts fresh anonymous session
  };
}`}
              />
            </Section>

            {/* Onboarding Tracking */}
            <Section id="onboarding-tracking" title="Onboarding Tracking">
              <p className="text-gray-400 mb-2">
                The SDK ships an{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  OnboardingTracker
                </code>{" "}
                class —{" "}
                <strong className="text-white">
                  nothing runs automatically
                </strong>
                . You instantiate it with your step definitions and call its
                methods at the right points in your UI.
              </p>
              <CodeBlock
                language="tsx"
                title="OnboardingFlow.tsx"
                code={`import { OnboardingTracker } from "mentiq-sdk";
import { useAnalytics } from "mentiq-sdk";

function useOnboarding() {
  const { analytics } = useAnalytics();

  const tracker = new OnboardingTracker(analytics, {
    steps: [
      { name: "profile_setup",  index: 0, required: true },
      { name: "invite_team",    index: 1, required: false },
      { name: "first_project",  index: 2, required: true },
    ],
  });

  return tracker;
}

// Usage
tracker.start();                           // → fires onboarding_started
tracker.completeStep("profile_setup");     // → fires onboarding_step_completed
tracker.skipStep("invite_team", "later");  // → fires onboarding_step_skipped
tracker.completeStep("first_project");     // → fires onboarding_step_completed
                                           //   + auto-fires onboarding_completed
                                           //     (triggered when ALL steps done)
tracker.abandon("closed_modal");           // → fires onboarding_abandoned`}
              />

              <h3 className="text-lg font-semibold text-white mt-6 mb-3">
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
                      { event: "onboarding_started", props: "total_steps" },
                      {
                        event: "onboarding_step_completed",
                        props:
                          "step_name, step_index, required, steps_completed, progress (%), time_since_start",
                      },
                      {
                        event: "onboarding_step_skipped",
                        props:
                          "step_name, step_index, reason, steps_completed — only for required: false steps",
                      },
                      {
                        event: "onboarding_completed",
                        props:
                          "steps_completed, completion_rate (%), duration_ms, duration_seconds",
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
                        <td className="py-3 px-4 text-gray-400">{row.props}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-4">
                <p className="text-sm text-primary">
                  <strong>💡 Note:</strong>{" "}
                  <code className="bg-primary/20 px-1 rounded">
                    onboarding_completed
                  </code>{" "}
                  fires automatically when{" "}
                  <code className="bg-primary/20 px-1 rounded">
                    completeStep()
                  </code>{" "}
                  marks the last step done — you don't need to call{" "}
                  <code className="bg-primary/20 px-1 rounded">complete()</code>{" "}
                  manually.
                </p>
              </div>

              <CodeBlock
                language="tsx"
                title="Reading progress"
                code={`// Read progress at any time
const { currentStep, progressPercent, completedSteps, duration } =
  tracker.getProgress();

tracker.isStepCompleted("profile_setup"); // → boolean
tracker.reset();                          // → clears all state`}
              />
            </Section>

            {/* Page Tracking */}
            <Section id="page-tracking" title="Page Tracking">
              <p className="text-gray-400 mb-2">
                Page views are tracked{" "}
                <strong className="text-white">automatically</strong> for SPA
                navigation (pushState / replaceState / popstate). For
                component-level control use the{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  usePageTracking
                </code>{" "}
                hook:
              </p>
              <CodeBlock
                language="tsx"
                title="page.tsx"
                code={`"use client";

import { usePageTracking, useAnalytics } from "mentiq-sdk";

// Auto-fires page_view for this route on mount
export default function DashboardPage() {
  usePageTracking();
  return <div>Dashboard Content</div>;
}

// Manual — useful if enableAutoPageTracking is false
function CustomPage() {
  const { page } = useAnalytics();

  useEffect(() => {
    page({ path: "/custom-page", title: "Custom Page | My App" });
  }, []);
}`}
              />
            </Section>

            {/* Heatmaps */}
            <Section id="heatmaps" title="Heatmap Tracking">
              <p className="text-gray-400 mb-4">
                Enable heatmap tracking via a config flag to capture clicks,
                mouse movements, and scroll depth globally. Use{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  {"<HeatmapTracker>"}
                </code>{" "}
                for element-level tracking:
              </p>
              <CodeBlock
                language="tsx"
                title="Global heatmap (config flag)"
                code={`<MentiqAnalyticsProvider
  config={{
    apiKey: "mentiq_live_abc123",
    projectId: "my-project",
    enableHeatmapTracking: true,  // global click / mousemove / scroll
  }}
>
  <App />
</MentiqAnalyticsProvider>`}
              />
              <CodeBlock
                language="tsx"
                title="Element-level heatmap (component)"
                code={`import { HeatmapTracker } from "mentiq-sdk";

<HeatmapTracker
  element="pricing-section"
  trackClicks   // default true
  trackHovers   // default false
  trackScrolls  // default false
>
  <PricingSection />
</HeatmapTracker>`}
              />
              <div className="text-gray-400 mt-4 space-y-2">
                <p>When the global flag is enabled, the SDK tracks:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong className="text-white">Clicks:</strong> X/Y
                    coordinates + element selector
                  </li>
                  <li>
                    <strong className="text-white">Mouse movements:</strong>{" "}
                    Debounced every 500 ms
                  </li>
                  <li>
                    <strong className="text-white">Scroll:</strong> Page offsets
                    debounced every 1 s
                  </li>
                </ul>
              </div>
            </Section>

            {/* Session Recording */}
            <Section id="session-recording" title="Session Recording">
              <p className="text-gray-400 mb-4">
                Enable session recording to stream full DOM snapshots to the
                backend for replay in the dashboard:
              </p>
              <CodeBlock
                language="tsx"
                title="Enable Session Recording"
                code={`<MentiqAnalyticsProvider
  config={{
    apiKey: "mentiq_live_abc123",
    projectId: "my-project",
    enableSessionRecording: true,
  }}
>
  <App />
</MentiqAnalyticsProvider>

// Control recording manually
analytics.startRecording();
analytics.pauseRecording();
analytics.resumeRecording();
analytics.stopRecording();
analytics.isRecordingActive(); // → boolean`}
              />
            </Section>

            {/* Configuration */}
            <Section id="configuration" title="Configuration Options">
              <p className="text-gray-400 mb-4">
                Complete list of configuration options:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Option
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Default
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {[
                      {
                        opt: "apiKey",
                        type: "string",
                        def: "required",
                        desc: "Your Mentiq API key",
                      },
                      {
                        opt: "projectId",
                        type: "string",
                        def: "required",
                        desc: "Your Mentiq project ID",
                      },
                      {
                        opt: "endpoint",
                        type: "string",
                        def: "https://api.mentiq.io",
                        desc: "Backend API URL",
                      },
                      {
                        opt: "debug",
                        type: "boolean",
                        def: "false",
                        desc: "Enable console logs",
                      },
                      {
                        opt: "userId",
                        type: "string",
                        def: "undefined",
                        desc: "Pre-seed user ID at init",
                      },
                      {
                        opt: "sessionTimeout",
                        type: "number",
                        def: "1800000",
                        desc: "Inactivity timeout (ms)",
                      },
                      {
                        opt: "batchSize",
                        type: "number",
                        def: "20",
                        desc: "Events per batch",
                      },
                      {
                        opt: "flushInterval",
                        type: "number",
                        def: "10000",
                        desc: "Auto-flush interval (ms)",
                      },
                      {
                        opt: "maxQueueSize",
                        type: "number",
                        def: "1000",
                        desc: "Max queue size before oldest dropped",
                      },
                      {
                        opt: "retryAttempts",
                        type: "number",
                        def: "3",
                        desc: "Retry count for failed batches",
                      },
                      {
                        opt: "retryDelay",
                        type: "number",
                        def: "1000",
                        desc: "Base retry delay in ms (exponential backoff)",
                      },
                      {
                        opt: "enableAutoPageTracking",
                        type: "boolean",
                        def: "true",
                        desc: "Auto-track SPA page views",
                      },
                      {
                        opt: "enableHeatmapTracking",
                        type: "boolean",
                        def: "false",
                        desc: "Global click/move/scroll heatmap",
                      },
                      {
                        opt: "enableSessionRecording",
                        type: "boolean",
                        def: "false",
                        desc: "Stream DOM recording to backend",
                      },
                      {
                        opt: "enablePerformanceTracking",
                        type: "boolean",
                        def: "false",
                        desc: "Track Web Vitals on page load",
                      },
                      {
                        opt: "enableErrorTracking",
                        type: "boolean",
                        def: "false",
                        desc: "Auto-track JS errors & rejections",
                      },
                      {
                        opt: "enableABTesting",
                        type: "boolean",
                        def: "false",
                        desc: "Activate A/B testing system",
                      },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-3 px-4 font-mono text-primary whitespace-nowrap">
                          {row.opt}
                        </td>
                        <td className="py-3 px-4 text-gray-400">{row.type}</td>
                        <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                          {row.def}
                        </td>
                        <td className="py-3 px-4">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* API Reference */}
            <Section id="api-reference" title="API Reference">
              <p className="text-gray-400 mb-4">
                The{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  useAnalytics()
                </code>{" "}
                /{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  useMentiqAnalytics()
                </code>{" "}
                hook exposes:
              </p>

              <div className="space-y-3">
                {[
                  {
                    method: "track(eventName, properties?)",
                    desc: "Track a custom event with optional properties",
                  },
                  {
                    method: "page(properties?)",
                    desc: "Manually fire a page view event",
                  },
                  {
                    method: "identify(userId, traits?)",
                    desc: "Link events to a known user — must call after login",
                  },
                  {
                    method: "reset()",
                    desc: "Clear userId, empty the queue, start a fresh anonymous session",
                  },
                  {
                    method: "flush()",
                    desc: "Manually flush the event queue to the backend",
                  },
                  {
                    method: "trackCustomError(error, properties?)",
                    desc: "Report a custom error event",
                  },
                  {
                    method: "analytics.trackFeatureUsage(featureName, props?)",
                    desc: "Fires feature_used — also feeds churn risk feature adoption score",
                  },
                  {
                    method: "analytics.startFunnel(name)",
                    desc: "Begin a named conversion funnel (5-min auto-abandon timer)",
                  },
                  {
                    method: "analytics.advanceFunnel(name, step)",
                    desc: "Move to the next step in a funnel",
                  },
                  {
                    method: "analytics.completeFunnel(name)",
                    desc: "Mark a funnel as completed",
                  },
                  {
                    method: "analytics.abandonFunnel(name, reason?)",
                    desc: "Mark a funnel as abandoned",
                  },
                  {
                    method: "analytics.calculateChurnRisk()",
                    desc: "Returns risk_score (0–100), risk_category, and intervention_recommended based on local session data",
                  },
                  {
                    method: "analytics.getSessionData()",
                    desc: "Returns current session metrics (duration, pageViews, clicks, scrollDepth, engagementScore)",
                  },
                  {
                    method: "analytics.trackSubscriptionStarted(props)",
                    desc: "Track a new subscription event",
                  },
                  {
                    method: "analytics.trackSubscriptionUpgraded(props)",
                    desc: "Track a plan upgrade",
                  },
                  {
                    method: "analytics.trackSubscriptionCanceled(props)",
                    desc: "Track a cancellation",
                  },
                  {
                    method: "analytics.trackPaymentFailed(props)",
                    desc: "Track a payment failure",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <code className="font-mono text-sm text-primary bg-primary/10 px-2 py-1 rounded whitespace-nowrap">
                      {item.method}
                    </code>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-white mt-8 mb-4">
                Available Hooks
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Hook
                      </th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        Purpose
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {[
                      {
                        hook: "useAnalytics() / useMentiqAnalytics()",
                        desc: "Primary hook — track, page, identify, flush, raw analytics instance",
                      },
                      {
                        hook: "usePageTracking()",
                        desc: "Auto-fires page_view for the current route on mount",
                      },
                      {
                        hook: "useInteractionTracking()",
                        desc: "Returns trackClick, trackHover, trackView helpers",
                      },
                      {
                        hook: "useElementTracking(ref, event)",
                        desc: "IntersectionObserver-based element visibility tracking",
                      },
                      {
                        hook: "useSessionTracking()",
                        desc: "Read session metrics: duration, pageViews, scrollDepth, clicks",
                      },
                      {
                        hook: "useErrorTracking()",
                        desc: "Manual error helpers + auto global error listeners",
                      },
                      {
                        hook: "usePerformanceTracking()",
                        desc: "Auto Web Vitals + measureCustomPerformance(label) helper",
                      },
                      {
                        hook: "useSubscriptionTracking()",
                        desc: "Subscription event helpers (started, upgraded, canceled etc.)",
                      },
                      {
                        hook: "useChurnRisk()",
                        desc: "Reactive churn risk score updated on a configurable interval",
                      },
                      {
                        hook: "useSyncSubscription(sub, opts?)",
                        desc: "Sync subscription state from your data source; auto-fires upgrade/downgrade events",
                      },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-3 px-4 font-mono text-primary text-xs whitespace-nowrap">
                          {row.hook}
                        </td>
                        <td className="py-3 px-4 text-gray-400">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Need Help */}
            <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent border border-primary/20">
              <h3 className="text-2xl font-bold text-white mb-2">Need Help?</h3>
              <p className="text-gray-400 mb-6">
                Check out the full SDK source on GitHub or contact our support
                team.
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
