"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ApiTestPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("analytics");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const endpoints = [
    {
      id: "analytics",
      name: "Get Analytics",
      method: "GET",
      path: "/api/v1/analytics",
    },
    {
      id: "projects",
      name: "Get Projects",
      method: "GET",
      path: "/api/v1/projects",
    },
    { id: "events", name: "Get Events", method: "GET", path: "/api/v1/events" },
    {
      id: "heatmaps",
      name: "Get Heatmaps",
      method: "GET",
      path: "/api/v1/heatmaps",
    },
    {
      id: "experiments",
      name: "Get Experiments",
      method: "GET",
      path: "/api/v1/experiments",
    },
    {
      id: "sessions",
      name: "Get Sessions",
      method: "GET",
      path: "/api/v1/sessions",
    },
    { id: "users", name: "Get Users", method: "GET", path: "/api/v1/users" },
    {
      id: "dashboard",
      name: "Get Dashboard",
      method: "GET",
      path: "/api/v1/dashboard",
    },
  ];

  const testResults = [
    {
      endpoint: "Get Analytics",
      status: "Success",
      time: "245ms",
      timestamp: "2 mins ago",
      statusCode: 200,
    },
    {
      endpoint: "Get Projects",
      status: "Success",
      time: "123ms",
      timestamp: "5 mins ago",
      statusCode: 200,
    },
    {
      endpoint: "Get Events",
      status: "Failed",
      time: "502ms",
      timestamp: "10 mins ago",
      statusCode: 401,
    },
    {
      endpoint: "Get Sessions",
      status: "Success",
      time: "189ms",
      timestamp: "15 mins ago",
      statusCode: 200,
    },
  ];

  const handleTest = async () => {
    setLoading(true);
    setResponse("");

    // Simulate API call
    setTimeout(() => {
      const mockResponse = {
        success: true,
        data: {
          message: "API test successful",
          endpoint: selectedEndpoint,
          timestamp: new Date().toISOString(),
        },
      };
      setResponse(JSON.stringify(mockResponse, null, 2));
      setLoading(false);
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    if (status === "Success")
      return <Badge className="bg-green-100 text-green-800">Success</Badge>;
    return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader
        title="API Test Console"
        description="Test and debug API endpoints"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground mt-1">this session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94.2%</div>
            <p className="text-xs text-muted-foreground mt-1">
              successful requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">218ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              average latency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">API Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-600" />
              <span className="text-sm font-medium">Operational</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              all systems normal
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Endpoint</CardTitle>
            <CardDescription>Select and test API endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Endpoint
              </label>
              <Select
                value={selectedEndpoint}
                onValueChange={setSelectedEndpoint}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {endpoints?.map((endpoint) => (
                    <SelectItem key={endpoint.id} value={endpoint.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {endpoint.method}
                        </Badge>
                        <span>{endpoint.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEndpoint && (
              <div className="p-3 bg-gray-100 rounded-md">
                <p className="text-sm font-mono">
                  {endpoints.find((e) => e.id === selectedEndpoint)?.path}
                </p>
              </div>
            )}

            <Button onClick={handleTest} disabled={loading} className="w-full">
              {loading ? "Testing..." : "Send Request"}
            </Button>

            {response && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Response
                </label>
                <pre className="p-4 bg-gray-100 rounded-md overflow-x-auto text-xs">
                  {response}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Endpoints</CardTitle>
            <CardDescription>All API endpoints for testing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {endpoints?.map((endpoint) => (
                <div
                  key={endpoint.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedEndpoint === endpoint.id
                      ? "border-blue-500 bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedEndpoint(endpoint.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">{endpoint.name}</p>
                    <Badge variant="outline" className="font-mono text-xs">
                      {endpoint.method}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {endpoint.path}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tests</CardTitle>
          <CardDescription>Latest API test results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testResults?.map((result, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{result.endpoint}</p>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {result.timestamp}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-mono">
                    {result.statusCode} • {result.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Quick reference for common endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Authentication</h4>
              <p className="text-sm text-muted-foreground mb-2">
                All requests require Bearer token authentication:
              </p>
              <pre className="p-3 bg-gray-100 rounded-md text-xs overflow-x-auto">
                Authorization: Bearer YOUR_ACCESS_TOKEN
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">Project Header</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Include project ID in headers:
              </p>
              <pre className="p-3 bg-gray-100 rounded-md text-xs overflow-x-auto">
                X-Project-ID: your-project-id
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">Rate Limits</h4>
              <p className="text-sm text-muted-foreground">
                • Standard: 1000 requests per hour
                <br />
                • Premium: 5000 requests per hour
                <br />• Enterprise: Unlimited
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
