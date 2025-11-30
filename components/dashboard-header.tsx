"use client";

import { ProjectSelector } from "./project-selector";

export function DashboardHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
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
    </div>
  );
}
