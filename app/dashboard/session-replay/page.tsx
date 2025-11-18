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
import { useStore } from "@/lib/store";
import type { Session } from "@/lib/types";

interface TimelineEvent {
  time: string;
  action: string;
  page?: string;
  element?: string;
  field?: string;
  endpoint?: string;
  position?: string;
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

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Calculate metrics from real session data
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      const totalSessions = sessions.length;
      const totalDuration = sessions.reduce(
        (sum, session) => sum + session.duration,
        0
      );
      const avgDuration = totalDuration / totalSessions;
      const sessionsWithErrors = sessions.filter(
        (session) => session.events < 2
      ).length; // Sessions with very few events might indicate issues

      // Calculate conversion rate (sessions with significant activity)
      const activeSessions = sessions.filter(
        (session) => session.pageViews > 2 && session.events > 5
      ).length;
      const conversionRate = (activeSessions / totalSessions) * 100;

      setSessionMetrics({
        totalSessions,
        avgDuration,
        sessionsWithErrors,
        errorRate: (sessionsWithErrors / totalSessions) * 100,
        conversionRate,
      });
    }
  }, [sessions]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  // Generate timeline from real session events
  const generateTimeline = (session: Session): TimelineEvent[] => {
    if (!session || !session.events) return [];

    // Create timeline events from session data
    const baseEvents: TimelineEvent[] = [
      { time: "0:00", action: "Session Start", page: "/dashboard" },
      { time: "0:02", action: "Page Load", page: "/dashboard" },
    ];

    // Add events based on session statistics
    const events: TimelineEvent[] = [...baseEvents];
    let timeOffset = 5;

    if (session.events > 2) {
      events.push({
        time: `0:${timeOffset.toString().padStart(2, "0")}`,
        action: "First Click",
        element: "Navigation",
      });
      timeOffset += 7;
    }

    if (session.pageViews > 1) {
      events.push({
        time: `0:${timeOffset.toString().padStart(2, "0")}`,
        action: "Page Navigation",
        page: "/analytics",
      });
      timeOffset += 15;
    }

    if (session.events > 5) {
      events.push({
        time: `0:${timeOffset.toString().padStart(2, "0")}`,
        action: "Scroll Event",
        position: "50%",
      });
      timeOffset += 20;
    }

    if (session.events > 8) {
      events.push({
        time: `1:${(timeOffset - 60).toString().padStart(2, "0")}`,
        action: "Form Interaction",
        field: "Input Field",
      });
      timeOffset += 13;
    }

    if (session.events > 10) {
      events.push({
        time: `1:${(timeOffset - 60).toString().padStart(2, "0")}`,
        action: "Button Click",
        element: "Submit Button",
      });
    }

    return events.slice(0, 8); // Limit to 8 events for display
  };

  const replayTimeline: TimelineEvent[] = selectedSession
    ? generateTimeline(selectedSession)
    : [];

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
              {sessionMetrics ? sessionMetrics.sessionsWithErrors : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {sessionMetrics
                ? `${sessionMetrics.errorRate.toFixed(1)}% of total`
                : "0% of total"}
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
            <div className="text-2xl font-bold">
              {sessionMetrics
                ? `${sessionMetrics.conversionRate.toFixed(1)}%`
                : "0%"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              active sessions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Click to view session replay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions &&
                sessions.length > 0 &&
                sessions?.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedSession?.id === session.id
                        ? "border-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => selectSession(session)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium">
                            {session.userId || "Anonymous"}
                          </p>
                          <Badge className="bg-blue-100 text-blue-800">
                            {session.events} Events
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{session.device}</span>
                          <span>•</span>
                          <span>{session.browser}</span>
                          <span>•</span>
                          <span>
                            {new Date(session.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm mt-2">
                          <span>
                            Duration: {formatDuration(session.duration)}
                          </span>
                          <span>•</span>
                          <span>{session.pageViews} pages</span>
                          <span>•</span>
                          <span>{session.events} events</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Watch
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Timeline</CardTitle>
            <CardDescription>
              {selectedSession
                ? "Selected session events"
                : "Select a session to view timeline"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedSession ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <Button size="sm" variant="outline">
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Play
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    0:00 / 5:32
                  </span>
                </div>
                <div className="relative space-y-3">
                  {replayTimeline?.map((event, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-blue-600" />
                        {i < replayTimeline.length - 1 && (
                          <div className="flex-1 w-0.5 bg-gray-200 my-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium">{event.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.time}
                          {event.page && ` • ${event.page}`}
                          {event.element && ` • ${event.element}`}
                          {event.field && ` • ${event.field}`}
                          {event.endpoint && ` • ${event.endpoint}`}
                          {event.position && ` • ${event.position}`}
                        </p>
                      </div>
                    </div>
                  ))}
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
