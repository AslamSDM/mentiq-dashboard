"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronRight,
  X,
  Zap,
  CreditCard,
  Users,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completed_at?: string;
  route: string;
}

interface OnboardingTasksResponse {
  pending: OnboardingTask[];
  completed: OnboardingTask[];
  onboarding_complete: boolean;
  platform_selected: string;
}

const TASK_ICONS: Record<string, React.ReactNode> = {
  first_event: <Zap className="h-4 w-4" />,
  stripe_connected: <CreditCard className="h-4 w-4" />,
  team_invited: <Users className="h-4 w-4" />,
};

export function OnboardingTaskBanner() {
  const router = useRouter();
  const [tasks, setTasks] = useState<OnboardingTasksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  // Initialize dismissed state from localStorage immediately to prevent flash
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("onboarding_banner_dismissed") === "true";
    }
    return false;
  });
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    // Skip API call if already dismissed
    if (dismissed) {
      setLoading(false);
      return;
    }
    fetchTasks();
  }, [dismissed]);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/onboarding/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);

        // Auto-dismiss if all complete
        if (data.onboarding_complete) {
          setDismissed(true);
        }
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task: OnboardingTask) => {
    router.push(task.route);
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Store dismissal in localStorage
    localStorage.setItem("onboarding_banner_dismissed", "true");
  };

  // Note: Dismiss check is now done in useState initializer to prevent flash

  if (loading) {
    return null;
  }

  if (
    dismissed ||
    !tasks ||
    tasks.onboarding_complete ||
    (tasks.pending.length === 0 && !tasks.platform_selected)
  ) {
    return null;
  }

  // Show incomplete onboarding banner if skipped
  const wasSkipped = tasks.pending.length > 0 || !tasks.platform_selected;

  const completionPercentage =
    (tasks.completed.length / (tasks.completed.length + tasks.pending.length)) *
    100;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border-primary/20 shadow-lg">
            <CardContent className="p-4">
              {!minimized ? (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">
                          {wasSkipped
                            ? "Complete your setup"
                            : "Complete your setup"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {wasSkipped
                            ? `You skipped onboarding. ${
                                tasks.pending.length
                              } task${
                                tasks.pending.length !== 1 ? "s" : ""
                              } remaining`
                            : `${tasks.pending.length} task${
                                tasks.pending.length !== 1 ? "s" : ""
                              } remaining to unlock full analytics power`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setMinimized(true)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Minimize
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDismiss}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground font-medium">
                        {Math.round(completionPercentage)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionPercentage}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="h-full bg-gradient-to-r from-primary to-purple-500"
                      />
                    </div>
                  </div>

                  {/* Task List - Show both completed and pending */}
                  <div className="grid md:grid-cols-3 gap-3">
                    {/* Completed Tasks */}
                    {tasks.completed.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <Card className="bg-green-500/10 border-green-500/30">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center border border-green-500">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                              <Badge variant="secondary" className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">
                                Done
                              </Badge>
                            </div>
                            <h4 className="text-sm font-semibold text-foreground mb-1">
                              {task.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {task.description}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}

                    {/* Pending Tasks */}
                    {tasks.pending.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * (index + tasks.completed.length) }}
                      >
                        <Card
                          className="group cursor-pointer bg-card/50 border-border hover:border-primary/50 hover:bg-card transition-all"
                          onClick={() => handleTaskClick(task)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:bg-primary group-hover:border-primary transition-all">
                                {TASK_ICONS[task.id] || (
                                  <Check className="h-4 w-4 text-primary group-hover:text-white" />
                                )}
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <h4 className="text-sm font-semibold text-foreground mb-1">
                              {task.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {task.description}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                // Minimized view
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        Setup Progress
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-primary/20 text-primary border-primary/30"
                      >
                        {tasks.pending.length} pending
                      </Badge>
                      {tasks.completed.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-green-500/20 text-green-600 border-green-500/30"
                        >
                          {tasks.completed.length} done
                        </Badge>
                      )}
                    </div>
                    <div className="hidden sm:block w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-purple-500"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setMinimized(false)}
                      className="border-primary/30 bg-primary/10 text-foreground hover:bg-primary hover:text-white"
                    >
                      Show Tasks
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDismiss}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
