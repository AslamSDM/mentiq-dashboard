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
import { useStore } from "@/lib/store";

type HeatmapPoint = {
  x: number;
  y: number;
  intensity: number;
};

type ScrollData = {
  depth: number;
  percentage: number;
};

const mockClickData: HeatmapPoint[] = [
  { x: 150, y: 100, intensity: 0.9 },
  { x: 200, y: 120, intensity: 0.7 },
  { x: 180, y: 110, intensity: 0.8 },
  { x: 300, y: 200, intensity: 0.6 },
  { x: 320, y: 210, intensity: 0.5 },
  { x: 400, y: 150, intensity: 0.4 },
  { x: 250, y: 300, intensity: 0.7 },
  { x: 270, y: 310, intensity: 0.6 },
  { x: 500, y: 250, intensity: 0.3 },
];

const mockScrollData: ScrollData[] = [
  { depth: 0, percentage: 100 },
  { depth: 25, percentage: 85 },
  { depth: 50, percentage: 62 },
  { depth: 75, percentage: 38 },
  { depth: 100, percentage: 15 },
];

export default function HeatmapsPage() {
  const {
    selectedProjectId,
    heatmapPages,
    loadingHeatmapPages,
    heatmapData,
    loadingHeatmapData,
    fetchHeatmapPages,
    fetchHeatmapData,
  } = useStore();

  const [selectedPage, setSelectedPage] = useState<string | undefined>(
    undefined
  );
  const [heatmapType, setHeatmapType] = useState<"click" | "scroll" | "move">(
    "click"
  );

  useEffect(() => {
    fetchHeatmapPages();
  }, [selectedProjectId, fetchHeatmapPages]);

  useEffect(() => {
    if (heatmapPages.length > 0 && !selectedPage) {
      setSelectedPage(heatmapPages[0].url);
    } else if (heatmapPages.length === 0) {
      setSelectedPage(undefined);
    }
  }, [heatmapPages, selectedPage]);

  useEffect(() => {
    if (selectedProjectId && selectedPage) {
      fetchHeatmapData({ url: selectedPage, type: heatmapType });
    }
  }, [selectedProjectId, selectedPage, heatmapType, fetchHeatmapData]);

  if (!selectedProjectId) {
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
              <div className="text-2xl font-bold">45,231</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Scroll Depth
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
                <path d="M12 5v14" />
                <path d="m19 12-7 7-7-7" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68%</div>
              <p className="text-xs text-muted-foreground">Average depth</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Mouse Movements
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
                <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7Z" />
                <path d="M12 2v7" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">892K</div>
              <p className="text-xs text-muted-foreground">Tracked movements</p>
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
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{heatmapPages.length}</div>
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
                    ) : (
                      heatmapPages.map((page) => (
                        <SelectItem key={page.id} value={page.url}>
                          {page.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
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
                  className="relative bg-muted rounded-lg overflow-hidden"
                  style={{ height: "500px" }}
                >
                  {loadingHeatmapData ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      Loading heatmap...
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <div className="text-center space-y-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-12 w-12 mx-auto mb-2"
                          >
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                            <path d="M7 7h.01" />
                            <path d="M17 7h.01" />
                            <path d="M7 17h.01" />
                            <path d="M17 17h.01" />
                          </svg>
                          <p className="text-sm font-medium">
                            Click Heatmap Preview
                          </p>
                          <p className="text-xs">Page: {selectedPage}</p>
                        </div>
                      </div>
                      {mockClickData.map((point, i) => (
                        <div
                          key={i}
                          className="absolute rounded-full blur-xl"
                          style={{
                            left: `${point.x}px`,
                            top: `${point.y}px`,
                            width: "80px",
                            height: "80px",
                            backgroundColor: `rgba(239, 68, 68, ${
                              point.intensity * 0.6
                            })`,
                            transform: "translate(-50%, -50%)",
                          }}
                        />
                      ))}
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
                    {heatmapData?.clicks?.length || 0} click clusters
                  </Badge>
                </div>
              </TabsContent>

              <TabsContent value="scroll" className="space-y-4">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Percentage of users who scrolled to each depth
                  </div>
                  {mockScrollData.map((data, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {data.depth}% of page
                        </span>
                        <span className="text-muted-foreground">
                          {data.percentage}% of users
                        </span>
                      </div>
                      <div className="h-8 w-full bg-muted rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-chart-2 to-chart-1 flex items-center justify-end px-3 text-xs font-medium text-white"
                          style={{ width: `${data.percentage}%` }}
                        >
                          {data.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        Average Scroll Depth
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Based on all sessions
                      </p>
                    </div>
                    <div className="text-2xl font-bold">68%</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="move" className="space-y-4">
                <div
                  className="relative bg-muted rounded-lg overflow-hidden"
                  style={{ height: "500px" }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center space-y-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-12 w-12 mx-auto mb-2"
                      >
                        <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7Z" />
                        <path d="M12 2v7" />
                      </svg>
                      <p className="text-sm font-medium">
                        Mouse Movement Heatmap
                      </p>
                      <p className="text-xs">Page: {selectedPage}</p>
                    </div>
                  </div>
                  <svg
                    className="absolute inset-0 w-full h-full"
                    style={{ opacity: 0.6 }}
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
                    <path
                      d="M 50 100 Q 150 50, 250 100 T 450 100 Q 500 150, 450 200"
                      stroke="url(#pathGradient)"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 100 200 Q 200 150, 300 200 T 500 200"
                      stroke="url(#pathGradient)"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 80 300 Q 180 250, 280 300 T 480 300"
                      stroke="url(#pathGradient)"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium">Total Movements</p>
                      <p className="text-2xl font-bold">892K</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Avg. Path Length</p>
                      <p className="text-2xl font-bold">1,234px</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Hover Time</p>
                      <p className="text-2xl font-bold">3.2s</p>
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
                {[
                  {
                    element: "Primary CTA Button",
                    clicks: 3245,
                    selector: "#cta-button",
                  },
                  {
                    element: "Navigation Menu",
                    clicks: 2891,
                    selector: "nav.main-menu",
                  },
                  {
                    element: "Product Card",
                    clicks: 1567,
                    selector: ".product-card",
                  },
                  {
                    element: "Footer Links",
                    clicks: 892,
                    selector: "footer a",
                  },
                  {
                    element: "Search Bar",
                    clicks: 654,
                    selector: "#search-input",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between pb-3 border-b last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{item.element}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {item.selector}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {item.clicks.toLocaleString()}
                    </Badge>
                  </div>
                ))}
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
