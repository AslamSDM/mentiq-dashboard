"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  LayoutDashboard,
  Bell,
  Users,
  Zap,
  Brain,
  Map,
  LineChart,
  BarChart,
  LogOut,
  FolderKanban,
  Settings,
  Activity,
  Globe,
  Smartphone,
  Repeat,
  Flame,
  FlaskConical,
  Heart,
  AlertTriangle,
  GitMerge,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  DollarSign,
} from "lucide-react";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  // {
  //   name: "Analytics",
  //   href: "/dashboard/analytics",
  //   icon: <BarChart className="h-5 w-5" />,
  // },
  // {
  //   name: "Location Analytics",
  //   href: "/dashboard/location",
  //   icon: <Globe className="h-5 w-5" />,
  // },
  // {
  //   name: "Device Analytics",
  //   href: "/dashboard/devices",
  //   icon: <Smartphone className="h-5 w-5" />,
  // },
  {
    name: "Revenue Analytics",
    href: "/dashboard/revenue",
    icon: <LineChart className="h-5 w-5" />,
  },
  {
    name: "Retention Cohorts",
    href: "/dashboard/retention",
    icon: <Repeat className="h-5 w-5" />,
  },
  {
    name: "Churn Analysis",
    href: "/dashboard/churn",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    name: "Feature Adoption",
    href: "/dashboard/adoption",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    name: "Feature Tracking",
    href: "/dashboard/features",
    icon: <Activity className="h-5 w-5" />,
  },
  // {
  //   name: "Heatmaps",
  //   href: "/dashboard/heatmaps",
  //   icon: <Flame className="h-5 w-5" />,
  // },
  // {
  //   name: "A/B Testing",
  //   href: "/dashboard/ab-testing",
  //   icon: <FlaskConical className="h-5 w-5" />,
  // },
  {
    name: "User Health Score",
    href: "/dashboard/health-score",
    icon: <Heart className="h-5 w-5" />,
  },
  // {
  //   name: "Churn Risk",
  //   href: "/dashboard/churn-risk",
  //   icon: <AlertTriangle className="h-5 w-5" />,
  // },
  // {
  //   name: "Path Analysis",
  //   href: "/dashboard/path-analysis",
  //   icon: <GitMerge className="h-5 w-5" />,
  // },
  {
    name: "Session Replay",
    href: "/dashboard/session-replay",
    icon: <Map className="h-5 w-5" />,
  },
  // {
  //   name: "Revenue Leakage",
  //   href: "/dashboard/revenue-leakage",
  //   icon: <TrendingDown className="h-5 w-5" />,
  // },
  {
    name: "Churn by Channel",
    href: "/dashboard/churn-by-channel",
    icon: <Brain className="h-5 w-5" />,
  },
  {
    name: "Growth Playbooks",
    href: "/dashboard/playbooks",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    name: "Projects",
    href: "/dashboard/projects",
    icon: <FolderKanban className="h-5 w-5" />,
  },
  // {
  //   name: "Pricing",
  //   href: "/dashboard/pricing",
  //   icon: <Settings className="h-5 w-5" />,
  // },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-40 text-white bg-slate-900/50 backdrop-blur-sm border border-slate-800"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "flex h-full flex-col border-r border-slate-800 bg-[#0f172a] text-slate-300 transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          "fixed inset-y-0 left-0 z-50 md:relative",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <div className="flex items-center justify-start gap-3 overflow-hidden -ml-2">
            <img
              src="/logo.png"
              alt="Mentiq Logo"
              className={cn(
                "object-contain transition-all duration-300",
                isCollapsed ? "hidden" : "h-10 w-10"
              )}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <div className={cn(isCollapsed && "scale-90")}>{item.icon}</div>
                {!isCollapsed && item.name}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-800 p-4 space-y-3">
          {session?.user && !isCollapsed && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-900/50">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <span className="text-sm font-medium">
                  {session.user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
          )}
          {session?.user && isCollapsed && (
            <div className="flex justify-center">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <span className="text-base font-medium">
                  {session.user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className={cn(
              "w-full text-slate-400 hover:text-white hover:bg-slate-800",
              isCollapsed ? "justify-center px-0" : "justify-start"
            )}
            onClick={handleSignOut}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut
              className={cn("h-5 w-5", !isCollapsed ? "mr-2" : "scale-125")}
            />
            {!isCollapsed && "Sign Out"}
          </Button>
        </div>
      </div>
    </>
  );
}
