"use client";

import type React from "react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

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

      // Set selected project ID from session if available and not already set
      if (session.projectId) {
        console.log("Setting project ID from session:", session.projectId);
        setSelectedProjectId(session.projectId);
      }
    } else if (status === "unauthenticated") {
      console.log("Unauthenticated, clearing token");
      setToken(null, null);
    }
  }, [
    status,
    session,
    setToken,
    token,
    selectedProjectId,
    setSelectedProjectId,
  ]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchProjects();
    }
  }, [isAuthenticated, fetchProjects, token]);

  // Redirect to projects page if no projects exist and not already on projects page
  useEffect(() => {
    if (
      projectsLoaded &&
      (!projects || projects.length === 0) &&
      pathname !== "/dashboard/projects"
    ) {
      router.push("/dashboard/projects");
    }
  }, [projectsLoaded, projects, pathname, router]);

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
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
