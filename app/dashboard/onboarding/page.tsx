"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useEffectiveProjectId } from "@/hooks/use-effective-project";
import {
  ReadyToConnect,
  AlternativeOptions,
  PlatformSelection,
  SDKSetup,
} from "@/components/onboarding-steps";
import { Loader2 } from "lucide-react";

type OnboardingStep =
  | "ready"
  | "alternatives"
  | "platform"
  | "setup"
  | "complete";

export default function OnboardingPage() {
  const router = useRouter();
  const { projects, apiKeys, fetchApiKeys } = useStore();
  const effectiveProjectId = useEffectiveProjectId();
  const [step, setStep] = useState<OnboardingStep>("ready");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (effectiveProjectId) {
      fetchApiKeys(effectiveProjectId);
    }
  }, [effectiveProjectId, fetchApiKeys]);

  const currentProject = projects.find((p) => p.id === effectiveProjectId);
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
    router.push("/dashboard/settings?tab=team");
  };

  const handleSkip = async () => {
    setLoading(true);
    await updateOnboardingStatus({
      data_connection_shown: true,
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

  const handleSDKSkip = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
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
