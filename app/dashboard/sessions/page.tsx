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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useStore } from "@/lib/store";

import type { Session, User } from "@/lib/types";

const sessionDurationData = [
  { time: "00:00", duration: 420 },
  { time: "04:00", duration: 380 },
  { time: "08:00", duration: 680 },
  { time: "12:00", duration: 820 },
  { time: "16:00", duration: 750 },
  { time: "20:00", duration: 590 },
];

export default function SessionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [localSelectedUser, setLocalSelectedUser] = useState<User | null>(null);

  const {
    sessions,
    users,
    selectedSession,
    sessionsOverview,
    loadingSessions,
    loadingUsers,
    fetchSessions,
    fetchUsers,
    fetchSessionsOverview,
    selectSession,
  } = useStore();

  useEffect(() => {
    fetchSessions();
    fetchUsers();
    fetchSessionsOverview();
  }, [fetchSessions, fetchUsers, fetchSessionsOverview]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Sessions & Users"
        description="Track user sessions and analyze user behavior patterns"
      />
      <div className="flex-1 p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sessions
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
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessionsOverview?.totalSessions || sessions.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Total sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessionsOverview?.activeUsers || users.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Active users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Session Duration
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
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessionsOverview?.avgSessionDuration
                  ? formatDuration(sessionsOverview.avgSessionDuration)
                  : "0m 0s"}
              </div>
              <p className="text-xs text-muted-foreground">Average time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
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
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessionsOverview?.bounceRate
                  ? `${Math.round(sessionsOverview.bounceRate * 100)}%`
                  : "0%"}
              </div>
              <p className="text-xs text-muted-foreground">Bounce rate</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Session Duration Trend</CardTitle>
            <CardDescription>
              Average session duration over the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                duration: {
                  label: "Duration (seconds)",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={
                    sessionsOverview?.sessionDurationTrend ||
                    sessionDurationData
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="duration"
                    stroke="var(--color-duration)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Tabs defaultValue="sessions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                  Recent user sessions with detailed information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Session ID</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Events</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions?.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell className="font-mono text-sm">
                            {session.id}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {session.userId || "-"}
                          </TableCell>
                          <TableCell>
                            {formatDuration(session.duration)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{session.events}</Badge>
                          </TableCell>
                          <TableCell>{session.device}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {session.location}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => selectSession(session)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {selectedSession && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Session Details</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => selectSession(null)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Session ID
                      </p>
                      <p className="text-sm font-mono">{selectedSession.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        User ID
                      </p>
                      <p className="text-sm font-mono">
                        {selectedSession.userId || "Anonymous"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Start Time
                      </p>
                      <p className="text-sm">
                        {new Date(selectedSession.startTime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Duration
                      </p>
                      <p className="text-sm">
                        {formatDuration(selectedSession.duration)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Page Views
                      </p>
                      <p className="text-sm">{selectedSession.pageViews}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Events
                      </p>
                      <p className="text-sm">{selectedSession.events}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Device
                      </p>
                      <p className="text-sm">{selectedSession.device}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Browser
                      </p>
                      <p className="text-sm">{selectedSession.browser}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Directory</CardTitle>
                <CardDescription>
                  Identified users and their activity metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Sessions</TableHead>
                        <TableHead>Events</TableHead>
                        <TableHead>Avg. Duration</TableHead>
                        <TableHead>Last Seen</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono text-sm">
                            {user.id}
                          </TableCell>
                          <TableCell>{user.email || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {user.totalSessions}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.totalEvents}</TableCell>
                          <TableCell>
                            {formatDuration(user.avgSessionDuration)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(user.lastSeen).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLocalSelectedUser(user)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {localSelectedUser && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>User Profile</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocalSelectedUser(null)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        User ID
                      </p>
                      <p className="text-sm font-mono">
                        {localSelectedUser.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Email
                      </p>
                      <p className="text-sm">
                        {localSelectedUser.email || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        First Seen
                      </p>
                      <p className="text-sm">
                        {new Date(localSelectedUser.firstSeen).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Last Seen
                      </p>
                      <p className="text-sm">
                        {new Date(localSelectedUser.lastSeen).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Sessions
                      </p>
                      <p className="text-sm">
                        {localSelectedUser.totalSessions}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Events
                      </p>
                      <p className="text-sm">{localSelectedUser.totalEvents}</p>
                    </div>
                  </div>
                  {localSelectedUser.properties && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        User Properties
                      </p>
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="text-xs font-mono">
                          {JSON.stringify(
                            localSelectedUser.properties,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
