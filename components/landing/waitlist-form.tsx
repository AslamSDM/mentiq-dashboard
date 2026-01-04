"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function WaitlistForm({ source = "landing_page" }: { source?: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [promoOptIn, setPromoOptIn] = useState(true);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    company: "",
    user_count: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) {
      toast({
        title: "Missing fields",
        description: "Please enter your name and email.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          user_count: formData.user_count ? parseInt(formData.user_count) : 0,
          promo_emails_opt_in: promoOptIn,
          source,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        toast({
          title: "You're on the list! 🎉",
          description: "Check your email for confirmation.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to join waitlist",
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

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 mb-4">
          <Check className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-[#2B3674] mb-2">You're on the list!</h3>
        <p className="text-[#4363C7]">We'll be in touch soon with early access.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-[#2B3674]">Full Name *</Label>
          <Input
            id="full_name"
            placeholder="John Doe"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="bg-[#F4F7FE] border-transparent text-[#2B3674] placeholder:text-gray-400 focus:bg-white focus:border-primary/20"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#2B3674]">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="bg-[#F4F7FE] border-transparent text-[#2B3674] placeholder:text-gray-400 focus:bg-white focus:border-primary/20"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company" className="text-[#2B3674]">Company Name</Label>
          <Input
            id="company"
            placeholder="Your Company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="bg-[#F4F7FE] border-transparent text-[#2B3674] placeholder:text-gray-400 focus:bg-white focus:border-primary/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user_count" className="text-[#2B3674]">Expected Users</Label>
          <Input
            id="user_count"
            type="number"
            placeholder="e.g. 500"
            value={formData.user_count}
            onChange={(e) => setFormData({ ...formData, user_count: e.target.value })}
            className="bg-[#F4F7FE] border-transparent text-[#2B3674] placeholder:text-gray-400 focus:bg-white focus:border-primary/20"
          />
        </div>
      </div>
      
      {/* Promotional email consent checkbox */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="promo_opt_in"
          checked={promoOptIn}
          onChange={(e) => setPromoOptIn(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 bg-white text-primary focus:ring-primary focus:ring-offset-0"
        />
        <label htmlFor="promo_opt_in" className="text-sm text-[#4363C7] cursor-pointer">
          I agree to receive promotional emails from Mentiq about product updates, tips, and special offers. You can unsubscribe anytime.
        </label>
      </div>
      
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_-5px_var(--primary)]"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Joining...
          </>
        ) : (
          <>
            Join the Waitlist <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
    </form>
  );
}
