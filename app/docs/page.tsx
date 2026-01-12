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
  ChevronRight,
  Settings,
  Eye,
  Activity,
  Shield,
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

// Navigation items for sidebar
const navItems = [
  { id: "installation", label: "Installation", icon: Package },
  { id: "quick-start", label: "Quick Start", icon: Zap },
  { id: "provider-setup", label: "Provider Setup", icon: Settings },
  { id: "tracking-events", label: "Tracking Events", icon: Activity },
  { id: "user-identification", label: "User Identification", icon: BookOpen },
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
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
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
                A comprehensive analytics SDK for React and Next.js with event tracking, 
                session monitoring, heatmaps, and session recording.
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
                  <strong>Note:</strong> The SDK requires React 16.8+ and rrweb 2.0+ as peer dependencies for session recording.
                </p>
              </div>
            </Section>

            {/* Quick Start */}
            <Section id="quick-start" title="Quick Start">
              <p className="text-gray-400 mb-4">
                Wrap your app with the AnalyticsProvider and start tracking in minutes:
              </p>
              <CodeBlock
                language="tsx"
                title="app/layout.tsx"
                code={`import { AnalyticsProvider } from "mentiq-sdk";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnalyticsProvider
          config={{
            projectId: "your-project-id",
            apiKey: "mentiq_live_your_api_key",
            endpoint: "https://app.trymentiq.com",
          }}
        >
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}`}
              />
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-6">
                <p className="text-sm text-primary">
                  <strong>💡 Tip:</strong> Find your API key in the{" "}
                  <Link href="/dashboard/projects" className="underline">
                    Projects page
                  </Link>{" "}
                  of your dashboard. An API key is automatically created when you create a project.
                </p>
              </div>
            </Section>

            {/* Provider Setup */}
            <Section id="provider-setup" title="Provider Setup">
              <p className="text-gray-400 mb-4">
                The AnalyticsProvider must wrap your application to enable tracking. It initializes the SDK and provides the analytics context to all child components.
              </p>
              <CodeBlock
                language="tsx"
                title="React App"
                code={`import { AnalyticsProvider } from "mentiq-sdk";

// Basic setup
<AnalyticsProvider
  config={{
    projectId: "my-project",
    apiKey: "mentiq_live_abc123",
    endpoint: "https://app.trymentiq.com",
  }}
>
  <App />
</AnalyticsProvider>

// With all options
<AnalyticsProvider
  config={{
    projectId: "my-project",
    apiKey: "mentiq_live_abc123",
    endpoint: "https://app.trymentiq.com",
    debug: true,                       // Enable console logs
    batchSize: 10,                     // Events per batch
    flushInterval: 10000,              // Auto-flush every 10s
    enableHeatmapTracking: true,       // Enable heatmap tracking
    enableSessionRecording: true,      // Enable session recording
    enableAutoPageTracking: true,      // Auto-track page views
    enablePerformanceTracking: true,   // Track Core Web Vitals
    enableErrorTracking: true,         // Track JS errors
    sessionTimeout: 1800000,           // 30 min session timeout
  }}
>
  <App />
</AnalyticsProvider>`}
              />
            </Section>

            {/* Tracking Events */}
            <Section id="tracking-events" title="Tracking Events">
              <p className="text-gray-400 mb-4">
                Use the <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">useAnalytics</code> hook to track custom events:
              </p>
              <CodeBlock
                language="tsx"
                title="Component.tsx"
                code={`import { useAnalytics } from "mentiq-sdk";

function SignupButton() {
  const { track } = useAnalytics();

  const handleClick = () => {
    track("button_clicked", {
      button_name: "signup_cta",
      page: "homepage",
      position: "hero",
    });
  };

  return <button onClick={handleClick}>Sign Up</button>;
}

// Track feature usage
function ExportButton() {
  const { track } = useAnalytics();

  const handleExport = () => {
    track("feature_used", {
      feature_name: "export_report",
      export_format: "pdf",
      record_count: 150,
    });
    // ... actual export logic
  };

  return <button onClick={handleExport}>Export PDF</button>;
}

// Track subscription changes
function UpgradeHandler() {
  const { track } = useAnalytics();

  const handleUpgrade = (newPlan) => {
    track("subscription_upgraded", {
      from_plan: "starter",
      to_plan: newPlan,
      mrr_increase: 50,
    });
  };
}`}
              />

              <h3 className="text-lg font-semibold text-white mt-8 mb-4">
                How Event Batching Works
              </h3>
              <div className="text-gray-400 space-y-2">
                <p>Events are automatically batched for optimal performance:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong className="text-white">By size:</strong> When queue reaches batchSize (default: 10 events)</li>
                  <li><strong className="text-white">By time:</strong> Every flushInterval (default: 10 seconds)</li>
                  <li><strong className="text-white">On unload:</strong> Before user leaves the page</li>
                  <li><strong className="text-white">Manual:</strong> When you call flush()</li>
                </ul>
              </div>
            </Section>

            {/* User Identification */}
            <Section id="user-identification" title="User Identification">
              <p className="text-gray-400 mb-4">
                Identify users to track behavior across sessions and devices:
              </p>
              <CodeBlock
                language="tsx"
                title="auth.tsx"
                code={`import { useAnalytics } from "mentiq-sdk";

function LoginHandler() {
  const { identify, setUserProperties } = useAnalytics();

  const handleLogin = async (user) => {
    // Identify the user after login
    identify(user.id, {
      email: user.email,
      name: user.name,
      plan: user.subscription.plan,
      created_at: user.createdAt,
      company: user.company,
    });
  };

  const handleProfileUpdate = () => {
    // Update user properties anytime
    setUserProperties({
      last_login: new Date().toISOString(),
      feature_flags: ["beta_dashboard", "new_reports"],
    });
  };
}

// Reset identity on logout
function LogoutHandler() {
  const { reset } = useAnalytics();

  const handleLogout = () => {
    reset(); // Clears user data and starts fresh
  };
}`}
              />
            </Section>

            {/* Page Tracking */}
            <Section id="page-tracking" title="Page Tracking">
              <p className="text-gray-400 mb-4">
                Automatically track page views using the usePageTracking hook:
              </p>
              <CodeBlock
                language="tsx"
                title="page.tsx"
                code={`"use client";

import { usePageTracking, useAnalytics } from "mentiq-sdk";

export default function DashboardPage() {
  // Automatic page view tracking
  usePageTracking();

  return <div>Dashboard Content</div>;
}

// Manual page view tracking
function CustomPage() {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView({
      path: "/custom-page",
      title: "Custom Page | My App",
      referrer: document.referrer,
    });
  }, []);
}`}
              />
            </Section>

            {/* Heatmaps */}
            <Section id="heatmaps" title="Heatmap Tracking">
              <p className="text-gray-400 mb-4">
                Enable heatmap tracking to visualize user interactions:
              </p>
              <CodeBlock
                language="tsx"
                title="layout.tsx"
                code={`<AnalyticsProvider
  config={{
    projectId: "my-project",
    apiKey: "mentiq_live_abc123",
    endpoint: "https://app.trymentiq.com",
    enableHeatmapTracking: true,  // Enable heatmap tracking
  }}
>
  <App />
</AnalyticsProvider>`}
              />
              <div className="text-gray-400 mt-4 space-y-2">
                <p>When enabled, the SDK tracks:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong className="text-white">Clicks:</strong> X/Y coordinates relative to viewport</li>
                  <li><strong className="text-white">Scrolls:</strong> Scroll depth percentage</li>
                  <li><strong className="text-white">Mouse movements:</strong> Sampled movement coordinates</li>
                  <li><strong className="text-white">Element interactions:</strong> Which elements users engage with</li>
                </ul>
              </div>
            </Section>

            {/* Session Recording */}
            <Section id="session-recording" title="Session Recording">
              <p className="text-gray-400 mb-4">
                The SDK integrates with rrweb for session recording, enabling full session replay in the dashboard:
              </p>
              <CodeBlock
                language="tsx"
                title="Enable Session Recording"
                code={`import { AnalyticsProvider } from "mentiq-sdk";

// Enable session recording with rrweb integration
<AnalyticsProvider
  config={{
    projectId: "my-project",
    apiKey: "mentiq_live_abc123",
    endpoint: "https://app.trymentiq.com",
    enableSessionRecording: true,  // Enable session recording
  }}
>
  <App />
</AnalyticsProvider>

// View recordings in the Session Replay page of your dashboard`}
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
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Option</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Default</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4 font-mono text-primary">projectId</td>
                      <td className="py-3 px-4">string</td>
                      <td className="py-3 px-4">required</td>
                      <td className="py-3 px-4">Your project ID</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4 font-mono text-primary">apiKey</td>
                      <td className="py-3 px-4">string</td>
                      <td className="py-3 px-4">required</td>
                      <td className="py-3 px-4">Your API key</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4 font-mono text-primary">endpoint</td>
                      <td className="py-3 px-4">string</td>
                      <td className="py-3 px-4">-</td>
                      <td className="py-3 px-4">Backend API URL</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4 font-mono text-primary">debug</td>
                      <td className="py-3 px-4">boolean</td>
                      <td className="py-3 px-4">false</td>
                      <td className="py-3 px-4">Enable console logs</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4 font-mono text-primary">batchSize</td>
                      <td className="py-3 px-4">number</td>
                      <td className="py-3 px-4">20</td>
                      <td className="py-3 px-4">Events per batch</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4 font-mono text-primary">flushInterval</td>
                      <td className="py-3 px-4">number</td>
                      <td className="py-3 px-4">10000</td>
                      <td className="py-3 px-4">Auto-flush interval (ms)</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4 font-mono text-primary">maxQueueSize</td>
                      <td className="py-3 px-4">number</td>
                      <td className="py-3 px-4">1000</td>
                      <td className="py-3 px-4">Max queue size</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4 font-mono text-primary">sessionTimeout</td>
                      <td className="py-3 px-4">number</td>
                      <td className="py-3 px-4">1800000</td>
                      <td className="py-3 px-4">Session timeout (30 min)</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4 font-mono text-primary">enableAutoPageTracking</td>
                      <td className="py-3 px-4">boolean</td>
                      <td className="py-3 px-4">true</td>
                      <td className="py-3 px-4">Auto-track page views</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4 font-mono text-primary">enableHeatmapTracking</td>
                      <td className="py-3 px-4">boolean</td>
                      <td className="py-3 px-4">false</td>
                      <td className="py-3 px-4">Enable heatmap tracking</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4 font-mono text-primary">enableSessionRecording</td>
                      <td className="py-3 px-4">boolean</td>
                      <td className="py-3 px-4">false</td>
                      <td className="py-3 px-4">Enable session recording</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4 font-mono text-primary">enablePerformanceTracking</td>
                      <td className="py-3 px-4">boolean</td>
                      <td className="py-3 px-4">false</td>
                      <td className="py-3 px-4">Track Core Web Vitals</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4 font-mono text-primary">enableErrorTracking</td>
                      <td className="py-3 px-4">boolean</td>
                      <td className="py-3 px-4">false</td>
                      <td className="py-3 px-4">Track JavaScript errors</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 px-4 font-mono text-primary">enableABTesting</td>
                      <td className="py-3 px-4">boolean</td>
                      <td className="py-3 px-4">false</td>
                      <td className="py-3 px-4">Enable A/B testing features</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {/* API Reference */}
            <Section id="api-reference" title="API Reference">
              <p className="text-gray-400 mb-4">
                The useAnalytics hook provides these methods:
              </p>

              <div className="space-y-4">
                {[
                  { method: "track(eventName, properties?)", desc: "Track a custom event with optional properties" },
                  { method: "identify(userId, traits?)", desc: "Identify a user with unique ID and traits" },
                  { method: "setUserProperties(properties)", desc: "Update properties for the current user" },
                  { method: "trackPageView(details?)", desc: "Manually track a page view" },
                  { method: "getSessionId()", desc: "Get the current session ID" },
                  { method: "flush()", desc: "Manually flush the event queue" },
                  { method: "reset()", desc: "Reset all user data and start fresh" },
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
                usePageTracking Hook
              </h3>
              <CodeBlock
                language="tsx"
                title="Usage"
                code={`import { usePageTracking } from "mentiq-sdk";

// Simply call in any page component to auto-track page views
export default function Page() {
  usePageTracking();
  return <div>Page content</div>;
}`}
              />
            </Section>

            {/* Need Help */}
            <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent border border-primary/20">
              <h3 className="text-2xl font-bold text-white mb-2">Need Help?</h3>
              <p className="text-gray-400 mb-6">
                Check out the full SDK source on GitHub or contact our support team.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="https://github.com/AslamSDM/mentiq-sdk" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
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
