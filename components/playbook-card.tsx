"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PlaybookData, Playbook } from "@/lib/services/playbooks";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  TrendingDown,
  Lightbulb,
  MessageSquare,
  Mail,
  Settings,
  Trash2,
  Play,
  Pause,
} from "lucide-react";

interface PlaybookCardProps {
  playbook: Playbook;
  data: PlaybookData;
  onChecklistUpdate?: (taskIndex: number, completed: boolean) => void;
  onStatusChange?: (status: "active" | "paused" | "archived") => void;
  onDelete?: () => void;
  onClick?: () => void;
}

export function PlaybookCard({
  playbook,
  data,
  onChecklistUpdate,
  onStatusChange,
  onDelete,
  onClick,
}: PlaybookCardProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const getConfidenceBadge = (level: string) => {
    switch (level) {
      case "High":
        return <Badge className="bg-green-100 text-green-800">High Confidence</Badge>;
      case "Medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Confidence</Badge>;
      case "Low":
        return <Badge className="bg-orange-100 text-orange-800">Low Confidence</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
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

  const completedTasks = data.execution_checklist.filter((t) => t.completed).length;
  const totalTasks = data.execution_checklist.length;
  const completionPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 cursor-pointer" onClick={onClick}>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI Generated
              </Badge>
              {getConfidenceBadge(data.confidence_level)}
              {getStatusBadge(playbook.status)}
            </div>
            <CardTitle className="text-xl leading-tight hover:text-primary transition-colors">
              {data.title}
            </CardTitle>
            <CardDescription className="mt-2 text-sm font-medium text-primary">
              {data.impact}
            </CardDescription>
          </div>
          <div className="flex gap-2 ml-4">
            {playbook.status === "draft" && (
              <Button
                size="sm"
                onClick={() => onStatusChange?.("active")}
              >
                <Play className="h-4 w-4 mr-1" />
                Activate
              </Button>
            )}
            {playbook.status === "active" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange?.("paused")}
              >
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}
            {playbook.status === "paused" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange?.("active")}
              >
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Why You're Seeing This */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Why You&apos;re Seeing This
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {data.why_seeing_this}
          </p>
        </div>

        {/* What the Data Shows */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            What the Data Shows
          </h4>
          <ul className="space-y-2">
            {data.what_data_shows.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Churn Risk If Ignored */}
        <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
          <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Churn Risk If Ignored
          </h4>
          <p className="text-sm text-red-800 dark:text-red-200 mb-3">
            {data.churn_risk_if_ignored.summary}
          </p>
          <ul className="space-y-1">
            {data.churn_risk_if_ignored.projections.map((projection, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                <TrendingDown className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{projection}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Actions - Collapsible */}
        <Collapsible open={isActionsOpen} onOpenChange={setIsActionsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto font-semibold">
              <span className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Recommended Actions
              </span>
              {isActionsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
            {/* Product Actions */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Product
              </h5>
              <ul className="space-y-2">
                {data.recommended_actions.product.map((action, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-muted-foreground">{i + 1}.</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Messaging Actions */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                In-App Messaging
              </h5>
              <ul className="space-y-2">
                {data.recommended_actions.messaging.map((action, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-muted-foreground">{i + 1}.</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lifecycle Actions */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h5 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Lifecycle (Email/CS)
              </h5>
              <ul className="space-y-2">
                {data.recommended_actions.lifecycle.map((action, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-muted-foreground">{i + 1}.</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Execution Checklist */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Execution Checklist
            </h4>
            <span className="text-xs text-muted-foreground">
              {completedTasks}/{totalTasks} completed ({completionPercent.toFixed(0)}%)
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div className="space-y-3">
            {data.execution_checklist.map((item, i) => (
              <label
                key={i}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={(checked) =>
                    onChecklistUpdate?.(i, checked as boolean)
                  }
                  className="mt-0.5"
                />
                <span
                  className={`text-sm transition-colors ${
                    item.completed
                      ? "line-through text-muted-foreground"
                      : "group-hover:text-primary"
                  }`}
                >
                  {item.task}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Success Metrics */}
        <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
          <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3">
            Success Metrics
          </h4>
          <ul className="space-y-2">
            {data.success_metrics.map((metric, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-800 dark:text-green-200">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{metric}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
