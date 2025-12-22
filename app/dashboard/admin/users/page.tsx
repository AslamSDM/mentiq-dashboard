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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { adminService, type AdminUser } from "@/lib/services/admin";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Eye,
  Calendar,
  Activity,
  MousePointer,
  BarChart3,
  Globe,
  Laptop,
  ExternalLink,
} from "lucide-react";

interface UserWithProjects extends AdminUser {
  projects: any[];
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { setImpersonatedProject } = useStore();

  const [usersWithProjects, setUsersWithProjects] = useState<
    UserWithProjects[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithProjects | null>(
    null
  );
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [projectData, setProjectData] = useState<any>(null);
  const [loadingProjectData, setLoadingProjectData] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (status === "authenticated" && session && !session.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      });
      router.push("/dashboard");
    }
  }, [session, status, router, toast]);

  // Fetch all users with their projects efficiently
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get all users with their projects in a single efficient call
        const usersWithProjectsData =
          await adminService.getAllUsersWithProjects();

        setUsersWithProjects(usersWithProjectsData);
      } catch (error: any) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session?.isAdmin) {
      fetchData();
    }
  }, [session, status, toast]);

  // Open dialog and set user
  const handleViewUser = (user: UserWithProjects) => {
    setSelectedUser(user);
    setSelectedProject("");
    setProjectData(null);
    setIsDialogOpen(true);
  };

  // Fetch project data when a project is selected
  const handleProjectSelect = async (projectId: string) => {
    if (!projectId) {
      setSelectedProject("");
      setProjectData(null);
      return;
    }

    setSelectedProject(projectId);
    setLoadingProjectData(true);

    try {
      const data = await adminService.getProjectData(projectId);
      setProjectData(data);
    } catch (error: any) {
      console.error("Failed to fetch project data:", error);
      toast({
        title: "Error",
        description: "Failed to load project data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingProjectData(false);
    }
  };

  // Navigate to dashboard with impersonated project
  const handleViewDashboard = (
    projectId: string,
    projectName: string,
    userEmail: string
  ) => {
    setImpersonatedProject(projectId, projectName, userEmail);
    toast({
      title: "Viewing as user",
      description: `Now viewing ${projectName} dashboard for ${userEmail}`,
    });
    setIsDialogOpen(false);
    // Reload the page to force fresh data
    window.location.href = "/dashboard";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

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
              Total users: {usersWithProjects.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : usersWithProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <p>No users found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersWithProjects.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.email}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {user.id}
                      </TableCell>
                      <TableCell>
                        {user.projects.length > 0 ? (
                          <div className="flex gap-2 flex-wrap">
                            {user.projects.map((project) => (
                              <Badge key={project.id} variant="secondary">
                                {project.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm">
                            No projects
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                          disabled={user.projects.length === 0}
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

      {/* Project Data Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Analytics</DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* Project Selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Select Project</CardTitle>
                  <CardDescription>
                    Choose a project to view detailed analytics or view the full
                    dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={selectedProject}
                    onValueChange={handleProjectSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedUser.projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name} ({project.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedProject && (
                    <Button
                      onClick={() => {
                        const project = selectedUser.projects.find(
                          (p) => p.id === selectedProject
                        );
                        if (project) {
                          handleViewDashboard(
                            project.id,
                            project.name,
                            selectedUser.email
                          );
                        }
                      }}
                      className="w-full"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full Dashboard as This User
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Project Analytics */}
              {loadingProjectData ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : projectData ? (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Total Events
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {projectData.total_events}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <MousePointer className="h-4 w-4" />
                          Unique Users
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {projectData.unique_users}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Sessions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {projectData.unique_sessions}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Event Types
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {projectData.event_breakdown?.length || 0}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Breakdowns Grid */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Event Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Event Types</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {projectData.event_breakdown?.map(
                            (item: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 rounded-lg border"
                              >
                                <span className="font-medium text-sm">
                                  {item.event_type}
                                </span>
                                <Badge variant="secondary">{item.count}</Badge>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Device Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Laptop className="h-4 w-4" />
                          Devices
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {projectData.device_breakdown?.map(
                            (item: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 rounded-lg border"
                              >
                                <span className="font-medium text-sm">
                                  {item.device}
                                </span>
                                <Badge variant="secondary">{item.count}</Badge>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Browser Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Browsers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {projectData.browser_breakdown?.map(
                            (item: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 rounded-lg border"
                              >
                                <span className="font-medium text-sm">
                                  {item.browser}
                                </span>
                                <Badge variant="secondary">{item.count}</Badge>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Country Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Countries
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {projectData.country_breakdown?.map(
                            (item: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 rounded-lg border"
                              >
                                <span className="font-medium text-sm">
                                  {item.country}
                                </span>
                                <Badge variant="secondary">{item.count}</Badge>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Events */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Events</CardTitle>
                      <CardDescription>
                        Last {projectData.recent_events?.length || 0} events (
                        {projectData.start_date} to {projectData.end_date})
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-96 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>User ID</TableHead>
                              <TableHead>Session</TableHead>
                              <TableHead>Timestamp</TableHead>
                              <TableHead>Device</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {projectData.recent_events?.map((event: any) => (
                              <TableRow key={event.event_id}>
                                <TableCell className="font-medium text-sm">
                                  {event.event_type}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-slate-500">
                                  {event.user_id?.slice(0, 8)}...
                                </TableCell>
                                <TableCell className="font-mono text-xs text-slate-500">
                                  {event.session_id?.slice(0, 8)}...
                                </TableCell>
                                <TableCell className="text-xs text-slate-600">
                                  {formatDate(event.timestamp)}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {event.device || "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : selectedProject ? (
                <div className="text-center py-12 text-slate-400">
                  No data available for this project
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  Please select a project to view analytics
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
