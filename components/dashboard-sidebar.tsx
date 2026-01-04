"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import {
  LayoutDashboard,
  BarChart,
  Settings,
  LogOut,
  Zap,
  User,
  Bell,
  Activity,
  FolderKanban,
  Brain,
  Globe,
  Smartphone,
  Repeat,
  Flame,
  FlaskConical,
  Heart,
  AlertTriangle,
  GitMerge,
  LifeBuoy,
  Ticket,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  DollarSign,
  Shield,
} from "lucide-react";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    name: "Revenue Analytics",
    href: "/dashboard/revenue",
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    name: "Retention Cohorts",
    href: "/dashboard/retention",
    icon: <Repeat className="h-5 w-5" />,
  },
  {
    name: "Churn Awareness",
    href: "/dashboard/churn",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    name: "Feature Tracking",
    href: "/dashboard/features",
    icon: <Activity className="h-5 w-5" />,
  },
  {
    name: "Session Replay",
    href: "/dashboard/session-replay",
    icon: <Repeat className="h-5 w-5" />,
  },
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
  {
    name: "Team",
    href: "/dashboard/team",
    icon: <User className="h-5 w-5" />,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    name: "Support",
    href: "/dashboard/support",
    icon: <LifeBuoy className="h-5 w-5" />,
  },
];

const adminNavigation = [
  {
    name: "Admin Users",
    href: "/dashboard/admin/users",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    name: "Test Users",
    href: "/dashboard/admin/test-users",
    icon: <User className="h-5 w-5" />,
  },
  {
    name: "Admin Projects",
    href: "/dashboard/admin/projects",
    icon: <FolderKanban className="h-5 w-5" />,
  },
  {
    name: "Admin Analytics",
    href: "/dashboard/admin/analytics",
    icon: <BarChart className="h-5 w-5" />,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const logout = useStore((state) => state.logout);

  const handleSignOut = useCallback(async () => {
    logout();
    if (typeof window !== "undefined") {
      localStorage.removeItem("mentiq-storage");
      localStorage.removeItem("selectedProjectId");
      localStorage.removeItem("impersonatedProjectId");
      localStorage.removeItem("onboarding_banner_dismissed");
    }
    await signOut({ callbackUrl: "/signin" });
  }, [logout]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-40 text-[#2B3674] bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#2B3674]/20 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={cn(
          "flex h-full flex-col bg-white transition-all duration-300 shadow-[0_18px_40px_rgba(112,144,176,0.12)]", // Light theme background and soft shadow
          isCollapsed ? "w-20" : "w-72",
          "fixed inset-y-0 left-0 z-50 md:relative",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-20 items-center justify-between px-2 border-b border-gray-100">
          <div className={cn("flex items-center gap-3 overflow-hidden transition-all duration-300", isCollapsed && "w-0 opacity-0")}>
             <div className="relative h-30 w-30">
              <img
                src="/logo.png"
                alt="Mentiq Logo"
                className={
                  "object-contain transition-all duration-300" + "h-30 w-30"
                }
              />
            </div>
          </div>
          
           {/* Collapse Toggle (Desktop only) */}
          <Button
            variant="ghost"
            size="icon"
            className={cn("hidden md:flex h-8 w-8 text-[#4363C7] hover:text-[#2B3674] shrink-0", isCollapsed && "mx-auto")}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>

          {/* Close Button (Mobile only) */}
           <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-[#4363C7] hover:text-[#2B3674]"
             onClick={() => setIsMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto scrollbar-hide">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative group my-1",
                  isActive
                    ? "text-[#2B3674] font-bold bg-[#F4F7FE]" // Active state: Dark text on light blue bg
                    : "text-[#4363C7] hover:text-[#2B3674]", // Inactive state: Muted text
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                 {/* Active Indicator Line */}
                 {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-l-lg bg-[#4318FF]" />
                 )}

                <div className={cn("transition-colors", isActive ? "text-[#4318FF]" : "text-[#4363C7] group-hover:text-[#2B3674]")}>
                    {item.icon}
                </div>
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}

            {/* Admin Section */}
          {session?.isAdmin && (
            <>
              {!isCollapsed && (
                <div className="px-4 py-2 text-xs font-bold text-[#4363C7] uppercase tracking-wider mt-4">
                  Admin
                </div>
              )}
              {isCollapsed && <div className="h-px w-full bg-gray-100 my-2" />}

              {adminNavigation.map((item) => {
                 const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative group my-1",
                        isActive
                            ? "text-[#2B3674] font-bold bg-[#F4F7FE]"
                            : "text-[#4363C7] hover:text-[#2B3674]",
                         isCollapsed && "justify-center px-2"
                    )}
                     title={isCollapsed ? item.name : undefined}
                  >
                     {isActive && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-l-lg bg-[#4318FF]" />
                     )}
                    <div className={cn("transition-colors", isActive ? "text-[#4318FF]" : "text-[#4363C7] group-hover:text-[#2B3674]")}>
                      {item.icon}
                    </div>
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User Profile / Logout Section */}
        <div className="p-4 mx-2 mb-2">
            {!isCollapsed ? (
                <div className="rounded-2xl bg-gradient-to-br from-[#868CFF] to-[#4318FF] p-4 text-white shadow-lg relative overflow-hidden">
                     <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                     
                     <div className="flex items-center gap-3 mb-3 relative z-10">
                         <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white border-2 border-white/30">
                             {session?.user?.image ? (
                                <img src={session.user.image} alt="User" className="rounded-full h-full w-full object-cover" />
                             ) : (
                                <span className="font-bold">{session?.user?.name?.charAt(0).toUpperCase()}</span>
                             )}
                         </div>
                         <div className="min-w-0">
                             <p className="font-bold text-sm truncate">{session?.user?.name}</p>
                             <p className="text-xs text-white/80 truncate">Pro Plan</p>
                         </div>
                     </div>

                     <Button
                        variant="secondary"
                        size="sm"
                        className="w-full bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm justify-start"
                        onClick={handleSignOut}
                     >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                     </Button>
                </div>
            ) : (
                 <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-12 text-[#4363C7] hover:text-[#E31A1A] hover:bg-red-50"
                    onClick={handleSignOut}
                    title="Sign Out"
                >
                    <LogOut className="h-5 w-5" />
                </Button>
            )}
        </div>
      </div>
    </>
  );
}
