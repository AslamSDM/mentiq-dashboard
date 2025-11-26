"use client";

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
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, UserMinus, Activity } from "lucide-react";
import { ChurnData, ChurnStats } from "@/lib/services/enhanced-analytics";

interface ChurnRiskCardProps {
  stats: ChurnStats | null;
  users: ChurnData[];
  loading: boolean;
}

export function ChurnRiskCard({ stats, users, loading }: ChurnRiskCardProps) {
  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Churn Risk Analysis</CardTitle>
          <CardDescription>AI-powered churn prediction</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-4 col-span-full">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Churn Rate (30d)
            </CardTitle>
            <UserMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.churn_rate_30d}</div>
            <p className="text-xs text-muted-foreground">
              {stats.churned_users} users churned in last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Users</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.at_risk_users}</div>
            <p className="text-xs text-muted-foreground">
              Users with high churn probability
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Health Score
            </CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.length > 0
                ? (
                    users.reduce(
                      (acc, user) => acc + parseFloat(user.health_score),
                      0
                    ) / users.length
                  ).toFixed(1)
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on recency, frequency & engagement
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>High Risk Users</CardTitle>
          <CardDescription>
            Users who need immediate attention to prevent churn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Health Score</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Inactive Days</TableHead>
                <TableHead className="text-right">Sessions (Total)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.slice(0, 5).map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">
                    {user.user_id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.category === "Critical"
                          ? "destructive"
                          : user.category === "High"
                          ? "default" // Orange-ish usually, but default is black/primary. Let's stick to default or outline.
                          : "secondary"
                      }
                      className={
                        user.category === "High"
                          ? "bg-orange-500 hover:bg-orange-600"
                          : ""
                      }
                    >
                      {user.category} ({user.risk_score})
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            parseFloat(user.health_score) > 70
                              ? "bg-green-500"
                              : parseFloat(user.health_score) > 40
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${parseFloat(user.health_score)}%` }}
                        />
                      </div>
                      <span className="text-xs">{user.health_score}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.last_active}</TableCell>
                  <TableCell>{user.days_inactive} days</TableCell>
                  <TableCell className="text-right">
                    {user.sessions_total}
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No at-risk users detected. Great job!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
