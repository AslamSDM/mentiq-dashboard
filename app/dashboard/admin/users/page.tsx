"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { adminService, type AdminUser, type UserEventData } from "@/lib/services/admin";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, Calendar, Activity, MousePointer } from "lucide-react";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userData, setUserData] = useState<UserEventData | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (session && !session.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      });
      router.push("/dashboard");
    }
  }, [session, router, toast]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const data = await adminService.getAccountUsers(session.user.id);
        setUsers(data);
      } catch (error: any) {
        console.error("Failed to fetch users:", error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.isAdmin) {
      fetchUsers();
    }
  }, [session, toast]);

  // Fetch user data when a user is selected
  const handleViewUser = async (user: AdminUser) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
    setLoadingUserData(true);

    try {
      const data = await adminService.getUserData(user.id);
      setUserData(data);
    } catch (error: any) {
      console.error("Failed to fetch user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingUserData(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!session?.isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader
        title="Admin - User Management"
        description="View and manage all users in the system"
      />

      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Total users: {users.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <p>No users found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Account ID</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {user.id}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {user.accountId}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Data
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Data Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              {selectedUser?.email} - {selectedUser?.id}
            </DialogDescription>
          </DialogHeader>

          {loadingUserData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : userData ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Total Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userData.totalEvents}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <MousePointer className="h-4 w-4" />
                      Total Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userData.totalSessions}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Event Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {userData.eventBreakdown.length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Event Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {userData.eventBreakdown.map((event, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg border"
                      >
                        <span className="font-medium">{event.eventType}</span>
                        <Badge variant="secondary">{event.count} events</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Events</CardTitle>
                  <CardDescription>
                    Last {userData.recentEvents.length} events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Properties</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userData.recentEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">
                            {event.eventType}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {formatDate(event.timestamp)}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                              {event.properties
                                ? JSON.stringify(event.properties).slice(0, 50) +
                                  "..."
                                : "{}"}
                            </code>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle>Sessions</CardTitle>
                  <CardDescription>
                    Total sessions: {userData.sessions.length}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {userData.sessions.slice(0, 10).map((session, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg border"
                      >
                        <span className="font-mono text-sm">
                          {session.sessionId}
                        </span>
                        <Badge variant="outline">{session.count} events</Badge>
                      </div>
                    ))}
                    {userData.sessions.length > 10 && (
                      <p className="text-sm text-slate-500 text-center pt-2">
                        ... and {userData.sessions.length - 10} more sessions
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              No data available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
