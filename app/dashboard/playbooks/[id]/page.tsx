"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import { useEffectiveProjectId } from "@/hooks/use-effective-project";
import { useToast } from "@/hooks/use-toast";
import {
  playbooksService,
  Playbook,
  PlaybookStep,
  PlaybookTrigger,
  PlaybookEnrollment,
  CreateStepRequest,
  CreateTriggerRequest,
} from "@/lib/services/playbooks";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Mail,
  MessageSquare,
  Webhook,
  Clock,
  GitBranch,
  Flag,
  Play,
  Pause,
  Users,
  Loader2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Zap,
} from "lucide-react";

const ACTION_TYPES = [
  { value: "email", label: "Email", icon: Mail },
  { value: "in_app_message", label: "In-App Message", icon: MessageSquare },
  { value: "webhook", label: "Webhook", icon: Webhook },
  { value: "wait", label: "Wait", icon: Clock },
  { value: "condition", label: "Condition", icon: GitBranch },
  { value: "feature_flag", label: "Feature Flag", icon: Flag },
];

const TRIGGER_TYPES = [
  { value: "event", label: "Event-based" },
  { value: "metric_threshold", label: "Metric Threshold" },
  { value: "segment", label: "User Segment" },
  { value: "schedule", label: "Scheduled" },
];

export default function PlaybookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playbookId = params.id as string;
  const effectiveProjectId = useEffectiveProjectId();
  const { toast } = useToast();
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  // State
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [enrollments, setEnrollments] = useState<PlaybookEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  const [isTriggerDialogOpen, setIsTriggerDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<PlaybookStep | null>(null);
  const [editingTrigger, setEditingTrigger] = useState<PlaybookTrigger | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step form state
  const [stepName, setStepName] = useState("");
  const [stepDescription, setStepDescription] = useState("");
  const [stepActionType, setStepActionType] = useState("email");
  const [stepDelayMinutes, setStepDelayMinutes] = useState(0);
  const [stepConfig, setStepConfig] = useState<Record<string, any>>({});

  // Trigger form state
  const [triggerName, setTriggerName] = useState("");
  const [triggerType, setTriggerType] = useState("metric_threshold");
  const [triggerConditions, setTriggerConditions] = useState<Record<string, any>>({
    metric: "health_score",
    operator: "lt",
    value: 50,
  });

  // Fetch playbook data
  useEffect(() => {
    if (!effectiveProjectId || !isAuthenticated || !playbookId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [playbookData, enrollmentsData] = await Promise.all([
          playbooksService.getPlaybook(effectiveProjectId, playbookId),
          playbooksService.getEnrollments(effectiveProjectId, playbookId).catch(() => []),
        ]);
        setPlaybook(playbookData);
        setEnrollments(enrollmentsData);
      } catch (error) {
        console.error("Failed to fetch playbook:", error);
        toast({
          title: "Error",
          description: "Failed to load playbook details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [effectiveProjectId, playbookId, isAuthenticated, toast]);

  const refreshPlaybook = async () => {
    if (!effectiveProjectId || !playbookId) return;
    const data = await playbooksService.getPlaybook(effectiveProjectId, playbookId);
    setPlaybook(data);
  };

  // Step handlers
  const openStepDialog = (step?: PlaybookStep) => {
    if (step) {
      setEditingStep(step);
      setStepName(step.name);
      setStepDescription(step.description || "");
      setStepActionType(step.action_type);
      setStepDelayMinutes(step.delay_minutes);
      setStepConfig(step.action_config || {});
    } else {
      setEditingStep(null);
      setStepName("");
      setStepDescription("");
      setStepActionType("email");
      setStepDelayMinutes(0);
      setStepConfig({});
    }
    setIsStepDialogOpen(true);
  };

  const handleSaveStep = async () => {
    if (!effectiveProjectId || !playbookId || !stepName.trim()) return;

    setIsSubmitting(true);
    try {
      const stepData: CreateStepRequest = {
        name: stepName,
        description: stepDescription,
        action_type: stepActionType,
        delay_minutes: stepDelayMinutes,
        action_config: stepConfig,
      };

      if (editingStep) {
        await playbooksService.updateStep(
          effectiveProjectId,
          playbookId,
          editingStep.id,
          stepData
        );
        toast({ title: "Step updated" });
      } else {
        await playbooksService.addStep(effectiveProjectId, playbookId, stepData);
        toast({ title: "Step added" });
      }

      await refreshPlaybook();
      setIsStepDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save step.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!effectiveProjectId || !playbookId) return;

    try {
      await playbooksService.deleteStep(effectiveProjectId, playbookId, stepId);
      toast({ title: "Step deleted" });
      await refreshPlaybook();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete step.",
        variant: "destructive",
      });
    }
  };

  // Trigger handlers
  const openTriggerDialog = (trigger?: PlaybookTrigger) => {
    if (trigger) {
      setEditingTrigger(trigger);
      setTriggerName(trigger.name);
      setTriggerType(trigger.trigger_type);
      setTriggerConditions(trigger.conditions || {});
    } else {
      setEditingTrigger(null);
      setTriggerName("");
      setTriggerType("metric_threshold");
      setTriggerConditions({ metric: "health_score", operator: "lt", value: 50 });
    }
    setIsTriggerDialogOpen(true);
  };

  const handleSaveTrigger = async () => {
    if (!effectiveProjectId || !playbookId || !triggerName.trim()) return;

    setIsSubmitting(true);
    try {
      const triggerData: CreateTriggerRequest = {
        name: triggerName,
        trigger_type: triggerType as any,
        conditions: triggerConditions,
        is_enabled: true,
      };

      if (editingTrigger) {
        await playbooksService.updateTrigger(
          effectiveProjectId,
          playbookId,
          editingTrigger.id,
          triggerData
        );
        toast({ title: "Trigger updated" });
      } else {
        await playbooksService.createTrigger(effectiveProjectId, playbookId, triggerData);
        toast({ title: "Trigger created" });
      }

      await refreshPlaybook();
      setIsTriggerDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save trigger.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrigger = async (triggerId: string) => {
    if (!effectiveProjectId || !playbookId) return;

    try {
      await playbooksService.deleteTrigger(effectiveProjectId, playbookId, triggerId);
      toast({ title: "Trigger deleted" });
      await refreshPlaybook();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete trigger.",
        variant: "destructive",
      });
    }
  };

  const handleToggleTrigger = async (trigger: PlaybookTrigger) => {
    if (!effectiveProjectId || !playbookId) return;

    try {
      await playbooksService.toggleTrigger(
        effectiveProjectId,
        playbookId,
        trigger.id,
        !trigger.is_enabled
      );
      toast({
        title: trigger.is_enabled ? "Trigger disabled" : "Trigger enabled",
      });
      await refreshPlaybook();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle trigger.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (status: "active" | "paused" | "archived") => {
    if (!effectiveProjectId || !playbookId) return;

    try {
      await playbooksService.updatePlaybookStatus(effectiveProjectId, playbookId, status);
      toast({ title: `Playbook ${status}` });
      await refreshPlaybook();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const getActionIcon = (actionType: string) => {
    const action = ACTION_TYPES.find((a) => a.value === actionType);
    const Icon = action?.icon || Mail;
    return <Icon className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!playbook) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-semibold mb-2">Playbook not found</h2>
        <Button variant="outline" onClick={() => router.push("/dashboard/playbooks")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Playbooks
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/playbooks")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{playbook.name}</h1>
              <Badge
                className={
                  playbook.status === "active"
                    ? "bg-green-100 text-green-800"
                    : playbook.status === "paused"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {playbook.status}
              </Badge>
              {playbook.source === "llm_generated" && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI Generated
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {playbook.description || "No description"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {playbook.status === "draft" && (
            <Button onClick={() => handleStatusChange("active")}>
              <Play className="h-4 w-4 mr-2" />
              Activate
            </Button>
          )}
          {playbook.status === "active" && (
            <Button variant="outline" onClick={() => handleStatusChange("paused")}>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          {playbook.status === "paused" && (
            <Button onClick={() => handleStatusChange("active")}>
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="steps" className="space-y-4">
        <TabsList>
          <TabsTrigger value="steps">
            Steps ({playbook.steps?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="triggers">
            Triggers ({playbook.triggers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="enrollments">
            Enrollments ({enrollments.length})
          </TabsTrigger>
        </TabsList>

        {/* Steps Tab */}
        <TabsContent value="steps">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Workflow Steps</CardTitle>
                  <CardDescription>
                    Define the sequence of actions in this playbook
                  </CardDescription>
                </div>
                <Button onClick={() => openStepDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(!playbook.steps || playbook.steps.length === 0) ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No steps yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add steps to define what happens when users enter this playbook.
                  </p>
                  <Button onClick={() => openStepDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Step
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {playbook.steps
                    .sort((a, b) => a.step_order - b.step_order)
                    .map((step, index) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <GripVertical className="h-4 w-4 cursor-grab" />
                          <span className="font-mono text-sm w-6">
                            {index + 1}.
                          </span>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          {getActionIcon(step.action_type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{step.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {step.description || ACTION_TYPES.find(a => a.value === step.action_type)?.label}
                            {step.delay_minutes > 0 && (
                              <span className="ml-2">
                                • Wait {step.delay_minutes >= 1440
                                  ? `${Math.floor(step.delay_minutes / 1440)}d`
                                  : step.delay_minutes >= 60
                                  ? `${Math.floor(step.delay_minutes / 60)}h`
                                  : `${step.delay_minutes}m`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openStepDialog(step)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteStep(step.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Triggers Tab */}
        <TabsContent value="triggers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Triggers</CardTitle>
                  <CardDescription>
                    Define when users should automatically enter this playbook
                  </CardDescription>
                </div>
                <Button onClick={() => openTriggerDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Trigger
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(!playbook.triggers || playbook.triggers.length === 0) ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No triggers yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add triggers to automatically enroll users based on events or conditions.
                  </p>
                  <Button onClick={() => openTriggerDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Trigger
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {playbook.triggers.map((trigger) => (
                    <div
                      key={trigger.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{trigger.name}</span>
                          <Badge variant="outline">
                            {TRIGGER_TYPES.find(t => t.value === trigger.trigger_type)?.label}
                          </Badge>
                          <Badge
                            className={
                              trigger.is_enabled
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {trigger.is_enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {trigger.conditions?.metric && (
                            <>
                              When {trigger.conditions.metric}{" "}
                              {trigger.conditions.operator} {trigger.conditions.value}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleTrigger(trigger)}
                        >
                          {trigger.is_enabled ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openTriggerDialog(trigger)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteTrigger(trigger.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enrollments Tab */}
        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Users</CardTitle>
              <CardDescription>
                Users currently progressing through this playbook
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No enrollments yet</h3>
                  <p className="text-muted-foreground">
                    Users will appear here once they are enrolled in this playbook.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{enrollment.user_id}</div>
                        <div className="text-sm text-muted-foreground">
                          Step {enrollment.current_step_order} of{" "}
                          {playbook.steps?.length || 0}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          className={
                            enrollment.status === "active"
                              ? "bg-blue-100 text-blue-800"
                              : enrollment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {enrollment.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Enrolled{" "}
                          {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Step Dialog */}
      <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingStep ? "Edit Step" : "Add Step"}</DialogTitle>
            <DialogDescription>
              Configure the action for this step.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Step Name</Label>
              <Input
                placeholder="e.g., Welcome Email"
                value={stepName}
                onChange={(e) => setStepName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                placeholder="What does this step do?"
                value={stepDescription}
                onChange={(e) => setStepDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Action Type</Label>
              <Select value={stepActionType} onValueChange={setStepActionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      <div className="flex items-center gap-2">
                        <action.icon className="h-4 w-4" />
                        {action.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Delay (minutes)</Label>
              <Input
                type="number"
                min={0}
                value={stepDelayMinutes}
                onChange={(e) => setStepDelayMinutes(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Wait time before executing this step. Use 60 for 1 hour, 1440 for 1 day.
              </p>
            </div>
            {stepActionType === "email" && (
              <>
                <div className="grid gap-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="Email subject"
                    value={stepConfig.subject || ""}
                    onChange={(e) =>
                      setStepConfig({ ...stepConfig, subject: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Email content..."
                    value={stepConfig.message_content || ""}
                    onChange={(e) =>
                      setStepConfig({ ...stepConfig, message_content: e.target.value })
                    }
                  />
                </div>
              </>
            )}
            {stepActionType === "webhook" && (
              <div className="grid gap-2">
                <Label>Webhook URL</Label>
                <Input
                  placeholder="https://..."
                  value={stepConfig.url || ""}
                  onChange={(e) =>
                    setStepConfig({ ...stepConfig, url: e.target.value })
                  }
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStepDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStep} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingStep ? "Update Step" : "Add Step"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trigger Dialog */}
      <Dialog open={isTriggerDialogOpen} onOpenChange={setIsTriggerDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTrigger ? "Edit Trigger" : "Add Trigger"}
            </DialogTitle>
            <DialogDescription>
              Define when users should be enrolled in this playbook.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Trigger Name</Label>
              <Input
                placeholder="e.g., Low Health Score"
                value={triggerName}
                onChange={(e) => setTriggerName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Trigger Type</Label>
              <Select value={triggerType} onValueChange={setTriggerType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {triggerType === "metric_threshold" && (
              <>
                <div className="grid gap-2">
                  <Label>Metric</Label>
                  <Select
                    value={triggerConditions.metric || "health_score"}
                    onValueChange={(v) =>
                      setTriggerConditions({ ...triggerConditions, metric: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health_score">Health Score</SelectItem>
                      <SelectItem value="churn_risk_score">Churn Risk Score</SelectItem>
                      <SelectItem value="days_since_login">Days Since Login</SelectItem>
                      <SelectItem value="session_count">Session Count</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Operator</Label>
                    <Select
                      value={triggerConditions.operator || "lt"}
                      onValueChange={(v) =>
                        setTriggerConditions({ ...triggerConditions, operator: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lt">Less than</SelectItem>
                        <SelectItem value="lte">Less than or equal</SelectItem>
                        <SelectItem value="gt">Greater than</SelectItem>
                        <SelectItem value="gte">Greater than or equal</SelectItem>
                        <SelectItem value="eq">Equal to</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Value</Label>
                    <Input
                      type="number"
                      value={triggerConditions.value || 0}
                      onChange={(e) =>
                        setTriggerConditions({
                          ...triggerConditions,
                          value: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </>
            )}
            {triggerType === "event" && (
              <div className="grid gap-2">
                <Label>Event Type</Label>
                <Input
                  placeholder="e.g., signup_completed"
                  value={triggerConditions.event_type || ""}
                  onChange={(e) =>
                    setTriggerConditions({
                      ...triggerConditions,
                      event_type: e.target.value,
                    })
                  }
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTriggerDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTrigger} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingTrigger ? "Update Trigger" : "Add Trigger"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
