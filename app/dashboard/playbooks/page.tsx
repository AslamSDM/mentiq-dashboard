"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePlaybooksState, useStore } from "@/lib/store";
import { useEffectiveProjectId } from "@/hooks/use-effective-project";
import { useToast } from "@/hooks/use-toast";
import { Playbook } from "@/lib/services/playbooks";
import {
  Zap,
  Play,
  Pause,
  Trash2,
  Settings,
  Users,
  TrendingUp,
  Clock,
  Loader2,
  Plus,
  Sparkles,
} from "lucide-react";

export default function PlaybooksPage() {
  const router = useRouter();
  const effectiveProjectId = useEffectiveProjectId();
  const { toast } = useToast();
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  const {
    playbooks,
    playbooksSummary,
    loadingPlaybooks,
    fetchPlaybooks,
    fetchPlaybooksSummary,
    createPlaybook,
    updatePlaybookStatus,
    deletePlaybook,
  } = usePlaybooksState();

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [newPlaybookName, setNewPlaybookName] = useState("");
  const [newPlaybookDescription, setNewPlaybookDescription] = useState("");
  const [newPlaybookType, setNewPlaybookType] = useState<
    "churn_prevention" | "growth_expansion" | "onboarding" | "engagement"
  >("onboarding");

  // Fetch data on mount and project change
  useEffect(() => {
    if (!effectiveProjectId || !isAuthenticated) return;
    fetchPlaybooks(true);
    fetchPlaybooksSummary(true);
  }, [effectiveProjectId, fetchPlaybooks, fetchPlaybooksSummary, isAuthenticated]);

  const handleCreatePlaybook = async () => {
    if (!newPlaybookName.trim()) {
      toast({
        title: "Error",
        description: "Playbook name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const playbook = await createPlaybook({
        name: newPlaybookName,
        description: newPlaybookDescription,
        type: newPlaybookType,
      });
      toast({
        title: "Playbook created",
        description: `"${playbook.name}" has been created successfully.`,
      });
      setIsCreateOpen(false);
      setNewPlaybookName("");
      setNewPlaybookDescription("");
      setNewPlaybookType("onboarding");
      // Navigate to the playbook detail page
      router.push(`/dashboard/playbooks/${playbook.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create playbook. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (
    playbook: Playbook,
    newStatus: "active" | "paused" | "archived"
  ) => {
    try {
      await updatePlaybookStatus(playbook.id, newStatus);
      toast({
        title: "Status updated",
        description: `"${playbook.name}" is now ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update playbook status.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedPlaybook) return;

    setIsSubmitting(true);
    try {
      await deletePlaybook(selectedPlaybook.id);
      toast({
        title: "Playbook deleted",
        description: `"${selectedPlaybook.name}" has been deleted.`,
      });
      setIsDeleteOpen(false);
      setSelectedPlaybook(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete playbook.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case "archived":
        return <Badge className="bg-red-100 text-red-800">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      churn_prevention: "Churn Prevention",
      growth_expansion: "Growth",
      onboarding: "Onboarding",
      engagement: "Engagement",
    };
    return (
      <Badge variant="outline" className="text-xs">
        {typeLabels[type] || type}
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    if (source === "llm_generated") {
      return (
        <Badge variant="secondary" className="text-xs gap-1">
          <Sparkles className="h-3 w-3" />
          AI Generated
        </Badge>
      );
    }
    return null;
  };

  if (loadingPlaybooks) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader
        title="Growth Playbooks"
        description="Automated workflows to drive user engagement and growth"
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Playbooks</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {playbooksSummary?.active_playbooks ??
                playbooks.filter((p) => p.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Triggers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {playbooksSummary?.total_triggers ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">configured triggers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {playbooksSummary?.completion_rate?.toFixed(1) ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">average completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {playbooksSummary?.in_progress ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              active enrollments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Playbooks List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Playbooks</CardTitle>
              <CardDescription>
                Manage your automated growth workflows
              </CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Playbook
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Playbook</DialogTitle>
                  <DialogDescription>
                    Set up a new automated workflow to engage your users.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Onboarding Flow"
                      value={newPlaybookName}
                      onChange={(e) => setNewPlaybookName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this playbook does..."
                      value={newPlaybookDescription}
                      onChange={(e) => setNewPlaybookDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newPlaybookType}
                      onValueChange={(v) => setNewPlaybookType(v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onboarding">Onboarding</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="churn_prevention">
                          Churn Prevention
                        </SelectItem>
                        <SelectItem value="growth_expansion">
                          Growth & Expansion
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePlaybook} disabled={isSubmitting}>
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Create Playbook
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {playbooks.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No playbooks yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first playbook to automate user engagement.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Playbook
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {playbooks.map((playbook) => (
                <div
                  key={playbook.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3
                          className="font-semibold cursor-pointer hover:text-primary"
                          onClick={() =>
                            router.push(`/dashboard/playbooks/${playbook.id}`)
                          }
                        >
                          {playbook.name}
                        </h3>
                        {getStatusBadge(playbook.status)}
                        {getTypeBadge(playbook.type)}
                        {getSourceBadge(playbook.source)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {playbook.description || "No description"}
                      </p>
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-muted-foreground">Steps: </span>
                          <span className="font-medium">
                            {playbook.steps?.length ?? 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Enrolled:{" "}
                          </span>
                          <span className="font-medium">
                            {playbook.total_enrolled ?? 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Completed:{" "}
                          </span>
                          <span className="font-medium">
                            {playbook.completed_count ?? 0}
                          </span>
                        </div>
                        {(playbook.total_enrolled ?? 0) > 0 && (
                          <div>
                            <span className="text-muted-foreground">Rate: </span>
                            <span className="font-medium">
                              {(
                                ((playbook.completed_count ?? 0) /
                                  (playbook.total_enrolled ?? 1)) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/playbooks/${playbook.id}`)
                        }
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      {playbook.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(playbook, "paused")}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      {playbook.status === "paused" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(playbook, "active")}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                      )}
                      {playbook.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(playbook, "active")}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Activate
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setSelectedPlaybook(playbook);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playbook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedPlaybook?.name}"? This
              action cannot be undone. All steps, triggers, and enrollment data
              will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
