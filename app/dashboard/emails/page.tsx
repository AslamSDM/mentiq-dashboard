"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { PageShell } from "@/components/page-shell";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  automationService,
  type AutomationExecution,
  type AutomationSettings,
} from "@/lib/services/automation";
import { useEffectiveProjectId } from "@/hooks/use-effective-project";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Mail,
  Eye,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Send,
  Pencil,
  RotateCcw,
} from "lucide-react";

const STATUS_BADGES: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2 }> = {
  sent: { variant: "default", icon: CheckCircle2 },
  pending: { variant: "secondary", icon: Clock },
  failed: { variant: "destructive", icon: XCircle },
  skipped: { variant: "outline", icon: Clock },
};

const TYPE_LABELS: Record<string, string> = {
  churn_prevention: "Churn Prevention",
  feature_adoption: "Feature Adoption",
  engagement: "Re-engagement",
};

export default function EmailsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const projectId = useEffectiveProjectId();

  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [automations, setAutomations] = useState<AutomationSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAutomation, setFilterAutomation] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Preview dialog
  const [previewExecution, setPreviewExecution] = useState<AutomationExecution | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Prompt editor dialog
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<AutomationSettings | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const [defaultPrompt, setDefaultPrompt] = useState("");
  const [savingPrompt, setSavingPrompt] = useState(false);

  // AI Preview dialog
  const [aiPreviewOpen, setAiPreviewOpen] = useState(false);
  const [aiPreviewLoading, setAiPreviewLoading] = useState(false);
  const [aiPreviewResult, setAiPreviewResult] = useState<{ subject: string; html: string; plain_text: string } | null>(null);
  const [previewUserName, setPreviewUserName] = useState("Jane Doe");
  const [previewUserEmail, setPreviewUserEmail] = useState("jane@example.com");

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const [execs, autos] = await Promise.all([
        automationService.getAutomationExecutions(
          projectId,
          filterAutomation !== "all" ? filterAutomation : undefined,
          undefined,
          filterStatus !== "all" ? filterStatus : undefined,
        ),
        automationService.getAutomations(projectId),
      ]);
      setExecutions(execs || []);
      setAutomations(autos || []);
    } catch {
      toast({ title: "Error", description: "Failed to load email data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [projectId, filterStatus, filterAutomation, toast]);

  useEffect(() => {
    if (session && projectId) fetchData();
  }, [session, projectId, fetchData]);

  const handlePreview = async (execution: AutomationExecution) => {
    // If execution already has stored email content, show it directly
    if (execution.email_html) {
      setPreviewExecution(execution);
      setPreviewOpen(true);
      return;
    }

    // Otherwise try to fetch full execution
    if (!projectId) return;
    setLoadingPreview(true);
    try {
      const full = await automationService.getAutomationExecution(projectId, execution.id);
      setPreviewExecution(full);
      setPreviewOpen(true);
    } catch {
      toast({ title: "Error", description: "Failed to load email content.", variant: "destructive" });
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleEditPrompt = async (automation: AutomationSettings) => {
    setEditingAutomation(automation);
    setPromptValue(automation.custom_prompt || "");
    // Fetch default prompt
    try {
      const result = await automationService.getDefaultPrompt(automation.type);
      setDefaultPrompt(result.default_prompt);
    } catch {
      setDefaultPrompt("");
    }
    setPromptDialogOpen(true);
  };

  const handleSavePrompt = async () => {
    if (!projectId || !editingAutomation) return;
    setSavingPrompt(true);
    try {
      await automationService.updateAutomation(projectId, editingAutomation.id, {
        custom_prompt: promptValue,
      });
      toast({ title: "Prompt Saved", description: "Custom prompt has been updated." });
      setPromptDialogOpen(false);
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to save prompt.", variant: "destructive" });
    } finally {
      setSavingPrompt(false);
    }
  };

  const handleResetPrompt = () => {
    setPromptValue("");
  };

  const handleGeneratePreview = async () => {
    if (!projectId || !editingAutomation) return;
    setAiPreviewLoading(true);
    setAiPreviewResult(null);
    setAiPreviewOpen(true);
    try {
      const result = await automationService.previewEmail(projectId, editingAutomation.id, {
        custom_prompt: promptValue || undefined,
        user_name: previewUserName,
        user_email: previewUserEmail,
      });
      setAiPreviewResult(result);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to generate preview.", variant: "destructive" });
      setAiPreviewOpen(false);
    } finally {
      setAiPreviewLoading(false);
    }
  };

  const automationNameMap = Object.fromEntries(automations.map((a) => [a.id, a]));

  const filteredExecutions = executions.filter((exec) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesUser = exec.user_id?.toLowerCase().includes(q);
      const matchesSubject = exec.email_subject?.toLowerCase().includes(q);
      const matchesPersonalization = JSON.stringify(exec.personalization || {}).toLowerCase().includes(q);
      if (!matchesUser && !matchesSubject && !matchesPersonalization) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <PageShell
      title="Automation Emails"
      description="View all sent automation emails, preview content, and customize AI prompts"
      breadcrumb="Pages / Sent Emails"
    >
      <div className="space-y-6">

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Sent</span>
            </div>
            <div className="text-2xl font-bold">
              {executions.filter((e) => e.status === "sent").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <div className="text-2xl font-bold">
              {executions.filter((e) => e.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Failed</span>
            </div>
            <div className="text-2xl font-bold">
              {executions.filter((e) => e.status === "failed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Automations</span>
            </div>
            <div className="text-2xl font-bold">{automations.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Prompt Editor per automation */}
      {automations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Prompts</CardTitle>
            <CardDescription>
              Customize the AI prompt for each automation to control how emails are generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {automations.map((automation) => (
                <div
                  key={automation.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{automation.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {TYPE_LABELS[automation.type] || automation.type}
                      </Badge>
                      {automation.custom_prompt && (
                        <Badge variant="secondary" className="text-xs">
                          Custom prompt
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {automation.custom_prompt
                        ? automation.custom_prompt.slice(0, 120) + (automation.custom_prompt.length > 120 ? "..." : "")
                        : "Using default system prompt"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEditPrompt(automation)}>
                    <Pencil className="mr-2 h-3 w-3" />
                    Edit Prompt
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by user, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAutomation} onValueChange={setFilterAutomation}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Automation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Automations</SelectItem>
                {automations.filter((a) => a.id).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Emails table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sent Emails</CardTitle>
          <CardDescription>{filteredExecutions.length} emails</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredExecutions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Mail className="mb-4 h-12 w-12" />
              <p>No automation emails found.</p>
              <p className="text-sm">Emails will appear here once automations start running.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Automation</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExecutions.map((exec) => {
                  const automation = automationNameMap[exec.automation_id];
                  const statusInfo = STATUS_BADGES[exec.status] || STATUS_BADGES.pending;
                  const StatusIcon = statusInfo.icon;
                  const subject =
                    exec.email_subject ||
                    (exec.personalization?.generated_subject as string) ||
                    (exec.execution_result?.subject as string) ||
                    "—";

                  return (
                    <TableRow key={exec.id}>
                      <TableCell className="max-w-[250px] truncate font-medium">
                        {subject}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {TYPE_LABELS[automation?.type] || automation?.name || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {(exec.personalization?.user_name as string) || exec.user_id}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {exec.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {exec.sent_at
                          ? new Date(exec.sent_at).toLocaleDateString()
                          : new Date(exec.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(exec)}
                          disabled={loadingPreview}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Preview
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Email Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Preview
            </DialogTitle>
            <DialogDescription>
              {previewExecution?.email_subject ||
                (previewExecution?.personalization?.generated_subject as string) ||
                "Automation Email"}
            </DialogDescription>
          </DialogHeader>

          {previewExecution && (
            <div className="space-y-4">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3 rounded-lg border p-4 text-sm">
                <div>
                  <span className="text-muted-foreground">To: </span>
                  <span>{(previewExecution.personalization?.user_email as string) || previewExecution.user_id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status: </span>
                  <Badge variant={STATUS_BADGES[previewExecution.status]?.variant || "secondary"}>
                    {previewExecution.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Subject: </span>
                  <span className="font-medium">
                    {previewExecution.email_subject || (previewExecution.personalization?.generated_subject as string) || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Sent: </span>
                  <span>
                    {previewExecution.sent_at
                      ? new Date(previewExecution.sent_at).toLocaleString()
                      : "Not sent yet"}
                  </span>
                </div>
              </div>

              {/* Email content tabs */}
              <Tabs defaultValue="html" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="html">HTML Preview</TabsTrigger>
                  <TabsTrigger value="text">Plain Text</TabsTrigger>
                </TabsList>
                <TabsContent value="html">
                  {previewExecution.email_html || previewExecution.personalization?.generated_body ? (
                    <div className="rounded-lg border bg-white">
                      <iframe
                        srcDoc={previewExecution.email_html || (previewExecution.personalization?.generated_body as string)}
                        className="h-[500px] w-full rounded-lg"
                        sandbox="allow-same-origin"
                        title="Email preview"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center rounded-lg border py-16 text-muted-foreground">
                      No HTML content stored for this email.
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="text">
                  {previewExecution.email_plain_text ? (
                    <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap rounded-lg border bg-muted p-4 text-sm">
                      {previewExecution.email_plain_text}
                    </pre>
                  ) : (
                    <div className="flex items-center justify-center rounded-lg border py-16 text-muted-foreground">
                      No plain text content stored for this email.
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Prompt Editor Dialog */}
      <Dialog open={promptDialogOpen} onOpenChange={setPromptDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Edit AI Prompt — {editingAutomation?.name}
            </DialogTitle>
            <DialogDescription>
              Customize how the AI generates emails for this automation.
              Leave empty to use the default system prompt.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {defaultPrompt && (
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Default System Prompt (for reference)
                </label>
                <pre className="max-h-[150px] overflow-auto whitespace-pre-wrap rounded-lg border bg-muted p-3 text-xs">
                  {defaultPrompt}
                </pre>
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium">
                Custom Prompt
              </label>
              <Textarea
                placeholder="Write your custom instructions for the AI email generator..."
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                The AI will receive user context (name, email, risk score, etc.) automatically.
                Focus on tone, structure, and goals.
              </p>
            </div>

            {/* Preview test inputs */}
            <div className="rounded-lg border p-4">
              <label className="mb-2 block text-sm font-medium">Test Preview</label>
              <div className="mb-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Sample user name</label>
                  <Input
                    value={previewUserName}
                    onChange={(e) => setPreviewUserName(e.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Sample user email</label>
                  <Input
                    value={previewUserEmail}
                    onChange={(e) => setPreviewUserEmail(e.target.value)}
                    placeholder="jane@example.com"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={handleGeneratePreview} disabled={aiPreviewLoading}>
                {aiPreviewLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" />
                )}
                Generate Preview
              </Button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={handleResetPrompt}>
                <RotateCcw className="mr-2 h-3 w-3" />
                Reset to Default
              </Button>
              <Button onClick={handleSavePrompt} disabled={savingPrompt}>
                {savingPrompt ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Save Prompt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Preview Result Dialog */}
      <Dialog open={aiPreviewOpen} onOpenChange={setAiPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI-Generated Email Preview
            </DialogTitle>
            <DialogDescription>
              This is a demo preview — no email was sent.
            </DialogDescription>
          </DialogHeader>

          {aiPreviewLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Generating email with AI...</p>
            </div>
          )}

          {aiPreviewResult && !aiPreviewLoading && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <span className="text-sm text-muted-foreground">Subject: </span>
                <span className="font-medium">{aiPreviewResult.subject}</span>
              </div>

              <Tabs defaultValue="html" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="html">HTML Preview</TabsTrigger>
                  <TabsTrigger value="text">Plain Text</TabsTrigger>
                </TabsList>
                <TabsContent value="html">
                  <div className="rounded-lg border bg-white">
                    <iframe
                      srcDoc={aiPreviewResult.html}
                      className="h-[500px] w-full rounded-lg"
                      sandbox="allow-same-origin"
                      title="AI preview"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="text">
                  <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap rounded-lg border bg-muted p-4 text-sm">
                    {aiPreviewResult.plain_text}
                  </pre>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </PageShell>
  );
}
