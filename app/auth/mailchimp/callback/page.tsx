"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession } from "next-auth/react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

function MailchimpCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleCallback = useCallback(async () => {
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // This is the projectId
    const error = searchParams.get("error");

    // Handle OAuth error
    if (error) {
      setStatus("error");
      setErrorMessage(
        error === "access_denied"
          ? "You denied access to Mailchimp. Please try again if you want to connect."
          : `OAuth error: ${error}`
      );
      return;
    }

    // Validate required params
    if (!code) {
      setStatus("error");
      setErrorMessage("No authorization code received from Mailchimp.");
      return;
    }

    if (!state) {
      setStatus("error");
      setErrorMessage("Missing project ID. Please try connecting again from the dashboard.");
      return;
    }

    // Get the session directly using getSession() - this works outside of components
    // and will fetch the session from the server
    const session = await getSession();

    if (!session?.accessToken) {
      // Try localStorage as fallback
      const storedToken = localStorage.getItem("auth_token");
      if (!storedToken) {
        setStatus("error");
        setErrorMessage("Session expired. Please log in again and retry.");
        setTimeout(() => {
          router.push("/signin");
        }, 3000);
        return;
      }

      // Use stored token
      await exchangeCode(state, code, storedToken);
    } else {
      // Use session token
      await exchangeCode(state, code, session.accessToken);
    }
  }, [searchParams, router]);

  const exchangeCode = async (projectId: string, code: string, token: string) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/projects/${projectId}/integrations/mailchimp/callback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Failed to connect: ${response.status}`);
      }

      setStatus("success");

      // Redirect to the playbooks/automations page after a short delay
      setTimeout(() => {
        router.push("/dashboard/playbooks?mailchimp=connected");
      }, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to complete Mailchimp connection"
      );
    }
  };

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {status === "loading" && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Connecting to Mailchimp...</h2>
              <p className="text-muted-foreground">
                Please wait while we complete the connection.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-green-700">Connected!</h2>
              <p className="text-muted-foreground mb-4">
                Mailchimp has been successfully connected to your project.
              </p>
              <p className="text-sm text-muted-foreground">Redirecting you to the dashboard...</p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-red-700">Connection Failed</h2>
              <p className="text-muted-foreground mb-6">{errorMessage}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => router.push("/dashboard/playbooks")}>
                  Go to Dashboard
                </Button>
                <Button onClick={() => router.push("/dashboard/playbooks")}>Try Again</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function MailchimpCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Loading...</h2>
              <p className="text-muted-foreground">
                Please wait while we load the page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <MailchimpCallbackContent />
    </Suspense>
  );
}
