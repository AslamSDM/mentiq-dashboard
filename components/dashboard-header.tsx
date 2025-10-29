"use client";

import { useEffect, useState } from "react";
import { ProjectSelector } from "./project-selector";

export function DashboardHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) setUserEmail(email);
  }, []);

  return (
    <div className="flex items-center justify-between border-b bg-background px-6 py-4">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <ProjectSelector />
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">{userEmail}</p>
          <p className="text-xs text-muted-foreground">Account</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
          <span className="text-sm font-medium text-primary-foreground">
            {userEmail.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
