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
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
  Bar,
  BarChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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
  TrendingUp,
  TrendingDown,
  CreditCard,
  Target,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RevenuePage() {
  const { getEffectiveProjectId } = useStore();
  const selectedProjectId = getEffectiveProjectId();
  const { toast } = useToast();

  const [stripeApiKey, setStripeApiKey] = useState("");
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(
    null
  );
  const [revenueAnalytics, setRevenueAnalytics] =
    useState<RevenueAnalytics | null>(null);
  const [customerAnalytics, setCustomerAnalytics] =
    useState<CustomerAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSyncStripeData = async () => {
    if (!selectedProjectId) return;

    setIsSyncing(true);
    try {
      await projectService.syncStripeData(selectedProjectId);
      toast({
        title: "Success",
        description: "Stripe data synced successfully",
      });
      await fetchAllData(); // Refresh data after sync
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
      // Use centralized data service - returns cached data if available
      const [metrics, analytics, customers] = await Promise.all([
        centralizedData.getRevenueMetrics(selectedProjectId).catch(() => null),
        centralizedData
          .getRevenueAnalytics(
            selectedProjectId,
            dateRange.start,
            dateRange.end
          )
          .catch(() => null),
        centralizedData
          .getCustomerAnalytics(selectedProjectId)
          .catch(() => null),
      ]);

      setRevenueMetrics(metrics);
      setRevenueAnalytics(analytics);
      setCustomerAnalytics(customers);
    } catch {
      // Silent fail for non-critical data
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [selectedProjectId, dateRange]);

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
          description="Track revenue, subscriptions, and customer metrics from Stripe"
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
        description="Track revenue, subscriptions, and customer metrics from Stripe"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stripe Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Stripe Configuration</CardTitle>
            <CardDescription>
              Configure your Stripe restricted API key to start tracking revenue
              metrics. For security, use a restricted key with read-only
              permissions for customers, subscriptions, and invoices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 font-medium">
                  🔒 Security Best Practice
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
                    → Create Restricted Key in Stripe Dashboard
                  </a>
                </div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-800 font-medium">
                  📋 Required Permissions (Read Only)
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                  <div>• Customers</div>
                  <div>• Invoices</div>
                  <div>• Subscriptions</div>
                  <div>• Charges</div>
                </div>
              </div>
            </div>
            <div className="flex gap-4 items-end">
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
                Update Key
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSyncStripeData}
                disabled={isSyncing}
                variant="outline"
              >
                {isSyncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sync Stripe Data
              </Button>
              <Button
                onClick={fetchAllData}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Refresh Data
              </Button>
            </div>
          </CardContent>
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

        {/* Empty State - No Stripe Data */}
        {!isLoading &&
          revenueMetrics &&
          revenueMetrics.mrr === 0 &&
          revenueMetrics.active_subscriptions === 0 &&
          revenueMetrics.total_revenue === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-40">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No Revenue Data</h3>
                    <p className="text-muted-foreground">
                      Configure your Stripe API key and sync data to see revenue
                      metrics
                    </p>
                  </div>
                  <Button onClick={handleSyncStripeData} disabled={isSyncing}>
                    {isSyncing && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Sync Stripe Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Revenue Metrics Overview */}
        {!isLoading &&
          revenueMetrics &&
          !(
            revenueMetrics.mrr === 0 &&
            revenueMetrics.active_subscriptions === 0 &&
            revenueMetrics.total_revenue === 0
          ) && (
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
                    Churn Rate
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPercentage(revenueMetrics.churn_rate)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {revenueMetrics.churned_subscriptions} canceled this month
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

        {!isLoading && (
          <Tabs defaultValue="analytics" className="space-y-4">
            <TabsList>
              <TabsTrigger value="analytics">Revenue Analytics</TabsTrigger>
              <TabsTrigger value="customers">Customer Analytics</TabsTrigger>
              <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-4">
              {revenueAnalytics && (
                <>
                  {/* MRR Trend Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>MRR Trend</CardTitle>
                      <CardDescription>
                        Monthly Recurring Revenue over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-2">
                      <ChartContainer
                        config={{
                          mrr: {
                            label: "MRR",
                            color: "hsl(var(--chart-1))",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={revenueAnalytics.time_series}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              className="stroke-muted/20"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="date"
                              className="text-xs text-muted-foreground"
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
                              className="text-xs text-muted-foreground"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={10}
                              tickFormatter={(value) =>
                                `$${value.toLocaleString()}`
                              }
                            />
                            <ChartTooltip
                              content={<ChartTooltipContent />}
                              formatter={(value) => [
                                formatCurrency(Number(value)),
                                "MRR",
                              ]}
                            />
                            <Bar
                              dataKey="mrr"
                              fill="var(--color-mrr)"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Subscriptions and Churn Chart */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Active Subscriptions</CardTitle>
                        <CardDescription>
                          Number of active subscriptions over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-2">
                        <ChartContainer
                          config={{
                            active_subscriptions: {
                              label: "Active Subscriptions",
                              color: "hsl(var(--chart-2))",
                            },
                          }}
                          className="h-[200px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueAnalytics.time_series}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-muted/20"
                                vertical={false}
                              />
                              <XAxis
                                dataKey="date"
                                className="text-xs text-muted-foreground"
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
                                className="text-xs text-muted-foreground"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                              />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Line
                                type="monotone"
                                dataKey="active_subscriptions"
                                stroke="var(--color-active_subscriptions)"
                                strokeWidth={2}
                                dot={{
                                  fill: "var(--color-active_subscriptions)",
                                  r: 4,
                                }}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Churn Rate</CardTitle>
                        <CardDescription>
                          Percentage of customers churning over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-2">
                        <ChartContainer
                          config={{
                            churn_rate: {
                              label: "Churn Rate",
                              color: "hsl(var(--chart-3))",
                            },
                          }}
                          className="h-[200px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueAnalytics.time_series}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-muted/20"
                                vertical={false}
                              />
                              <XAxis
                                dataKey="date"
                                className="text-xs text-muted-foreground"
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
                                className="text-xs text-muted-foreground"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                              />
                              <ChartTooltip
                                content={<ChartTooltipContent />}
                                formatter={(value) => [
                                  formatPercentage(Number(value)),
                                  "Churn Rate",
                                ]}
                              />
                              <Line
                                type="monotone"
                                dataKey="churn_rate"
                                stroke="var(--color-churn_rate)"
                                strokeWidth={2}
                                dot={{ fill: "var(--color-churn_rate)", r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>
                </>
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
                            customerAnalytics.summary?.conversion_rate
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
                                <div>
                                  <p className="font-medium">
                                    {customer.email || "N/A"}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {customer.name || "Unknown"}
                                  </p>
                                </div>
                                <div className="text-right">
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
                        <span>Expansion Revenue:</span>
                        <span className="font-medium">
                          {formatCurrency(revenueMetrics.expansion_revenue)}
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
                            revenueMetrics.trial_to_pay_conversion_rate
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
      </div>
    </div>
  );
}
