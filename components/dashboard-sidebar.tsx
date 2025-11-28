"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-800 bg-[#0f172a] text-slate-300">
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
          <Activity className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold text-white tracking-wide">
          MENTIQ
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 p-4 space-y-3">
        {session?.user && (
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
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
