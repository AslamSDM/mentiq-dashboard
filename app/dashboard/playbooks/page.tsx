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
import { PlaybookCard } from "@/components/playbook-card";
import { usePlaybooksState, useStore } from "@/lib/store";
import { useEffectiveProjectId } from "@/hooks/use-effective-project";
import { useToast } from "@/hooks/use-toast";
import {
  Playbook,
  PlaybookData,
  parsePlaybookData,
  playbooksService,
} from "@/lib/services/playbooks";
import {
  Zap,
  TrendingUp,
  Users,
  Clock,
  Loader2,
  Sparkles,
  AlertTriangle,
  Rocket,
  UserPlus,
  Target,
} from "lucide-react";

type PlaybookType = "churn_prevention" | "growth_expansion" | "onboarding" | "feature_adoption";

const PLAYBOOK_TYPES = [
  {
    value: "churn_prevention" as PlaybookType,
    label: "Churn Prevention",
    description: "Reduce churn and retain at-risk users",
    icon: AlertTriangle,
    color: "text-red-500",
  },
  {
    value: "growth_expansion" as PlaybookType,
    label: "Growth & Expansion",
    description: "Drive upgrades and expansion revenue",
    icon: Rocket,
    color: "text-green-500",
  },
  {
    value: "onboarding" as PlaybookType,
    label: "Onboarding",
    description: "Optimize user activation and TTFV",
    icon: UserPlus,
    color: "text-blue-500",
  },
  {
    value: "feature_adoption" as PlaybookType,
    label: "Feature Adoption",
    description: "Increase core feature usage",
    icon: Target,
    color: "text-purple-500",
  },
];

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
    updatePlaybookStatus,
    deletePlaybook,
  } = usePlaybooksState();

  // Dialog states
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<PlaybookType>("churn_prevention");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data on mount and project change
  useEffect(() => {
    if (!effectiveProjectId || !isAuthenticated) return;
    fetchPlaybooks(true);
    fetchPlaybooksSummary(true);
  }, [effectiveProjectId, fetchPlaybooks, fetchPlaybooksSummary, isAuthenticated]);

  const handleGeneratePlaybook = async () => {
    if (!effectiveProjectId) return;

    setIsGenerating(true);
    try {
      // Generate playbook using AI
      const generation = await playbooksService.generatePlaybook(
        effectiveProjectId,
        selectedType
      );

      if (generation.status === "completed") {
        // Apply the generated playbook
        const playbook = await playbooksService.applyGeneratedPlaybook(
          effectiveProjectId,
          generation.id
        );

        toast({
          title: "Playbook Generated",
          description: `"${playbook.name}" has been created with AI-powered recommendations.`,
        });

        // Refresh the list
        fetchPlaybooks(true);
      } else if (generation.status === "failed") {
        throw new Error(generation.error_message || "Generation failed");
      }
    } catch (error: any) {
      console.error("Error generating playbook:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate playbook. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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

  const handleChecklistUpdate = async (
    playbook: Playbook,
    taskIndex: number,
    completed: boolean
  ) => {
    if (!effectiveProjectId) return;

    try {
      await playbooksService.updateChecklistItem(
        effectiveProjectId,
        playbook.id,
        taskIndex,
        completed
      );
      fetchPlaybooks(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update checklist item.",
        variant: "destructive",
      });
    }
  };

  // Separate LLM-generated playbooks from manual ones
  const llmPlaybooks = playbooks.filter((p) => p.source === "llm_generated");
  const manualPlaybooks = playbooks.filter((p) => p.source !== "llm_generated");

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
        title="AI Growth Playbooks"
        description="Data-driven recommendations powered by your SaaS metrics"
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
            <CardTitle className="text-sm font-medium">AI Generated</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{llmPlaybooks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">smart recommendations</p>
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

      {/* Generate New Playbook Section */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate AI Playbook
          </CardTitle>
          <CardDescription>
            Analyze your SaaS metrics and get actionable recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select
                value={selectedType}
                onValueChange={(v) => setSelectedType(v as PlaybookType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select playbook type" />
                </SelectTrigger>
                <SelectContent>
                  {PLAYBOOK_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className={`h-4 w-4 ${type.color}`} />
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                {PLAYBOOK_TYPES.find((t) => t.value === selectedType)?.description}
              </p>
            </div>
            <Button
              onClick={handleGeneratePlaybook}
              disabled={isGenerating}
              className="min-w-[200px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Data...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Generated Playbooks */}
      {llmPlaybooks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Recommendations
          </h2>
          <div className="space-y-6">
            {llmPlaybooks.map((playbook) => {
              const data = parsePlaybookData(playbook);
              if (!data) return null;

              return (
                <PlaybookCard
                  key={playbook.id}
                  playbook={playbook}
                  data={data}
                  onChecklistUpdate={(taskIndex, completed) =>
                    handleChecklistUpdate(playbook, taskIndex, completed)
                  }
                  onStatusChange={(status) => handleStatusChange(playbook, status)}
                  onDelete={() => {
                    setSelectedPlaybook(playbook);
                    setIsDeleteOpen(true);
                  }}
                  onClick={() => router.push(`/dashboard/playbooks/${playbook.id}`)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Manual Playbooks (Legacy) */}
      {manualPlaybooks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Manual Playbooks</CardTitle>
            <CardDescription>
              Custom workflows created manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {manualPlaybooks.map((playbook) => (
                <div
                  key={playbook.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/playbooks/${playbook.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{playbook.name}</h3>
                        <Badge variant="outline">{playbook.status}</Badge>
                        <Badge variant="outline">{playbook.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {playbook.description || "No description"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlaybook(playbook);
                          setIsDeleteOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {playbooks.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No playbooks yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Generate your first AI-powered playbook to get data-driven
              recommendations for reducing churn, improving engagement, and
              growing revenue.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playbook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedPlaybook?.name}&quot;? This
              action cannot be undone.
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
