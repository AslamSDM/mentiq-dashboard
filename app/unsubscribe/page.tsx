"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, XCircle, Loader2, MailX } from "lucide-react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "invalid">(
    token ? "loading" : "invalid"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    const processUnsubscribe = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/api/v1/unsubscribe?token=${token}`
        );

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "You have been unsubscribed successfully.");
        } else if (response.status === 404) {
          setStatus("error");
          setMessage(data.error || "This unsubscribe link is no longer valid or has already been used.");
        } else {
          setStatus("error");
          setMessage(data.error || "Something went wrong. Please try again.");
        }
      } catch {
        setStatus("error");
        setMessage("An error occurred. Please try again later.");
      }
    };

    processUnsubscribe();
  }, [token]);

  return (
    <div className="min-h-screen flex bg-white text-[#2B3674]">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#2B3674]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-[#2B3674]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:24px_24px] opacity-10"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-30 w-30">
              <Image
                src="/logo.png"
                alt="Mentiq Logo"
                fill
                className="object-contain brightness-0 invert"
              />
            </div>
            <span className="text-2xl font-bold">Mentiq</span>
          </Link>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              Email
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-white">
                Preferences
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-md">
              Manage your email subscription preferences for Mentiq.
            </p>
          </div>

          <div className="flex items-center gap-8 text-sm text-blue-200">
            <span>&copy; 2025 Mentiq</span>
            <Link href="#" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Unsubscribe Status */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden flex items-center gap-3 mb-8">
            <div className="relative h-30 w-30">
              <Image
                src="/logo.png"
                alt="Mentiq Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-[#2B3674]">Mentiq</span>
          </Link>

          <div className="text-center space-y-6">
            {status === "loading" && (
              <>
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[#2B3674]">Processing...</h2>
                <p className="text-[#4363C7]">
                  Please wait while we update your email preferences.
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-green-600">
                  Unsubscribed Successfully
                </h2>
                <p className="text-[#4363C7]">{message}</p>
                <p className="text-sm text-[#A3AED0]">
                  You will no longer receive promotional emails from Mentiq.
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="h-10 w-10 text-red-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-red-500">
                  Link Expired
                </h2>
                <p className="text-[#4363C7]">{message}</p>
                <p className="text-sm text-[#A3AED0]">
                  If you continue to receive emails, please contact us at{" "}
                  <a href="mailto:support@mentiq.co" className="text-primary hover:underline">
                    support@mentiq.co
                  </a>
                </p>
              </>
            )}

            {status === "invalid" && (
              <>
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-yellow-50 flex items-center justify-center">
                    <MailX className="h-10 w-10 text-yellow-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-yellow-600">
                  Invalid Request
                </h2>
                <p className="text-[#4363C7]">
                  This unsubscribe link is missing a valid token. Please use the link from your email.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-[#2B3674]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-[#4363C7]">Loading...</p>
          </div>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
