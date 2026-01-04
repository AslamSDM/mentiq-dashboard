"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: sessionStatus, update: updateSession } = useSession();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "pending">(
    token ? "loading" : "pending"
  );
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Handle token verification
  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/verify-email?token=${token}`
        );

        const data = await response.json();

        if (response.ok && data.verified) {
          setStatus("success");
          setMessage(data.message || "Your email has been verified successfully!");

          // If user is logged in, update their session
          if (session) {
            await updateSession();
            // Redirect to dashboard after short delay
            setTimeout(() => {
              router.push("/dashboard");
            }, 2000);
          }
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to verify email. The link may have expired.");
        }
      } catch {
        setStatus("error");
        setMessage("An error occurred while verifying your email. Please try again.");
      }
    };

    verifyEmail();
  }, [token, session, updateSession, router]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Poll for verification status when in pending state
  useEffect(() => {
    if (status !== "pending" || !session?.user?.email) return;

    const checkVerification = async () => {
      try {
        // Trigger a session update to check if email was verified
        await updateSession();
      } catch {
        // Silent fail - retry on next interval
      }
    };

    // Check every 5 seconds
    const interval = setInterval(checkVerification, 5000);
    return () => clearInterval(interval);
  }, [status, session?.user?.email, updateSession]);

  // Redirect to dashboard if session shows emailVerified
  useEffect(() => {
    if (session?.emailVerified === true) {
      router.push("/dashboard");
    }
  }, [session?.emailVerified, router]);

  const handleResendVerification = async () => {
    if (!session?.user?.email || isResending || resendCooldown > 0) return;

    setIsResending(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: session.user.email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Verification email sent! Please check your inbox.");
        setResendCooldown(60); // 60 second cooldown
      } else {
        setMessage(data.error || "Failed to resend verification email.");
      }
    } catch {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

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
                Verification
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-md">
              Verify your email to unlock the full power of Mentiq.
            </p>
          </div>

          <div className="flex items-center gap-8 text-sm text-blue-200">
            <span>© 2025 Mentiq</span>
            <Link href="#" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Verification Status */}
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
                <h2 className="text-2xl font-bold text-[#2B3674]">Verifying your email...</h2>
                <p className="text-[#4363C7]">
                  Please wait while we verify your email address.
                </p>
              </>
            )}

            {status === "pending" && (
              <>
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-yellow-50 flex items-center justify-center">
                    <Mail className="h-10 w-10 text-yellow-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-yellow-600">
                  Verify Your Email
                </h2>
                <p className="text-[#4363C7]">
                  We sent a verification email to{" "}
                  <span className="text-[#2B3674] font-medium">
                    {session?.user?.email || "your email"}
                  </span>
                  . Please check your inbox and click the verification link.
                </p>
                {message && (
                  <p className="text-sm text-green-600">{message}</p>
                )}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleResendVerification}
                    disabled={isResending || resendCooldown > 0}
                    className="w-full h-12 text-base bg-primary hover:bg-primary/90 shadow-[0_0_20px_-5px_var(--primary)] transition-all duration-300"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : resendCooldown > 0 ? (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Resend in {resendCooldown}s
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full h-12 text-base border-[#E0E5F2] bg-white hover:bg-[#F4F7FE] text-[#2B3674]"
                  >
                    Sign out
                  </Button>
                </div>
                <p className="text-sm text-[#4363C7]">
                  Once verified, you will be automatically redirected to the dashboard.
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
                  Email Verified!
                </h2>
                <p className="text-[#4363C7]">{message}</p>
                {session ? (
                  <p className="text-sm text-[#4363C7]">
                    Redirecting to dashboard...
                  </p>
                ) : (
                  <Button
                    onClick={() => router.push("/signin")}
                    className="w-full h-12 text-base bg-primary hover:bg-primary/90 shadow-[0_0_20px_-5px_var(--primary)] transition-all duration-300"
                  >
                    Sign in to your account
                  </Button>
                )}
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
                  Verification Failed
                </h2>
                <p className="text-[#4363C7]">{message}</p>
                <div className="space-y-3">
                  <Link href="/signin" className="block">
                    <Button
                      variant="outline"
                      className="w-full h-12 text-base border-[#E0E5F2] bg-white hover:bg-[#F4F7FE] text-[#2B3674]"
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      Go to Sign In
                    </Button>
                  </Link>
                  <p className="text-sm text-[#4363C7]">
                    You can request a new verification email from the sign-in page.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
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
      <VerifyEmailContent />
    </Suspense>
  );
}
