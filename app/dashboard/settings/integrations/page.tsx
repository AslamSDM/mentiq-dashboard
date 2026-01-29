"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  integrationsService, 
  ProjectIntegration,
  MailchimpSettings 
} from "@/lib/services/integrations";
import { 
  ExternalLink, 
  Check, 
  X, 
  RefreshCw, 
  Settings, 
  Mail,
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";

interface IntegrationCardProps {
  provider: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  integration?: ProjectIntegration | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onSettings: () => void;
  isLoading?: boolean;
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
  isLoading
}: IntegrationCardProps) {
  const isConnected = integration?.is_active;
  const hasError = integration?.sync_status === "error";
  const settings = integration?.settings as MailchimpSettings | undefined;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            </div>
          </div>
          {isConnected ? (
            <Badge variant="default" className="bg-green-500">
              <Check className="w-3 h-3 mr-1" /> Connected
            </Badge>
          ) : (
            <Badge variant="secondary">Not Connected</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isConnected && settings && (
          <div className="mb-4 p-3 rounded-lg bg-muted/50 text-sm space-y-1">
            {settings.account_name && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Account:</span>
                <span className="font-medium">{settings.account_name}</span>
              </div>
            )}
            {settings.audience_name && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Audience:</span>
                <span className="font-medium">{settings.audience_name}</span>
              </div>
            )}
            {hasError && integration?.last_error && (
              <div className="flex items-start gap-2 text-red-500 mt-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-xs">{integration.last_error}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onSettings}
                className="flex-1"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={onDisconnect}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </Button>
            </>
          ) : (
            <Button 
              onClick={onConnect}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
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

  // Check for success/error params from OAuth callback
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "connected") {
      toast({
        title: "Mailchimp Connected!",
        description: "Your Mailchimp account has been successfully connected.",
      });
      // Clear the URL params
      router.replace("/dashboard/settings/integrations");
    }

    if (error) {
      let errorMessage = "Failed to connect Mailchimp";
      switch (error) {
        case "oauth_denied":
          errorMessage = "You denied the Mailchimp authorization";
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

  const handleConnectMailchimp = async () => {
    if (!projectId) {
      toast({
        title: "No Project Selected",
        description: "Please select a project first",
        variant: "destructive",
      });
      return;
    }

    setActionLoading("mailchimp-connect");
    try {
      const { auth_url } = await integrationsService.connectMailchimp(projectId);
      // Redirect to Mailchimp OAuth
      window.location.href = auth_url;
    } catch {
      toast({
        title: "Error",
        description: "Failed to start Mailchimp connection",
        variant: "destructive",
      });
      setActionLoading(null);
    }
  };

  const handleDisconnectMailchimp = async () => {
    if (!projectId) return;

    setActionLoading("mailchimp-disconnect");
    try {
      await integrationsService.disconnectMailchimp(projectId);
      toast({
        title: "Disconnected",
        description: "Mailchimp has been disconnected",
      });
      fetchIntegrations();
    } catch {
      toast({
        title: "Error",
        description: "Failed to disconnect Mailchimp",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleMailchimpSettings = () => {
    router.push("/dashboard/settings/integrations/mailchimp");
  };

  if (!projectId) {
    return (
      <div className="p-6">
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">
            Connect third-party services to automate your workflows
          </p>
        </div>
        <Button variant="outline" onClick={fetchIntegrations} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Mailchimp */}
        <IntegrationCard
          provider="mailchimp"
          name="Mailchimp"
          description="Sync at-risk users for automated email campaigns"
          icon={<Mail className="w-6 h-6 text-yellow-500" />}
          integration={getIntegration("mailchimp")}
          onConnect={handleConnectMailchimp}
          onDisconnect={handleDisconnectMailchimp}
          onSettings={handleMailchimpSettings}
          isLoading={actionLoading?.startsWith("mailchimp")}
        />

        {/* Coming Soon Placeholders */}
        <Card className="relative overflow-hidden opacity-60">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-gray-500/10" />
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                  <Mail className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">SendGrid</CardTitle>
                  <CardDescription className="text-sm">
                    Transactional email automation
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Connect
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden opacity-60">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-gray-500/10" />
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                  <Mail className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Customer.io</CardTitle>
                  <CardDescription className="text-sm">
                    Automated messaging platform
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Connect
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
