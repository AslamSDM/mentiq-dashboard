"use client";

import { useState, useEffect, useRef } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient, type Project, type ApiKey } from "@/lib/api";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";

// Code block component with syntax highlighting
function CodeBlock({
  code,
  language = "typescript",
  onCopy,
  isCopied,
}: {
  code: string;
  language?: string;
  onCopy: () => void;
  isCopied: boolean;
}) {
  return (
    <div className="relative rounded-xl overflow-hidden border border-[#E0E5F2]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2B3674] border-b border-[#3a4690]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
        >
          {isCopied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "#1e1e2e",
          fontSize: "0.875rem",
          borderRadius: 0,
        }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default function ProjectsPage() {
  // Zustand store
  const {
    projects,
    fetchProjects,
    projectsLoaded,
    createProject,
    deleteProject,
    apiKeys,
    loadingApiKeys,
    fetchApiKeys,
    createApiKey,
    deleteApiKey,
    updateApiKey,
  } = useStore();

  const { toast } = useToast();
  const { data: session } = useSession();

  // Refs to prevent duplicate operations
  const hasFetched = useRef(false);
  const hasShownPaymentToast = useRef(false);

  // Local state
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set()
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateKeyOpen, setIsCreateKeyOpen] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [newApiKey, setNewApiKey] = useState({
    name: "",
    permissions: [] as string[],
  });
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get role from session, default to "owner" for backward compatibility
  const currentUserRole = session?.role || "owner";

  // Fetch projects only once if not loaded
  useEffect(() => {
    if (!projectsLoaded && !hasFetched.current) {
      hasFetched.current = true;
      setLoading(true);
      fetchProjects().finally(() => setLoading(false));
    }
  }, [fetchProjects, projectsLoaded]);

  // Check for successful payment from Stripe (once)
  useEffect(() => {
    if (hasShownPaymentToast.current) return;
    
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      hasShownPaymentToast.current = true;
      toast({
        title: "Payment successful! 🎉",
        description:
          "Your subscription is active. Create your first project to get started.",
        duration: 5000,
      });
      // Clean up URL
      window.history.replaceState({}, "", "/dashboard/projects");
    }
  }, [toast]);

  const handleCreateProject = async () => {
    try {
      await createProject(newProject.name, newProject.description);
      setNewProject({ name: "", description: "" });
      setIsCreateOpen(false);
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
    } catch (error: any) {
      // Check if it's a project limit error
      if (error?.response?.status === 403) {
        toast({
          title: "Project limit reached",
          description:
            "Upgrade to Enterprise plan to create multiple projects.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to create project",
          description:
            error?.message || "An error occurred while creating the project.",
          variant: "destructive",
        });
      }

      setNewProject({ name: "", description: "" });
      setIsCreateOpen(false);
    }
  };

  const handleCopyItem = (item: string, type: "key" | "id" = "key") => {
    navigator.clipboard.writeText(item);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
    } catch (error) {
      // Silent fail - store handles error state
    }
  };

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
        // Fetch API keys when expanding if not already loaded
        if (!apiKeys[projectId]) {
          fetchApiKeys(projectId);
        }
      }
      return newSet;
    });
  };

  const handleCreateApiKey = async (projectId: string) => {
    try {
      await createApiKey(projectId, newApiKey.name, newApiKey.permissions);
      setNewApiKey({ name: "", permissions: [] });
      setIsCreateKeyOpen(null);
    } catch (error) {
      // Silent fail - store handles error state
      setNewApiKey({ name: "", permissions: [] });
      setIsCreateKeyOpen(null);
    }
  };

  const handleDeleteApiKey = async (projectId: string, keyId: string) => {
    try {
      await deleteApiKey(projectId, keyId);
    } catch (error) {
      // Silent fail - store handles error state
    }
  };

  const handleToggleKeyStatus = async (
    projectId: string,
    keyId: string,
    isActive: boolean
  ) => {
    try {
      await updateApiKey(projectId, keyId, { isActive });
    } catch (error) {
      // Silent fail - store handles error state
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Empty state when no projects exist
  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <DashboardHeader
          title="Projects"
          description="Manage your projects and API keys"
        />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-12 w-12 text-primary"
                  >
                    <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                    <path d="M17 18h1" />
                    <path d="M12 18h1" />
                    <path d="M7 18h1" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">
                    Create Your First Project
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Get started by creating a project to track analytics,
                    monitor user behavior, and gain insights into your
                    application's performance.
                  </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="mt-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-5 w-5"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                      Create Your First Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Project</DialogTitle>
                      <DialogDescription>
                        Add a new project to start tracking analytics
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input
                          id="project-name"
                          placeholder="My Awesome App"
                          value={newProject.name}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project-description">Description</Label>
                        <Input
                          id="project-description"
                          placeholder="Brief description of your project"
                          value={newProject.description}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateProject}
                        disabled={!newProject.name}
                      >
                        Create Project
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="pt-4 border-t w-full">
                  <p className="text-sm text-muted-foreground mb-4">
                    What you'll get with your project:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-green-600 dark:text-green-400"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">API Keys</p>
                        <p className="text-xs text-muted-foreground">
                          Secure access to your analytics
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-green-600 dark:text-green-400"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Event Tracking</p>
                        <p className="text-xs text-muted-foreground">
                          Monitor user interactions
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-green-600 dark:text-green-400"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Session Recording</p>
                        <p className="text-xs text-muted-foreground">
                          Watch user sessions replay
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-green-600 dark:text-green-400"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Analytics Dashboard
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Comprehensive data insights
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title="Projects"
        description="Manage your projects and API keys"
      />
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Your Projects</h2>
            <p className="text-sm text-muted-foreground">
              Create and manage projects to track analytics
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {projects?.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {(project.eventCount || 0).toLocaleString()} events
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Project Information
                  </Label>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">
                        Project ID:
                      </Label>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {project.id}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyItem(project.id, "id")}
                        className="h-6 w-6 p-0"
                      >
                        {copiedItem === project.id ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3 w-3"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3 w-3"
                          >
                            <rect
                              width="14"
                              height="14"
                              x="8"
                              y="8"
                              rx="2"
                              ry="2"
                            />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created on{" "}
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleProjectExpansion(project.id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`mr-2 h-4 w-4 transition-transform ${
                        expandedProjects.has(project.id) ? "rotate-180" : ""
                      }`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                    {expandedProjects.has(project.id) ? "Hide" : "Show"} API
                    Keys
                  </Button>
                  {currentUserRole === "owner" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                      Delete
                    </Button>
                  )}
                </div>

                {/* Collapsible API Keys Section */}
                {expandedProjects.has(project.id) && (
                  <div className="mt-6 border-t pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">API Keys</h4>
                        <p className="text-sm text-muted-foreground">
                          Manage API keys for secure access to your project
                          data.
                        </p>
                      </div>
                      <Dialog
                        open={isCreateKeyOpen === project.id}
                        onOpenChange={(open) =>
                          setIsCreateKeyOpen(open ? project.id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            disabled={currentUserRole === "viewer"}
                            title={
                              currentUserRole === "viewer"
                                ? "Viewers cannot create API keys"
                                : "Create new API key"
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-2 h-4 w-4"
                            >
                              <path d="M5 12h14" />
                              <path d="M12 5v14" />
                            </svg>
                            Create New Key
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New API Key</DialogTitle>
                            <DialogDescription>
                              Generate a new API key for secure access to{" "}
                              {project.name}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="key-name">Key Name</Label>
                              <Input
                                id="key-name"
                                placeholder="Production Key, Development Key, etc."
                                value={newApiKey.name}
                                onChange={(e) =>
                                  setNewApiKey({
                                    ...newApiKey,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsCreateKeyOpen(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleCreateApiKey(project.id)}
                              disabled={!newApiKey.name}
                            >
                              Create Key
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {loadingApiKeys[project.id] ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Key</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead>Last Used</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(apiKeys[project.id] || [])?.map((key: ApiKey) => (
                              <TableRow key={key.id}>
                                <TableCell className="font-medium">
                                  {key.name}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                                      {key.key.substring(0, 20)}...
                                    </code>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCopyItem(key.key)}
                                    >
                                      {copiedItem === key.key ? (
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
                                          <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                      ) : (
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
                                          <rect
                                            width="14"
                                            height="14"
                                            x="8"
                                            y="8"
                                            rx="2"
                                            ry="2"
                                          />
                                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                        </svg>
                                      )}
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      key.isActive ? "default" : "secondary"
                                    }
                                  >
                                    {key.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {new Date(key.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {key.lastUsedAt
                                    ? new Date(
                                        key.lastUsedAt
                                      ).toLocaleDateString()
                                    : "Never"}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleToggleKeyStatus(
                                          project.id,
                                          key.id,
                                          !key.isActive
                                        )
                                      }
                                      disabled={currentUserRole === "viewer"}
                                      title={
                                        currentUserRole === "viewer"
                                          ? "Viewers cannot modify API keys"
                                          : ""
                                      }
                                    >
                                      {key.isActive ? "Disable" : "Enable"}
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteApiKey(project.id, key.id)
                                      }
                                      disabled={currentUserRole === "viewer"}
                                      title={
                                        currentUserRole === "viewer"
                                          ? "Viewers cannot delete API keys"
                                          : ""
                                      }
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {(apiKeys[project.id] || []).length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            No API keys found. Create your first key to get
                            started.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-none shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
          <CardHeader>
            <CardTitle className="text-[#2B3674] font-bold">SDK Integration</CardTitle>
            <CardDescription className="text-[#4363C7]">
              Use your API key to integrate the Mentiq Analytics SDK into your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Installation */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#4318FF]/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#4318FF]">1</span>
                </div>
                <Label className="text-[#2B3674] font-semibold">Installation</Label>
              </div>
              <CodeBlock
                code="npm install mentiq-sdk"
                language="bash"
                onCopy={() => handleCopyItem("npm install mentiq-sdk")}
                isCopied={copiedItem === "npm install mentiq-sdk"}
              />
            </div>

            {/* Step 2: Provider Setup */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#4318FF]/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#4318FF]">2</span>
                </div>
                <Label className="text-[#2B3674] font-semibold">Provider Setup (app/layout.tsx)</Label>
              </div>
              <CodeBlock
                code={`import { MentiqAnalyticsProvider } from "mentiq-sdk";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MentiqAnalyticsProvider
          config={{
            projectId: "${projects?.[0]?.id || 'your-project-id'}",
            apiKey: "${apiKeys[projects?.[0]?.id]?.[0]?.key || 'mentiq_live_your_api_key'}",
            endpoint: "https://app.trymentiq.com",
            enableHeatmapTracking: true,
            enableSessionRecording: true,
          }}
        >
          {children}
        </MentiqAnalyticsProvider>
      </body>
    </html>
  );
}`}
                language="tsx"
                onCopy={() => handleCopyItem(`import { MentiqAnalyticsProvider } from "mentiq-sdk";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MentiqAnalyticsProvider
          config={{
            projectId: "${projects?.[0]?.id || 'your-project-id'}",
            apiKey: "${apiKeys[projects?.[0]?.id]?.[0]?.key || 'mentiq_live_your_api_key'}",
            endpoint: "https://app.trymentiq.com",
            enableHeatmapTracking: true,
            enableSessionRecording: true,
          }}
        >
          {children}
        </MentiqAnalyticsProvider>
      </body>
    </html>
  );
}`)}
                isCopied={copiedItem?.includes("MentiqAnalyticsProvider") || false}
              />
            </div>

            {/* Step 3: Track Events */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#4318FF]/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#4318FF]">3</span>
                </div>
                <Label className="text-[#2B3674] font-semibold">Track Custom Events</Label>
              </div>
              <CodeBlock
                code={`import { useAnalytics } from "mentiq-sdk";

function SignupButton() {
  const { track } = useAnalytics();

  const handleClick = () => {
    track("button_clicked", {
      button_name: "signup_cta",
      page: "homepage",
      position: "hero",
    });
  };

  return <button onClick={handleClick}>Sign Up</button>;
}`}
                language="tsx"
                onCopy={() => handleCopyItem(`import { useAnalytics } from "mentiq-sdk";

function SignupButton() {
  const { track } = useAnalytics();

  const handleClick = () => {
    track("button_clicked", {
      button_name: "signup_cta",
      page: "homepage",
      position: "hero",
    });
  };

  return <button onClick={handleClick}>Sign Up</button>;
}`)}
                isCopied={(copiedItem?.includes("useAnalytics") && !copiedItem?.includes("identify")) || false}
              />
            </div>

            {/* Step 4: Identify Users */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#4318FF]/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#4318FF]">4</span>
                </div>
                <Label className="text-[#2B3674] font-semibold">Identify Users</Label>
              </div>
              <CodeBlock
                code={`import { useAnalytics } from "mentiq-sdk";

function LoginHandler() {
  const { identify } = useAnalytics();

  const handleLogin = async (user) => {
    identify(user.id, {
      email: user.email,
      name: user.name,
      plan: user.subscription.plan,
    });
  };
}`}
                language="tsx"
                onCopy={() => handleCopyItem(`import { useAnalytics } from "mentiq-sdk";

function LoginHandler() {
  const { identify } = useAnalytics();

  const handleLogin = async (user) => {
    identify(user.id, {
      email: user.email,
      name: user.name,
      plan: user.subscription.plan,
    });
  };
}`)}
                isCopied={copiedItem?.includes("identify") || false}
              />
            </div>

            {/* Features & Docs Link */}
            <div className="bg-[#F4F7FE] rounded-xl p-4 mt-6">
              <p className="font-semibold text-[#2B3674] mb-3">Available Features:</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-[#2B3674] mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-[#05CD99]/20 flex items-center justify-center">
                    <svg className="h-2.5 w-2.5 text-[#05CD99]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span>Event Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-[#05CD99]/20 flex items-center justify-center">
                    <svg className="h-2.5 w-2.5 text-[#05CD99]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span>Heatmap Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-[#05CD99]/20 flex items-center justify-center">
                    <svg className="h-2.5 w-2.5 text-[#05CD99]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span>Session Recording</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-[#05CD99]/20 flex items-center justify-center">
                    <svg className="h-2.5 w-2.5 text-[#05CD99]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span>User Identification</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-[#05CD99]/20 flex items-center justify-center">
                    <svg className="h-2.5 w-2.5 text-[#05CD99]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span>Page View Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-[#05CD99]/20 flex items-center justify-center">
                    <svg className="h-2.5 w-2.5 text-[#05CD99]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span>Error Tracking</span>
                </div>
              </div>
              <p className="text-sm text-[#4363C7]">
                📚 Full documentation:{" "}
                <a
                  href="/docs"
                  className="text-[#4318FF] hover:underline font-medium"
                >
                  View SDK Docs
                </a>
                {" "}or{" "}
                <a
                  href="https://github.com/AslamSDM/mentiq-sdk#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4318FF] hover:underline font-medium"
                >
                  GitHub README
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
