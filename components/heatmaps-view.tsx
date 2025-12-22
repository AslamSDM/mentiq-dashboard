"use client";

import { useState, useEffect } from "react";
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
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MousePointer, Scroll, Eye } from "lucide-react";

export function HeatmapsView() {
  const {
    selectedProjectId,
    heatmapPages,
    loadingHeatmapPages,
    heatmapData,
    loadingHeatmapData,
    fetchHeatmapPages,
    fetchHeatmapData,
  } = useStore();
  const { toast } = useToast();

  const [selectedPage, setSelectedPage] = useState<string | undefined>(
    undefined
  );
  const [heatmapType, setHeatmapType] = useState<"click" | "scroll" | "move">(
    "click"
  );

  useEffect(() => {
    if (selectedProjectId) {
      fetchHeatmapPages().catch((error) => {
        console.error("Error fetching heatmap pages:", error);
        toast({
          title: "Error",
          description: "Failed to load heatmap pages",
          variant: "destructive",
        });
      });
    }
  }, [selectedProjectId, fetchHeatmapPages, toast]);

  useEffect(() => {
    if (heatmapPages.length > 0 && !selectedPage) {
      setSelectedPage(heatmapPages[0].url);
    } else if (heatmapPages.length === 0) {
      setSelectedPage(undefined);
    }
  }, [heatmapPages, selectedPage]);

  useEffect(() => {
    if (selectedProjectId && selectedPage) {
      fetchHeatmapData({ url: selectedPage, type: heatmapType }).catch(
        (error) => {
          console.error("Error fetching heatmap data:", error);
          toast({
            title: "Error",
            description: "Failed to load heatmap data",
            variant: "destructive",
          });
        }
      );
    }
  }, [selectedProjectId, selectedPage, heatmapType, fetchHeatmapData, toast]);

  if (!selectedProjectId) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No Project Selected</h3>
            <p className="text-muted-foreground">
              Please select a project to view heatmaps.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M9 9h.01" />
              <path d="M15 9h.01" />
              <path d="M9 15h.01" />
              <path d="M15 15h.01" />
              <rect width="18" height="18" x="3" y="3" rx="2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {heatmapData?.clicks
                ?.reduce((sum, click) => sum + click.count, 0)
                ?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">Total clicks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Scroll Depth
            </CardTitle>
            <Scroll className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {heatmapData?.scrolls && heatmapData.scrolls.length > 0
                ? `${Math.round(
                    heatmapData.scrolls.reduce(
                      (sum, scroll) =>
                        sum + (scroll.percentage * scroll.depth) / 100,
                      0
                    ) / heatmapData.scrolls.length
                  )}%`
                : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">Average depth</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {heatmapData?.totalSessions?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">Sessions tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages Tracked</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a1 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {heatmapPages?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active pages</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Heatmap Visualization</CardTitle>
              <CardDescription>
                Interactive visualization of user behavior on your pages
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedPage}
                onValueChange={(value) => setSelectedPage(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select page" />
                </SelectTrigger>
                <SelectContent>
                  {loadingHeatmapPages ? (
                    <SelectItem value="loading" disabled>
                      Loading pages...
                    </SelectItem>
                  ) : heatmapPages?.length > 0 ? (
                    heatmapPages.map((page) => (
                      <SelectItem key={page.id} value={page.url}>
                        {page.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-pages" disabled>
                      No pages available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  if (selectedPage) {
                    fetchHeatmapData({
                      url: selectedPage,
                      type: heatmapType,
                    });
                  }
                }}
                disabled={loadingHeatmapData || !selectedPage}
                variant="outline"
                size="sm"
              >
                {loadingHeatmapData && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={heatmapType}
            onValueChange={(v) => setHeatmapType(v as any)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="click">Click Heatmap</TabsTrigger>
              <TabsTrigger value="scroll">Scroll Depth</TabsTrigger>
              <TabsTrigger value="move">Mouse Movement</TabsTrigger>
            </TabsList>

            <TabsContent value="click" className="space-y-4">
              <div
                className="relative bg-muted rounded-lg overflow-hidden border"
                style={{ height: "600px" }}
              >
                {loadingHeatmapData ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Site Preview iframe */}
                    {selectedPage && (
                      <iframe
                        src={selectedPage}
                        className="absolute inset-0 w-full h-full border-0"
                        style={{ pointerEvents: "none" }}
                        title="Site Preview"
                        sandbox="allow-same-origin allow-scripts"
                      />
                    )}

                    {/* Heatmap overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      {!heatmapData?.clicks || heatmapData.clicks.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                          <div className="text-center space-y-2 bg-card p-6 rounded-lg shadow-lg border">
                            <MousePointer className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium">
                              No Click Data Available
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Start tracking user interactions to see click heatmaps
                            </p>
                          </div>
                        </div>
                      ) : (
                        heatmapData.clicks.map((click, i) => {
                          const maxCount = Math.max(
                            ...heatmapData.clicks.map((c) => c.count)
                          );
                          const intensity =
                            maxCount > 0 ? click.count / maxCount : 0;

                          return (
                            <div
                              key={i}
                              className="absolute rounded-full blur-xl"
                              style={{
                                left: `${click.x}px`,
                                top: `${click.y}px`,
                                width: `${60 + intensity * 40}px`,
                                height: `${60 + intensity * 40}px`,
                                backgroundColor: `rgba(239, 68, 68, ${
                                  0.3 + intensity * 0.5
                                })`,
                                transform: "translate(-50%, -50%)",
                              }}
                              title={`${click.count} clicks${
                                click.element ? ` on ${click.element}` : ""
                              }`}
                            />
                          );
                        })
                      )}
                    </div>

                    {/* Page URL badge */}
                    {selectedPage && (
                      <div className="absolute top-2 left-2 z-10">
                        <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                          {selectedPage}
                        </Badge>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Heat Intensity:</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-12 rounded"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 1))",
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      Low → High
                    </span>
                  </div>
                </div>
                <Badge variant="secondary">
                  {heatmapData?.clicks?.length || 0} click areas
                </Badge>
              </div>
            </TabsContent>

            <TabsContent value="scroll" className="space-y-4">
              {!heatmapData?.scrolls || heatmapData.scrolls.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                  <Scroll className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium">
                      No Scroll Data Available
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Start tracking user scroll behavior to see depth analytics
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Percentage of users who scrolled to each depth
                  </div>
                  {heatmapData.scrolls.map((scroll, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {scroll.depth}% of page
                        </span>
                        <span className="text-muted-foreground">
                          {scroll.percentage}% of users ({scroll.count} users)
                        </span>
                      </div>
                      <div className="h-8 w-full bg-muted rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-end px-3 text-xs font-medium text-white"
                          style={{ width: `${scroll.percentage}%` }}
                        >
                          {scroll.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          Average Scroll Depth
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Based on {heatmapData.totalSessions} sessions
                        </p>
                      </div>
                      <div className="text-2xl font-bold">
                        {heatmapData.scrolls.length > 0
                          ? `${Math.round(
                              heatmapData.scrolls.reduce(
                                (sum, scroll) =>
                                  sum +
                                  (scroll.percentage * scroll.depth) / 100,
                                0
                              ) / heatmapData.scrolls.length
                            )}%`
                          : "0%"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="move" className="space-y-4">
              <div
                className="relative bg-muted rounded-lg overflow-hidden border"
                style={{ height: "600px" }}
              >
                {/* Site Preview iframe */}
                {selectedPage && (
                  <iframe
                    src={selectedPage}
                    className="absolute inset-0 w-full h-full border-0"
                    style={{ pointerEvents: "none" }}
                    title="Site Preview"
                    sandbox="allow-same-origin allow-scripts"
                  />
                )}

                {/* Mouse movement overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {!heatmapData?.mouseMoves ||
                  heatmapData.mouseMoves.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                      <div className="text-center space-y-2 bg-card p-6 rounded-lg shadow-lg border">
                        <MousePointer className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          No Mouse Movement Data
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Enable mouse tracking to see movement patterns
                        </p>
                      </div>
                    </div>
                  ) : (
                    <svg
                      className="absolute inset-0 w-full h-full"
                      style={{ opacity: 0.8 }}
                    >
                      <defs>
                        <linearGradient
                          id="pathGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            style={{
                              stopColor: "rgb(59, 130, 246)",
                              stopOpacity: 0.8,
                            }}
                          />
                          <stop
                            offset="100%"
                            style={{
                              stopColor: "rgb(147, 51, 234)",
                              stopOpacity: 0.4,
                            }}
                          />
                        </linearGradient>
                      </defs>
                      {heatmapData.mouseMoves.map((moveData, i) => (
                        <g key={i}>
                          {moveData.path.length > 1 && (
                            <path
                              d={`M ${moveData.path[0].x} ${
                                moveData.path[0].y
                              } ${moveData.path
                                .slice(1)
                                .map((point) => `L ${point.x} ${point.y}`)
                                .join(" ")}`}
                              stroke="url(#pathGradient)"
                              strokeWidth="2"
                              fill="none"
                              strokeLinecap="round"
                              opacity={0.6}
                            />
                          )}
                          {moveData.density?.map((density, j) => (
                            <circle
                              key={j}
                              cx={density.x}
                              cy={density.y}
                              r={5 + density.intensity * 10}
                              fill={`rgba(239, 68, 68, ${
                                density.intensity * 0.5
                              })`}
                              className="blur-sm"
                            />
                          ))}
                        </g>
                      ))}
                    </svg>
                  )}
                </div>

                {/* Page URL badge */}
                {selectedPage && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                      {selectedPage}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Total Movements</p>
                    <p className="text-2xl font-bold">
                      {heatmapData?.mouseMoves
                        ?.reduce((sum, move) => sum + move.path.length, 0)
                        ?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Movement Paths</p>
                    <p className="text-2xl font-bold">
                      {heatmapData?.mouseMoves?.length || "0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Density Points</p>
                    <p className="text-2xl font-bold">
                      {heatmapData?.mouseMoves?.reduce(
                        (sum, move) => sum + (move.density?.length || 0),
                        0
                      ) || "0"}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Click Areas</CardTitle>
            <CardDescription>
              Most clicked elements on {selectedPage}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!heatmapData?.clicks || heatmapData.clicks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MousePointer className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No click data available</p>
                  <p className="text-xs">
                    Start tracking to see top click areas
                  </p>
                </div>
              ) : (
                heatmapData.clicks
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map((click, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between pb-3 border-b last:border-0"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {click.element || `Click Area ${i + 1}`}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          Position: ({click.x}, {click.y})
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {click.count.toLocaleString()} clicks
                      </Badge>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Heatmap Settings</CardTitle>
            <CardDescription>Configure heatmap data collection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Click Tracking</p>
                  <p className="text-xs text-muted-foreground">
                    Record user clicks
                  </p>
                </div>
                <Badge variant="default">Enabled</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Scroll Tracking</p>
                  <p className="text-xs text-muted-foreground">
                    Track scroll depth
                  </p>
                </div>
                <Badge variant="default">Enabled</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Mouse Movement</p>
                  <p className="text-xs text-muted-foreground">
                    Record cursor paths
                  </p>
                </div>
                <Badge variant="secondary">Disabled</Badge>
              </div>
            </div>
            <div className="pt-4">
              <Button className="w-full">Configure Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
