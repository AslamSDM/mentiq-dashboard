"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
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
import { useToast } from "@/hooks/use-toast";
import {
  integrationsService,
  ProjectIntegration,
  MailchimpSettings,
  APIKeyProviderSettings
} from "@/lib/services/integrations";
import {
  ExternalLink,
  Check,
  X,
  RefreshCw,
  Settings,
  AlertCircle,
  Loader2,
  Send,
  Key
} from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  ResendLogo,
  SendGridLogo,
  MailchimpLogo,
  CustomerIoLogo,
} from "@/components/brand-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface IntegrationCardProps {
  provider: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  integration?: ProjectIntegration | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onSettings?: () => void;
  isLoading?: boolean;
  settingsPreview?: React.ReactNode;
}

function IntegrationCard({
  provider,
  name,
  description,
  icon,
  integration,
  onConnect,
  onDisconnect,
  onSettings,
  isLoading,
  settingsPreview,
}: IntegrationCardProps) {
  const isConnected = integration?.is_active;
  const hasError = integration?.sync_status === "error";

  // Map providers to color backgrounds if possible
  const iconBgMap: Record<string, string> = {
    resend: "bg-slate-100 text-slate-900 border border-slate-200",
    sendgrid: "bg-blue-100 text-blue-700",
    mailchimp: "bg-yellow-100 text-yellow-700",
  };
  
  const iconBgStyle = iconBgMap[provider] || "bg-slate-100 text-slate-700";

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${iconBgStyle}`}>
            {icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{name}</div>
            <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              {description}
            </div>
          </div>
        </div>
        {isConnected ? (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
            <Check className="w-3 h-3" /> Connected
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 shrink-0">
            Not Connected
          </span>
        )}
      </div>

      {(isConnected && settingsPreview) && (
        <div className="p-3 rounded-lg bg-slate-50 text-sm space-y-1 border border-slate-100">
          {settingsPreview}
          {hasError && integration?.last_error && (
            <div className="flex items-start gap-2 text-red-500 mt-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-xs">{integration.last_error}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mt-auto pt-2">
        {isConnected ? (
          <>
            {onSettings && (
              <button
                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                onClick={onSettings}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            )}
            <button
              className="flex items-center justify-center py-2 px-3 text-sm font-semibold rounded-lg border border-slate-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              onClick={onDisconnect}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>
          </>
        ) : (
          <button
            onClick={onConnect}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4" />
            )}
            Connect {name}
          </button>
        )}
      </div>
    </div>
  );
}

// Dialog for connecting API-key-based providers (Resend, SendGrid)
function APIKeyConnectDialog({
  open,
  onOpenChange,
  provider,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: "resend" | "sendgrid";
  onSubmit: (data: { api_key: string; from_email: string; from_name: string }) => void;
  isLoading: boolean;
}) {
  const [apiKey, setApiKey] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const providerName = provider === "resend" ? "Resend" : "SendGrid";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect {providerName}</DialogTitle>
          <DialogDescription>
            Enter your {providerName} API key to enable email sending through {providerName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === "resend" ? "re_..." : "SG..."}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromEmail">From Email</Label>
            <Input
              id="fromEmail"
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="noreply@yourcompany.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromName">From Name</Label>
            <Input
              id="fromName"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="Your Company"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit({ api_key: apiKey, from_email: fromEmail, from_name: fromName })}
            disabled={!apiKey.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Key className="w-4 h-4 mr-2" />
            )}
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Dialog for testing email sending
function TestEmailDialog({
  open,
  onOpenChange,
  provider,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: string;
  onSubmit: (email: string) => void;
  isLoading: boolean;
}) {
  const [email, setEmail] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
          <DialogDescription>
            Send a test email via {provider} to verify the integration works.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="testEmail">Recipient Email</Label>
            <Input
              id="testEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(email)}
            disabled={!email.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function IntegrationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { getEffectiveProjectId } = useStore();

  const projectId = getEffectiveProjectId();
  const [integrations, setIntegrations] = useState<ProjectIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Dialog state
  const [connectDialog, setConnectDialog] = useState<"resend" | "sendgrid" | null>(null);
  const [testDialog, setTestDialog] = useState<"resend" | "sendgrid" | null>(null);

  // Check for success/error params from OAuth callback
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "connected") {
      toast({
        title: "Integration Connected!",
        description: "Your integration has been successfully connected.",
      });
      router.replace("/dashboard/settings/integrations");
    }

    if (error) {
      let errorMessage = "Failed to connect integration";
      switch (error) {
        case "oauth_denied":
          errorMessage = "You denied the authorization";
          break;
        case "no_code":
          errorMessage = "No authorization code received";
          break;
        case "token_exchange_failed":
          errorMessage = "Failed to exchange authorization token";
          break;
      }
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
      router.replace("/dashboard/settings/integrations");
    }
  }, [searchParams, toast, router]);

  const fetchIntegrations = useCallback(async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);
      const data = await integrationsService.getIntegrations(projectId);
      setIntegrations(data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch integrations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    if (projectId) {
      fetchIntegrations();
    } else {
      setIsLoading(false);
    }
  }, [projectId, fetchIntegrations]);

  const getIntegration = (provider: string): ProjectIntegration | undefined => {
    return integrations.find((i) => i.provider === provider);
  };

  // Mailchimp handlers
  const handleConnectMailchimp = async () => {
    if (!projectId) {
      toast({ title: "No Project Selected", description: "Please select a project first", variant: "destructive" });
      return;
    }
    setActionLoading("mailchimp-connect");
    try {
      const { auth_url } = await integrationsService.connectMailchimp(projectId);
      window.location.href = auth_url;
    } catch {
      toast({ title: "Error", description: "Failed to start Mailchimp connection", variant: "destructive" });
      setActionLoading(null);
    }
  };

  const handleDisconnectMailchimp = async () => {
    if (!projectId) return;
    setActionLoading("mailchimp-disconnect");
    try {
      await integrationsService.disconnectMailchimp(projectId);
      toast({ title: "Disconnected", description: "Mailchimp has been disconnected" });
      fetchIntegrations();
    } catch {
      toast({ title: "Error", description: "Failed to disconnect Mailchimp", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  // Resend handlers
  const handleConnectResend = async (data: { api_key: string; from_email: string; from_name: string }) => {
    if (!projectId) return;
    setActionLoading("resend-connect");
    try {
      await integrationsService.connectResend(projectId, data);
      toast({ title: "Connected", description: "Resend has been connected successfully" });
      setConnectDialog(null);
      fetchIntegrations();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to connect Resend", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnectResend = async () => {
    if (!projectId) return;
    setActionLoading("resend-disconnect");
    try {
      await integrationsService.disconnectResend(projectId);
      toast({ title: "Disconnected", description: "Resend has been disconnected" });
      fetchIntegrations();
    } catch {
      toast({ title: "Error", description: "Failed to disconnect Resend", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleTestResend = async (email: string) => {
    if (!projectId) return;
    setActionLoading("resend-test");
    try {
      await integrationsService.testResend(projectId, email);
      toast({ title: "Test Email Sent", description: `Test email sent to ${email}` });
      setTestDialog(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send test email", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  // SendGrid handlers
  const handleConnectSendGrid = async (data: { api_key: string; from_email: string; from_name: string }) => {
    if (!projectId) return;
    setActionLoading("sendgrid-connect");
    try {
      await integrationsService.connectSendGrid(projectId, data);
      toast({ title: "Connected", description: "SendGrid has been connected successfully" });
      setConnectDialog(null);
      fetchIntegrations();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to connect SendGrid", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnectSendGrid = async () => {
    if (!projectId) return;
    setActionLoading("sendgrid-disconnect");
    try {
      await integrationsService.disconnectSendGrid(projectId);
      toast({ title: "Disconnected", description: "SendGrid has been disconnected" });
      fetchIntegrations();
    } catch {
      toast({ title: "Error", description: "Failed to disconnect SendGrid", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleTestSendGrid = async (email: string) => {
    if (!projectId) return;
    setActionLoading("sendgrid-test");
    try {
      await integrationsService.testSendGrid(projectId, email);
      toast({ title: "Test Email Sent", description: `Test email sent to ${email}` });
      setTestDialog(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send test email", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  if (!projectId) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <DashboardHeader
          title="Integrations"
          description="Connect third-party services to automate your workflows"
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
            <p className="text-muted-foreground mb-4">
              Please select a project to manage integrations
            </p>
            <Link href="/dashboard/projects">
              <Button>Select Project</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const resendIntegration = getIntegration("resend");
  const sendgridIntegration = getIntegration("sendgrid");
  const mailchimpIntegration = getIntegration("mailchimp");
  const mcSettings = mailchimpIntegration?.settings as MailchimpSettings | undefined;
  const resendSettings = resendIntegration?.settings as APIKeyProviderSettings | undefined;
  const sendgridSettings = sendgridIntegration?.settings as APIKeyProviderSettings | undefined;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Integrations"
          description="Connect third-party services to automate your workflows"
        />
        <Button variant="outline" onClick={fetchIntegrations} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Email Providers Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Email Providers</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Resend */}
          <IntegrationCard
            provider="resend"
            name="Resend"
            description="Modern email API for transactional and automation emails"
            icon={<ResendLogo size={28} />}
            integration={resendIntegration}
            onConnect={() => setConnectDialog("resend")}
            onDisconnect={handleDisconnectResend}
            onSettings={() => setTestDialog("resend")}
            isLoading={actionLoading?.startsWith("resend") ?? false}
            settingsPreview={
              resendSettings?.from_email ? (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">From:</span>
                  <span className="font-medium">
                    {resendSettings.from_name ? `${resendSettings.from_name} <${resendSettings.from_email}>` : resendSettings.from_email}
                  </span>
                </div>
              ) : null
            }
          />

          {/* SendGrid */}
          <IntegrationCard
            provider="sendgrid"
            name="SendGrid"
            description="Twilio SendGrid for reliable email delivery at scale"
            icon={<SendGridLogo size={28} />}
            integration={sendgridIntegration}
            onConnect={() => setConnectDialog("sendgrid")}
            onDisconnect={handleDisconnectSendGrid}
            onSettings={() => setTestDialog("sendgrid")}
            isLoading={actionLoading?.startsWith("sendgrid") ?? false}
            settingsPreview={
              sendgridSettings?.from_email ? (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">From:</span>
                  <span className="font-medium">
                    {sendgridSettings.from_name ? `${sendgridSettings.from_name} <${sendgridSettings.from_email}>` : sendgridSettings.from_email}
                  </span>
                </div>
              ) : null
            }
          />

          {/* Mailchimp */}
          <IntegrationCard
            provider="mailchimp"
            name="Mailchimp"
            description="Sync at-risk users for automated email campaigns"
            icon={<MailchimpLogo size={28} />}
            integration={mailchimpIntegration}
            onConnect={handleConnectMailchimp}
            onDisconnect={handleDisconnectMailchimp}
            onSettings={() => router.push("/dashboard/settings/integrations/mailchimp")}
            isLoading={actionLoading?.startsWith("mailchimp") ?? false}
            settingsPreview={
              mcSettings ? (
                <>
                  {mcSettings.account_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Account:</span>
                      <span className="font-medium">{mcSettings.account_name}</span>
                    </div>
                  )}
                  {mcSettings.audience_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Audience:</span>
                      <span className="font-medium">{mcSettings.audience_name}</span>
                    </div>
                  )}
                </>
              ) : null
            }
          />
        </div>
      </div>

      {/* Coming Soon */}
      <div>
        <h2 className="text-lg font-semibold mb-4">More Integrations</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex flex-col gap-4 opacity-75">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold bg-purple-100 text-purple-700">
                  <CustomerIoLogo size={24} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Customer.io</div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Automated messaging platform
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 shrink-0">
                Coming Soon
              </span>
            </div>
            <div className="mt-auto pt-2">
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Connect Customer.io
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Connect Dialogs */}
      <APIKeyConnectDialog
        open={connectDialog === "resend"}
        onOpenChange={(open) => !open && setConnectDialog(null)}
        provider="resend"
        onSubmit={handleConnectResend}
        isLoading={actionLoading === "resend-connect"}
      />
      <APIKeyConnectDialog
        open={connectDialog === "sendgrid"}
        onOpenChange={(open) => !open && setConnectDialog(null)}
        provider="sendgrid"
        onSubmit={handleConnectSendGrid}
        isLoading={actionLoading === "sendgrid-connect"}
      />

      {/* Test Email Dialogs */}
      <TestEmailDialog
        open={testDialog === "resend"}
        onOpenChange={(open) => !open && setTestDialog(null)}
        provider="Resend"
        onSubmit={handleTestResend}
        isLoading={actionLoading === "resend-test"}
      />
      <TestEmailDialog
        open={testDialog === "sendgrid"}
        onOpenChange={(open) => !open && setTestDialog(null)}
        provider="SendGrid"
        onSubmit={handleTestSendGrid}
        isLoading={actionLoading === "sendgrid-test"}
      />
    </div>
  );
}
