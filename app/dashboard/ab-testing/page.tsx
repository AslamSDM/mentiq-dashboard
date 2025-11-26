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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { useStore } from "@/lib/store";
import { CreateExperimentRequest } from "@/lib/services/experiment";
import { enhancedAnalyticsService } from "@/lib/services/enhanced-analytics";
import { useToast } from "@/hooks/use-toast";
import { Target, AlertCircle, Clock, Loader2 } from "lucide-react";

interface FeatureAdoptionData {
  feature_name: string;
  total_users: number;
  adopted_users: number;
  adoption_rate: number;
  daily_active: number;
  weekly_active: number;
  monthly_active: number;
  stickiness: number;
}

export default function ABTestingPage() {
  const {
    selectedProjectId,
    experiments,
    loadingExperiments,
    selectedExperimentId,
    experimentResults,
    loadingExperimentResults,
    fetchExperiments,
    fetchExperimentResults,
    createExperiment,
    updateExperimentStatus,
    setSelectedExperimentId,
  } = useStore();
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [adoptionData, setAdoptionData] = useState<FeatureAdoptionData[]>([]);
  const [loadingAdoption, setLoadingAdoption] = useState(false);
  const [newExperiment, setNewExperiment] = useState<CreateExperimentRequest>({
    name: "",
    description: "",
    trafficAllocation: 50,
    variants: [
      {
        name: "Control",
        description: "Original version",
        trafficWeight: 50,
        isControl: true,
        changes: [],
      },
      {
        name: "Variant A",
        description: "Test version",
        trafficWeight: 50,
        isControl: false,
        changes: [],
      },
    ],
    goals: [
      {
        name: "Conversion",
        type: "click",
        target: ".cta-button",
        isPrimary: true,
      },
    ],
  });

  useEffect(() => {
    if (selectedProjectId) {
      fetchExperiments();
      fetchAdoptionData();
    }
  }, [selectedProjectId, fetchExperiments]);

  useEffect(() => {
    if (selectedExperimentId) {
      fetchExperimentResults(selectedExperimentId);
    }
  }, [selectedExperimentId, fetchExperimentResults]);

  const fetchAdoptionData = async () => {
    if (!selectedProjectId) return;

    setLoadingAdoption(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const response = await enhancedAnalyticsService.getFeatureAdoption(
        selectedProjectId,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );

      if (response?.data?.features) {
        const transformedData: FeatureAdoptionData[] =
          response.data.features.map((feature: any) => ({
            feature_name: feature.feature_name,
            total_users: feature.unique_users || 0,
            adopted_users: feature.unique_users || 0,
            adoption_rate: feature.adoption_rate || 0,
            daily_active: Math.floor((feature.unique_users || 0) * 0.3),
            weekly_active: Math.floor((feature.unique_users || 0) * 0.6),
            monthly_active: feature.unique_users || 0,
            stickiness: (feature.adoption_rate || 0) * 0.4,
          }));

        setAdoptionData(transformedData);
      } else {
        setAdoptionData([]);
      }
    } catch (error) {
      console.error("Error fetching adoption data:", error);
      setAdoptionData([]);
    } finally {
      setLoadingAdoption(false);
    }
  };

  const handleCreateExperiment = async () => {
    await createExperiment(newExperiment);
    setIsCreateDialogOpen(false);
    setNewExperiment({
      name: "",
      description: "",
      trafficAllocation: 50,
      variants: [
        {
          name: "Control",
          description: "Original version",
          trafficWeight: 50,
          isControl: true,
          changes: [],
        },
        {
          name: "Variant A",
          description: "Test version",
          trafficWeight: 50,
          isControl: false,
          changes: [],
        },
      ],
      goals: [
        {
          name: "Conversion",
          type: "click",
          target: ".cta-button",
          isPrimary: true,
        },
      ],
    });
  };

  if (loadingExperiments) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedExp = experiments.find(
    (exp) => exp.id === selectedExperimentId
  );

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="A/B Testing & Feature Adoption"
        description="Manage experiments and track feature adoption"
      />

      <div className="flex-1 p-6 space-y-6">
        <Tabs defaultValue="experiments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="experiments">Experiments</TabsTrigger>
            <TabsTrigger value="adoption">Feature Adoption</TabsTrigger>
          </TabsList>

          <TabsContent value="experiments" className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Tests
              </CardTitle>
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {experiments.filter((exp) => exp.status === "RUNNING").length}
              </div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Visitors
              </CardTitle>
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {experimentResults?.summary.totalVisitors.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">In selected test</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversion Rate
              </CardTitle>
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {experimentResults
                  ? (experimentResults.summary.conversionRate * 100)?.toFixed(
                      2
                    ) + "%"
                  : "0%"}
              </div>
              <p className="text-xs text-muted-foreground">Overall rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Statistical Significance
              </CardTitle>
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {experimentResults?.summary.confidenceLevel || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {experimentResults?.summary.statisticalSignificance ? (
                  <span className="text-green-600">Significant</span>
                ) : (
                  <span className="text-yellow-600">Not significant</span>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <Label>Select Experiment</Label>
              <Select
                value={selectedExperimentId || ""}
                onValueChange={setSelectedExperimentId}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select an experiment" />
                </SelectTrigger>
                <SelectContent>
                  {experiments?.map((exp) => (
                    <SelectItem key={exp.id} value={exp.id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{exp.name}</span>
                        <Badge
                          variant={
                            exp.status === "RUNNING"
                              ? "default"
                              : exp.status === "COMPLETED"
                              ? "secondary"
                              : "outline"
                          }
                          className="ml-2"
                        >
                          {exp.status.toLowerCase()}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create Test
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New A/B Test</DialogTitle>
                <DialogDescription>
                  Set up a new experiment to test different variants
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exp-name">Experiment Name</Label>
                    <Input
                      id="exp-name"
                      value={newExperiment.name}
                      onChange={(e) =>
                        setNewExperiment({
                          ...newExperiment,
                          name: e.target.value,
                        })
                      }
                      placeholder="Homepage CTA Test"
                    />
                  </div>
                  <div>
                    <Label htmlFor="traffic">Traffic Allocation (%)</Label>
                    <Input
                      id="traffic"
                      type="number"
                      min="1"
                      max="100"
                      value={newExperiment.trafficAllocation}
                      onChange={(e) =>
                        setNewExperiment({
                          ...newExperiment,
                          trafficAllocation: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="exp-description">Description</Label>
                  <Textarea
                    id="exp-description"
                    value={newExperiment.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNewExperiment({
                        ...newExperiment,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe what you're testing..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateExperiment}
                    disabled={!newExperiment.name}
                  >
                    Create Experiment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {selectedExp && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedExp.name}</CardTitle>
                  <CardDescription>{selectedExp.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      selectedExp.status === "RUNNING"
                        ? "default"
                        : selectedExp.status === "COMPLETED"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {selectedExp.status.toLowerCase()}
                  </Badge>
                  {selectedExp.status === "RUNNING" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateExperimentStatus(selectedExp.id, "PAUSED")
                      }
                    >
                      Pause
                    </Button>
                  )}
                  {selectedExp.status === "PAUSED" && (
                    <Button
                      size="sm"
                      onClick={() =>
                        updateExperimentStatus(selectedExp.id, "RUNNING")
                      }
                    >
                      Resume
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium">Traffic Allocation</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress
                      value={
                        selectedExp.traffic_split ||
                        selectedExp.trafficAllocation ||
                        0
                      }
                      className="flex-1"
                    />
                    <span className="text-sm">
                      {selectedExp.traffic_split ||
                        selectedExp.trafficAllocation ||
                        0}
                      %
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Start Date</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedExp.start_date
                      ? new Date(selectedExp.start_date).toLocaleDateString()
                      : selectedExp.startDate
                      ? new Date(selectedExp.startDate).toLocaleDateString()
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">End Date</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedExp.end_date
                      ? new Date(selectedExp.end_date).toLocaleDateString()
                      : selectedExp.endDate
                      ? new Date(selectedExp.endDate).toLocaleDateString()
                      : "Not set"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loadingExperimentResults ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          </div>
        ) : (
          experimentResults && (
            <Tabs defaultValue="results" className="space-y-4">
              <TabsList>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="variants">Variants</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {experimentResults.variants?.map((variant) => (
                    <Card key={variant.variantId}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {variant.name}
                          </CardTitle>
                          {variant.improvement > 0 && (
                            <Badge variant="default" className="bg-green-500">
                              +{(variant.improvement * 100)?.toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Visitors</p>
                              <p className="text-2xl font-bold">
                                {variant.visitors.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Conversions</p>
                              <p className="text-2xl font-bold">
                                {variant.conversions.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Conversion Rate
                            </p>
                            <p className="text-3xl font-bold">
                              {(variant.conversionRate * 100)?.toFixed(2)}%
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress
                                value={variant.conversionRate * 100}
                                className="flex-1"
                              />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Confidence Interval
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {(variant.confidenceInterval[0] * 100)?.toFixed(
                                2
                              )}
                              % -{" "}
                              {(variant.confidenceInterval[1] * 100)?.toFixed(
                                2
                              )}
                              %
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="variants" className="space-y-4">
                <div className="space-y-4">
                  {selectedExp?.variants?.map((variant) => (
                    <Card key={variant.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{variant.name}</CardTitle>
                            <CardDescription>
                              {variant.description}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {(variant.is_control || variant.isControl) && (
                              <Badge variant="secondary">Control</Badge>
                            )}
                            <Badge variant="outline">
                              {variant.traffic_split ||
                                variant.trafficWeight ||
                                0}
                              % traffic
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {variant.changes && variant.changes.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Changes:</p>
                            {variant.changes?.map((change, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 p-2 bg-muted rounded text-sm"
                              >
                                <code className="text-xs">
                                  {change.selector}
                                </code>
                                <span>→</span>
                                <span>
                                  {change.property}: {change.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No changes (original version)
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Over Time</CardTitle>
                    <CardDescription>
                      Daily conversion rates for the experiment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        conversionRate: {
                          label: "Conversion Rate",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={experimentResults.timeline}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="conversionRate"
                            stroke="var(--color-conversionRate)"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )
        )}
          </TabsContent>

          <TabsContent value="adoption" className="space-y-6">
            {loadingAdoption ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p className="text-muted-foreground">
                    Loading feature adoption data...
                  </p>
                </CardContent>
              </Card>
            ) : adoptionData.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-40">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">No Feature Data</h3>
                      <p className="text-muted-foreground">
                        Start tracking feature usage to see adoption metrics
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Features
                      </CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{adoptionData.length}</div>
                      <p className="text-xs text-muted-foreground">
                        Features being tracked
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Avg Adoption Rate
                      </CardTitle>
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(
                          adoptionData.reduce((sum, f) => sum + f.adoption_rate, 0) /
                          adoptionData.length
                        )?.toFixed(1)}
                        %
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Across all features
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        High Adoption
                      </CardTitle>
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {adoptionData.filter((f) => f.adoption_rate >= 60).length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Features with &gt;60% adoption
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Needs Attention
                      </CardTitle>
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {adoptionData.filter((f) => f.adoption_rate < 40).length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Features with &lt;40% adoption
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Feature Adoption Overview</CardTitle>
                    <CardDescription>
                      Adoption rates and user engagement for all tracked features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {adoptionData?.map((feature) => (
                        <div key={feature.feature_name} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <h4 className="font-medium">
                                {feature.feature_name}
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge variant={feature.adoption_rate >= 60 ? "default" : feature.adoption_rate >= 40 ? "secondary" : "destructive"}>
                                  {feature.adoption_rate?.toFixed(1)}% adoption
                                </Badge>
                                <Badge variant="outline">
                                  {feature.stickiness?.toFixed(1)}% stickiness
                                </Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6 text-right text-sm">
                              <div>
                                <p className="text-muted-foreground">Adopted Users</p>
                                <p className="font-medium">
                                  {feature.adopted_users.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Daily Active</p>
                                <p className="font-medium">
                                  {feature.daily_active.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Monthly Active</p>
                                <p className="font-medium">
                                  {feature.monthly_active.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Adoption Progress</span>
                              <span>
                                {feature.adopted_users.toLocaleString()} /{" "}
                                {feature.total_users.toLocaleString()}
                              </span>
                            </div>
                            <Progress
                              value={feature.adoption_rate}
                              className="h-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center">
                  <Button
                    onClick={fetchAdoptionData}
                    disabled={loadingAdoption}
                    variant="outline"
                  >
                    {loadingAdoption && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Refresh Data
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
