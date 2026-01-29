"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  integrationsService, 
  ProjectIntegration,
  MailchimpSettings,
  MailchimpAudience,
  IntegrationSyncLog
} from "@/lib/services/integrations";
import { 
  ArrowLeft, 
  RefreshCw, 
  Play, 
  Check,
  X,
  Mail,
  Users,
  Settings,
  Clock,
  AlertCircle,
  Loader2,
  Sparkles,
  AlertTriangle,
  Target
} from "lucide-react";
import Link from "next/link";

function getProjectId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("selectedProjectId");
}

export default function MailchimpSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [projectId, setProjectId] = useState<string | null>(null);
  const [integration, setIntegration] = useState<ProjectIntegration | null>(null);
  const [audiences, setAudiences] = useState<MailchimpAudience[]>([]);
  const [syncLogs, setSyncLogs] = useState<IntegrationSyncLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Local settings state
  const [selectedAudience, setSelectedAudience] = useState<string>("");
  const [syncHighRisk, setSyncHighRisk] = useState(true);
  const [riskThreshold, setRiskThreshold] = useState(70);
  const [addTags, setAddTags] = useState(true);
  const [tagName, setTagName] = useState("churn_risk_high");

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setIsLoading(true);
      
      // Fetch integration and audiences in parallel
      const [integrationData, audiencesData, logsData] = await Promise.all([
        integrationsService.getIntegration(projectId, "mailchimp"),
        integrationsService.getMailchimpAudiences(projectId).catch(() => ({ audiences: [] })),
        integrationsService.getMailchimpSyncLogs(projectId).catch(() => ({ logs: [] }))
      ]);
      
      if (!integrationData) {
        router.push("/dashboard/settings/integrations");
        return;
      }
      
      setIntegration(integrationData);
      setAudiences(audiencesData.audiences);
      setSyncLogs(logsData.logs);
      
      // Set local state from integration settings
      const settings = integrationData.settings as MailchimpSettings;
      setSelectedAudience(settings.audience_id || "");
      setSyncHighRisk(settings.sync_high_risk ?? true);
      setRiskThreshold(settings.risk_threshold ?? 70);
      setAddTags(settings.add_tags ?? true);
      setTagName(settings.tag_name || "churn_risk_high");
      
    } catch {
      toast({
        title: "Error",
        description: "Failed to load Mailchimp settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, router, toast]);

  useEffect(() => {
    const id = getProjectId();
    setProjectId(id);
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId, fetchData]);

  const handleSave = async () => {
    if (!projectId) return;

    setIsSaving(true);
    try {
      const audience = audiences.find(a => a.id === selectedAudience);
      
      await integrationsService.updateMailchimpSettings(projectId, {
        audience_id: selectedAudience,
        audience_name: audience?.name || "",
        sync_high_risk: syncHighRisk,
        risk_threshold: riskThreshold,
        add_tags: addTags,
        tag_name: tagName,
      });
      
      toast({
        title: "Settings Saved",
        description: "Your Mailchimp settings have been updated",
      });
      
      fetchData();
    } catch {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSync = async () => {
    if (!projectId) return;

    setIsSyncing(true);
    try {
      const result = await integrationsService.triggerMailchimpSync(projectId);
      
      toast({
        title: "Sync Complete",
        description: `Synced ${result.contacts_synced} contacts${result.contacts_failed > 0 ? `, ${result.contacts_failed} failed` : ""}`,
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync contacts",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!integration) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Not Connected</h3>
            <p className="text-muted-foreground mb-4">
              Mailchimp is not connected to this project
            </p>
            <Link href="/dashboard/settings/integrations">
              <Button>Back to Integrations</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const settings = integration.settings as MailchimpSettings;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings/integrations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Mail className="w-8 h-8 text-yellow-500" />
            <div>
              <h1 className="text-2xl font-bold">Mailchimp Settings</h1>
              <p className="text-muted-foreground text-sm">
                {settings.account_email || "Configure your Mailchimp integration"}
              </p>
            </div>
          </div>
        </div>
        <Badge variant={integration.is_active ? "default" : "secondary"}>
          {integration.is_active ? (
            <><Check className="w-3 h-3 mr-1" /> Connected</>
          ) : (
            <><X className="w-3 h-3 mr-1" /> Disconnected</>
          )}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration
            </CardTitle>
            <CardDescription>
              Configure how at-risk users are synced to Mailchimp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Audience Selection */}
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an audience" />
                </SelectTrigger>
                <SelectContent>
                  {audiences.map((audience) => (
                    <SelectItem key={audience.id} value={audience.id}>
                      {audience.name} ({audience.member_count.toLocaleString()} members)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                At-risk users will be added to this audience
              </p>
            </div>

            <Separator />

            {/* Auto-sync toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-sync High-Risk Users</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically sync when users cross risk threshold
                </p>
              </div>
              <Switch
                checked={syncHighRisk}
                onCheckedChange={setSyncHighRisk}
              />
            </div>

            {/* Risk Threshold Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Risk Threshold</Label>
                <span className="text-sm font-medium">{riskThreshold}%</span>
              </div>
              <Slider
                value={[riskThreshold]}
                onValueChange={(v) => setRiskThreshold(v[0])}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Users with churn risk ≥ {riskThreshold}% will be synced
              </p>
            </div>

            <Separator />

            {/* Tags toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Add Tags</Label>
                <p className="text-xs text-muted-foreground">
                  Tag synced contacts in Mailchimp
                </p>
              </div>
              <Switch
                checked={addTags}
                onCheckedChange={setAddTags}
              />
            </div>

            {addTags && (
              <div className="space-y-2">
                <Label htmlFor="tagName">Tag Name</Label>
                <Input
                  id="tagName"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="churn_risk_high"
                />
              </div>
            )}

            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                "Save Settings"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Sync Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Manual Sync
              </CardTitle>
              <CardDescription>
                Trigger a sync of all at-risk users now
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedAudience ? (
                <div className="text-center py-4 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select an audience to enable syncing</p>
                </div>
              ) : (
                <Button 
                  onClick={handleSync} 
                  disabled={isSyncing}
                  className="w-full"
                  variant="outline"
                >
                  {isSyncing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Syncing...</>
                  ) : (
                    <><Play className="w-4 h-4 mr-2" /> Sync Now</>
                  )}
                </Button>
              )}
              
              {integration.last_sync_at && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Last sync: {new Date(integration.last_sync_at).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Sync History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Syncs
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={fetchData}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {syncLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No sync history yet
                </p>
              ) : (
                <div className="space-y-3">
                  {syncLogs.slice(0, 5).map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {log.sync_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">
                          <span className="text-green-500 font-medium">
                            {log.contacts_synced} synced
                          </span>
                          {log.contacts_failed > 0 && (
                            <span className="text-red-500 ml-2">
                              {log.contacts_failed} failed
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(log.duration / 1000).toFixed(1)}s
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Automation Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Automation Campaigns
          </CardTitle>
          <CardDescription>
            Configure automated email campaigns that use Claude AI to generate personalized content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">AI-Powered Email Campaigns</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically send personalized emails to at-risk users, promote unused features, and re-engage inactive users
                </p>
              </div>
              <Link href="/dashboard/settings/automations">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Automations
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="font-medium text-red-900">Churn Prevention</span>
                </div>
                <p className="text-sm text-red-700">
                  Send discount codes to high-risk users with personalized messages
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-blue-900">Feature Adoption</span>
                </div>
                <p className="text-sm text-blue-700">
                  Educate users about unused features with AI-generated content
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-green-900">Re-engagement</span>
                </div>
                <p className="text-sm text-green-700">
                  Bring inactive users back with compelling personalized emails
                </p>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Claude AI Integration</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Our automation system uses Claude AI to generate personalized email content based on user behavior, 
                churn risk scores, and feature usage patterns. Each email is tailored to the individual user.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
