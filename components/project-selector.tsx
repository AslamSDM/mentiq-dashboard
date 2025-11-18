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
  const {
    selectedProjectId,
    projects,
    setSelectedProjectId,
    fetchProjects,
    projectsLoaded,
    isAuthenticated,
  } = useStore();

  useEffect(() => {
    if (isAuthenticated && !projectsLoaded) {
      fetchProjects();
    }
  }, [isAuthenticated, projectsLoaded, fetchProjects]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

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
          >
            {selectedProject ? selectedProject.name : "Select a project"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {projects?.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
