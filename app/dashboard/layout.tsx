"use client";

import type React from "react";
import { useEffect, useRef, useCallback } from "react";
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

  // Use refs to track initialization state to prevent redundant operations
  const hasInitialized = useRef(false);
  const hasFetchedProjects = useRef(false);
  const hasSetProject = useRef(false);

  // Sync auth token from session (only when status changes)
  useEffect(() => {
    if (status === "authenticated" && session?.accessToken && !hasInitialized.current) {
      hasInitialized.current = true;
      setToken(session.accessToken, session.refreshToken);
    } else if (status === "unauthenticated") {
      hasInitialized.current = false;
      hasFetchedProjects.current = false;
      hasSetProject.current = false;
      setToken(null, null);
    }
  }, [status, session?.accessToken, session?.refreshToken, setToken]);

  // Fetch projects once when authenticated
  useEffect(() => {
    if (isAuthenticated && token && !hasFetchedProjects.current && !projectsLoaded) {
      hasFetchedProjects.current = true;
      fetchProjects();
    }
  }, [isAuthenticated, token, projectsLoaded, fetchProjects]);

  // Set project ID from session after projects are loaded (once)
  useEffect(() => {
    if (
      projectsLoaded &&
      projects.length > 0 &&
      !selectedProjectId &&
      !hasSetProject.current
    ) {
      hasSetProject.current = true;
      // Use session project if it exists, otherwise use first project
      const targetProjectId = session?.projectId;
      const projectExists = targetProjectId && projects.some((p) => p.id === targetProjectId);
      setSelectedProjectId(projectExists ? targetProjectId : projects[0].id);
    }
  }, [projectsLoaded, projects, selectedProjectId, session?.projectId, setSelectedProjectId]);

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
        // SECURITY: Non-admin user has impersonation set, clearing it
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
