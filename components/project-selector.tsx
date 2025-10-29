"use client";

import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useStore } from "../lib/store";

export function ProjectSelector() {
  const { selectedProjectId, projects, setSelectedProjectId } = useStore();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Project:</span>
      <Select
        value={selectedProjectId || ""}
        onValueChange={(value) => setSelectedProjectId(value)}
        disabled={projects.length === 0}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue
            placeholder={
              projects.length === 0 ? "No projects" : "Select a project"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
