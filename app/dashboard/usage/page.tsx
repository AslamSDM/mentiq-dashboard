"use client";

import { useState, useEffect } from "react";
import { PageShell } from "@/components/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  usageService,
  UsageResponse,
  UsageStatus,
} from "@/lib/services/usage";
import {
  Users,
  Play,
  Mail,
  Brain,
  UserPlus,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

const RESOURCE_META: Record<
  string,
  { label: string; icon: React.ElementType; unit: string }
> = {
  paid_users: { label: "Paid Users", icon: Users, unit: "users" },
  session_replays: { label: "Session Replays", icon: Play, unit: "replays" },
  automated_emails: { label: "Automated Emails", icon: Mail, unit: "emails" },
  ai_generations: { label: "AI Generations", icon: Brain, unit: "generations" },
  team_members: { label: "Team Members", icon: UserPlus, unit: "members" },
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function UsageBar({ status }: { status: UsageStatus }) {
  const meta = RESOURCE_META[status.resource] || {
    label: status.resource,
    icon: Users,
    unit: "",
  };
  const Icon = meta.icon;
  const pct = Math.min(status.percentage, 100);
  const isOver = status.percentage > 100;
  const isWarning = status.percentage >= 80 && status.percentage < 100;

  let barColor = "bg-stone-800";
  if (isOver) barColor = "bg-red-500";
  else if (isWarning) barColor = "bg-amber-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-stone-500" />
          <span className="text-sm font-medium text-stone-800">
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-stone-600">
            {status.current_usage.toLocaleString()} /{" "}
            {status.limit.toLocaleString()}
          </span>
          {isOver && (
            <Badge variant="destructive" className="text-xs">
              +{status.overage.toLocaleString()} over
            </Badge>
          )}
          {isWarning && (
            <Badge
              variant="outline"
              className="text-xs border-amber-400 text-amber-700 bg-amber-50"
            >
              {status.percentage.toFixed(0)}%
            </Badge>
          )}
        </div>
      </div>
      <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {status.overage_cost > 0 && (
        <p className="text-xs text-red-600">
          Estimated overage: {formatCents(status.overage_cost)}
        </p>
      )}
    </div>
  );
}

export default function UsagePage() {
  const [data, setData] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    usageService
      .getUsageSummary()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageShell title="Usage & Billing">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-stone-300 border-t-stone-800" />
        </div>
      </PageShell>
    );
  }

  if (error || !data) {
    return (
      <PageShell title="Usage & Billing">
        <Card>
          <CardContent className="py-10 text-center text-stone-500">
            {error || "Failed to load usage data."}
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  const { summary, upgrade_suggestion } = data;
  const hasOverages = summary.total_overage_cost > 0;
  const hasAlerts = summary.alerts && summary.alerts.length > 0;

  return (
    <PageShell
      title="Usage & Billing"
      description="Track your current usage against your plan limits."
    >
      <div className="space-y-6">
        {/* Plan overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Current Plan</CardDescription>
              <CardTitle className="text-xl">{summary.tier_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-stone-500">
                {formatCents(summary.base_price)}/month base
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Billing Cycle</CardDescription>
              <CardTitle className="text-base">
                {formatDate(summary.billing_period_start)} &ndash;{" "}
                {formatDate(summary.billing_period_end)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-stone-500">
                {Math.max(0, Math.ceil(
                  (new Date(summary.billing_period_end).getTime() -
                    Date.now()) /
                    (1000 * 60 * 60 * 24)
                ))}{" "}
                days remaining
              </p>
            </CardContent>
          </Card>

          <Card
            className={
              hasOverages ? "border-red-200 bg-red-50/50" : ""
            }
          >
            <CardHeader className="pb-2">
              <CardDescription>
                {hasOverages ? "Projected Bill" : "Estimated Bill"}
              </CardDescription>
              <CardTitle className="text-xl flex items-center gap-2">
                {formatCents(summary.projected_bill)}
                {hasOverages && (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasOverages ? (
                <p className="text-sm text-red-600">
                  Includes {formatCents(summary.total_overage_cost)} in overages
                </p>
              ) : (
                <p className="text-sm text-stone-500">No overages</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {hasAlerts && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  {summary.alerts!.map((alert) => {
                    const meta = RESOURCE_META[alert.resource];
                    return (
                      <p key={alert.resource} className="text-sm text-amber-800">
                        <span className="font-medium">{meta?.label || alert.resource}</span>{" "}
                        has reached{" "}
                        <span className="font-medium">{alert.percentage.toFixed(0)}%</span>{" "}
                        of its included limit
                        {alert.threshold === 100 && " — overages are being incurred"}.
                      </p>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Usage bars */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resource Usage</CardTitle>
            <CardDescription>
              Usage for the current billing period. Overages are charged at the
              end of the cycle.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {summary.resources.map((status) => (
              <UsageBar key={status.resource} status={status} />
            ))}
          </CardContent>
        </Card>

        {/* Overage breakdown */}
        {hasOverages && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overage Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.resources
                  .filter((r) => r.overage_cost > 0)
                  .map((r) => {
                    const meta = RESOURCE_META[r.resource];
                    return (
                      <div
                        key={r.resource}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-stone-600">
                          {meta?.label || r.resource} (+
                          {r.overage.toLocaleString()} {meta?.unit})
                        </span>
                        <span className="font-medium text-stone-800">
                          {formatCents(r.overage_cost)}
                        </span>
                      </div>
                    );
                  })}
                <div className="border-t pt-3 flex items-center justify-between font-medium">
                  <span className="text-stone-800">Total estimated overages</span>
                  <span className="text-red-600">
                    {formatCents(summary.total_overage_cost)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upgrade CTA */}
        {upgrade_suggestion && (
          <Card className="border-stone-300 bg-stone-50">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-stone-800">
                    {upgrade_suggestion.message}
                  </p>
                  <p className="text-sm text-stone-500">
                    {upgrade_suggestion.name} plan at{" "}
                    {formatCents(upgrade_suggestion.base_price)}/month includes
                    higher limits with lower overage rates.
                  </p>
                </div>
                <Button className="shrink-0 ml-4" asChild>
                  <a href="/dashboard/settings#billing">
                    Upgrade
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
