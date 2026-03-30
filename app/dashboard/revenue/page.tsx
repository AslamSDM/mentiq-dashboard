"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
} from "recharts";
import {
  ChartContainer,
} from "@/components/ui/chart";
import { useStore } from "@/lib/store";
import { centralizedData } from "@/lib/services/centralized-data";
import { projectService } from "@/lib/services/project";
import type {
  RevenueMetrics,
  RevenueAnalytics,
  CustomerAnalytics,
} from "@/lib/services/project";
import {
  Loader2,
  DollarSign,
  Users,
  CreditCard,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  MoreVertical,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp, Key } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StripeLogo, DodoLogo, PolarLogo } from "@/components/brand-icons";

export default function RevenuePage() {
  const { getEffectiveProjectId, projects, fetchProjects } = useStore();
  const selectedProjectId = getEffectiveProjectId();
  const { toast } = useToast();

  const [stripeApiKey, setStripeApiKey] = useState("");
  const [dodoApiKey, setDodoApiKey] = useState("");
  const [polarApiKey, setPolarApiKey] = useState("");
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);
  const [isUpdatingDodoKey, setIsUpdatingDodoKey] = useState(false);
  const [isUpdatingPolarKey, setIsUpdatingPolarKey] = useState(false);
  const [isStripeConfigExpanded, setIsStripeConfigExpanded] = useState(false);
  const [isDodoConfigExpanded, setIsDodoConfigExpanded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDodoSyncing, setIsDodoSyncing] = useState(false);
  const [isPolarSyncing, setIsPolarSyncing] = useState(false);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(
    null,
  );
  const [revenueAnalytics, setRevenueAnalytics] =
    useState<RevenueAnalytics | null>(null);
  const [customerAnalytics, setCustomerAnalytics] =
    useState<CustomerAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<"stripe" | "dodo" | "polar">("stripe");
  const [replaceKeyModal, setReplaceKeyModal] = useState<"stripe" | "dodo" | "polar" | null>(null);
  const [replaceKeyValue, setReplaceKeyValue] = useState("");

  // Check if keys are already configured
  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const hasStripeKeyConfigured = !!selectedProject?.hasStripeKey;
  const hasDodoKeyConfigured = !!(selectedProject as any)?.hasDodoKey;
  const hasPolarKeyConfigured = !!(selectedProject as any)?.hasPolarKey;

  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const handleUpdateStripeKey = async () => {
    if (!selectedProjectId || !stripeApiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Stripe restricted API key",
        variant: "destructive",
      });
      return;
    }

    // Validate that it's a restricted key
    if (
      !stripeApiKey.startsWith("rk_live_") &&
      !stripeApiKey.startsWith("rk_test_")
    ) {
      toast({
        title: "Invalid Key Type",
        description:
          "Please use a restricted API key (starts with rk_live_ or rk_test_) for security",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingKey(true);
    try {
      await projectService.updateStripeApiKey(selectedProjectId, stripeApiKey);
      toast({
        title: "Success",
        description: "Stripe API key updated successfully",
      });
      setStripeApiKey("");
      // Invalidate frontend caches and refresh
      centralizedData.invalidateRevenueCache(selectedProjectId);
      await fetchProjects();
      await fetchAllData();
    } catch (error) {
      toast({
        title: "Configuration Failed",
        description:
          "Failed to save Stripe API key. Check that it's a valid restricted key.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingKey(false);
    }
  };

  const handleUpdateDodoKey = async () => {
    if (!selectedProjectId || !dodoApiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid DodoPayments API key",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingDodoKey(true);
    try {
      await projectService.updateDodoApiKey(selectedProjectId, dodoApiKey);
      toast({
        title: "Success",
        description: "DodoPayments API key updated successfully",
      });
      setDodoApiKey("");
      centralizedData.invalidateRevenueCache(selectedProjectId);
      await fetchProjects();
      await fetchAllData();
    } catch (error) {
      toast({
        title: "Configuration Failed",
        description:
          "Failed to save DodoPayments API key. Check that it's a valid API key.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingDodoKey(false);
    }
  };

  const handleSyncDodoData = async () => {
    if (!selectedProjectId) return;

    setIsDodoSyncing(true);
    try {
      await projectService.syncDodoData(selectedProjectId);
      toast({
        title: "Success",
        description: "DodoPayments data synced successfully",
      });
      centralizedData.invalidateRevenueCache(selectedProjectId);
      await fetchAllData();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description:
          "Failed to sync DodoPayments data. Verify your API key has the required permissions.",
        variant: "destructive",
      });
    } finally {
      setIsDodoSyncing(false);
    }
  };

  const handleUpdatePolarKey = async () => {
    if (!selectedProjectId || !polarApiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Polar Organization Access Token",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPolarKey(true);
    try {
      await projectService.updatePolarApiKey(selectedProjectId, polarApiKey);
      toast({
        title: "Success",
        description: "Polar API key updated successfully",
      });
      setPolarApiKey("");
      centralizedData.invalidateRevenueCache(selectedProjectId);
      await fetchProjects();
      await fetchAllData();
    } catch (error) {
      toast({
        title: "Configuration Failed",
        description:
          "Failed to save Polar API key. Check that it's a valid Organization Access Token.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPolarKey(false);
    }
  };

  const handleSyncPolarData = async () => {
    if (!selectedProjectId) return;

    setIsPolarSyncing(true);
    try {
      await projectService.syncPolarData(selectedProjectId);
      toast({
        title: "Success",
        description: "Polar data synced successfully",
      });
      centralizedData.invalidateRevenueCache(selectedProjectId);
      await fetchAllData();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description:
          "Failed to sync Polar data. Verify your OAT has the required scopes.",
        variant: "destructive",
      });
    } finally {
      setIsPolarSyncing(false);
    }
  };

  const handleSyncStripeData = async () => {
    if (!selectedProjectId) return;

    setIsSyncing(true);
    try {
      await projectService.syncStripeData(selectedProjectId);
      toast({
        title: "Success",
        description: "Stripe data synced successfully",
      });
      // Invalidate frontend caches before refreshing
      centralizedData.invalidateRevenueCache(selectedProjectId);
      await fetchAllData();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description:
          "Failed to sync Stripe data. Verify your restricted API key has the required permissions.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchAllData = async () => {
    if (!selectedProjectId) return;

    setIsLoading(true);
    try {
      if (activeProvider === "polar") {
        const [metrics, analytics, customers] = await Promise.all([
          centralizedData.getPolarRevenueMetrics(selectedProjectId).catch(() => null),
          centralizedData
            .getPolarRevenueAnalytics(
              selectedProjectId,
              dateRange.start,
              dateRange.end,
            )
            .catch(() => null),
          centralizedData
            .getPolarCustomerAnalytics(selectedProjectId)
            .catch(() => null),
        ]);

        setRevenueMetrics(metrics);
        setRevenueAnalytics(analytics);
        setCustomerAnalytics(customers);
      } else if (activeProvider === "dodo") {
        const [metrics, analytics, customers] = await Promise.all([
          centralizedData.getDodoRevenueMetrics(selectedProjectId).catch(() => null),
          centralizedData
            .getDodoRevenueAnalytics(
              selectedProjectId,
              dateRange.start,
              dateRange.end,
            )
            .catch(() => null),
          centralizedData
            .getDodoCustomerAnalytics(selectedProjectId)
            .catch(() => null),
        ]);

        setRevenueMetrics(metrics);
        setRevenueAnalytics(analytics);
        setCustomerAnalytics(customers);
      } else {
        // Stripe (default)
        const [metrics, analytics, customers] = await Promise.all([
          centralizedData.getRevenueMetrics(selectedProjectId).catch(() => null),
          centralizedData
            .getRevenueAnalytics(
              selectedProjectId,
              dateRange.start,
              dateRange.end,
            )
            .catch(() => null),
          centralizedData
            .getCustomerAnalytics(selectedProjectId)
            .catch(() => null),
        ]);

        setRevenueMetrics(metrics);
        setRevenueAnalytics(analytics);
        setCustomerAnalytics(customers);
      }
    } catch {
      // Silent fail for non-critical data
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [selectedProjectId, dateRange, activeProvider]);

  // Auto-detect which provider to use and auto-expand config if needed
  useEffect(() => {
    if (hasPolarKeyConfigured && !hasStripeKeyConfigured && !hasDodoKeyConfigured) {
      setActiveProvider("polar");
    } else if (hasDodoKeyConfigured && !hasStripeKeyConfigured) {
      setActiveProvider("dodo");
    } else if (hasStripeKeyConfigured) {
      setActiveProvider("stripe");
    }

    if (!hasStripeKeyConfigured && !hasDodoKeyConfigured && !hasPolarKeyConfigured) {
      setIsStripeConfigExpanded(true);
    }
  }, [hasStripeKeyConfigured, hasDodoKeyConfigured, hasPolarKeyConfigured]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value?.toFixed(1)}%`;
  };

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader
          title="Revenue Analytics"
          description="Track revenue, subscriptions, and customer metrics"
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">
            Please select a project to view revenue analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Revenue Analytics"
        description="Track revenue, subscriptions, and customer metrics"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Payment Provider Configuration */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setIsStripeConfigExpanded(!isStripeConfigExpanded)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>Payment Provider</CardTitle>
                {(hasStripeKeyConfigured || hasDodoKeyConfigured || hasPolarKeyConfigured) && (
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                    {activeProvider === "stripe" && <StripeLogo size={14} className="mr-1.5" />}
                    {activeProvider === "dodo" && <DodoLogo size={14} className="mr-1.5" />}
                    {activeProvider === "polar" && <PolarLogo size={14} className="mr-1.5" />}
                    {activeProvider === "stripe" ? "Stripe" : activeProvider === "dodo" ? "Dodo Payments" : "Polar"} Connected
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm">
                {isStripeConfigExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            <CardDescription>
              Select your payment provider and enter your API key to track revenue metrics.
            </CardDescription>
          </CardHeader>
          {isStripeConfigExpanded && (
            <CardContent className="space-y-4">
              {/* Provider Selection Dropdown */}
              <div className="space-y-2">
                <Label>Payment Provider</Label>
                <Select value={activeProvider} onValueChange={(v) => setActiveProvider(v as "stripe" | "dodo" | "polar")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">
                      <div className="flex items-center gap-3">
                        <StripeLogo size={20} />
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Stripe</span>
                          <span className="text-xs text-muted-foreground">Subscriptions, invoices & charges</span>
                          {hasStripeKeyConfigured && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0">
                              Connected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="dodo">
                      <div className="flex items-center gap-3">
                        <DodoLogo size={20} />
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Dodo Payments</span>
                          <span className="text-xs text-muted-foreground">Payments, subscriptions & billing</span>
                          {hasDodoKeyConfigured && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0">
                              Connected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="polar">
                      <div className="flex items-center gap-3">
                        <PolarLogo size={20} />
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Polar</span>
                          <span className="text-xs text-muted-foreground">Orders, subscriptions & products</span>
                          {hasPolarKeyConfigured && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0">
                              Connected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stripe-specific config */}
              {activeProvider === "stripe" && (
                <div className="space-y-4 pt-2 border-t">
                  {hasStripeKeyConfigured ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center gap-3">
                        <StripeLogo size={24} />
                        <div>
                          <p className="text-sm font-medium text-green-800">Stripe Connected</p>
                          <p className="text-xs text-green-600">API key is configured and active</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleSyncStripeData}
                          disabled={isSyncing}
                          variant="outline"
                          size="sm"
                        >
                          {isSyncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Sync Data
                        </Button>
                        <Button
                          onClick={fetchAllData}
                          disabled={isLoading}
                          variant="outline"
                          size="sm"
                        >
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Refresh
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setReplaceKeyModal("stripe"); setReplaceKeyValue(""); }}>
                              <Key className="h-4 w-4 mr-2" />
                              Replace API Key
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-sm text-blue-800 font-medium">
                            Security Best Practice
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Create a <strong>restricted API key</strong> in your Stripe
                            dashboard with read-only access to: Customers, Subscriptions,
                            Invoices, and Charges. Never use your secret key here.
                          </p>
                          <div className="mt-2">
                            <a
                              href="https://dashboard.stripe.com/apikeys"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-700 underline hover:text-blue-800"
                            >
                              Create Restricted Key in Stripe Dashboard
                            </a>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                          <p className="text-sm text-gray-800 font-medium">
                            Required Permissions (Read Only)
                          </p>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                            <div>Customers</div>
                            <div>Invoices</div>
                            <div>Subscriptions</div>
                            <div>Charges</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                        <div className="flex-1">
                          <Label htmlFor="stripe-key">Stripe Restricted API Key</Label>
                          <Input
                            id="stripe-key"
                            type="password"
                            placeholder="rk_live_... or rk_test_..."
                            value={stripeApiKey}
                            onChange={(e) => setStripeApiKey(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleUpdateStripeKey} disabled={isUpdatingKey}>
                          {isUpdatingKey && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Connect Stripe
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Dodo Payments-specific config */}
              {activeProvider === "dodo" && (
                <div className="space-y-4 pt-2 border-t">
                  {hasDodoKeyConfigured ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center gap-3">
                        <DodoLogo size={24} />
                        <div>
                          <p className="text-sm font-medium text-green-800">Dodo Payments Connected</p>
                          <p className="text-xs text-green-600">API key is configured and active</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleSyncDodoData}
                          disabled={isDodoSyncing}
                          variant="outline"
                          size="sm"
                        >
                          {isDodoSyncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Sync Data
                        </Button>
                        <Button
                          onClick={fetchAllData}
                          disabled={isLoading}
                          variant="outline"
                          size="sm"
                        >
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Refresh
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setReplaceKeyModal("dodo"); setReplaceKeyValue(""); }}>
                              <Key className="h-4 w-4 mr-2" />
                              Replace API Key
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-800 font-medium">
                          Getting Your API Key
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Get your API key from the Dodo Payments dashboard. Use a key
                          with read access to Payments, Subscriptions, Customers, and Refunds.
                        </p>
                        <div className="mt-2">
                          <a
                            href="https://app.dodopayments.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-700 underline hover:text-green-800"
                          >
                            Open Dodo Payments Dashboard
                          </a>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                        <div className="flex-1">
                          <Label htmlFor="dodo-key">Dodo Payments API Key</Label>
                          <Input
                            id="dodo-key"
                            type="password"
                            placeholder="Your Dodo Payments API key"
                            value={dodoApiKey}
                            onChange={(e) => setDodoApiKey(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleUpdateDodoKey} disabled={isUpdatingDodoKey}>
                          {isUpdatingDodoKey && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Connect Dodo Payments
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Polar-specific config */}
              {activeProvider === "polar" && (
                <div className="space-y-4 pt-2 border-t">
                  {hasPolarKeyConfigured ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center gap-3">
                        <PolarLogo size={24} />
                        <div>
                          <p className="text-sm font-medium text-green-800">Polar Connected</p>
                          <p className="text-xs text-green-600">Organization Access Token is configured</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleSyncPolarData}
                          disabled={isPolarSyncing}
                          variant="outline"
                          size="sm"
                        >
                          {isPolarSyncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Sync Data
                        </Button>
                        <Button
                          onClick={fetchAllData}
                          disabled={isLoading}
                          variant="outline"
                          size="sm"
                        >
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Refresh
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setReplaceKeyModal("polar"); setReplaceKeyValue(""); }}>
                              <Key className="h-4 w-4 mr-2" />
                              Replace API Key
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                        <p className="text-sm text-purple-800 font-medium">
                          Organization Access Token
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          Create an Organization Access Token (OAT) in your Polar dashboard
                          with read access to: Orders, Subscriptions, Customers, and Metrics.
                        </p>
                        <div className="mt-2">
                          <a
                            href="https://polar.sh/dashboard"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-700 underline hover:text-purple-800"
                          >
                            Open Polar Dashboard
                          </a>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-sm text-gray-800 font-medium">
                          Required Scopes (Read Only)
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                          <div>orders:read</div>
                          <div>subscriptions:read</div>
                          <div>customers:read</div>
                          <div>metrics:read</div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                        <div className="flex-1">
                          <Label htmlFor="polar-key">Polar Organization Access Token</Label>
                          <Input
                            id="polar-key"
                            type="password"
                            placeholder="polar_oat_..."
                            value={polarApiKey}
                            onChange={(e) => setPolarApiKey(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleUpdatePolarKey} disabled={isUpdatingPolarKey}>
                          {isUpdatingPolarKey && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Connect Polar
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-muted-foreground">Loading revenue data...</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !revenueMetrics && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-40">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No Revenue Data</h3>
                  <p className="text-muted-foreground">
                    {activeProvider === "polar"
                      ? hasPolarKeyConfigured
                        ? "Click Sync to pull the latest data from Polar."
                        : "Select Polar above and enter your OAT to get started."
                      : activeProvider === "dodo"
                        ? hasDodoKeyConfigured
                          ? "Click Sync to pull the latest data from Dodo Payments."
                          : "Select Dodo Payments above and enter your API key to get started."
                        : hasStripeKeyConfigured
                          ? "Click Sync to pull the latest data from Stripe."
                          : "Select Stripe above and enter your API key to get started."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revenue Metrics Overview */}
        {!isLoading && revenueMetrics && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Monthly Recurring Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(revenueMetrics.mrr)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {revenueMetrics.growth_rate > 0 ? "+" : ""}
                    {formatPercentage(revenueMetrics.growth_rate)} from last
                    month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Subscriptions
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {revenueMetrics.active_subscriptions}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {revenueMetrics.new_subscriptions} new this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Customers
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {revenueMetrics.total_customers ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(revenueMetrics.churn_rate)} churn rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ARPU</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(revenueMetrics.arpu)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average revenue per user
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

        {/* MRR Movements Cards */}
        {!isLoading && revenueMetrics && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Expansion MRR
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    +{formatCurrency(revenueMetrics.expansion_mrr ?? 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Revenue from upgrades & expansions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Downgrade MRR
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    -{formatCurrency(revenueMetrics.downgrade_mrr ?? 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Revenue lost from downgrades
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Net Revenue Churn
                  </CardTitle>
                  <Activity className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${(revenueMetrics.net_revenue_churn ?? 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatPercentage(revenueMetrics.net_revenue_churn ?? 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Churned MRR: {formatCurrency(revenueMetrics.churned_mrr ?? 0)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

        {!isLoading && (
          <Tabs defaultValue="analytics" className="space-y-4">
            <TabsList>
              <TabsTrigger value="analytics">Revenue Analytics</TabsTrigger>
              <TabsTrigger value="customers">Customer Analytics</TabsTrigger>
              <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-4">
              {revenueMetrics?.time_series && revenueMetrics.time_series.length > 0 ? (
                <>
                  {/* MRR & Revenue Trend */}
                  <Card className="min-w-0 overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-[#2B3674] font-bold">MRR & Revenue Trend</CardTitle>
                      <CardDescription className="text-[#4363C7]">
                        Monthly Recurring Revenue and daily revenue over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-2 overflow-hidden">
                      <ChartContainer
                        config={{
                          mrr: {
                            label: "MRR",
                            color: "#4318FF",
                          },
                          revenue: {
                            label: "Revenue",
                            color: "#05CD99",
                          },
                        }}
                        className="h-[300px] w-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={revenueMetrics.time_series}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              className="stroke-[#E0E5F2]"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="date"
                              className="text-xs text-[#4363C7]"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={10}
                              minTickGap={30}
                              tickFormatter={(value) =>
                                new Date(value).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              }
                            />
                            <YAxis
                              className="text-xs text-[#4363C7]"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={10}
                              tickFormatter={(value) =>
                                `$${value.toLocaleString()}`
                              }
                              width={45}
                            />
                            <Tooltip
                              cursor={{ stroke: "#E0E5F2", strokeWidth: 1 }}
                              contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
                              }}
                              formatter={(value: number, name: string) => [
                                formatCurrency(Number(value)),
                                name === "mrr" ? "MRR" : "Revenue",
                              ]}
                            />
                            <Line
                              type="monotone"
                              dataKey="mrr"
                              stroke="#4318FF"
                              strokeWidth={3}
                              dot={false}
                              activeDot={{
                                r: 6,
                                fill: "#4318FF",
                                stroke: "#fff",
                                strokeWidth: 2,
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              stroke="#05CD99"
                              strokeWidth={3}
                              dot={false}
                              activeDot={{
                                r: 6,
                                fill: "#05CD99",
                                stroke: "#fff",
                                strokeWidth: 2,
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* MRR Movements */}
                  <Card className="min-w-0 overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-[#2B3674] font-bold">MRR Movements</CardTitle>
                      <CardDescription className="text-[#4363C7]">
                        Expansion, downgrade, and churned MRR over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-2 overflow-hidden">
                      <ChartContainer
                        config={{
                          expansion_mrr: {
                            label: "Expansion MRR",
                            color: "#05CD99",
                          },
                          downgrade_mrr: {
                            label: "Downgrade MRR",
                            color: "#FF6B00",
                          },
                          churned_mrr: {
                            label: "Churned MRR",
                            color: "#EE5D50",
                          },
                          net_revenue_churn: {
                            label: "Net Revenue Churn %",
                            color: "#7551FF",
                          },
                        }}
                        className="h-[300px] w-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={revenueMetrics.time_series}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              className="stroke-[#E0E5F2]"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="date"
                              className="text-xs text-[#4363C7]"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={10}
                              minTickGap={30}
                              tickFormatter={(value) =>
                                new Date(value).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              }
                            />
                            <YAxis
                              yAxisId="left"
                              className="text-xs text-[#4363C7]"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={10}
                              tickFormatter={(value) =>
                                `$${value.toLocaleString()}`
                              }
                              width={45}
                            />
                            <YAxis
                              yAxisId="right"
                              orientation="right"
                              className="text-xs text-[#7551FF]"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={10}
                              tickFormatter={(value) => `${value}%`}
                              width={40}
                            />
                            <Tooltip
                              cursor={{ stroke: "#E0E5F2", strokeWidth: 1 }}
                              contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
                              }}
                              formatter={(value: number, name: string) => {
                                if (name === "net_revenue_churn") return [`${Number(value).toFixed(2)}%`, "Net Revenue Churn"];
                                const labels: Record<string, string> = {
                                  expansion_mrr: "Expansion MRR",
                                  downgrade_mrr: "Downgrade MRR",
                                  churned_mrr: "Churned MRR",
                                };
                                return [formatCurrency(Number(value)), labels[name] || name];
                              }}
                            />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="expansion_mrr"
                              stroke="#05CD99"
                              strokeWidth={3}
                              dot={false}
                              activeDot={{
                                r: 6,
                                fill: "#05CD99",
                                stroke: "#fff",
                                strokeWidth: 2,
                              }}
                            />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="downgrade_mrr"
                              stroke="#FF6B00"
                              strokeWidth={3}
                              dot={false}
                              activeDot={{
                                r: 6,
                                fill: "#FF6B00",
                                stroke: "#fff",
                                strokeWidth: 2,
                              }}
                            />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="churned_mrr"
                              stroke="#EE5D50"
                              strokeWidth={3}
                              dot={false}
                              activeDot={{
                                r: 6,
                                fill: "#EE5D50",
                                stroke: "#fff",
                                strokeWidth: 2,
                              }}
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="net_revenue_churn"
                              stroke="#7551FF"
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              dot={false}
                              activeDot={{
                                r: 6,
                                fill: "#7551FF",
                                stroke: "#fff",
                                strokeWidth: 2,
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Customer Growth & Subscriptions */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="min-w-0 overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-[#2B3674] font-bold">Customer Growth</CardTitle>
                        <CardDescription className="text-[#4363C7]">
                          Total customers over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-2 overflow-hidden">
                        <ChartContainer
                          config={{
                            total_customers: {
                              label: "Total Customers",
                              color: "#FFCE20",
                            },
                          }}
                          className="h-[200px] w-full"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueMetrics.time_series}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-[#E0E5F2]"
                                vertical={false}
                              />
                              <XAxis
                                dataKey="date"
                                className="text-xs text-[#4363C7]"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                minTickGap={30}
                                tickFormatter={(value) =>
                                  new Date(value).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })
                                }
                              />
                              <YAxis
                                className="text-xs text-[#4363C7]"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                width={35}
                                allowDecimals={false}
                              />
                              <Tooltip
                                cursor={{ stroke: "#E0E5F2", strokeWidth: 1 }}
                                contentStyle={{
                                  borderRadius: "12px",
                                  border: "none",
                                  boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="total_customers"
                                stroke="#FFCE20"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{
                                  r: 6,
                                  fill: "#FFCE20",
                                  stroke: "#fff",
                                  strokeWidth: 2,
                                }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card className="min-w-0 overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-[#2B3674] font-bold">Active Subscriptions</CardTitle>
                        <CardDescription className="text-[#4363C7]">
                          Number of active subscriptions over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-2 overflow-hidden">
                        <ChartContainer
                          config={{
                            active_subscriptions: {
                              label: "Active Subscriptions",
                              color: "#00A3FF",
                            },
                          }}
                          className="h-[200px] w-full"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueMetrics.time_series}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-[#E0E5F2]"
                                vertical={false}
                              />
                              <XAxis
                                dataKey="date"
                                className="text-xs text-[#4363C7]"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                minTickGap={30}
                                tickFormatter={(value) =>
                                  new Date(value).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })
                                }
                              />
                              <YAxis
                                className="text-xs text-[#4363C7]"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                width={35}
                                allowDecimals={false}
                              />
                              <Tooltip
                                cursor={{ stroke: "#E0E5F2", strokeWidth: 1 }}
                                contentStyle={{
                                  borderRadius: "12px",
                                  border: "none",
                                  boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="active_subscriptions"
                                stroke="#00A3FF"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{
                                  r: 6,
                                  fill: "#00A3FF",
                                  stroke: "#fff",
                                  strokeWidth: 2,
                                }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : !isLoading && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center h-40">
                    <p className="text-muted-foreground mb-4">
                      No analytics data available. Click Sync to pull data from Stripe.
                    </p>
                    <Button onClick={handleSyncStripeData} disabled={isSyncing} variant="outline">
                      {isSyncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sync Stripe Data
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="customers" className="space-y-4">
              {customerAnalytics && (
                <>
                  {/* Customer Summary */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Total Customers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {customerAnalytics.summary?.total_customers}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            {customerAnalytics.summary?.paid_customers} paid
                          </Badge>
                          <Badge variant="outline">
                            {customerAnalytics.summary?.free_customers} free
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Conversion Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {formatPercentage(
                            customerAnalytics.summary?.conversion_rate,
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Free to paid conversion
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Total Customer MRR</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {formatCurrency(customerAnalytics.summary?.total_mrr)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          From all paying customers
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Customers Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Breakdown</CardTitle>
                      <CardDescription>
                        Top customers by monthly revenue
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {customerAnalytics.customers &&
                        Array.isArray(customerAnalytics.customers) &&
                        customerAnalytics.customers.length > 0 ? (
                          customerAnalytics.customers
                            .slice(0, 10)
                            .map((customer: any) => (
                              <div
                                key={customer.id}
                                className="flex items-center justify-between p-3 border rounded"
                              >
                                <div className="min-w-0 mr-2">
                                  <p
                                    className="font-medium truncate"
                                    title={customer.email || ""}
                                  >
                                    {customer.email || "N/A"}
                                  </p>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {customer.name || "Unknown"}
                                  </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="font-medium">
                                    {formatCurrency(customer.mrr || 0)}
                                  </p>
                                  <Badge
                                    variant={
                                      customer.status === "active"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {customer.status}
                                  </Badge>
                                </div>
                              </div>
                            ))
                        ) : (
                          <p className="text-center text-muted-foreground py-8">
                            No customer data available
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              {revenueMetrics && (
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Revenue Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>MRR:</span>
                        <span className="font-medium">
                          {formatCurrency(revenueMetrics.mrr)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>ARR:</span>
                        <span className="font-medium">
                          {formatCurrency(revenueMetrics.arr)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Revenue:</span>
                        <span className="font-medium">
                          {formatCurrency(revenueMetrics.total_revenue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expansion MRR:</span>
                        <span className="font-medium text-green-600">
                          +{formatCurrency(revenueMetrics.expansion_mrr ?? 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Downgrade MRR:</span>
                        <span className="font-medium text-orange-600">
                          -{formatCurrency(revenueMetrics.downgrade_mrr ?? 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Churned MRR:</span>
                        <span className="font-medium text-red-600">
                          -{formatCurrency(revenueMetrics.churned_mrr ?? 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Revenue Churn:</span>
                        <span className={`font-medium ${(revenueMetrics.net_revenue_churn ?? 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatPercentage(revenueMetrics.net_revenue_churn ?? 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Revenue:</span>
                        <span className="font-medium">
                          {formatCurrency(revenueMetrics.net_revenue)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Subscription Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Subscription Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Active Subscriptions:</span>
                        <span className="font-medium">
                          {revenueMetrics.active_subscriptions}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>New Subscriptions:</span>
                        <span className="font-medium">
                          {revenueMetrics.new_subscriptions}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Churned Subscriptions:</span>
                        <span className="font-medium">
                          {revenueMetrics.churned_subscriptions}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Churn Rate:</span>
                        <span className="font-medium">
                          {formatPercentage(revenueMetrics.churn_rate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trial Conversion Rate:</span>
                        <span className="font-medium">
                          {formatPercentage(
                            revenueMetrics.trial_to_pay_conversion_rate,
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {!revenueMetrics && !isLoading && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center h-40">
                    <p className="text-muted-foreground mb-4">
                      No revenue data available
                    </p>
                    <Button onClick={handleSyncStripeData} disabled={isSyncing}>
                      {isSyncing && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Sync Stripe Data
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Replace API Key Modal */}
        <Dialog open={replaceKeyModal !== null} onOpenChange={(open) => !open && setReplaceKeyModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {replaceKeyModal === "stripe" && <StripeLogo size={20} />}
                {replaceKeyModal === "dodo" && <DodoLogo size={20} />}
                {replaceKeyModal === "polar" && <PolarLogo size={20} />}
                Replace {replaceKeyModal === "stripe" ? "Stripe" : replaceKeyModal === "dodo" ? "Dodo Payments" : "Polar"} API Key
              </DialogTitle>
              <DialogDescription>
                Enter a new API key to replace the existing one. This will immediately take effect.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="replace-key">New API Key</Label>
                <Input
                  id="replace-key"
                  type="password"
                  placeholder={
                    replaceKeyModal === "stripe" ? "rk_live_... or rk_test_..." :
                    replaceKeyModal === "polar" ? "polar_oat_..." :
                    "Your API key"
                  }
                  value={replaceKeyValue}
                  onChange={(e) => setReplaceKeyValue(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReplaceKeyModal(null)}>
                Cancel
              </Button>
              <Button
                disabled={!replaceKeyValue.trim() || isUpdatingKey || isUpdatingDodoKey || isUpdatingPolarKey}
                onClick={async () => {
                  if (replaceKeyModal === "stripe") {
                    setStripeApiKey(replaceKeyValue);
                    // Trigger the update handler directly
                    setIsUpdatingKey(true);
                    try {
                      await projectService.updateStripeApiKey(selectedProjectId!, replaceKeyValue);
                      toast({ title: "Success", description: "Stripe API key replaced successfully" });
                      setReplaceKeyValue("");
                      setReplaceKeyModal(null);
                      centralizedData.invalidateRevenueCache(selectedProjectId!);
                      await fetchProjects();
                      await fetchAllData();
                    } catch {
                      toast({ title: "Error", description: "Failed to update Stripe API key", variant: "destructive" });
                    } finally {
                      setIsUpdatingKey(false);
                      setStripeApiKey("");
                    }
                  } else if (replaceKeyModal === "dodo") {
                    setIsUpdatingDodoKey(true);
                    try {
                      await projectService.updateDodoApiKey(selectedProjectId!, replaceKeyValue);
                      toast({ title: "Success", description: "Dodo Payments API key replaced successfully" });
                      setReplaceKeyValue("");
                      setReplaceKeyModal(null);
                      centralizedData.invalidateRevenueCache(selectedProjectId!);
                      await fetchProjects();
                      await fetchAllData();
                    } catch {
                      toast({ title: "Error", description: "Failed to update Dodo API key", variant: "destructive" });
                    } finally {
                      setIsUpdatingDodoKey(false);
                    }
                  } else if (replaceKeyModal === "polar") {
                    setIsUpdatingPolarKey(true);
                    try {
                      await projectService.updatePolarApiKey(selectedProjectId!, replaceKeyValue);
                      toast({ title: "Success", description: "Polar API key replaced successfully" });
                      setReplaceKeyValue("");
                      setReplaceKeyModal(null);
                      centralizedData.invalidateRevenueCache(selectedProjectId!);
                      await fetchProjects();
                      await fetchAllData();
                    } catch {
                      toast({ title: "Error", description: "Failed to update Polar API key", variant: "destructive" });
                    } finally {
                      setIsUpdatingPolarKey(false);
                    }
                  }
                }}
              >
                {(isUpdatingKey || isUpdatingDodoKey || isUpdatingPolarKey) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Replace Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
