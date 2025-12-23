"use client";

import type React from "react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { OnboardingTaskBanner } from "@/components/onboarding-task-banner";
import { Button } from "@/components/ui/button";
import { X, Eye } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const {
    token,
    setToken,
    fetchProjects,
    isAuthenticated,
    projects,
    projectsLoaded,
    selectedProjectId,
    setSelectedProjectId,
    impersonatedProjectId,
    impersonatedProjectName,
    impersonatedUserEmail,
    clearImpersonation,
  } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("Session status changed:", status, session);
    console.log("Current token in Zustand:", token);
    console.log("Session access token:", session?.accessToken);
    console.log("Session project ID:", session?.projectId);

    if (status === "authenticated" && session?.accessToken) {
      console.log("Setting token from session:", session.accessToken);
      setToken(session.accessToken, session.refreshToken);
    } else if (status === "unauthenticated") {
      console.log("Unauthenticated, clearing token");
      setToken(null, null);
    }
  }, [status, session, setToken, token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchProjects();
    }
  }, [isAuthenticated, fetchProjects, token]);

  // Set project ID from session after projects are loaded
  useEffect(() => {
    if (
      projectsLoaded &&
      session?.projectId &&
      !selectedProjectId &&
      projects.length > 0
    ) {
      console.log(
        "Projects loaded, setting project ID from session:",
        session.projectId
      );
      // Check if the session project ID exists in the projects list
      const projectExists = projects.some((p) => p.id === session.projectId);
      if (projectExists) {
        setSelectedProjectId(session.projectId);
      } else {
        console.log(
          "Session project not found in projects list, using first project"
        );
        setSelectedProjectId(projects[0].id);
      }
    }
  }, [
    projectsLoaded,
    session?.projectId,
    selectedProjectId,
    projects,
    setSelectedProjectId,
  ]);

  // Redirect to verify-email page if email is not verified
  useEffect(() => {
    if (status === "authenticated" && session?.emailVerified === false) {
      router.push("/verify-email");
    }
  }, [status, session?.emailVerified, router]);

  // Redirect to projects page if no projects exist and not already on projects page
  useEffect(() => {
    if (pathname === "/dashboard/onboarding") return;
    if (
      projectsLoaded &&
      (!projects || projects.length === 0) &&
      pathname !== "/dashboard/projects"
    ) {
      router.push("/dashboard/onboarding");
    }
  }, [projectsLoaded, projects, pathname, router]);

  // SECURITY: Clear impersonation if user is not an admin
  useEffect(() => {
    if (status === "authenticated" && session && impersonatedProjectId) {
      if (!session.isAdmin) {
        console.warn(
          "🚨 SECURITY: Non-admin user has impersonation set, clearing it"
        );
        clearImpersonation();
        // Also clear from localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("mentiq-storage");
        }
      }
    }
  }, [status, session, impersonatedProjectId, clearImpersonation]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading while fetching projects
  if (!projectsLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden flex-col">
      {/* Admin Impersonation Banner - Only shown for admin users */}
      {session?.isAdmin && impersonatedProjectId && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">
              Viewing as: <strong>{impersonatedUserEmail}</strong> - Project:{" "}
              <strong>{impersonatedProjectName}</strong>
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearImpersonation();
              // Reload the page to force fresh data
              window.location.href = "/dashboard/admin/users";
            }}
            className="hover:bg-amber-600 text-amber-950"
          >
            <X className="h-4 w-4 mr-1" />
            Exit View
          </Button>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto">
          <OnboardingTaskBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
