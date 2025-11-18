"use client";

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

export default function PlaybooksPage() {
  const playbooks = [
    {
      id: "1",
      name: "Onboarding Acceleration",
      description: "Guide new users to their first value moment faster",
      status: "Active",
      triggered: 245,
      completed: 187,
      impact: "+32% activation",
      steps: 5,
    },
    {
      id: "2",
      name: "Feature Adoption Push",
      description: "Increase adoption of underutilized premium features",
      status: "Active",
      triggered: 128,
      completed: 89,
      impact: "+18% feature usage",
      steps: 4,
    },
    {
      id: "3",
      name: "At-Risk User Recovery",
      description: "Re-engage users showing signs of churn",
      status: "Active",
      triggered: 67,
      completed: 42,
      impact: "+24% retention",
      steps: 6,
    },
    {
      id: "4",
      name: "Upsell Opportunity",
      description: "Convert power users to higher tier plans",
      status: "Draft",
      triggered: 0,
      completed: 0,
      impact: "Est. +$15K MRR",
      steps: 3,
    },
    {
      id: "5",
      name: "Trial Conversion",
      description: "Maximize trial-to-paid conversions",
      status: "Paused",
      triggered: 542,
      completed: 298,
      impact: "+14% conversion",
      steps: 7,
    },
  ];

  const recentTriggers = [
    {
      id: "1",
      playbook: "Onboarding Acceleration",
      user: "john@startup.com",
      trigger: "Sign up completed",
      status: "In Progress",
      step: "3/5",
      time: "5 minutes ago",
    },
    {
      id: "2",
      playbook: "At-Risk User Recovery",
      user: "sarah@company.com",
      trigger: "No login 14 days",
      status: "Completed",
      step: "6/6",
      time: "2 hours ago",
    },
    {
      id: "3",
      playbook: "Feature Adoption Push",
      user: "mike@enterprise.com",
      trigger: "Premium unused 30 days",
      status: "In Progress",
      step: "2/4",
      time: "3 hours ago",
    },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "Active")
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    if (status === "Draft")
      return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
  };

  const getTriggerStatus = (status: string) => {
    if (status === "Completed")
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader
        title="Growth Playbooks"
        description="Automated workflows to drive user engagement and growth"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Active Playbooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {playbooks.filter((p) => p.status === "Active").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Total Triggers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {playbooks.reduce((sum, p) => sum + p.triggered, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                (playbooks.reduce((sum, p) => sum + p.completed, 0) /
                  playbooks.reduce((sum, p) => sum + p.triggered, 0)) *
                100
              )?.toFixed(1)}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              average completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground mt-1">
              active users in playbooks
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Playbooks</CardTitle>
              <CardDescription>
                Manage your automated growth workflows
              </CardDescription>
            </div>
            <Button>Create Playbook</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {playbooks?.map((playbook) => (
              <div key={playbook.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{playbook.name}</h3>
                      {getStatusBadge(playbook.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {playbook.description}
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Steps: </span>
                        <span className="font-medium">{playbook.steps}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Triggered:{" "}
                        </span>
                        <span className="font-medium">
                          {playbook.triggered}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Completed:{" "}
                        </span>
                        <span className="font-medium">
                          {playbook.completed}
                        </span>
                      </div>
                      {playbook.triggered > 0 && (
                        <div>
                          <span className="text-muted-foreground">Rate: </span>
                          <span className="font-medium">
                            {(
                              (playbook.completed / playbook.triggered) *
                              100
                            )?.toFixed(1)}
                            %
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-300 mb-2"
                    >
                      {playbook.impact}
                    </Badge>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      {playbook.status === "Active" && (
                        <Button variant="outline" size="sm">
                          Pause
                        </Button>
                      )}
                      {playbook.status === "Paused" && (
                        <Button variant="outline" size="sm">
                          Resume
                        </Button>
                      )}
                      {playbook.status === "Draft" && (
                        <Button size="sm">Activate</Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest playbook triggers and completions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTriggers?.map((trigger) => (
              <div
                key={trigger.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{trigger.playbook}</p>
                    {getTriggerStatus(trigger.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {trigger.user}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span>Trigger: {trigger.trigger}</span>
                    <span>•</span>
                    <span>{trigger.time}</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-medium">Step {trigger.step}</p>
                  <Button variant="link" size="sm" className="h-auto p-0 mt-1">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
