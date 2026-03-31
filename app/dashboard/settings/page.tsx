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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Mail, Loader2, Check, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/page-shell";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  
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
            {(["profile", "security"] as const).map((tab) => (
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
                {tab === "profile" ? <User className="w-3.5 h-3.5" strokeWidth={1.75} /> : <Lock className="w-3.5 h-3.5" strokeWidth={1.75} />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
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
        </motion.div>
      </div>
    </PageShell>
  );
}
