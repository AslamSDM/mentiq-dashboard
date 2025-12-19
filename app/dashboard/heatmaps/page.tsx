"use client";

import { useState, useEffect, useRef } from "react";
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
import { useStore } from "@/lib/store";
import { useEffectiveProjectId } from "@/hooks/use-effective-project";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MousePointer, Scroll, Eye, ExternalLink } from "lucide-react";

export default function HeatmapsPage() {
  const {
    heatmapPages,
    loadingHeatmapPages,
    heatmapData,
    loadingHeatmapData,
    fetchHeatmapPages,
    fetchHeatmapData,
  } = useStore();
  const effectiveProjectId = useEffectiveProjectId();
  const { toast } = useToast();

  const [selectedPage, setSelectedPage] = useState<string | undefined>(
    undefined
  );
  const [heatmapType, setHeatmapType] = useState<"click" | "scroll" | "move">(
    "click"
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [overlayEnabled, setOverlayEnabled] = useState(true);

  useEffect(() => {
    if (effectiveProjectId) {
      fetchHeatmapPages(true).catch((error) => { // Force refresh when project changes
        console.error("Error fetching heatmap pages:", error);
        toast({
          title: "Error",
          description: "Failed to load heatmap pages",
          variant: "destructive",
        });
      });
    }
  }, [effectiveProjectId, fetchHeatmapPages, toast]);

  useEffect(() => {
    if (heatmapPages.length > 0 && !selectedPage) {
      setSelectedPage(heatmapPages[0].url);
    } else if (heatmapPages.length === 0) {
      setSelectedPage(undefined);
    }
  }, [heatmapPages, selectedPage]);

  useEffect(() => {
    if (effectiveProjectId && selectedPage) {
      console.log("🔍 Fetching heatmap data for:", {
        selectedPage,
        heatmapType,
      });
      fetchHeatmapData({ url: selectedPage, type: heatmapType }, true).catch( // Force refresh when project changes
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
  }, [effectiveProjectId, selectedPage, heatmapType, fetchHeatmapData, toast]);

  // Log heatmap data changes
  useEffect(() => {
    if (heatmapData) {
      console.log("📊 Heatmap data received:", {
        url: heatmapData.url,
        clicksCount: heatmapData.clicks?.length || 0,
        scrollsCount: heatmapData.scrolls?.length || 0,
        mouseMovesCount: heatmapData.mouseMoves?.length || 0,
        totalSessions: heatmapData.totalSessions,
        clicks: heatmapData.clicks,
        scrolls: heatmapData.scrolls,
      });
    }
  }, [heatmapData]);

  if (!effectiveProjectId) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader
          title="Heatmap Analytics"
          description="Visualize user interactions with click, scroll, and movement heatmaps"
        />
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
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Heatmap Analytics"
        description="Visualize user interactions with click, scroll, and movement heatmaps"
      />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Clicks
              </CardTitle>
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
              <CardTitle className="text-sm font-medium">
                Pages Tracked
              </CardTitle>
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
                  <SelectTrigger className="w-[280px]">
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
                          {page.title || page.url}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-pages" disabled>
                        No pages available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {selectedPage && (
                  <Button
                    onClick={() => window.open(selectedPage, "_blank")}
                    variant="ghost"
                    size="sm"
                    title="Open page in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  onClick={() => {
                    if (selectedPage) {
                      setIframeLoaded(false);
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
                {!heatmapData?.clicks || heatmapData.clicks.length === 0 ? (
                  <div
                    className="relative bg-muted rounded-lg overflow-hidden flex items-center justify-center"
                    style={{ height: "600px" }}
                  >
                    <div className="text-center space-y-2">
                      <MousePointer className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        No Click Data Available
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Page: {selectedPage || "None selected"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Start tracking user interactions to see click heatmaps
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="relative bg-background rounded-lg overflow-hidden border"
                    style={{ height: "600px" }}
                  >
                    {/* Iframe with actual website */}
                    <iframe
                      ref={iframeRef}
                      src={selectedPage}
                      className="w-full h-full"
                      onLoad={() => setIframeLoaded(true)}
                      style={{ border: "none" }}
                    />

                    {/* Heatmap overlay */}
                    {iframeLoaded && overlayEnabled && (
                      <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full">
                          {heatmapData.clicks.map((click, i) => {
                            const maxCount = Math.max(
                              ...heatmapData.clicks.map((c) => c.count)
                            );
                            const intensity =
                              maxCount > 0 ? click.count / maxCount : 0;
                            const radius = 30 + intensity * 40;

                            return (
                              <g key={i}>
                                <defs>
                                  <radialGradient id={`heat-${i}`}>
                                    <stop
                                      offset="0%"
                                      stopColor={`rgba(239, 68, 68, ${
                                        intensity * 0.9
                                      })`}
                                    />
                                    <stop
                                      offset="50%"
                                      stopColor={`rgba(239, 68, 68, ${
                                        intensity * 0.5
                                      })`}
                                    />
                                    <stop
                                      offset="100%"
                                      stopColor="rgba(239, 68, 68, 0)"
                                    />
                                  </radialGradient>
                                </defs>
                                <circle
                                  cx={click.x}
                                  cy={click.y}
                                  r={radius}
                                  fill={`url(#heat-${i})`}
                                  filter="blur(15px)"
                                />
                                <title>
                                  {click.count} clicks
                                  {click.element ? ` on ${click.element}` : ""}
                                </title>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    )}

                    {/* Toggle overlay button */}
                    <div className="absolute top-4 right-4 z-10">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setOverlayEnabled(!overlayEnabled)}
                      >
                        {overlayEnabled ? "Hide" : "Show"} Overlay
                      </Button>
                    </div>

                    {/* Loading indicator */}
                    {!iframeLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    )}
                  </div>
                )}
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
                  <div
                    className="relative bg-muted rounded-lg overflow-hidden flex items-center justify-center"
                    style={{ height: "600px" }}
                  >
                    <div className="text-center space-y-2">
                      <Scroll className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        No Scroll Data Available
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Start tracking user scroll behavior to see depth
                        analytics
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Iframe with scroll depth overlay */}
                    <div
                      className="relative bg-background rounded-lg overflow-hidden border"
                      style={{ height: "600px" }}
                    >
                      <iframe
                        src={selectedPage}
                        className="w-full h-full"
                        style={{ border: "none" }}
                      />

                      {/* Scroll depth overlay */}
                      {overlayEnabled && (
                        <div className="absolute inset-0 pointer-events-none">
                          {heatmapData.scrolls.map((scroll, i) => {
                            const yPosition = (scroll.depth / 100) * 600;
                            const opacity = scroll.percentage / 100;

                            return (
                              <div
                                key={i}
                                className="absolute w-full"
                                style={{
                                  top: `${yPosition}px`,
                                  height: "2px",
                                  backgroundColor: `rgba(59, 130, 246, ${opacity})`,
                                  boxShadow: `0 0 10px rgba(59, 130, 246, ${
                                    opacity * 0.8
                                  })`,
                                }}
                              >
                                <div
                                  className="absolute right-2 -top-2 text-xs font-medium bg-blue-500 text-white px-2 py-1 rounded"
                                  style={{ opacity }}
                                >
                                  {scroll.depth}% - {scroll.percentage}% users
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Toggle overlay button */}
                      <div className="absolute top-4 right-4 z-10">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setOverlayEnabled(!overlayEnabled)}
                        >
                          {overlayEnabled ? "Hide" : "Show"} Overlay
                        </Button>
                      </div>
                    </div>

                    {/* Stats */}
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
                {!heatmapData?.mouseMoves ||
                heatmapData.mouseMoves.length === 0 ? (
                  <div
                    className="relative bg-muted rounded-lg overflow-hidden flex items-center justify-center"
                    style={{ height: "600px" }}
                  >
                    <div className="text-center space-y-2">
                      <Eye className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        No Mouse Movement Data
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Enable mouse tracking to see movement patterns
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="relative bg-background rounded-lg overflow-hidden border"
                    style={{ height: "600px" }}
                  >
                    <iframe
                      src={selectedPage}
                      className="w-full h-full"
                      style={{ border: "none" }}
                    />

                    {/* Mouse movement overlay */}
                    {overlayEnabled && (
                      <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full">
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
                                stopColor="rgb(59, 130, 246)"
                                stopOpacity="0.8"
                              />
                              <stop
                                offset="100%"
                                stopColor="rgb(147, 51, 234)"
                                stopOpacity="0.4"
                              />
                            </linearGradient>
                          </defs>
                          {heatmapData.mouseMoves.map((moveData, i) => (
                            <g key={i}>
                              {/* Draw path lines */}
                              {moveData.path && moveData.path.length > 1 && (
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
                              {/* Draw density heatmap */}
                              {moveData.density?.map((density, j) => (
                                <circle
                                  key={j}
                                  cx={density.x}
                                  cy={density.y}
                                  r={5 + density.intensity * 10}
                                  fill={`rgba(239, 68, 68, ${
                                    density.intensity * 0.5
                                  })`}
                                  filter="blur(4px)"
                                />
                              ))}
                            </g>
                          ))}
                        </svg>
                      </div>
                    )}

                    {/* Toggle overlay button */}
                    <div className="absolute top-4 right-4 z-10">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setOverlayEnabled(!overlayEnabled)}
                      >
                        {overlayEnabled ? "Hide" : "Show"} Overlay
                      </Button>
                    </div>
                  </div>
                )}
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
              <CardDescription>
                Configure heatmap data collection
              </CardDescription>
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
    </div>
  );
}
