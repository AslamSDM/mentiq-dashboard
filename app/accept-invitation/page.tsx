"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { teamService } from "@/lib/api";
import { CheckCircle2, AlertCircle, Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState("");

  // Form state
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("No invitation token provided");
    }
  }, [searchParams]);

  const validateForm = () => {
    if (!fullName.trim()) {
      setError("Please enter your full name");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await teamService.acceptInvitation(token, fullName, password);

      setSuccess(true);

      // Auto-login with the new credentials
      setTimeout(async () => {
        const result = await signIn("credentials", {
          email: response.user.email,
          password: password,
          redirect: false,
        });

        if (result?.ok) {
          router.push("/dashboard");
        } else {
          // If auto-login fails, redirect to login page
          router.push("/signin?message=Account created. Please sign in.");
        }
      }, 2000);
    } catch (err: any) {
      // Silent fail - error handled via UI
      setError(err.response?.data?.error || err.message || "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex bg-black text-white">
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md text-center space-y-6">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h2 className="text-3xl font-bold">Invalid Invitation</h2>
            <p className="text-gray-400">
              No invitation token was provided in the URL or the token is invalid.
            </p>
            <Link href="/signin">
              <Button className="w-full h-12 text-base bg-primary hover:bg-primary/90">
                Go to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex bg-black text-white">
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md text-center space-y-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-3xl font-bold">Welcome to the Team!</h2>
            <p className="text-gray-400">
              Your account has been created successfully.
            </p>
            <div className="flex items-center justify-center gap-2 text-primary">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Redirecting to dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-black text-white">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-black"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-30 w-30">
              <Image
                src="/logo.png"
                alt="Mentiq Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold">Mentiq</span>
          </Link>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              Join the
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary">
                Winning Team
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-md">
              Accept your invitation to collaborate, analyze, and drive growth with Mentiq.
            </p>
          </div>

          <div className="flex items-center gap-8 text-sm text-gray-400">
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

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="relative h-30 w-30">
              <Image
                src="/logo.png"
                alt="Mentiq Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold">Mentiq</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Accept Invitation</h2>
            <p className="text-gray-400">
              Set up your account to join the team
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-300">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  required
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={8}
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={8}
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base bg-primary hover:bg-primary/90 shadow-[0_0_30px_-5px_var(--primary)] transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Accept Invitation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              By accepting, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}
