"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import type { Session } from "@/lib/types";
import rrwebPlayer from "rrweb-player";
import "rrweb-player/dist/style.css";

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
    selectedProjectId,
  } = useStore();

  const [sessionMetrics, setSessionMetrics] = useState<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

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
        // Initialize new player
        playerRef.current = new rrwebPlayer({
          target: playerContainerRef.current,
          props: {
            events: selectedSession.eventsList,
            width: playerContainerRef.current.clientWidth,
            height: 400, // Fixed height for the player
            autoPlay: false,
            showController: true,
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
    if (!selectedSession?.eventsList) return [];

    return selectedSession.eventsList.map((event: any) => {
      // Calculate relative time from start
      const eventTime = new Date(event.timestamp).getTime();
      const startTime = new Date(selectedSession.startTime).getTime();
      const relativeTimeMs = Math.max(0, eventTime - startTime);

      // Format time as M:SS
      const minutes = Math.floor(relativeTimeMs / 60000);
      const seconds = Math.floor((relativeTimeMs % 60000) / 1000);
      const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

      return {
        id: event.event_id || Math.random().toString(),
        time: timeString,
        type:
          event.event_type === "page_view"
            ? "Navigation"
            : event.event_type === "click"
            ? "Click"
            : event.event_type === "input"
            ? "Input"
            : "Custom",
        description:
          event.event_type === "page_view"
            ? `Visited ${event.properties?.url || "page"}`
            : event.event_type === "click"
            ? `Clicked ${event.properties?.element || "element"}`
            : event.event_type === "input"
            ? `Input in ${event.properties?.element || "field"}`
            : `Event: ${event.event_type}`,
        element: event.properties?.element,
        data: event.properties,
      };
    });
  }, [selectedSession]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader
        title="Session Replay"
        description="Watch user sessions to understand behavior and issues"
      />

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
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessionMetrics
                ? formatDuration(Math.round(sessionMetrics.avgDuration))
                : "0m 0s"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">per session</p>
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
            <p className="text-xs text-muted-foreground mt-1">0% of total</p>
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
                  <h3 className="text-sm font-medium">Session Timeline</h3>
                  <div className="relative space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {replayTimeline?.map((event, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-3 w-3 rounded-full bg-blue-600" />
                          {i < replayTimeline.length - 1 && (
                            <div className="flex-1 w-0.5 bg-gray-200 my-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium">{event.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.time} • {event.description}
                          </p>
                        </div>
                      </div>
                    ))}
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
    </div>
  );
}
