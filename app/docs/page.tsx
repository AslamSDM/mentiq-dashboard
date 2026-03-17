"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Copy,
  Check,
  Package,
  Zap,
  Users,
  ListChecks,
  Activity,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

/* --- Code Block --- */
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

/* --- Section --- */
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

/* --- Callout --- */
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
  const labels = { tip: "Tip", warning: "Note", info: "Info" };

  return (
    <div className={`rounded-xl p-4 border ${styles[type]}`}>
      <p className="text-sm">
        <strong>{labels[type]}:</strong> {children}
      </p>
    </div>
  );
}

/* --- Sidebar Items --- */
const navItems = [
  { id: "installation", label: "Installation", icon: Package },
  { id: "quick-start", label: "Quick Start", icon: Zap },
  { id: "identify-users", label: "Identify Users", icon: Users },
  { id: "onboarding", label: "Onboarding Tracking", icon: ListChecks },
  { id: "custom-events", label: "Custom Events", icon: Activity },
  { id: "configuration", label: "Configuration", icon: Settings },
];

/* --- Page --- */
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
                mentiq-sdk
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Mentiq SDK
              </h1>
              <p className="text-xl text-gray-400">
                Track user onboarding, identify users, and send custom events
                in your React &amp; Next.js app — in minutes.
              </p>
            </div>

            {/* 1. Installation */}
            <Section id="installation" title="Installation">
              <CodeBlock
                language="bash"
                title="Terminal"
                code={`npm install mentiq-sdk`}
              />
            </Section>

            {/* 2. Quick Start */}
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
                    "Events batched and flushed every 10 seconds",
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

            {/* 3. Identify Users */}
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
  const { identify } = useAnalytics();

  // Call once after login
  identify(user.id, {
    email: user.email,
    name: user.name,
    plan: user.plan,
  });
}`}
              />
            </Section>

            {/* 4. Onboarding Tracking */}
            <Section id="onboarding" title="Onboarding Tracking">
              <p className="text-gray-400 mb-2">
                Use the{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  useOnboardingTracker
                </code>{" "}
                hook to track every step of your user onboarding. Define your
                steps, then call methods as users progress.
              </p>

              <CodeBlock
                language="tsx"
                title="onboarding.tsx"
                code={`import { useOnboardingTracker, useAnalytics } from "mentiq-sdk";

function OnboardingWizard() {
  const { analytics } = useAnalytics();

  const tracker = useOnboardingTracker(analytics, {
    steps: [
      { name: "create_account",   index: 0, required: true  },
      { name: "complete_profile", index: 1, required: true  },
      { name: "invite_team",      index: 2, required: false },
      { name: "create_project",   index: 3, required: true  },
    ],
  });

  if (!tracker) return null;

  return <YourOnboardingUI tracker={tracker} />;
}`}
              />

              <h3 className="text-lg font-semibold text-white mt-6 mb-3">
                Track progress
              </h3>
              <p className="text-gray-400 mb-3">
                Call these methods at the right points in your UI:
              </p>
              <CodeBlock
                language="tsx"
                title="Using the tracker"
                code={`// Start onboarding
tracker.start();

// When a user finishes a step
tracker.completeStep("complete_profile");

// Skip an optional step
tracker.skipStep("invite_team", "will do later");

// If the user leaves early
tracker.abandon("closed_modal");

// Check progress anytime
const progress = tracker.getProgress();
// => { currentStep, completedSteps, totalSteps, progressPercent, duration }`}
              />

              <Callout type="tip">
                When all required steps are completed, an{" "}
                <code className="text-primary">onboarding_completed</code>{" "}
                event fires automatically — no extra code needed.
              </Callout>
            </Section>

            {/* 5. Custom Events */}
            <Section id="custom-events" title="Custom Events">
              <p className="text-gray-400 mb-4">
                Use{" "}
                <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  track()
                </code>{" "}
                to send any custom event:
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
        })
      }
    >
      Sign Up Free
    </button>
  );
}`}
              />
            </Section>

            {/* 6. Configuration */}
            <Section id="configuration" title="Configuration">
              <p className="text-gray-400 mb-4">
                Only{" "}
                <code className="text-primary bg-primary/10 px-1 rounded">
                  apiKey
                </code>{" "}
                and{" "}
                <code className="text-primary bg-primary/10 px-1 rounded">
                  projectId
                </code>{" "}
                are required. You can optionally pass:
              </p>
              <CodeBlock
                language="tsx"
                title="Optional config"
                code={`<MentiqAnalyticsProvider
  config={{
    apiKey: "mentiq_live_abc123",
    projectId: "my-project",

    // Optional
    endpoint: "https://api.mentiq.io",
    debug: false,
    batchSize: 20,
    flushInterval: 10000, // 10 seconds
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
