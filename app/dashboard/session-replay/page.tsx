"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { useEffectiveProjectId } from "@/hooks/use-effective-project";
import type { Session } from "@/lib/types";
import rrwebPlayer from "rrweb-player";
import "rrweb-player/dist/style.css";
import { HeatmapsView } from "@/components/heatmaps-view";

interface TimelineEvent {
  id: string;
  time: string;
  type: string;
  description: string;
  element?: string;
  data?: any;
}

export default function SessionReplayPage() {
  const {
    sessions,
    selectedSession,
    loadingSessions,
    fetchSessions,
    selectSession,
  } = useStore();
  const effectiveProjectId = useEffectiveProjectId();

  const [sessionMetrics, setSessionMetrics] = useState<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (effectiveProjectId) {
      fetchSessions(true); // Force refresh when project changes
    }
  }, [effectiveProjectId, fetchSessions]);

  // Initialize rrweb player when session changes
  useEffect(() => {
    if (
      selectedSession &&
      selectedSession.eventsList &&
      selectedSession.eventsList.length > 0 &&
      playerContainerRef.current
    ) {
      // Clean up previous player instance
      if (playerRef.current) {
        // Try to properly destroy/unmount if method exists, otherwise just clear innerHTML
        const container = playerContainerRef.current;
        container.innerHTML = "";
        playerRef.current = null;
      }

      try {
        // Normalize timestamps to start from 0
        const events = selectedSession.eventsList;
        const firstTimestamp = events[0]?.timestamp || 0;

        const normalizedEvents = events.map((event: any) => ({
          ...event,
          timestamp: event.timestamp - firstTimestamp,
        }));

        console.log("Player events:", {
          original: events.length,
          normalized: normalizedEvents.length,
          duration: normalizedEvents[normalizedEvents.length - 1]?.timestamp,
          firstEvent: normalizedEvents[0],
          lastEvent: normalizedEvents[normalizedEvents.length - 1],
        });

        // Initialize new player
        playerRef.current = new rrwebPlayer({
          target: playerContainerRef.current,
          props: {
            events: normalizedEvents,
            width: playerContainerRef.current.clientWidth,
            height: 400, // Fixed height for the player
            autoPlay: false,
            showController: true,
            speedOption: [1, 2, 4, 8],
          },
        });
      } catch (error) {
        console.error("Failed to initialize rrweb player:", error);
      }
    }

    return () => {
      // Cleanup on unmount or session change
      if (playerRef.current) {
        const container = playerContainerRef.current;
        if (container) container.innerHTML = "";
        playerRef.current = null;
      }
    };
  }, [selectedSession]);

  // Calculate metrics from real session data
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      const totalSessions = sessions.length;
      const totalDuration = sessions.reduce(
        (sum, session: Session) => sum + session.duration,
        0
      );
      const avgDuration = totalDuration / totalSessions;

      setSessionMetrics({
        totalSessions,
        avgDuration,
      });
    }
  }, [sessions]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const replayTimeline: TimelineEvent[] = useMemo(() => {
    if (!selectedSession?.eventsList || selectedSession.eventsList.length === 0)
      return [];

    const events = selectedSession.eventsList;
    const firstTimestamp = events[0]?.timestamp || 0;

    // Filter and map events based on rrweb event types
    // Don't filter too aggressively - include more event types
    return events
      .filter((event: any) => {
        // rrweb event types:
        // 0=DomContentLoaded, 1=Load, 2=FullSnapshot, 3=IncrementalSnapshot, 4=Meta, 5=Custom
        // Show 2 (FullSnapshot - page loads), 3 (interactions), and 5 (custom)
        return event.type === 2 || event.type === 3 || event.type === 5;
      })
      .map((event: any, index: number) => {
        // Calculate relative time from first event
        const relativeTimeMs = Math.max(
          0,
          (event.timestamp || 0) - firstTimestamp
        );

        // Format time as M:SS
        const minutes = Math.floor(relativeTimeMs / 60000);
        const seconds = Math.floor((relativeTimeMs % 60000) / 1000);
        const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        // Determine event type from rrweb data
        let eventType = "Interaction";
        let description = "User interaction";

        if (event.type === 2) {
          // FullSnapshot - page load/navigation
          eventType = "Navigation";
          description = "Page loaded";
        } else if (event.type === 3 && event.data?.source !== undefined) {
          // IncrementalSnapshot - source types: 0=Mutation, 1=MouseMove, 2=MouseInteraction, 3=Scroll, etc.
          switch (event.data.source) {
            case 2: // MouseInteraction
              eventType = "Click";
              description =
                event.data.type === 0
                  ? "Mouse down"
                  : event.data.type === 1
                  ? "Mouse up"
                  : event.data.type === 2
                  ? "Click"
                  : "Mouse interaction";
              if (event.data.id) description += ` on element`;
              break;
            case 3: // Scroll
              eventType = "Scroll";
              description = `Scrolled to (${event.data.x || 0}, ${
                event.data.y || 0
              })`;
              break;
            case 1: // MouseMove
              eventType = "Mouse Move";
              description = "Mouse movement";
              break;
            case 5: // Input
              eventType = "Input";
              description = `Input text: ${
                event.data.text?.substring(0, 20) || "..."
              }`;
              break;
            case 6: // MediaInteraction
              eventType = "Media";
              description = "Media interaction";
              break;
            default:
              description = `Interaction (source: ${event.data.source})`;
          }
        } else if (event.type === 5) {
          // Custom event
          eventType = "Custom";
          description = event.data?.tag || "Custom event";
        }

        return {
          id: `event-${index}`,
          time: timeString,
          type: eventType,
          description: description,
          element: event.data?.id?.toString(),
          data: event.data,
        };
      });
  }, [selectedSession]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader
        title="Session Analysis"
        description="Analyze user sessions and interaction heatmaps"
      />

      <Tabs defaultValue="replay" className="space-y-4">
        <TabsList>
          <TabsTrigger value="replay">Session Replay</TabsTrigger>
          <TabsTrigger value="heatmaps">Heatmaps</TabsTrigger>
        </TabsList>

        <TabsContent value="replay" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Total Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sessionMetrics
                    ? sessionMetrics.totalSessions.toLocaleString()
                    : sessions?.length?.toLocaleString() || "0"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  recorded sessions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Avg Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedSession
                    ? formatDuration(selectedSession.duration)
                    : sessionMetrics
                    ? formatDuration(Math.round(sessionMetrics.avgDuration))
                    : "0m 0s"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedSession ? "session duration" : "per session"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Sessions with Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {/* Placeholder for actual issue detection */}0
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  0% of total
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
                <div className="text-2xl font-bold">0%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  active sessions
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-7">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingSessions ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Loading sessions...
                    </div>
                  ) : sessions?.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No sessions found
                    </div>
                  ) : (
                    sessions?.slice(0, 10).map((session) => (
                      <div
                        key={session.id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                          selectedSession?.id === session.id
                            ? "bg-accent border-primary"
                            : ""
                        }`}
                        onClick={() => selectSession(session)}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {session.userId || "Anonymous User"}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {session.device}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(session.startTime).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {formatDuration(session.duration)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {session.events} events
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-5">
              <CardHeader>
                <CardTitle>
                  {selectedSession
                    ? `Session Replay - ${new Date(
                        selectedSession.startTime
                      ).toLocaleString()}`
                    : "Select a Session"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedSession ? (
                  <div className="space-y-6">
                    {/* Player Container */}
                    <div className="border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 min-h-[400px] flex items-center justify-center">
                      {selectedSession.eventsList &&
                      selectedSession.eventsList.length > 0 ? (
                        <div ref={playerContainerRef} className="w-full" />
                      ) : (
                        <div className="text-muted-foreground">
                          No recording data available for this session
                        </div>
                      )}
                    </div>

                    {/* Event Timeline */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">
                          Session Timeline
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {replayTimeline.length} events
                        </span>
                      </div>
                      <div className="relative space-y-3 max-h-[500px] overflow-y-auto pr-2 border rounded-lg p-4 bg-muted/30">
                        {replayTimeline.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm">No events recorded</p>
                          </div>
                        ) : (
                          replayTimeline?.map((event, i) => (
                            <div key={event.id} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`h-3 w-3 rounded-full ${
                                    event.type === "Navigation"
                                      ? "bg-green-600"
                                      : event.type === "Click"
                                      ? "bg-blue-600"
                                      : event.type === "Scroll"
                                      ? "bg-purple-600"
                                      : event.type === "Input"
                                      ? "bg-orange-600"
                                      : "bg-gray-600"
                                  }`}
                                />
                                {i < replayTimeline.length - 1 && (
                                  <div className="flex-1 w-0.5 bg-gray-200 dark:bg-gray-700 my-1" />
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <p className="text-sm font-medium">
                                  {event.type}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {event.time} • {event.description}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p className="text-sm">Select a session to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="heatmaps" className="space-y-4">
          <HeatmapsView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
