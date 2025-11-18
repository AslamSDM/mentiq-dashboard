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
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { enhancedAnalyticsService } from "@/lib/services/enhanced-analytics";
import { useToast } from "@/hooks/use-toast";

export default function PathAnalysisPage() {
  const { selectedProjectId } = useStore();
  const { toast } = useToast();

  // State for path analysis data
  const [funnelData, setFunnelData] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch path analysis data
  useEffect(() => {
    if (selectedProjectId) {
      fetchPathData();
    }
  }, [selectedProjectId]);

  const fetchPathData = async () => {
    if (!selectedProjectId) return;

    setLoading(true);
    try {
      const [funnelRes, sessionRes] = await Promise.all([
        enhancedAnalyticsService
          .getConversionFunnel(selectedProjectId)
          .catch(() => null),
        enhancedAnalyticsService
          .getSessionAnalytics(selectedProjectId)
          .catch(() => null),
      ]);

      if (funnelRes?.data) {
        setFunnelData(funnelRes.data);
      }

      if (sessionRes?.data) {
        setSessionData(sessionRes.data);
      }
    } catch (error) {
      console.error("Error fetching path data:", error);
      toast({
        title: "Error",
        description: "Failed to load path analysis data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  // Calculate top paths from funnel and session data
  const topPaths = funnelData?.funnel
    ? funnelData.funnel
        .map((step: any, index: number) => {
          const nextStep = funnelData.funnel[index + 1];
          const dropOff = nextStep ? step.drop_off_rate : 0;

          return {
            id: `path-${index}`,
            path: [step.event_type, nextStep?.event_type].filter(Boolean),
            users: step.users,
            conversionRate: step.conversion_rate * 100,
            dropOffPoints:
              dropOff > 20
                ? [`${step.event_type} → ${nextStep?.event_type}`]
                : [],
          };
        })
        .slice(0, 4)
    : [];

  // Use real funnel steps from API data
  const funnelSteps = funnelData?.funnel
    ? funnelData.funnel.map((step: any, index: number) => ({
        step: step.event_type || `Step ${index + 1}`,
        users: step.users || 0,
        dropOff: step.drop_off_rate * 100 || 0,
      }))
    : [];

  const maxUsers =
    funnelSteps.length > 0
      ? Math.max(...funnelSteps.map((s: any) => s.users))
      : 1;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader
        title="Path Analysis"
        description="Understand user journeys and identify optimization opportunities"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Paths</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">
                {funnelSteps.length || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              funnel steps tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Avg Path Length
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">
                {funnelSteps.length > 0 ? funnelSteps.length.toFixed(1) : "0"}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              steps per journey
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">
                {funnelData?.overall_conversion
                  ? `${(funnelData.overall_conversion * 100).toFixed(1)}%`
                  : "0%"}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              overall conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Drop-off Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="text-2xl font-bold text-red-600">
                {funnelSteps.length > 0
                  ? `${(
                      funnelSteps.reduce(
                        (sum: number, step: any) => sum + step.dropOff,
                        0
                      ) / funnelSteps.length
                    ).toFixed(1)}%`
                  : "0%"}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              average drop-off
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>User progression through key stages</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : funnelSteps.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No funnel data available</p>
              <p className="text-sm text-muted-foreground mt-1">
                Set up conversion tracking to see user journey steps
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {funnelSteps?.map((step: any, i: number) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{step.step}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {step.users.toLocaleString()} users
                      </span>
                      {i > 0 && (
                        <span className="text-red-600 font-medium">
                          -{step.dropOff.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-12 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium"
                      style={{ width: `${(step.users / maxUsers) * 100}%` }}
                    >
                      {funnelSteps[0]
                        ? ((step.users / funnelSteps[0].users) * 100).toFixed(1)
                        : 0}
                      %
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top User Paths</CardTitle>
          <CardDescription>
            Most common user journeys through your app
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : topPaths.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No user paths data available
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Enable user journey tracking to see common paths
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {topPaths?.map((pathData: any) => (
                <div key={pathData.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium">
                        {pathData.users.toLocaleString()} users
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Conversion: {pathData.conversionRate.toFixed(1)}%
                      </p>
                    </div>
                    {pathData.dropOffPoints.length > 0 && (
                      <Badge
                        variant="outline"
                        className="text-red-600 border-red-300"
                      >
                        {pathData.dropOffPoints.length} drop-off points
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {pathData.path?.map((step: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                          {step}
                        </div>
                        {i < pathData.path.length - 1 && (
                          <svg
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                  {pathData.dropOffPoints.length > 0 && (
                    <div className="mt-3 text-sm text-red-600">
                      Drop-offs: {pathData.dropOffPoints.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
