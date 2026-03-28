"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  adminService,
  type AdminAccount,
  type AccountLimitsResponse,
  type LimitOverrides,
} from "@/lib/services/admin";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Users,
  Video,
  Mail,
  Sparkles,
  RotateCcw,
  Save,
  Search,
  AlertTriangle,
} from "lucide-react";

const RESOURCE_META: Record<
  string,
  { label: string; icon: typeof Users; overrideKey: keyof LimitOverrides }
> = {
  paid_users: {
    label: "Paid Users Tracked",
    icon: Users,
    overrideKey: "paid_users_override",
  },
  session_replays: {
    label: "Session Replays",
    icon: Video,
    overrideKey: "session_replays_override",
  },
  automated_emails: {
    label: "Automated Emails",
    icon: Mail,
    overrideKey: "automated_emails_override",
  },
  ai_generations: {
    label: "AI Email Generation",
    icon: Sparkles,
    overrideKey: "ai_generations_override",
  },
};

export default function AdminLimitsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    searchParams.get("account_id") || "",
  );
  const [limitsData, setLimitsData] = useState<AccountLimitsResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingLimits, setLoadingLimits] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Local override form state
  const [overrideForm, setOverrideForm] = useState<LimitOverrides>({});

  // Check admin access
  useEffect(() => {
    if (status === "authenticated" && session && !session.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      });
      router.push("/dashboard");
    }
  }, [session, status, router, toast]);

  // Fetch accounts list
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAllAccounts();
        setAccounts(data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load accounts.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session?.isAdmin) {
      fetchAccounts();
    }
  }, [session, status, toast]);

  // Fetch limits when account is selected
  const fetchLimits = useCallback(
    async (accountId: string) => {
      if (!accountId) return;
      try {
        setLoadingLimits(true);
        const data = await adminService.getAccountLimits(accountId);
        setLimitsData(data);
        // Initialize form with current overrides
        setOverrideForm({
          paid_users_override: data.overrides?.paid_users_override ?? undefined,
          session_replays_override:
            data.overrides?.session_replays_override ?? undefined,
          automated_emails_override:
            data.overrides?.automated_emails_override ?? undefined,
          ai_generations_override:
            data.overrides?.ai_generations_override ?? undefined,
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to load account limits.",
          variant: "destructive",
        });
      } finally {
        setLoadingLimits(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    if (selectedAccountId) {
      fetchLimits(selectedAccountId);
    }
  }, [selectedAccountId, fetchLimits]);

  const handleSave = async () => {
    if (!selectedAccountId) return;
    try {
      setSaving(true);
      const result = await adminService.updateAccountLimits(
        selectedAccountId,
        overrideForm,
      );
      setLimitsData(result);
      toast({
        title: "Limits Updated",
        description: "Account limits have been updated successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update limits.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (resource: string) => {
    if (!selectedAccountId) return;
    try {
      const result = await adminService.resetAccountLimit(
        selectedAccountId,
        resource,
      );
      // Re-fetch full limits
      await fetchLimits(selectedAccountId);
      toast({
        title: "Limit Reset",
        description: `${RESOURCE_META[resource]?.label} limit reset to plan default.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to reset limit.",
        variant: "destructive",
      });
    }
  };

  const filteredAccounts = accounts.filter(
    (a) =>
      a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  if (status === "loading" || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader
        title="Usage Limits"
        description="View and override resource limits for customer accounts"
      />

      {/* Account selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
            >
              <SelectTrigger className="w-[400px]">
                <SelectValue placeholder="Choose an account" />
              </SelectTrigger>
              <SelectContent>
                {filteredAccounts.filter((account) => account.id).map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name || account.email} —{" "}
                    <span className="text-muted-foreground">
                      {account.email}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Limits editor */}
      {selectedAccountId && loadingLimits && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {selectedAccountId && limitsData && !loadingLimits && (
        <>
          {/* Summary bar */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">
                  Current Plan
                </div>
                <div className="text-2xl font-bold">
                  {limitsData.summary.tier_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  ${(limitsData.summary.base_price / 100).toFixed(0)}/mo base
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">
                  Total Overages
                </div>
                <div className="text-2xl font-bold">
                  ${(limitsData.summary.total_overage_cost / 100).toFixed(2)}
                </div>
                {limitsData.summary.total_overage_cost > 0 && (
                  <div className="flex items-center gap-1 text-sm text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    Overage charges active
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">
                  Projected Bill
                </div>
                <div className="text-2xl font-bold">
                  ${(limitsData.summary.projected_bill / 100).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  base + overages
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resource cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {limitsData.summary.resources.map((resource) => {
              const meta = RESOURCE_META[resource.resource];
              if (!meta) return null;
              const Icon = meta.icon;
              const usagePercent = resource.limit > 0
                ? Math.min((resource.current_usage / resource.limit) * 100, 100)
                : 0;
              const isOver = resource.current_usage > resource.limit;
              const overrideKey = meta.overrideKey;
              const currentOverride = overrideForm[overrideKey];

              return (
                <Card key={resource.resource}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-base">
                          {meta.label}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {resource.is_override && (
                          <Badge variant="outline" className="text-xs">
                            Override
                          </Badge>
                        )}
                        {isOver && (
                          <Badge variant="destructive" className="text-xs">
                            Over limit
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {resource.current_usage.toLocaleString()} /{" "}
                      {resource.limit.toLocaleString()} used
                      {resource.overage > 0 && (
                        <span className="ml-2 text-amber-600">
                          (+{resource.overage.toLocaleString()} overage = $
                          {(resource.overage_cost / 100).toFixed(2)})
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={usagePercent}
                      className={`mb-4 h-2 ${isOver ? "[&>div]:bg-red-500" : ""}`}
                    />
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="mb-1 block text-xs text-muted-foreground">
                          Override limit (leave empty for plan default)
                        </label>
                        <Input
                          type="number"
                          placeholder={`Plan default: ${resource.limit}`}
                          value={currentOverride ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOverrideForm((prev) => ({
                              ...prev,
                              [overrideKey]:
                                val === "" ? null : parseInt(val, 10),
                            }));
                          }}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-5"
                        onClick={() => handleReset(resource.resource)}
                        title="Reset to plan default"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Overrides
            </Button>
          </div>
        </>
      )}

      {!selectedAccountId && (
        <Card>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            Select an account above to view and edit usage limits.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
