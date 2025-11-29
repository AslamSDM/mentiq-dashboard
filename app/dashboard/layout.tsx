"use client";

import type React from "react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useStore } from "@/lib/store";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const { token, setToken, fetchProjects, isAuthenticated } = useStore();

  useEffect(() => {
    console.log("Session status changed:", status, session);
    console.log("Current token in Zustand:", token);
    console.log("Session access token:", session?.accessToken);

    if (status === "authenticated" && session?.accessToken) {
      console.log("Setting token from session:", session.accessToken);
      setToken(session.accessToken);
    } else if (status === "unauthenticated") {
      console.log("Unauthenticated, clearing token");
      setToken(null);
    }
  }, [status, session, setToken, token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchProjects();
    }
  }, [isAuthenticated, fetchProjects, token]);

  if (status === "loading") {
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
