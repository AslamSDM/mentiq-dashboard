"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Mail, Loader2, Check, Camera, CreditCard, Key, AlertTriangle, ArrowUpRight, Pause, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/page-shell";
import {
  usageService,
  UsageResponse,
  SubscriptionResponse,
} from "@/lib/services/usage";
import { useStore } from "@/lib/store";

type SettingsTab = "profile" | "security" | "billing";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  
  // Profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar_url: "",
  });
  
  // Password state
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Billing state
  const [billingLoading, setBillingLoading] = useState(false);
  const [subData, setSubData] = useState<SubscriptionResponse | null>(null);
  const [usageData, setUsageData] = useState<UsageResponse | null>(null);
  const [lifetimeKey, setLifetimeKey] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [maxEmailChars, setMaxEmailChars] = useState<number>(0);
  const [emailCharsLoading, setEmailCharsLoading] = useState(false);
  const getEffectiveProjectId = useStore((s) => s.getEffectiveProjectId);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = (session as any)?.accessToken;
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/account/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProfile({
            name: data.name || "",
            email: data.email || "",
            avatar_url: data.avatar_url || "",
          });
        }
      } catch (error) {
        // Silent fail - profile will show defaults
      } finally {
        setProfileLoading(false);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session]);

  // Fetch billing data when billing tab is active
  useEffect(() => {
    if (activeTab !== "billing") return;
    const fetchBillingData = async () => {
      setBillingLoading(true);
      try {
        const [sub, usage] = await Promise.all([
          usageService.getSubscription(),
          usageService.getUsageSummary(),
        ]);
        setSubData(sub);
        setUsageData(usage);

        // Load project settings for email char limit
        const projectId = getEffectiveProjectId();
        if (projectId) {
          try {
            const ps = await usageService.getProjectSettings(projectId);
            setMaxEmailChars(ps.settings.max_email_characters || 0);
          } catch { /* project settings may not exist yet */ }
        }
      } catch {
        // silent — billing data may not be available for all accounts
      } finally {
        setBillingLoading(false);
      }
    };
    fetchBillingData();
  }, [activeTab]);

  const handleRedeemKey = async () => {
    if (!lifetimeKey.trim()) return;
    setRedeemLoading(true);
    try {
      const result = await usageService.redeemLifetimeKey(lifetimeKey.trim());
      toast({ title: "Lifetime plan activated", description: result.message });
      setLifetimeKey("");
      // Refresh billing data
      const sub = await usageService.getSubscription();
      setSubData(sub);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Invalid key", variant: "destructive" });
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    setCancelLoading(true);
    try {
      const result = await usageService.requestCancel("");
      toast({ title: "Request submitted", description: result.message });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to submit", variant: "destructive" });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleUnpause = async () => {
    try {
      await usageService.unpauseUsage();
      toast({ title: "Usage resumed", description: "Your usage has been unpaused." });
      const sub = await usageService.getSubscription();
      setSubData(sub);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSaveEmailCharLimit = async () => {
    const projectId = getEffectiveProjectId();
    if (!projectId) return;
    setEmailCharsLoading(true);
    try {
      await usageService.updateProjectSettings(projectId, {
        max_email_characters: maxEmailChars,
      });
      toast({ title: "Saved", description: "Email character limit updated." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setEmailCharsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = (session as any)?.accessToken;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/account/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: profile.name,
            avatar_url: profile.avatar_url,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new_password !== passwords.confirm_password) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }

    if (passwords.new_password.length < 8) {
      toast({
        title: "Password too short",
        description: "New password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    if (profile.email && passwords.new_password.toLowerCase() === profile.email.toLowerCase()) {
      toast({
        title: "Insecure password",
        description: "Password cannot be the same as your email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const token = (session as any)?.accessToken;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/account/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password: passwords.current_password,
            new_password: passwords.new_password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password changed",
          description: "Your password has been updated successfully.",
        });
        setPasswords({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to change password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Account Settings" description="Manage your account settings and preferences" breadcrumb="Workspace / Settings">
      <div className="max-w-4xl py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-lg w-fit" style={{ backgroundColor: "#F3F2F1" }}>
            {(["profile", "security", "billing"] as const).map((tab) => {
              const icons = { profile: User, security: Lock, billing: CreditCard };
              const Icon = icons[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-md text-[0.8125rem] font-medium transition-all duration-150 capitalize"
                  style={{
                    backgroundColor: activeTab === tab ? "#FFFFFF" : "transparent",
                    color: activeTab === tab ? "#1C1917" : "#78716C",
                    boxShadow: activeTab === tab ? "0 1px 3px rgba(28,25,23,0.08)" : "none",
                  }}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              );
            })}
          </div>

          {activeTab === "profile" && (
            <div className="max-w-lg">
              <div className="rounded-xl border bg-white p-6" style={{ borderColor: "#E7E5E4" }}>
                <h3 className="text-[0.875rem] font-semibold mb-1" style={{ color: "#1C1917" }}>Profile Information</h3>
                <p className="text-[0.75rem] mb-6" style={{ color: "#A8A29E" }}>Update your account profile and avatar</p>

                {profileLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center text-[1.1rem] font-semibold overflow-hidden"
                          style={{ backgroundColor: "rgba(37,99,235,0.1)", color: "#2563EB" }}
                        >
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            profile.name?.charAt(0).toUpperCase() || "A"
                          )}
                        </div>
                        <button
                          type="button"
                          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center hover:bg-slate-50 transition-colors"
                          style={{ backgroundColor: "#FFFFFF", borderColor: "#E7E5E4" }}
                          onClick={() => {
                            toast({
                              title: "Coming soon",
                              description: "Avatar upload will be available soon.",
                            });
                          }}
                        >
                          <Camera className="w-2.5 h-2.5" style={{ color: "#78716C" }} />
                        </button>
                      </div>
                      <div>
                        <p className="text-[0.8125rem] font-medium" style={{ color: "#1C1917" }}>{profile.name || "Anonymous User"}</p>
                        <p className="text-[0.75rem]" style={{ color: "#A8A29E" }}>Pro Plan</p>
                      </div>
                    </div>

                    {/* Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[0.75rem] font-medium mb-1.5" style={{ color: "#1C1917" }}>Name</label>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border text-[0.8125rem] outline-none transition-colors"
                          style={{ borderColor: "#E7E5E4", color: "#1C1917", backgroundColor: "#FAFAF9" }}
                          onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                          onBlur={(e) => (e.target.style.borderColor = "#E7E5E4")}
                        />
                      </div>
                      <div>
                        <label className="block text-[0.75rem] font-medium mb-1.5" style={{ color: "#1C1917" }}>Email</label>
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full px-3 py-2 rounded-lg border text-[0.8125rem]"
                          style={{ borderColor: "#E7E5E4", color: "#A8A29E", backgroundColor: "#F8F7F4", cursor: "not-allowed" }}
                        />
                        <p className="text-[0.7rem] mt-1" style={{ color: "#A8A29E" }}>Email cannot be changed</p>
                      </div>
                      <div>
                        <label className="block text-[0.75rem] font-medium mb-1.5" style={{ color: "#1C1917" }}>Avatar URL</label>
                        <input
                          type="url"
                          placeholder="https://example.com/avatar.jpg"
                          value={profile.avatar_url}
                          onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border text-[0.8125rem] outline-none transition-colors"
                          style={{ borderColor: "#E7E5E4", color: "#1C1917", backgroundColor: "#FAFAF9" }}
                          onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                          onBlur={(e) => (e.target.style.borderColor = "#E7E5E4")}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 flex items-center gap-2 rounded-lg text-[0.8125rem] font-medium transition-opacity disabled:opacity-50"
                        style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = !loading ? "0.9" : "0.5")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = !loading ? "1" : "0.5")}
                      >
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="max-w-lg">
              <div className="rounded-xl border bg-white p-6" style={{ borderColor: "#E7E5E4" }}>
                <h3 className="text-[0.875rem] font-semibold mb-1" style={{ color: "#1C1917" }}>Change Password</h3>
                <p className="text-[0.75rem] mb-6" style={{ color: "#A8A29E" }}>Update your account password</p>
                
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-[0.75rem] font-medium mb-1.5" style={{ color: "#1C1917" }}>Current password</label>
                    <input
                      type="password"
                      value={passwords.current_password}
                      onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg border text-[0.8125rem] outline-none transition-colors"
                      style={{ borderColor: "#E7E5E4", color: "#1C1917", backgroundColor: "#FAFAF9" }}
                      onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                      onBlur={(e) => (e.target.style.borderColor = "#E7E5E4")}
                    />
                  </div>
                  <div>
                    <label className="block text-[0.75rem] font-medium mb-1.5" style={{ color: "#1C1917" }}>New password</label>
                    <input
                      type="password"
                      placeholder="min 8 characters"
                      value={passwords.new_password}
                      onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                      required
                      minLength={8}
                      className="w-full px-3 py-2 rounded-lg border text-[0.8125rem] outline-none transition-colors"
                      style={{ borderColor: "#E7E5E4", color: "#1C1917", backgroundColor: "#FAFAF9" }}
                      onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                      onBlur={(e) => (e.target.style.borderColor = "#E7E5E4")}
                    />
                  </div>
                  <div>
                    <label className="block text-[0.75rem] font-medium mb-1.5" style={{ color: "#1C1917" }}>Confirm new password</label>
                    <input
                      type="password"
                      value={passwords.confirm_password}
                      onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-lg border text-[0.8125rem] outline-none transition-colors"
                      style={{ borderColor: "#E7E5E4", color: "#1C1917", backgroundColor: "#FAFAF9" }}
                      onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                      onBlur={(e) => (e.target.style.borderColor = "#E7E5E4")}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 mt-2 flex items-center gap-2 rounded-lg text-[0.8125rem] font-medium transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = !loading ? "0.9" : "0.5")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = !loading ? "1" : "0.5")}
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}
          {activeTab === "billing" && (
            <div className="max-w-2xl space-y-6">
              {billingLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Current Plan */}
                  <div className="rounded-xl border bg-white p-6" style={{ borderColor: "#E7E5E4" }}>
                    <h3 className="text-[0.875rem] font-semibold mb-1" style={{ color: "#1C1917" }}>Current Plan</h3>
                    <p className="text-[0.75rem] mb-4" style={{ color: "#A8A29E" }}>Your subscription details</p>

                    {subData?.subscription ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold" style={{ color: "#1C1917" }}>
                            {subData.subscription.tier_name}
                          </span>
                          {subData.subscription.is_lifetime && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                              <Crown className="w-3 h-3 mr-1" /> Lifetime
                            </Badge>
                          )}
                          <Badge variant={subData.subscription.status === "active" ? "default" : "secondary"}>
                            {subData.subscription.status}
                          </Badge>
                        </div>

                        {!subData.subscription.is_lifetime && subData.subscription.monthly_price > 0 && (
                          <p className="text-sm" style={{ color: "#78716C" }}>
                            ${(subData.subscription.monthly_price / 100).toFixed(2)}/month
                          </p>
                        )}

                        {subData.subscription.is_lifetime && (
                          <p className="text-sm" style={{ color: "#78716C" }}>
                            No monthly fee. Overages billed only with a payment method on file.
                          </p>
                        )}

                        {/* Usage Paused Warning */}
                        {subData.subscription.usage_paused && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                            <Pause className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-amber-800">Usage Paused</p>
                              <p className="text-xs text-amber-700">
                                {subData.subscription.usage_paused_reason || "You've hit your included limits. Add a payment method to continue."}
                              </p>
                              {subData.has_payment_method ? (
                                <button
                                  onClick={handleUnpause}
                                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                                >
                                  Resume Usage
                                </button>
                              ) : (
                                <p className="text-xs text-amber-700 font-medium">
                                  Please add a payment method in Stripe to resume.
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Payment method status */}
                        <div className="flex items-center gap-2 text-sm" style={{ color: "#78716C" }}>
                          <CreditCard className="w-4 h-4" />
                          {subData.has_payment_method
                            ? "Payment method on file"
                            : "No payment method on file"}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm" style={{ color: "#78716C" }}>No active subscription.</p>
                    )}
                  </div>

                  {/* Usage Limits */}
                  {usageData && (
                    <div className="rounded-xl border bg-white p-6" style={{ borderColor: "#E7E5E4" }}>
                      <h3 className="text-[0.875rem] font-semibold mb-1" style={{ color: "#1C1917" }}>Usage Limits</h3>
                      <p className="text-[0.75rem] mb-4" style={{ color: "#A8A29E" }}>
                        Current billing period usage. See full details on the{" "}
                        <a href="/dashboard/usage" className="underline" style={{ color: "#2563EB" }}>Usage & Billing</a> page.
                      </p>

                      <div className="space-y-3">
                        {usageData.summary.resources.map((r) => {
                          const pct = Math.min(r.percentage, 100);
                          const isOver = r.percentage > 100;
                          const isWarn = r.percentage >= 80 && r.percentage < 100;
                          return (
                            <div key={r.resource} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium capitalize" style={{ color: "#1C1917" }}>
                                  {r.resource.replace(/_/g, " ")}
                                </span>
                                <span style={{ color: isOver ? "#DC2626" : "#78716C" }}>
                                  {r.current_usage.toLocaleString()} / {r.limit.toLocaleString()}
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F3F2F1" }}>
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor: isOver ? "#DC2626" : isWarn ? "#F59E0B" : "#1C1917",
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {usageData.summary.total_overage_cost > 0 && (
                        <p className="text-xs mt-3" style={{ color: "#DC2626" }}>
                          Estimated overages: ${(usageData.summary.total_overage_cost / 100).toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Upgrade Plans */}
                  {subData?.subscription && !subData.subscription.is_lifetime && (
                    <div className="rounded-xl border bg-white p-6" style={{ borderColor: "#E7E5E4" }}>
                      <h3 className="text-[0.875rem] font-semibold mb-1" style={{ color: "#1C1917" }}>Upgrade Plan</h3>
                      <p className="text-[0.75rem] mb-4" style={{ color: "#A8A29E" }}>Need higher limits?</p>
                      <a
                        href="/pricing"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.8125rem] font-medium transition-opacity hover:opacity-90"
                        style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
                      >
                        View Plans <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {/* Redeem Lifetime Key */}
                  <div className="rounded-xl border bg-white p-6" style={{ borderColor: "#E7E5E4" }}>
                    <h3 className="text-[0.875rem] font-semibold mb-1" style={{ color: "#1C1917" }}>Redeem Lifetime Key</h3>
                    <p className="text-[0.75rem] mb-4" style={{ color: "#A8A29E" }}>
                      Have a lifetime activation key? Enter it below to activate your plan.
                    </p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#A8A29E" }} />
                        <input
                          type="text"
                          placeholder="MQ-XXXX-XXXX-XXXX-XXXX"
                          value={lifetimeKey}
                          onChange={(e) => setLifetimeKey(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-lg border text-[0.8125rem] outline-none transition-colors font-mono"
                          style={{ borderColor: "#E7E5E4", color: "#1C1917", backgroundColor: "#FAFAF9" }}
                          onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                          onBlur={(e) => (e.target.style.borderColor = "#E7E5E4")}
                        />
                      </div>
                      <button
                        onClick={handleRedeemKey}
                        disabled={redeemLoading || !lifetimeKey.trim()}
                        className="px-4 py-2 rounded-lg text-[0.8125rem] font-medium transition-opacity disabled:opacity-50"
                        style={{ backgroundColor: "#1C1917", color: "#FFFFFF" }}
                      >
                        {redeemLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Redeem"}
                      </button>
                    </div>
                  </div>

                  {/* Email Character Limit */}
                  <div className="rounded-xl border bg-white p-6" style={{ borderColor: "#E7E5E4" }}>
                    <h3 className="text-[0.875rem] font-semibold mb-1" style={{ color: "#1C1917" }}>Email Character Limit</h3>
                    <p className="text-[0.75rem] mb-4" style={{ color: "#A8A29E" }}>
                      Set a hard limit on the number of characters in automated emails for the current project. Set to 0 for no limit.
                    </p>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-[0.7rem] font-medium mb-1" style={{ color: "#78716C" }}>Max characters</label>
                        <input
                          type="number"
                          min={0}
                          value={maxEmailChars}
                          onChange={(e) => setMaxEmailChars(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full px-3 py-2 rounded-lg border text-[0.8125rem] outline-none transition-colors"
                          style={{ borderColor: "#E7E5E4", color: "#1C1917", backgroundColor: "#FAFAF9" }}
                          onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                          onBlur={(e) => (e.target.style.borderColor = "#E7E5E4")}
                        />
                      </div>
                      <button
                        onClick={handleSaveEmailCharLimit}
                        disabled={emailCharsLoading}
                        className="px-4 py-2 rounded-lg text-[0.8125rem] font-medium transition-opacity disabled:opacity-50"
                        style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
                      >
                        {emailCharsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
                      </button>
                    </div>
                    {maxEmailChars > 0 && (
                      <p className="text-[0.7rem] mt-2" style={{ color: "#78716C" }}>
                        Emails exceeding {maxEmailChars.toLocaleString()} characters will be truncated.
                      </p>
                    )}
                  </div>

                  {/* Cancel Plan */}
                  {subData?.subscription && subData.subscription.status === "active" && (
                    <div className="rounded-xl border bg-white p-6" style={{ borderColor: "#E7E5E4" }}>
                      <h3 className="text-[0.875rem] font-semibold mb-1" style={{ color: "#1C1917" }}>Cancel Plan</h3>
                      <p className="text-[0.75rem] mb-4" style={{ color: "#A8A29E" }}>
                        Submit a cancellation request. Our team will follow up via email.
                      </p>
                      <button
                        onClick={handleCancelRequest}
                        disabled={cancelLoading}
                        className="px-4 py-2 rounded-lg text-[0.8125rem] font-medium border flex items-center gap-2 transition-colors hover:bg-red-50 disabled:opacity-50"
                        style={{ borderColor: "#FCA5A5", color: "#DC2626" }}
                      >
                        {cancelLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        Request Cancellation
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </motion.div>
      </div>
    </PageShell>
  );
}
