"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveProjectId } from "@/hooks/use-effective-project";
import { automationService, AutomationSettings } from "@/lib/services/automation";
import {
  AlertTriangle,
  Target,
  Users,
  Plus,
  Settings,
  Play,
  Pause,
  Trash2,
  Edit,
  TrendingUp,
  Sparkles,
} from "lucide-react";
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

type AutomationType = "churn_prevention" | "feature_adoption" | "engagement";

const AUTOMATION_TYPES = [
  {
    value: "churn_prevention" as AutomationType,
    label: "Churn Prevention",
    description: "Automatically send discount codes to high-risk users",
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    value: "feature_adoption" as AutomationType,
    label: "Feature Adoption",
    description: "Educate users about unused features",
    icon: Target,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    value: "engagement" as AutomationType,
    label: "Engagement",
    description: "Re-engage inactive users with personalized content",
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
];

export default function AutomationSettingsPage() {
  const router = useRouter();
  const effectiveProjectId = useEffectiveProjectId();
  const { toast } = useToast();

  const [automations, setAutomations] = useState<AutomationSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState<AutomationType>("churn_prevention");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<AutomationSettings | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [riskThreshold, setRiskThreshold] = useState(70);
  const [discountPercentage, setDiscountPercentage] = useState(20);
  const [cooldownDays, setCooldownDays] = useState(30);
  const [maxCampaignsPerUser, setMaxCampaignsPerUser] = useState(3);
  const [unusedFeaturesThreshold, setUnusedFeaturesThreshold] = useState(7);
  const [engagementThreshold, setEngagementThreshold] = useState(30);

  useEffect(() => {
    if (!effectiveProjectId) return;
    fetchAutomations();
  }, [effectiveProjectId]);

  const fetchAutomations = async () => {
    if (!effectiveProjectId) return;
    
    try {
      setLoading(true);
      const data = await automationService.getAutomations(effectiveProjectId);
      setAutomations(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch automation settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAutomation = async () => {
    if (!effectiveProjectId) return;

    setIsCreating(true);
    try {
      const config = buildConfig();
      
      const newAutomation = await automationService.createAutomation(effectiveProjectId, {
        name,
        description,
        type: selectedType,
        config,
        is_enabled: isEnabled,
      });

      setAutomations([...automations, newAutomation]);
      resetForm();
      
      toast({
        title: "Success",
        description: `"${name}" automation created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create automation",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const buildConfig = () => {
    switch (selectedType) {
      case "churn_prevention":
        return {
          churn_prevention: {
            enabled: true,
            risk_threshold: riskThreshold,
            discount_percentage: discountPercentage,
            cooldown_days: cooldownDays,
            max_campaigns_per_user: maxCampaignsPerUser,
          },
        };
      case "feature_adoption":
        return {
          feature_adoption: {
            enabled: true,
            unused_features_threshold: unusedFeaturesThreshold,
            min_user_activity: 10,
            target_features: ["analytics", "ab_testing", "session_recording"],
          },
        };
      case "engagement":
        return {
          engagement: {
            enabled: true,
            engagement_threshold: engagementThreshold,
            inactivity_days: 14,
            min_session_count: 5,
          },
        };
      default:
        return {};
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setIsEnabled(true);
    setRiskThreshold(70);
    setDiscountPercentage(20);
    setCooldownDays(30);
    setMaxCampaignsPerUser(3);
    setUnusedFeaturesThreshold(7);
    setEngagementThreshold(30);
  };

  const handleToggleAutomation = async (automation: AutomationSettings) => {
    try {
      const updated = await automationService.updateAutomation(
        effectiveProjectId!,
        automation.id,
        { is_enabled: !automation.is_enabled }
      );

      setAutomations(automations.map(a => 
        a.id === automation.id ? updated : a
      ));

      toast({
        title: "Success",
        description: `"${automation.name}" is now ${updated.is_enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update automation status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAutomation = async () => {
    if (!selectedAutomation || !effectiveProjectId) return;

    try {
      await automationService.deleteAutomation(effectiveProjectId, selectedAutomation.id);
      
      setAutomations(automations.filter(a => a.id !== selectedAutomation.id));
      setIsDeleteOpen(false);
      setSelectedAutomation(null);

      toast({
        title: "Success",
        description: `"${selectedAutomation.name}" automation deleted`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete automation",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader
        title="Automation Settings"
        description="Configure automated email campaigns for churn prevention, feature adoption, and user engagement"
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automations.filter(a => a.is_enabled).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">out of {automations.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Prevention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automations.filter(a => a.type === 'churn_prevention' && a.is_enabled).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">active campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feature Adoption</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automations.filter(a => a.type === 'feature_adoption' && a.is_enabled).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">education campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Create New Automation */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create New Automation
          </CardTitle>
          <CardDescription>
            Set up automated email campaigns to reduce churn and increase user engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {AUTOMATION_TYPES.map((type) => (
                <div
                  key={type.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedType === type.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedType(type.value)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <type.icon className={`h-5 w-5 ${type.color}`} />
                    <span className="font-medium">{type.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Automation Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={`${AUTOMATION_TYPES.find(t => t.value === selectedType)?.label} Campaign`}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this automation..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={isEnabled}
                  onCheckedChange={setIsEnabled}
                />
                <Label htmlFor="enabled">Enable automation immediately</Label>
              </div>

              {/* Type-specific settings */}
              {selectedType === 'churn_prevention' && (
                <div className="space-y-4 p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-900">Churn Prevention Settings</h4>
                  
                  <div className="space-y-2">
                    <Label>Risk Threshold: {riskThreshold}%</Label>
                    <Slider
                      value={[riskThreshold]}
                      onValueChange={(value) => setRiskThreshold(value[0])}
                      min={50}
                      max={95}
                      step={5}
                    />
                    <p className="text-sm text-muted-foreground">
                      Users with churn risk above this threshold will receive campaigns
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Discount Percentage: {discountPercentage}%</Label>
                    <Slider
                      value={[discountPercentage]}
                      onValueChange={(value) => setDiscountPercentage(value[0])}
                      min={5}
                      max={50}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cooldown Days: {cooldownDays}</Label>
                    <Slider
                      value={[cooldownDays]}
                      onValueChange={(value) => setCooldownDays(value[0])}
                      min={7}
                      max={90}
                      step={7}
                    />
                    <p className="text-sm text-muted-foreground">
                      Minimum days between campaigns for the same user
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Max Campaigns Per User: {maxCampaignsPerUser}</Label>
                    <Slider
                      value={[maxCampaignsPerUser]}
                      onValueChange={(value) => setMaxCampaignsPerUser(value[0])}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>
                </div>
              )}

              {selectedType === 'feature_adoption' && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Feature Adoption Settings</h4>
                  
                  <div className="space-y-2">
                    <Label>Unused Features Threshold: {unusedFeaturesThreshold} days</Label>
                    <Slider
                      value={[unusedFeaturesThreshold]}
                      onValueChange={(value) => setUnusedFeaturesThreshold(value[0])}
                      min={3}
                      max={30}
                      step={1}
                    />
                    <p className="text-sm text-muted-foreground">
                      Users who haven't used features in this many days
                    </p>
                  </div>
                </div>
              )}

              {selectedType === 'engagement' && (
                <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">Engagement Settings</h4>
                  
                  <div className="space-y-2">
                    <Label>Engagement Threshold: {engagementThreshold}%</Label>
                    <Slider
                      value={[engagementThreshold]}
                      onValueChange={(value) => setEngagementThreshold(value[0])}
                      min={10}
                      max={80}
                      step={5}
                    />
                    <p className="text-sm text-muted-foreground">
                      Users with engagement below this threshold
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Button 
              onClick={handleCreateAutomation} 
              disabled={isCreating || !name.trim()}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Automation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Automations */}
      {automations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Automations</h2>
          <div className="space-y-4">
            {automations.map((automation) => {
              const typeConfig = AUTOMATION_TYPES.find(t => t.value === automation.type);
              return (
                <Card key={automation.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={automation.is_enabled ? "default" : "secondary"}>
                            {automation.is_enabled ? "Active" : "Paused"}
                          </Badge>
                          <Badge variant="outline">{typeConfig?.label}</Badge>
                        </div>
                        <CardTitle className="text-base">{automation.name}</CardTitle>
                        <CardDescription>{automation.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={automation.is_enabled}
                          onCheckedChange={() => handleToggleAutomation(automation)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAutomation(automation);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Last executed: Never</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Settings className="h-4 w-4" />
                        <span>Type: {typeConfig?.label}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {automations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No automations yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Create your first automation to start reducing churn and increasing user engagement with AI-powered email campaigns.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Automation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedAutomation?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAutomation} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}