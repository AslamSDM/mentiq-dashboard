"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { adminService } from "@/lib/services/admin";
import { Loader2, UserPlus, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminTestUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    skipEmailVerification: true,
    skipPaywall: true,
    createProject: true,
    projectName: "Test Project",
  });

  // Redirect non-admins
  if (status === "authenticated" && session && !session.isAdmin) {
    toast({
      title: "Access Denied",
      description: "You do not have permission to access this page.",
      variant: "destructive",
    });
    router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await adminService.createTestUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        skip_email_verification: formData.skipEmailVerification,
        skip_paywall: formData.skipPaywall,
        create_project: formData.createProject,
        project_name: formData.projectName,
      });

      toast({
        title: "Test User Created",
        description: `Successfully created test user: ${formData.email}`,
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        skipEmailVerification: true,
        skipPaywall: true,
        createProject: true,
        projectName: "Test Project",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create test user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4318FF]" />
      </div>
    );
  }

  if (!session?.isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Admin Only Feature</AlertTitle>
        <AlertDescription className="text-amber-700">
          Test users bypass email verification and paywall checks. Use only for testing purposes.
        </AlertDescription>
      </Alert>

      <Card className="border-none shadow-[0px_18px_40px_rgba(112,144,176,0.12)] rounded-3xl">
        <CardHeader>
          <CardTitle className="text-[#2B3674] font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-[#4318FF]" />
            Create Test User
          </CardTitle>
          <CardDescription className="text-[#A3AED0]">
            Create a test user account that bypasses normal registration requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#2B3674] font-medium">Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="rounded-xl border-[#E0E5F2] focus:border-[#4318FF] focus:ring-[#4318FF]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#2B3674] font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="test@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="rounded-xl border-[#E0E5F2] focus:border-[#4318FF] focus:ring-[#4318FF]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#2B3674] font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                className="rounded-xl border-[#E0E5F2] focus:border-[#4318FF] focus:ring-[#4318FF]"
              />
            </div>

            <div className="space-y-4 p-4 bg-[#F4F7FE] rounded-2xl">
              <h4 className="font-bold text-[#2B3674]">Options</h4>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="skipEmail"
                  checked={formData.skipEmailVerification}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, skipEmailVerification: checked === true })
                  }
                  className="border-[#4318FF] data-[state=checked]:bg-[#4318FF]"
                />
                <Label htmlFor="skipEmail" className="text-[#2B3674] cursor-pointer">
                  Skip email verification (mark as verified)
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="skipPaywall"
                  checked={formData.skipPaywall}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, skipPaywall: checked === true })
                  }
                  className="border-[#4318FF] data-[state=checked]:bg-[#4318FF]"
                />
                <Label htmlFor="skipPaywall" className="text-[#2B3674] cursor-pointer">
                  Skip paywall (grant subscription access)
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="createProject"
                  checked={formData.createProject}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, createProject: checked === true })
                  }
                  className="border-[#4318FF] data-[state=checked]:bg-[#4318FF]"
                />
                <Label htmlFor="createProject" className="text-[#2B3674] cursor-pointer">
                  Auto-create a project
                </Label>
              </div>

              {formData.createProject && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="projectName" className="text-[#2B3674] font-medium">Project Name</Label>
                  <Input
                    id="projectName"
                    placeholder="My Test Project"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    className="rounded-xl border-[#E0E5F2] focus:border-[#4318FF] focus:ring-[#4318FF]"
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4318FF] hover:bg-[#3311CC] text-white rounded-xl py-6 text-base font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Create Test User
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
