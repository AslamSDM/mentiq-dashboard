"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { ProjectSelector } from "@/components/project-selector";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Mail,
  User,
  Activity,
  FolderOpen,
  UserCircle,
  Brain,
  Repeat,
  LifeBuoy,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  DollarSign,
  Shield,
  Plug,
  Clock,
  Gauge,
  Send,
  HelpCircle,
  BarChart2,
  Users,
  TrendingDown,
  Zap,
  Play,
} from "lucide-react";
import Image from "next/image";

const NAV_GROUPS = [
  {
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      {
        name: "Revenue Analytics",
        href: "/dashboard/revenue",
        icon: DollarSign,
      },
      { name: "Retention Cohorts", href: "/dashboard/retention", icon: Users },
      {
        name: "Churn Awareness",
        href: "/dashboard/churn",
        icon: TrendingDown,
      }, // Note: may need redirect mapped
      { name: "Feature Tracking", href: "/dashboard/features", icon: Zap },
      { name: "Session Replay", href: "/dashboard/session-replay", icon: Play },
      {
        name: "Churn by Channel",
        href: "/dashboard/churn-by-channel",
        icon: BarChart2,
      },
      { name: "Email Automations", href: "/dashboard/playbooks", icon: Mail },
      { name: "Sent Emails", href: "/dashboard/emails", icon: Send },
    ],
  },
  {
    label: "Workspace",
    items: [
      { name: "Projects", href: "/dashboard/projects", icon: FolderOpen },
      { name: "Team", href: "/dashboard/team", icon: UserCircle },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
      {
        name: "Integrations",
        href: "/dashboard/settings/integrations",
        icon: Plug,
      },
      { name: "Support", href: "/dashboard/support", icon: HelpCircle },
    ],
  },
];

const ADMIN_GROUP = {
  label: "Admin",
  items: [
    { name: "Admin Users", href: "/dashboard/admin/users", icon: Shield },
    { name: "Add Users", href: "/dashboard/admin/test-users", icon: User },
    { name: "Waitlist", href: "/dashboard/admin/waitlist", icon: Clock },
    // {
    //   name: "Usage Limits",
    //   href: "/dashboard/admin/limits",
    //   icon: FolderOpen,
    // },
    { name: "Admin Tickets", href: "/dashboard/admin/tickets", icon: Ticket },
    { name: "Usage Limits", href: "/dashboard/admin/limits", icon: Gauge },
  ],
};

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

  // Merge admin group if needed
  const groupsToRender = session?.isAdmin
    ? [...NAV_GROUPS, ADMIN_GROUP]
    : NAV_GROUPS;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 right-4 z-40 text-slate-800 bg-white/80 backdrop-blur-sm border shadow-sm"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "flex flex-col shrink-0 border-r transition-all duration-300 z-50 fixed inset-y-0 left-0 md:relative",
          isCollapsed ? "w-[56px]" : "w-[220px]",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#E7E5E4",
        }}
      >
        <div
          className="flex items-center justify-between h-[56px] px-4 border-b shrink-0 bg-white"
          style={{ borderColor: "#E7E5E4" }}
        >
          {!isCollapsed ? (
            <Link href="/" onClick={() => setIsMobileOpen(false)}>
              <div className="relative h-30 w-36">
                <Image
                  src="/logo.png"
                  alt="Mentiq"
                  fill
                  className="object-contain -ml-8"
                  priority
                />
              </div>
            </Link>
          ) : (
            <Link
              href="/"
              className="mx-auto"
              onClick={() => setIsMobileOpen(false)}
            >
              <span
                className="text-[1rem] font-bold"
                style={{ color: "#2563EB" }}
              >
                M
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-slate-600 hover:text-slate-900"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Project Selector embedded at the top */}
        {!isCollapsed && (
          <div className="px-3 py-3 border-b border-gray-100 flex items-center justify-center">
            <ProjectSelector />
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-hide">
          {groupsToRender.map((group, gi) => (
            <div key={gi}>
              {group.label && !isCollapsed && (
                <>
                  <p
                    className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] px-2 mb-1"
                    style={{ color: "#A8A29E" }}
                  >
                    {group.label}
                  </p>
                  <div
                    className="h-px mb-2 mx-2"
                    style={{ backgroundColor: "#F3F2F1" }}
                  />
                </>
              )}
              {group.label && isCollapsed && (
                <div
                  className="h-px mb-2 mx-2 mt-4"
                  style={{ backgroundColor: "#F3F2F1" }}
                />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className="group block"
                    >
                      <div
                        className={cn(
                          "flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors duration-100 cursor-pointer",
                          isCollapsed && "justify-center",
                        )}
                        style={{
                          backgroundColor: isActive
                            ? "rgba(37,99,235,0.08)"
                            : "transparent",
                          color: isActive ? "#2563EB" : "#78716C",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            (
                              e.currentTarget as HTMLDivElement
                            ).style.backgroundColor = "#F8F7F4";
                            (e.currentTarget as HTMLDivElement).style.color =
                              "#1C1917";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            (
                              e.currentTarget as HTMLDivElement
                            ).style.backgroundColor = "transparent";
                            (e.currentTarget as HTMLDivElement).style.color =
                              "#78716C";
                          }
                        }}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <item.icon
                          className="shrink-0"
                          style={{ width: "14px", height: "14px" }}
                          strokeWidth={isActive ? 2 : 1.75}
                        />
                        {!isCollapsed && (
                          <span className="text-[0.8125rem] font-medium truncate">
                            {item.name}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div
          className="border-t px-2 py-3 space-y-1"
          style={{ borderColor: "#E7E5E4" }}
        >
          <div
            className={cn(
              "flex items-center gap-2.5 px-2 py-1.5 rounded-md",
              isCollapsed && "justify-center",
            )}
            style={{ color: "#78716C" }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[0.65rem] font-semibold shrink-0"
              style={{
                backgroundColor: "rgba(37,99,235,0.1)",
                color: "#2563EB",
              }}
            >
              {session?.user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p
                  className="text-[0.75rem] font-medium truncate"
                  style={{ color: "#1C1917" }}
                >
                  {session?.user?.name || "Anonymous User"}
                </p>
                <p
                  className="text-[0.65rem] truncate"
                  style={{ color: "#A8A29E" }}
                >
                  Pro Plan
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleSignOut}
            className={cn(
              "flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md transition-colors duration-100",
              isCollapsed && "justify-center",
            )}
            style={{ color: "#A8A29E" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#DC2626";
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "rgba(220,38,38,0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#A8A29E";
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "transparent";
            }}
            title={isCollapsed ? "Sign out" : undefined}
          >
            <LogOut
              style={{ width: "14px", height: "14px" }}
              strokeWidth={1.75}
              className="shrink-0"
            />
            {!isCollapsed && (
              <span className="text-[0.8125rem] font-medium">Sign out</span>
            )}
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "hidden md:flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md transition-colors duration-100",
              isCollapsed && "justify-center",
            )}
            style={{ color: "#A8A29E" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#F8F7F4";
              (e.currentTarget as HTMLButtonElement).style.color = "#78716C";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#A8A29E";
            }}
          >
            {isCollapsed ? (
              <ChevronRight
                style={{ width: "14px", height: "14px" }}
                strokeWidth={1.75}
              />
            ) : (
              <>
                <ChevronLeft
                  style={{ width: "14px", height: "14px" }}
                  strokeWidth={1.75}
                />
                <span className="text-[0.8125rem] font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
