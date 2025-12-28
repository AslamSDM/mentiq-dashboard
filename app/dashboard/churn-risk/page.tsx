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
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { centralizedData } from "@/lib/services/centralized-data";
import { enhancedAnalyticsService } from "@/lib/services/enhanced-analytics";
import { Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ChurnRiskPage() {
  const { getEffectiveProjectId } = useStore();
  const selectedProjectId = getEffectiveProjectId();
  const { toast } = useToast();
  const [churnData, setChurnData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [threshold, setThreshold] = useState(50);

  useEffect(() => {
    if (selectedProjectId) {
      fetchChurnData();
    }
  }, [selectedProjectId, threshold]);

  const fetchChurnData = async () => {
    if (!selectedProjectId) return;

    setIsLoading(true);
    try {
      const response = await centralizedData.getChurnRisk(
        selectedProjectId,
        threshold
      );
      setChurnData(response.data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load churn risk data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportAtRiskUsers = async (
    riskLevel: "all" | "high" | "medium" | "critical" = "all"
  ) => {
    if (!selectedProjectId) return;

    setIsExporting(true);
    try {
      const blob = await enhancedAnalyticsService.exportChurnRiskCSV(
        selectedProjectId,
        riskLevel,
        threshold
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `at_risk_users_${riskLevel}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: `Exported ${riskLevel === "all" ? "all" : riskLevel + " risk"} users to CSV`,
      });
    } catch {
      toast({
        title: "Export Failed",
        description: "Failed to export at-risk users",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return "High";
    if (score >= 40) return "Medium";
    return "Low";
  };

  const getRiskBadge = (risk: string) => {
    if (risk === "High")
      return <Badge className="bg-red-100 text-red-800">High Risk</Badge>;
    if (risk === "Medium")
      return (
        <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
      );
    return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
  };

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader
          title="Churn Risk Analysis"
          description="Identify and prevent customer churn before it happens"
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">
            Please select a project to view churn risk data.
          </p>
        </div>
      </div>
    );
  }

  const highRiskUsers =
    churnData?.at_risk_users?.filter((u: any) => u.risk_score >= 70) || [];
  const mediumRiskUsers =
    churnData?.at_risk_users?.filter(
      (u: any) => u.risk_score >= 40 && u.risk_score < 70
    ) || [];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader
        title="Churn Risk Analysis"
        description="Identify and prevent customer churn before it happens"
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Total At Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {churnData?.total_at_risk || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">High Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {highRiskUsers.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  critical attention needed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Medium Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {mediumRiskUsers.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  monitor closely
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Avg Days Inactive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {churnData?.at_risk_users &&
                  churnData.at_risk_users.length > 0
                    ? Math.round(
                        churnData.at_risk_users.reduce(
                          (sum: number, u: any) => sum + u.days_inactive,
                          0
                        ) / churnData.at_risk_users.length
                      )
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Churn Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {churnData?.churn_rate
                    ? `${churnData.churn_rate?.toFixed(1)}%`
                    : "0%"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  current rate
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Churn Risk Factors</CardTitle>
                <CardDescription>
                  Leading indicators of customer churn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">High Inactivity</p>
                      <div className="text-right">
                        <span className="text-sm font-bold">
                          {churnData?.at_risk_users?.filter(
                            (u: any) => u.days_inactive > 30
                          ).length || 0}{" "}
                          users
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600"
                          style={{
                            width: `${
                              churnData?.at_risk_users
                                ? (churnData.at_risk_users.filter(
                                    (u: any) => u.days_inactive > 30
                                  ).length /
                                    churnData.at_risk_users.length) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Low Event Activity</p>
                      <div className="text-right">
                        <span className="text-sm font-bold">
                          {churnData?.at_risk_users?.filter(
                            (u: any) => u.total_events < 10
                          ).length || 0}{" "}
                          users
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-600"
                          style={{
                            width: `${
                              churnData?.at_risk_users
                                ? (churnData.at_risk_users.filter(
                                    (u: any) => u.total_events < 10
                                  ).length /
                                    churnData.at_risk_users.length) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Users by risk level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-red-600">
                      {highRiskUsers.length}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      High Risk
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-600">
                      {mediumRiskUsers.length}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Medium Risk
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>At-Risk Users</CardTitle>
                  <CardDescription>
                    Users requiring immediate attention
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => exportAtRiskUsers("high")}
                    disabled={isExporting || !churnData?.at_risk_users?.length}
                    variant="outline"
                    size="sm"
                  >
                    {isExporting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Export Email List
                  </Button>
                  <Button
                    onClick={fetchChurnData}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {churnData &&
              churnData.at_risk_users &&
              churnData.at_risk_users.length > 0 ? (
                <div className="space-y-4">
                  {churnData.at_risk_users?.map((user: any, index: number) => {
                    const riskLevel = getRiskLevel(user.risk_score);
                    return (
                      <div
                        key={user.user_id || index}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium">
                              {user.email || user.user_id}
                            </p>
                            {getRiskBadge(riskLevel)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            User ID: {user.user_id}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {user.days_inactive > 30 && (
                              <Badge variant="outline" className="text-xs">
                                Inactive {user.days_inactive} days
                              </Badge>
                            )}
                            {user.total_events < 10 && (
                              <Badge variant="outline" className="text-xs">
                                Low engagement
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 ml-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Last active:{" "}
                              {new Date(user.last_active).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Events: {user.total_events}
                            </p>
                            <p className="text-xs font-bold text-red-600 mt-1">
                              Risk Score: {user.risk_score}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No at-risk users found
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
