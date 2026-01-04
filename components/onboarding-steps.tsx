"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  Mail,
  ChevronRight,
  Check,
  Code,
  Zap,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

interface ReadyToConnectProps {
  onYes: () => void;
  onNotYet: () => void;
}

export function ReadyToConnect({ onYes, onNotYet }: ReadyToConnectProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl space-y-8"
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#4318FF]/10 border-2 border-[#4318FF]/20"
          >
            <Zap className="h-8 w-8 text-[#4318FF]" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2B3674]">
            Ready to connect?
          </h1>
          <p className="text-lg text-[#4363C7] max-w-2xl mx-auto">
            Let's get your analytics up and running. Choose how you'd like to
            proceed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Yes - I'm ready */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              className="group relative overflow-hidden bg-white border-[#E0E5F2] hover:border-[#4318FF]/50 transition-all duration-300 cursor-pointer h-full shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl"
              onClick={onYes}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#4318FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#2B3674] mb-2">Yes!</h3>
                    <p className="text-[#4363C7]">I'm ready to send data</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-[#4318FF]/20 flex items-center justify-center border border-[#4318FF]/30 group-hover:bg-[#4318FF] group-hover:border-[#4318FF] transition-all">
                    <ChevronRight className="h-5 w-5 text-[#4318FF] group-hover:text-white" />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#E0E5F2]">
                  <div className="flex items-center gap-3 text-sm text-[#2B3674]">
                    <Check className="h-5 w-5 text-[#05CD99] shrink-0" />
                    <span>Install SDK in minutes</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#2B3674]">
                    <Check className="h-5 w-5 text-[#05CD99] shrink-0" />
                    <span>Start tracking events immediately</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#2B3674]">
                    <Check className="h-5 w-5 text-[#05CD99] shrink-0" />
                    <span>See real-time analytics</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Not yet */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              className="group relative overflow-hidden bg-white border-[#E0E5F2] hover:border-purple-500/50 transition-all duration-300 cursor-pointer h-full shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl"
              onClick={onNotYet}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#2B3674] mb-2">
                      Not yet...
                    </h3>
                    <p className="text-[#4363C7]">Show me what else I can do</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 group-hover:bg-purple-500 group-hover:border-purple-500 transition-all">
                    <ChevronRight className="h-5 w-5 text-purple-500 group-hover:text-white" />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#E0E5F2]">
                  <div className="flex items-center gap-3 text-sm text-[#2B3674]">
                    <Check className="h-5 w-5 text-purple-500 shrink-0" />
                    <span>Upload sample data</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#2B3674]">
                    <Check className="h-5 w-5 text-purple-500 shrink-0" />
                    <span>Invite a developer</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#2B3674]">
                    <Check className="h-5 w-5 text-purple-500 shrink-0" />
                    <span>Explore the dashboard</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-[#4363C7]"
        >
          You can change this anytime from your dashboard settings
        </motion.p>
      </motion.div>
    </div>
  );
}

interface AlternativeOptionsProps {
  onUploadData: () => void;
  onInviteDeveloper: () => void;
  onSkip: () => void;
}

export function AlternativeOptions({
  onUploadData,
  onInviteDeveloper,
  onSkip,
}: AlternativeOptionsProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl space-y-8"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2B3674]">
            No problem! Here are a few things to try...
          </h1>
          <p className="text-lg text-[#4363C7]">
            Get familiar with the platform at your own pace
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Upload sample data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              className="group relative overflow-hidden bg-white border-[#E0E5F2] hover:border-blue-500/50 transition-all duration-300 cursor-pointer h-full shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl"
              onClick={onUploadData}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-6 space-y-4">
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 group-hover:bg-blue-500 group-hover:border-blue-500 transition-all">
                  <Upload className="h-6 w-6 text-blue-500 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#2B3674] mb-2">
                    Upload sample data
                  </h3>
                  <p className="text-sm text-[#4363C7]">
                    Send sample data through CSV, Chrome Extension, or
                    Bookmarklet
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Invite a developer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              className="group relative overflow-hidden bg-white border-[#E0E5F2] hover:border-[#05CD99]/50 transition-all duration-300 cursor-pointer h-full shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl"
              onClick={onInviteDeveloper}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#05CD99]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-6 space-y-4">
                <div className="h-12 w-12 rounded-full bg-[#05CD99]/20 flex items-center justify-center border border-[#05CD99]/30 group-hover:bg-[#05CD99] group-hover:border-[#05CD99] transition-all">
                  <Mail className="h-6 w-6 text-[#05CD99] group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#2B3674] mb-2">
                    Invite a developer
                  </h3>
                  <p className="text-sm text-[#4363C7]">
                    Draft a setup email to a colleague to handle the integration
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Skip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card
              className="group relative overflow-hidden bg-white border-[#E0E5F2] hover:border-purple-500/50 transition-all duration-300 cursor-pointer h-full shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl"
              onClick={onSkip}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-6 space-y-4">
                <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 group-hover:bg-purple-500 group-hover:border-purple-500 transition-all">
                  <ChevronRight className="h-6 w-6 text-purple-500 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#2B3674] mb-2">Skip</h3>
                  <p className="text-sm text-[#4363C7]">
                    Browse Mentiq without data and explore the features
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

interface PlatformSelectionProps {
  onPlatformSelect: (platform: string) => void;
}

export function PlatformSelection({
  onPlatformSelect,
}: PlatformSelectionProps) {
  const platforms = [
    {
      id: "web",
      name: "Web",
      description: "React, Vue, Angular, or vanilla JavaScript",
      icon: Code,
      color: "blue",
      popular: true,
    },
    {
      id: "mobile",
      name: "Mobile",
      description: "React Native, iOS, Android",
      icon: Code,
      color: "green",
      comingSoon: true,
    },
    {
      id: "backend",
      name: "Backend",
      description: "Node.js, Python, Ruby, Go",
      icon: Code,
      color: "purple",
      comingSoon: true,
    },
  ];

  const getColorClasses = (color: string, isComingSoon?: boolean) => {
    if (isComingSoon) {
      return {
        iconBg: "bg-gray-100",
        iconBorder: "border-gray-200",
        iconText: "text-gray-400",
        hoverBorder: "hover:border-gray-300",
      };
    }
    
    const colors: Record<string, any> = {
      blue: {
        iconBg: "bg-blue-500/20",
        iconBorder: "border-blue-500/30",
        iconText: "text-blue-500",
        hoverBorder: "hover:border-blue-500/50",
      },
      green: {
        iconBg: "bg-[#05CD99]/20",
        iconBorder: "border-[#05CD99]/30",
        iconText: "text-[#05CD99]",
        hoverBorder: "hover:border-[#05CD99]/50",
      },
      purple: {
        iconBg: "bg-purple-500/20",
        iconBorder: "border-purple-500/30",
        iconText: "text-purple-500",
        hoverBorder: "hover:border-purple-500/50",
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl space-y-8"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#2B3674]">
            Select your platform
          </h1>
          <p className="text-lg text-[#4363C7]">
            Choose where you'll integrate Mentiq SDK
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {platforms.map((platform, index) => {
            const colorClasses = getColorClasses(platform.color, platform.comingSoon);
            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card
                  className={`group relative overflow-hidden bg-white border-[#E0E5F2] ${colorClasses.hoverBorder} transition-all duration-300 ${
                    platform.comingSoon
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer"
                  } h-full shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl`}
                  onClick={() =>
                    !platform.comingSoon && onPlatformSelect(platform.id)
                  }
                >
                  <CardContent className="relative p-6 space-y-4">
                    {platform.popular && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 text-xs font-semibold bg-[#4318FF] text-white rounded-full">
                          Popular
                        </span>
                      </div>
                    )}
                    {platform.comingSoon && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 text-xs font-semibold bg-gray-400 text-white rounded-full">
                          Coming Soon
                        </span>
                      </div>
                    )}
                    <div
                      className={`h-12 w-12 rounded-full ${colorClasses.iconBg} flex items-center justify-center border ${colorClasses.iconBorder}`}
                    >
                      <platform.icon
                        className={`h-6 w-6 ${colorClasses.iconText}`}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#2B3674] mb-2">
                        {platform.name}
                      </h3>
                      <p className="text-sm text-[#4363C7]">
                        {platform.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            variant="link"
            className="text-[#4363C7] hover:text-[#2B3674]"
            onClick={() => onPlatformSelect("skip")}
          >
            Skip for now
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

interface SDKSetupProps {
  platform: string;
  projectId: string;
  apiKey: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function SDKSetup({
  platform,
  projectId,
  apiKey,
  onComplete,
  onSkip,
}: SDKSetupProps) {
  const installCode = `npm install @mentiq-sdk`;
  const setupCode = `import Mentiq from '@mentiq-sdk';

Mentiq.init({
  projectId: '${projectId}',
  apiKey: '${apiKey}',
  // Optional configuration
  autoTrack: true,
  captureClicks: true,
  capturePageViews: true,
});`;

  const trackEventCode = `// Track custom events
Mentiq.track('button_clicked', {
  button_name: 'Sign Up',
  page: 'Home',
});

// Identify users
Mentiq.identify('user-123', {
  email: 'user@example.com',
  plan: 'premium',
});`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl space-y-8"
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#4318FF]/10 border-2 border-[#4318FF]/20"
          >
            <Code className="h-8 w-8 text-[#4318FF]" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2B3674]">
            Install Mentiq SDK
          </h1>
          <p className="text-lg text-[#4363C7]">
            Follow these steps to start tracking events
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Install */}
          <Card className="bg-white border-[#E0E5F2] shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#4318FF]/20 flex items-center justify-center border border-[#4318FF]/30">
                  <span className="text-sm font-bold text-[#4318FF]">1</span>
                </div>
                <h3 className="text-xl font-bold text-[#2B3674]">
                  Install the SDK
                </h3>
              </div>
              <div className="relative">
                <pre className="bg-[#2B3674] p-4 rounded-xl overflow-x-auto">
                  <code className="text-sm text-gray-200">{installCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 text-gray-300 hover:text-white hover:bg-white/10"
                  onClick={() => navigator.clipboard.writeText(installCode)}
                >
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Initialize */}
          <Card className="bg-white border-[#E0E5F2] shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#4318FF]/20 flex items-center justify-center border border-[#4318FF]/30">
                  <span className="text-sm font-bold text-[#4318FF]">2</span>
                </div>
                <h3 className="text-xl font-bold text-[#2B3674]">
                  Initialize in your app
                </h3>
              </div>
              <div className="relative">
                <pre className="bg-[#2B3674] p-4 rounded-xl overflow-x-auto">
                  <code className="text-sm text-gray-200">{setupCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 text-gray-300 hover:text-white hover:bg-white/10"
                  onClick={() => navigator.clipboard.writeText(setupCode)}
                >
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Track Events */}
          <Card className="bg-white border-[#E0E5F2] shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#4318FF]/20 flex items-center justify-center border border-[#4318FF]/30">
                  <span className="text-sm font-bold text-[#4318FF]">3</span>
                </div>
                <h3 className="text-xl font-bold text-[#2B3674]">Track events</h3>
              </div>
              <div className="relative">
                <pre className="bg-[#2B3674] p-4 rounded-xl overflow-x-auto">
                  <code className="text-sm text-gray-200">
                    {trackEventCode}
                  </code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 text-gray-300 hover:text-white hover:bg-white/10"
                  onClick={() => navigator.clipboard.writeText(trackEventCode)}
                >
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Documentation Link */}
          <Card className="bg-[#4318FF]/10 border-[#4318FF]/20 shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#2B3674]">
                    Need more help?
                  </h3>
                  <p className="text-sm text-[#4363C7]">
                    Check out our full documentation and examples
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-[#4318FF]/30 bg-[#4318FF]/10 text-[#4318FF] hover:bg-[#4318FF] hover:text-white rounded-xl"
                  onClick={() => window.open("/mentiq-sdk", "_blank")}
                >
                  View Docs
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={onComplete}
            className="flex-1 h-12 text-base bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl"
          >
            I've installed the SDK
            <Check className="ml-2 h-5 w-5" />
          </Button>
          <Button
            onClick={onSkip}
            variant="outline"
            className="border-[#E0E5F2] bg-white hover:bg-[#F4F7FE] text-[#2B3674] rounded-xl"
          >
            Skip for now
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
