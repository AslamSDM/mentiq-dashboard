"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useStore } from "@/lib/store";
import { useEffectiveProjectId } from "@/hooks/use-effective-project";
import {
  ReadyToConnect,
  AlternativeOptions,
  PlatformSelection,
  SDKSetup,
} from "@/components/onboarding-steps";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type OnboardingStep =
  | "createProject"
  | "ready"
  | "alternatives"
  | "platform"
  | "setup"
  | "complete";

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update } = useSession();
  const {
    projects,
    apiKeys,
    fetchApiKeys,
    fetchProjects,
    projectsLoaded,
    createProject,
  } = useStore();
  const effectiveProjectId = useEffectiveProjectId();
  const { toast } = useToast();
  const [step, setStep] = useState<OnboardingStep>("createProject");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const paymentPollingStarted = useRef(false);

  // Check if user already has projects, skip to ready step
  useEffect(() => {
    if (projectsLoaded && projects && projects.length > 0) {
      setStep("ready");
      router.push("/dashboard");
    }
  }, [projectsLoaded, projects]);

  // Refresh session after successful payment
  useEffect(() => {
    const success = searchParams.get("success");

    // Prevent multiple polling attempts
    if (success === "true" && update && !paymentPollingStarted.current) {
      paymentPollingStarted.current = true;
      console.log(
        "💳 Payment successful - waiting for subscription to be created..."
      );
      setLoading(true);

      let attempts = 0;
      const maxAttempts = 5; // 5 retries max

      // Exponential backoff: 2s, 4s, 8s, 16s, 32s (total ~62 seconds)
      const getBackoffDelay = (attempt: number) => Math.pow(2, attempt) * 1000;

      const checkAndUpdateSession = async () => {
        attempts++;
        const delay = getBackoffDelay(attempts);
        console.log(
          `🔄 Checking subscription status (${attempts}/${maxAttempts}), next delay: ${
            delay / 1000
          }s...`
        );

        try {
          // Trigger session refresh which will call /api/v1/me
          await update();

          // Check if session was updated with subscription
          const response = await fetch("/api/auth/session");
          const sessionData = await response.json();

          if (sessionData?.hasActiveSubscription) {
            console.log(
              "✅ Subscription confirmed! Redirecting to dashboard..."
            );
            setLoading(false);
            router.push("/dashboard");
            return;
          }

          if (attempts < maxAttempts) {
            setTimeout(checkAndUpdateSession, delay);
          } else {
            console.log(
              "⏱️ Max retries reached - subscription not confirmed yet"
            );
            setLoading(false);
            // Show error toast instead of redirect loop
            toast({
              title: "Payment processing",
              description:
                "Your payment is still being processed. Please refresh the page in a few moments or contact support if this persists.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error checking subscription:", error);
          if (attempts < maxAttempts) {
            setTimeout(checkAndUpdateSession, delay);
          } else {
            setLoading(false);
            // Show error toast instead of redirect loop
            toast({
              title: "Payment verification failed",
              description:
                "We couldn't verify your subscription. Please refresh the page or contact support.",
              variant: "destructive",
            });
          }
        }
      };

      // Start checking after 2 seconds to allow webhook to process
      setTimeout(checkAndUpdateSession, 2000);
    }
  }, [searchParams, update, router, toast]);

  useEffect(() => {
    if (effectiveProjectId) {
      fetchApiKeys(effectiveProjectId);
    }
  }, [effectiveProjectId, fetchApiKeys]);

  const currentProject = projects?.find((p) => p.id === effectiveProjectId);
  const projectApiKeys = effectiveProjectId
    ? apiKeys[effectiveProjectId] || []
    : [];
  const apiKey = projectApiKeys[0]?.key || "your-api-key";

  const updateOnboardingStatus = async (updates: any) => {
    try {
      const response = await fetch("/api/onboarding/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update onboarding status");
      }
    } catch (error) {
      console.error("Error updating onboarding status:", error);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await createProject(newProject.name, newProject.description);
      await fetchProjects();
      toast({
        title: "Project created!",
        description: "Your project has been created successfully.",
      });
      setNewProject({ name: "", description: "" });
      setStep("ready");
    } catch (error: any) {
      console.error("Failed to create project:", error);
      toast({
        title: "Failed to create project",
        description:
          error?.message || "An error occurred while creating the project.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleYes = async () => {
    setLoading(true);
    await updateOnboardingStatus({
      data_connection_shown: true,
      data_connected: true,
    });
    setLoading(false);
    setStep("platform");
  };

  const handleNotYet = async () => {
    setLoading(true);
    await updateOnboardingStatus({
      data_connection_shown: true,
    });
    setLoading(false);
    setStep("alternatives");
  };

  const handleUploadData = () => {
    // TODO: Implement upload data flow
    router.push("/dashboard");
  };

  const handleInviteDeveloper = () => {
    router.push("/dashboard/team");
  };

  const handleSkip = async () => {
    setLoading(true);
    await updateOnboardingStatus({
      data_connection_shown: true,
      onboarding_skipped: true,
    });
    setLoading(false);
    router.push("/dashboard");
  };

  const handlePlatformSelect = async (platform: string) => {
    if (platform === "skip") {
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    setSelectedPlatform(platform);
    await updateOnboardingStatus({
      platform_selected: platform,
    });
    setLoading(false);
    setStep("setup");
  };

  const handleSDKComplete = async () => {
    setLoading(true);
    await updateOnboardingStatus({
      sdk_installed: true,
    });
    setLoading(false);
    setStep("complete");
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  const handleSDKSkip = async () => {
    setLoading(true);
    await updateOnboardingStatus({
      onboarding_skipped: true,
    });
    setLoading(false);
    router.push("/dashboard");
  };

  // Show loading while fetching projects
  if (!projectsLoaded || loading) {
    // Show special message when waiting for payment subscription
    if (searchParams.get("success") === "true") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-2xl font-bold text-white">
              Processing your payment...
            </h2>
            <p className="text-gray-400">
              Please wait while we activate your subscription
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {step === "createProject" && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-6">
          <Card className="w-full max-w-2xl border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-3xl text-white">
                Create Your First Project
              </CardTitle>
              <CardDescription className="text-gray-400">
                Let's start by creating a project to track your analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name" className="text-white">
                    Project Name *
                  </Label>
                  <Input
                    id="project-name"
                    placeholder="My Awesome App"
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-description" className="text-white">
                    Description (Optional)
                  </Label>
                  <Input
                    id="project-description"
                    placeholder="Brief description of your project"
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-gray-400 mb-4">
                  What you'll get with your project:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>API Keys</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>Event Tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>Session Recording</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span>Analytics Dashboard</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCreateProject}
                disabled={!newProject.name || loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project & Continue"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      {step === "ready" && (
        <ReadyToConnect onYes={handleYes} onNotYet={handleNotYet} />
      )}
      {step === "alternatives" && (
        <AlternativeOptions
          onUploadData={handleUploadData}
          onInviteDeveloper={handleInviteDeveloper}
          onSkip={handleSkip}
        />
      )}
      {step === "platform" && (
        <PlatformSelection onPlatformSelect={handlePlatformSelect} />
      )}
      {step === "setup" && (
        <SDKSetup
          platform={selectedPlatform}
          projectId={effectiveProjectId || ""}
          apiKey={apiKey}
          onComplete={handleSDKComplete}
          onSkip={handleSDKSkip}
        />
      )}
      {step === "complete" && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="text-center space-y-4">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border-2 border-green-500/20">
              <svg
                className="h-10 w-10 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white">All set!</h1>
            <p className="text-lg text-gray-400">
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
