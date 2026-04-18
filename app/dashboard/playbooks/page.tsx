"use client";

import { useEffect, useState } from "react";
import { useEffectiveProjectId } from "@/hooks/use-effective-project";
import { useToast } from "@/hooks/use-toast";
import { PageShell } from "@/components/page-shell";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Mail,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Target,
  TrendingUp,
  Trash2,
  RefreshCw,
  Settings,
  Plus,
  Zap,
  Send,
  Play,
  FlaskConical,
  Globe,
  Palette,
  Type,
  Ban,
} from "lucide-react";
import {
  automationService,
  AutomationSettings,
  AutomationExecution,
  DiscountCode,
  CreateAutomationRequest,
  BrandProfile,
  BrandSettings,
} from "@/lib/services/automation";
import {
  integrationsService,
  ProjectIntegration,
  MailchimpSettings,
} from "@/lib/services/integrations";

type AutomationType = "churn_prevention" | "feature_adoption" | "engagement";

const AUTOMATION_TYPES: {
  value: AutomationType;
  label: string;
  description: string;
  icon: typeof ShieldAlert;
  color: string;
}[] = [
  {
    value: "churn_prevention",
    label: "Churn Prevention",
    description: "Automatically email at-risk users with retention offers",
    icon: ShieldAlert,
    color: "text-red-500",
  },
  {
    value: "feature_adoption",
    label: "Feature Adoption",
    description: "Nudge users to try unused features",
    icon: Target,
    color: "text-purple-500",
  },
  {
    value: "engagement",
    label: "Engagement",
    description: "Re-engage inactive or low-activity users",
    icon: TrendingUp,
    color: "text-blue-500",
  },
];

function getDefaultConfig(type: AutomationType): Record<string, any> {
  switch (type) {
    case "churn_prevention":
      return { risk_threshold: 70, discount_percent: 20, cooldown_days: 30 };
    case "feature_adoption":
      return { unused_features_threshold_days: 14 };
    case "engagement":
      return { engagement_threshold: 30, inactivity_days: 14 };
  }
}

export default function EmailAutomationsPage() {
  const effectiveProjectId = useEffectiveProjectId();
  const { toast } = useToast();

  // Data state
  const [mailchimp, setMailchimp] = useState<ProjectIntegration | null>(null);
  const [resend, setResend] = useState<ProjectIntegration | null>(null);
  const [sendgrid, setSendgrid] = useState<ProjectIntegration | null>(null);
  const [automations, setAutomations] = useState<AutomationSettings[]>([]);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [selectedType, setSelectedType] = useState<AutomationType>("churn_prevention");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formEnabled, setFormEnabled] = useState(true);
  const [formConfig, setFormConfig] = useState<Record<string, any>>(
    getDefaultConfig("churn_prevention")
  );
  const [creating, setCreating] = useState(false);

  // Discount code form
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(20);
  const [discountMaxUses, setDiscountMaxUses] = useState(100);
  const [creatingDiscount, setCreatingDiscount] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<AutomationSettings | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Test dialog
  const [testTarget, setTestTarget] = useState<AutomationSettings | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [testName, setTestName] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    execution?: any;
    email_content?: Record<string, string>;
  } | null>(null);

  // Trigger state
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  // Brand profile dialog
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [brandWebsiteUrl, setBrandWebsiteUrl] = useState("");
  const [brandTone, setBrandTone] = useState("");
  const [brandStyle, setBrandStyle] = useState("");
  const [brandWordsToAvoid, setBrandWordsToAvoid] = useState("");
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [crawling, setCrawling] = useState(false);

  // Preview tab
  const [testPreviewTab, setTestPreviewTab] = useState<"html" | "text">("html");

  // Integration actions
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connectingResend, setConnectingResend] = useState(false);
  const [resendApiKey, setResendApiKey] = useState("");
  const [connectingSendgrid, setConnectingSendgrid] = useState(false);
  const [sendgridApiKey, setSendgridApiKey] = useState("");

  // Fetch all data on mount
  useEffect(() => {
    if (!effectiveProjectId) return;

    const fetchAll = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        integrationsService.getIntegration(effectiveProjectId, "mailchimp"),
        automationService.getAutomations(effectiveProjectId),
        automationService.getAutomationExecutions(effectiveProjectId),
        automationService.getDiscountCodes(effectiveProjectId),
        integrationsService.getIntegration(effectiveProjectId, "resend"),
        integrationsService.getIntegration(effectiveProjectId, "sendgrid"),
      ]);

      if (results[0].status === "fulfilled") setMailchimp(results[0].value);
      if (results[1].status === "fulfilled") setAutomations(results[1].value ?? []);
      if (results[2].status === "fulfilled") setExecutions(results[2].value ?? []);
      if (results[3].status === "fulfilled") setDiscountCodes(results[3].value ?? []);
      if (results[4].status === "fulfilled") setResend(results[4].value);
      if (results[5].status === "fulfilled") setSendgrid(results[5].value);

      setLoading(false);
    };

    fetchAll();
  }, [effectiveProjectId]);

  // Handlers
  const handleConnectMailchimp = async () => {
    if (!effectiveProjectId) return;
    setConnecting(true);
    try {
      const { auth_url } = await integrationsService.connectMailchimp(effectiveProjectId);
      window.open(auth_url, "_blank");
    } catch (error: any) {
      toast({ title: "Connection Failed", description: error.message, variant: "destructive" });
    } finally {
      setConnecting(false);
    }
  };

  const handleSyncMailchimp = async () => {
    if (!effectiveProjectId) return;
    setSyncing(true);
    try {
      const result = await integrationsService.triggerMailchimpSync(effectiveProjectId);
      toast({
        title: "Sync Complete",
        description: `Synced ${result.contacts_synced} contacts in ${result.duration_ms}ms.`,
      });
      // Refresh integration status
      const updated = await integrationsService.getIntegration(effectiveProjectId, "mailchimp");
      setMailchimp(updated);
    } catch (error: any) {
      toast({ title: "Sync Failed", description: error.message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectResend = async () => {
    if (!effectiveProjectId || !resendApiKey.trim()) return;
    setConnectingResend(true);
    try {
      await integrationsService.connectResend(effectiveProjectId, { api_key: resendApiKey.trim() });
      const updated = await integrationsService.getIntegration(effectiveProjectId, "resend");
      setResend(updated);
      setResendApiKey("");
      toast({ title: "Connected", description: "Resend integration connected successfully." });
    } catch (error: any) {
      toast({ title: "Connection Failed", description: error.message, variant: "destructive" });
    } finally {
      setConnectingResend(false);
    }
  };

  const handleConnectSendgrid = async () => {
    if (!effectiveProjectId || !sendgridApiKey.trim()) return;
    setConnectingSendgrid(true);
    try {
      await integrationsService.connectSendGrid(effectiveProjectId, { api_key: sendgridApiKey.trim() });
      const updated = await integrationsService.getIntegration(effectiveProjectId, "sendgrid");
      setSendgrid(updated);
      setSendgridApiKey("");
      toast({ title: "Connected", description: "SendGrid integration connected successfully." });
    } catch (error: any) {
      toast({ title: "Connection Failed", description: error.message, variant: "destructive" });
    } finally {
      setConnectingSendgrid(false);
    }
  };

  const handleCrawlBrand = async () => {
    if (!brandWebsiteUrl.trim()) return;
    setCrawling(true);
    try {
      const profile = await automationService.crawlBrandProfile(brandWebsiteUrl.trim());
      setBrandProfile(profile);
      toast({ title: "Brand Profile Loaded", description: `Detected: ${profile.company_name || "Unknown"}` });
    } catch (error: any) {
      toast({ title: "Crawl Failed", description: error.message, variant: "destructive" });
    } finally {
      setCrawling(false);
    }
  };

  const handleSaveBrandSettings = () => {
    const brandSettings: BrandSettings = {
      website_url: brandWebsiteUrl,
      tone: brandTone,
      style: brandStyle,
      words_to_avoid: brandWordsToAvoid,
      brand_profile: brandProfile || undefined,
    };
    setFormConfig((c) => ({ ...c, brand_settings: brandSettings }));
    setBrandDialogOpen(false);
    toast({ title: "Brand Settings Saved", description: "Brand profile will be used in email generation." });
  };

  const handleCreateAutomation = async () => {
    if (!effectiveProjectId || !formName.trim()) return;
    setCreating(true);
    try {
      const data: CreateAutomationRequest = {
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        type: selectedType,
        config: formConfig,
        is_enabled: formEnabled,
      };
      const created = await automationService.createAutomation(effectiveProjectId, data);
      setAutomations((prev) => [...prev, created]);
      setFormName("");
      setFormDescription("");
      setFormEnabled(true);
      setBrandWebsiteUrl("");
      setBrandTone("");
      setBrandStyle("");
      setBrandWordsToAvoid("");
      setBrandProfile(null);
      toast({ title: "Automation Created", description: `"${created.name}" is ready.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleAutomation = async (automation: AutomationSettings) => {
    if (!effectiveProjectId) return;
    try {
      const updated = await automationService.updateAutomation(
        effectiveProjectId,
        automation.id,
        { is_enabled: !automation.is_enabled }
      );
      setAutomations((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteAutomation = async () => {
    if (!effectiveProjectId || !deleteTarget) return;
    setDeleting(true);
    try {
      await automationService.deleteAutomation(effectiveProjectId, deleteTarget.id);
      setAutomations((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      toast({ title: "Deleted", description: `"${deleteTarget.name}" has been removed.` });
      setDeleteTarget(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateDiscountCode = async () => {
    if (!effectiveProjectId || !discountCode.trim()) return;
    setCreatingDiscount(true);
    try {
      const created = await automationService.createDiscountCode(effectiveProjectId, {
        code: discountCode.trim().toUpperCase(),
        discount_percent: discountPercent,
        max_uses: discountMaxUses,
        is_active: true,
      });
      setDiscountCodes((prev) => [...prev, created]);
      setDiscountCode("");
      toast({ title: "Discount Code Created", description: `Code "${created.code}" is active.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setCreatingDiscount(false);
    }
  };

  // Update config when type changes
  const handleTypeSelect = (type: AutomationType) => {
    setSelectedType(type);
    setFormConfig(getDefaultConfig(type));
  };

  // Trigger automation to run immediately
  const handleTriggerAutomation = async (automation: AutomationSettings) => {
    if (!effectiveProjectId) return;
    setTriggeringId(automation.id);
    try {
      await automationService.triggerAutomation(effectiveProjectId, automation.id);
      toast({
        title: "Automation Triggered",
        description: `"${automation.name}" is now processing eligible users.`,
      });
      // Refresh executions after a short delay
      setTimeout(async () => {
        const execs = await automationService.getAutomationExecutions(effectiveProjectId);
        setExecutions(execs ?? []);
      }, 2000);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setTriggeringId(null);
    }
  };

  // Test automation with sample user
  const handleTestAutomation = async () => {
    if (!effectiveProjectId || !testTarget || !testEmail.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await automationService.testAutomation(effectiveProjectId, testTarget.id, {
        user_id: `test-${Date.now()}`,
        email: testEmail.trim(),
        name: testName.trim() || "Test User",
      });
      setTestResult(result);
      toast({
        title: "Test Completed",
        description: "Check the generated email content below.",
      });
      // Refresh executions
      const execs = await automationService.getAutomationExecutions(effectiveProjectId);
      setExecutions(execs ?? []);
    } catch (error: any) {
      toast({ title: "Test Failed", description: error.message, variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  const openTestDialog = (automation: AutomationSettings) => {
    setTestTarget(automation);
    setTestEmail("");
    setTestName("");
    setTestResult(null);
  };

  // Derived stats
  const activeCount = automations.filter((a) => a.is_enabled).length;
  const emailsSent = executions.filter((e) => e.status === "sent").length;
  const churnPreventionCount = automations.filter(
    (a) => a.type === "churn_prevention" && a.is_enabled
  ).length;
  const featureAdoptionCount = automations.filter(
    (a) => a.type === "feature_adoption" && a.is_enabled
  ).length;

  const mcSettings = mailchimp?.settings as MailchimpSettings | undefined;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <PageShell
      title="Email Automations"
      description="Create and manage automated email campaigns"
      breadcrumb="Pages / Automations"
    >
      <div className="space-y-6">
      {/* Email Provider Connections */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Mailchimp */}
        {!mailchimp?.is_active ? (
          <Card className="border border-[#E7E5E4] bg-white">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#FFE01B]/15 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-[#FFE01B]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "#1C1917" }}>Mailchimp</h3>
                  <p className="text-xs" style={{ color: "#78716C" }}>Email marketing & audience sync</p>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs"
                onClick={handleConnectMailchimp}
                disabled={connecting}
              >
                {connecting ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                )}
                Connect
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-green-900 truncate">
                    Mailchimp Connected
                    {mcSettings?.account_name && (
                      <span className="text-green-700 font-normal"> — {mcSettings.account_name}</span>
                    )}
                  </p>
                  <p className="text-xs text-green-700 truncate">
                    {mcSettings?.audience_name && `Audience: ${mcSettings.audience_name}`}
                    {mailchimp.last_sync_at && (
                      <span>
                        {mcSettings?.audience_name ? " · " : ""}
                        Last sync: {new Date(mailchimp.last_sync_at).toLocaleString()}
                      </span>
                    )}
                    {mailchimp.sync_status === "syncing" && " · Syncing..."}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                  <a href="/dashboard/settings/integrations">
                    <Settings className="h-3.5 w-3.5 mr-1" />
                    Settings
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={handleSyncMailchimp}
                  disabled={syncing}
                >
                  {syncing ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  )}
                  Sync
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resend */}
        {!resend?.is_active ? (
          <Card className="border border-[#E7E5E4] bg-white">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#1C1917]/8 flex items-center justify-center shrink-0">
                  <Send className="h-5 w-5 text-[#1C1917]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "#1C1917" }}>Resend</h3>
                  <p className="text-xs" style={{ color: "#78716C" }}>Transactional email API</p>
                </div>
              </div>
              <Input
                type="password"
                placeholder="Resend API Key"
                value={resendApiKey}
                onChange={(e) => setResendApiKey(e.target.value)}
                className="text-xs"
              />
              <Button
                size="sm"
                className="w-full bg-[#1C1917] hover:bg-[#1C1917]/90 text-white text-xs"
                onClick={handleConnectResend}
                disabled={connectingResend || !resendApiKey.trim()}
              >
                {connectingResend ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                )}
                Connect
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-green-900 truncate">Resend Connected</p>
                  <p className="text-xs text-green-700 truncate">Transactional email API</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                <a href="/dashboard/settings/integrations">
                  <Settings className="h-3.5 w-3.5 mr-1" />
                  Settings
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* SendGrid */}
        {!sendgrid?.is_active ? (
          <Card className="border border-[#E7E5E4] bg-white">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-[#2563EB]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "#1C1917" }}>SendGrid</h3>
                  <p className="text-xs" style={{ color: "#78716C" }}>Scalable email delivery</p>
                </div>
              </div>
              <Input
                type="password"
                placeholder="SendGrid API Key"
                value={sendgridApiKey}
                onChange={(e) => setSendgridApiKey(e.target.value)}
                className="text-xs"
              />
              <Button
                size="sm"
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs"
                onClick={handleConnectSendgrid}
                disabled={connectingSendgrid || !sendgridApiKey.trim()}
              >
                {connectingSendgrid ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                )}
                Connect
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-green-900 truncate">SendGrid Connected</p>
                  <p className="text-xs text-green-700 truncate">Scalable email delivery</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                <a href="/dashboard/settings/integrations">
                  <Settings className="h-3.5 w-3.5 mr-1" />
                  Settings
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailsSent}</div>
            <p className="text-xs text-muted-foreground mt-1">from executions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Prevention</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{churnPreventionCount}</div>
            <p className="text-xs text-muted-foreground mt-1">active rules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feature Adoption</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featureAdoptionCount}</div>
            <p className="text-xs text-muted-foreground mt-1">active rules</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Create Tab */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Automation</CardTitle>
              <CardDescription>
                Set up automated email workflows triggered by user behavior.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Type Selector */}
              <div className="grid gap-3 md:grid-cols-3">
                {AUTOMATION_TYPES.map((t) => {
                  const Icon = t.icon;
                  const isSelected = selectedType === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => handleTypeSelect(t.value)}
                      className={`rounded-lg border-2 p-4 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-muted-foreground/30"
                      }`}
                    >
                      <Icon className={`h-6 w-6 mb-2 ${t.color}`} />
                      <p className="font-medium text-sm">{t.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                    </button>
                  );
                })}
              </div>

              {/* Name & Description */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="auto-name">Name</Label>
                  <Input
                    id="auto-name"
                    placeholder="e.g. High-risk churn email"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auto-desc">Description</Label>
                  <Textarea
                    id="auto-desc"
                    placeholder="Optional description..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={1}
                  />
                </div>
              </div>

              {/* Enable toggle */}
              <div className="flex items-center gap-3">
                <Switch
                  checked={formEnabled}
                  onCheckedChange={setFormEnabled}
                  id="auto-enabled"
                />
                <Label htmlFor="auto-enabled">Enable immediately after creation</Label>
              </div>

              {/* Type-specific config */}
              <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-medium text-sm">Configuration</h4>

                {selectedType === "churn_prevention" && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <Label>Risk Threshold</Label>
                        <span className="text-muted-foreground">{formConfig.risk_threshold}%</span>
                      </div>
                      <Slider
                        value={[formConfig.risk_threshold]}
                        onValueChange={([v]) => setFormConfig((c) => ({ ...c, risk_threshold: v }))}
                        min={50}
                        max={95}
                        step={5}
                      />
                      <p className="text-xs text-muted-foreground">
                        Trigger when churn risk score exceeds this threshold
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <Label>Discount Offer</Label>
                        <span className="text-muted-foreground">{formConfig.discount_percent}%</span>
                      </div>
                      <Slider
                        value={[formConfig.discount_percent]}
                        onValueChange={([v]) =>
                          setFormConfig((c) => ({ ...c, discount_percent: v }))
                        }
                        min={5}
                        max={50}
                        step={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <Label>Cooldown Period</Label>
                        <span className="text-muted-foreground">{formConfig.cooldown_days} days</span>
                      </div>
                      <Slider
                        value={[formConfig.cooldown_days]}
                        onValueChange={([v]) =>
                          setFormConfig((c) => ({ ...c, cooldown_days: v }))
                        }
                        min={7}
                        max={90}
                        step={1}
                      />
                    </div>
                  </>
                )}

                {selectedType === "feature_adoption" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label>Unused Features Threshold</Label>
                      <span className="text-muted-foreground">
                        {formConfig.unused_features_threshold_days} days
                      </span>
                    </div>
                    <Slider
                      value={[formConfig.unused_features_threshold_days]}
                      onValueChange={([v]) =>
                        setFormConfig((c) => ({ ...c, unused_features_threshold_days: v }))
                      }
                      min={3}
                      max={30}
                      step={1}
                    />
                    <p className="text-xs text-muted-foreground">
                      Notify users who haven&apos;t used a feature in this many days
                    </p>
                  </div>
                )}

                {selectedType === "engagement" && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <Label>Engagement Threshold</Label>
                        <span className="text-muted-foreground">
                          {formConfig.engagement_threshold}%
                        </span>
                      </div>
                      <Slider
                        value={[formConfig.engagement_threshold]}
                        onValueChange={([v]) =>
                          setFormConfig((c) => ({ ...c, engagement_threshold: v }))
                        }
                        min={10}
                        max={80}
                        step={5}
                      />
                      <p className="text-xs text-muted-foreground">
                        Target users with engagement score below this level
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <Label>Inactivity Period</Label>
                        <span className="text-muted-foreground">
                          {formConfig.inactivity_days} days
                        </span>
                      </div>
                      <Slider
                        value={[formConfig.inactivity_days]}
                        onValueChange={([v]) =>
                          setFormConfig((c) => ({ ...c, inactivity_days: v }))
                        }
                        min={7}
                        max={60}
                        step={1}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Brand Profile Settings */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Brand Profile
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Configure brand voice for AI-generated emails
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBrandDialogOpen(true)}
                  >
                    {formConfig.brand_settings ? "Edit Brand" : "Set Up Brand"}
                  </Button>
                </div>
                {formConfig.brand_settings && (
                  <div className="flex flex-wrap gap-2">
                    {formConfig.brand_settings.brand_profile?.company_name && (
                      <Badge variant="secondary" className="text-xs">
                        {formConfig.brand_settings.brand_profile.company_name}
                      </Badge>
                    )}
                    {formConfig.brand_settings.tone && (
                      <Badge variant="outline" className="text-xs">
                        Tone: {formConfig.brand_settings.tone}
                      </Badge>
                    )}
                    {formConfig.brand_settings.style && (
                      <Badge variant="outline" className="text-xs">
                        Style: {formConfig.brand_settings.style}
                      </Badge>
                    )}
                    {formConfig.brand_settings.words_to_avoid && (
                      <Badge variant="outline" className="text-xs text-destructive">
                        Avoid: {formConfig.brand_settings.words_to_avoid.slice(0, 30)}
                        {formConfig.brand_settings.words_to_avoid.length > 30 ? "..." : ""}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <Button onClick={handleCreateAutomation} disabled={creating || !formName.trim()}>
                {creating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Create Automation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automations Tab */}
        <TabsContent value="automations">
          {automations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No automations yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Create your first email automation from the Create tab to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {automations.map((automation) => {
                const typeInfo = AUTOMATION_TYPES.find((t) => t.value === automation.type);
                const Icon = typeInfo?.icon ?? Zap;
                return (
                  <Card key={automation.id}>
                    <CardContent className="flex items-center justify-between gap-4 py-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <Icon className={`h-5 w-5 shrink-0 ${typeInfo?.color ?? "text-muted-foreground"}`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium truncate">{automation.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {typeInfo?.label ?? automation.type}
                            </Badge>
                            <Badge
                              variant={automation.is_enabled ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {automation.is_enabled ? "Active" : "Disabled"}
                            </Badge>
                          </div>
                          {automation.description && (
                            <p className="text-sm text-muted-foreground truncate mt-0.5">
                              {automation.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {Object.entries(automation.config || {})
                              .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
                              .join(" | ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTestDialog(automation)}
                        >
                          <FlaskConical className="h-4 w-4 mr-1" />
                          Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTriggerAutomation(automation)}
                          disabled={triggeringId === automation.id || !automation.is_enabled}
                        >
                          {triggeringId === automation.id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4 mr-1" />
                          )}
                          Run
                        </Button>
                        <Switch
                          checked={automation.is_enabled}
                          onCheckedChange={() => handleToggleAutomation(automation)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(automation)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          {/* Executions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>Email automation activity log</CardDescription>
            </CardHeader>
            <CardContent>
              {executions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No executions yet. Automations will appear here once triggered.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executions.slice(0, 50).map((exec) => (
                      <TableRow key={exec.id}>
                        <TableCell className="font-mono text-xs">{exec.user_id}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {exec.automation_id
                              ? automations.find((a) => a.id === exec.automation_id)?.type ?? "—"
                              : "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              exec.status === "sent"
                                ? "default"
                                : exec.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {exec.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {exec.trigger_reason}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(exec.sent_at || exec.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Discount Codes Section */}
          <Card>
            <CardHeader>
              <CardTitle>Discount Codes</CardTitle>
              <CardDescription>
                Create and manage discount codes used in churn prevention emails.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create form */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="CODE_NAME"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  className="sm:max-w-[200px]"
                />
                <div className="flex items-center gap-2">
                  <Label className="whitespace-nowrap text-sm">Discount %</Label>
                  <Input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="whitespace-nowrap text-sm">Max Uses</Label>
                  <Input
                    type="number"
                    value={discountMaxUses}
                    onChange={(e) => setDiscountMaxUses(Number(e.target.value))}
                    min={1}
                    className="w-20"
                  />
                </div>
                <Button
                  onClick={handleCreateDiscountCode}
                  disabled={creatingDiscount || !discountCode.trim()}
                  size="sm"
                >
                  {creatingDiscount ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>

              {/* Discount codes table */}
              {discountCodes.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discountCodes.map((dc) => (
                      <TableRow key={dc.id}>
                        <TableCell className="font-mono font-medium">{dc.code}</TableCell>
                        <TableCell>{dc.discount_percent}%</TableCell>
                        <TableCell>
                          {dc.used_count} / {dc.max_uses}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={dc.is_active ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {dc.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(dc.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Automation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAutomation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Test Automation Dialog */}
      <Dialog open={!!testTarget} onOpenChange={(open) => !open && setTestTarget(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Test Automation: {testTarget?.name}
            </DialogTitle>
            <DialogDescription>
              Send a test email to verify the automation works correctly. This will create a test
              execution and generate AI-powered email content.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="test-email">Test Email Address *</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="your@email.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-name">Recipient Name</Label>
                <Input
                  id="test-name"
                  placeholder="Test User"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                />
              </div>
            </div>

            {testResult && (
              <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Test execution created!</span>
                </div>

                {testResult.email_content && (
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Subject</Label>
                      <p className="font-medium">{testResult.email_content.subject}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email Preview</Label>
                      <div className="flex gap-1 mt-1 mb-2">
                        <Button
                          variant={testPreviewTab === "html" ? "default" : "outline"}
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => setTestPreviewTab("html")}
                        >
                          HTML
                        </Button>
                        <Button
                          variant={testPreviewTab === "text" ? "default" : "outline"}
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => setTestPreviewTab("text")}
                        >
                          Plain Text
                        </Button>
                      </div>
                      {testPreviewTab === "html" ? (
                        testResult.email_content.html ? (
                          <iframe
                            srcDoc={testResult.email_content.html}
                            className="w-full h-60 rounded border bg-white"
                            sandbox="allow-same-origin"
                            title="Test email preview"
                          />
                        ) : (
                          <div className="rounded border bg-muted p-4 text-sm text-muted-foreground text-center">
                            No HTML content generated.
                          </div>
                        )
                      ) : (
                        <pre className="rounded border bg-muted p-4 text-sm max-h-60 overflow-auto whitespace-pre-wrap">
                          {testResult.email_content.text || testResult.email_content.plain_text || "No plain text generated."}
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                {!testResult.email_content && (
                  <p className="text-sm text-muted-foreground">
                    Execution created but no email content was generated. Make sure ANTHROPIC_API_KEY
                    is set in your backend environment.
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTestTarget(null)}>
              Close
            </Button>
            <Button onClick={handleTestAutomation} disabled={testing || !testEmail.trim()}>
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Run Test
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Brand Profile Dialog */}
      <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Brand Profile
            </DialogTitle>
            <DialogDescription>
              Configure your brand voice for AI-generated emails. Crawl your website to auto-detect brand details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Website URL */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Website URL
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://yourcompany.com"
                  value={brandWebsiteUrl}
                  onChange={(e) => setBrandWebsiteUrl(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={handleCrawlBrand}
                  disabled={crawling || !brandWebsiteUrl.trim()}
                >
                  {crawling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Crawl"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                We&apos;ll extract brand colors, company name, and description from your website.
              </p>
            </div>

            {/* Crawl result */}
            {brandProfile && (
              <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
                <p className="text-sm font-medium">{brandProfile.company_name}</p>
                {brandProfile.industry && (
                  <p className="text-xs text-muted-foreground">Industry: {brandProfile.industry}</p>
                )}
                {brandProfile.description && (
                  <p className="text-xs text-muted-foreground">{brandProfile.description}</p>
                )}
                {brandProfile.colors && brandProfile.colors.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-muted-foreground">Colors:</span>
                    {brandProfile.colors.map((color) => (
                      <div
                        key={color}
                        className="h-5 w-5 rounded border"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tone */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5" />
                Tone
              </Label>
              <Input
                placeholder="e.g. Friendly, Professional, Empathetic, Casual"
                value={brandTone}
                onChange={(e) => setBrandTone(e.target.value)}
              />
            </div>

            {/* Style */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" />
                Style
              </Label>
              <Input
                placeholder="e.g. Concise, Storytelling, Data-driven, Warm"
                value={brandStyle}
                onChange={(e) => setBrandStyle(e.target.value)}
              />
            </div>

            {/* Words to avoid */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Ban className="h-3.5 w-3.5" />
                Words to Avoid
              </Label>
              <Textarea
                placeholder="e.g. spam, free, urgent, act now, limited time"
                value={brandWordsToAvoid}
                onChange={(e) => setBrandWordsToAvoid(e.target.value)}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of words or phrases to exclude from generated emails.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBrandDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBrandSettings}>
              Save Brand Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </PageShell>
  );
}
