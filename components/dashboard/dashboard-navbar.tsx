"use client";

import { Bell, Search, Info, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { ProjectSelector } from "@/components/project-selector";

interface DashboardNavbarProps {
  title?: string;
}

export function DashboardNavbar({ title = "Dashboard" }: DashboardNavbarProps) {
    const { data: session } = useSession();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-6 bg-[#F4F7FE]/50 backdrop-blur-sm sticky top-0 z-30 mb-2">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-[#707EAE]">Pages / {title}</p>
        <h1 className="text-3xl font-bold text-[#2B3674] tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-full shadow-[0px_18px_40px_rgba(112,144,176,0.12)]">
         {/* Project Selector embedded in navbar for quick access */}
         <div className="mr-2 border-r border-gray-100 pr-2">
            <ProjectSelector />
         </div>

        {/* Search Bar - hidden on mobile, visible on desktop */}
        <div className="relative hidden lg:block bg-[#F4F7FE] rounded-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#2B3674]" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border-none rounded-full leading-5 bg-transparent text-[#2B3674] placeholder-[#8F9BBA] focus:outline-none focus:ring-0 sm:text-sm transition-colors w-40 focus:w-60 transition-all"
            placeholder="Search..."
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-[#A3AED0] hover:text-[#2B3674] hover:bg-transparent rounded-full">
                <Bell className="h-5 w-5" />
            </Button>
             <Button variant="ghost" size="icon" className="text-[#A3AED0] hover:text-[#2B3674] hover:bg-transparent rounded-full">
                <Info className="h-5 w-5" />
            </Button>
            {/* Theme Toggle Placeholder */}
             <Button variant="ghost" size="icon" className="text-[#A3AED0] hover:text-[#2B3674] hover:bg-transparent rounded-full">
                <Moon className="h-5 w-5" />
            </Button>
        </div>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="h-10 w-10 rounded-full bg-[#11047A] text-white flex items-center justify-center font-bold text-sm cursor-pointer hover:shadow-lg transition-all border-[3px] border-white">
                {session?.user?.image ? (
                     <img src={session.user.image} alt="Profile" className="rounded-full w-full h-full object-cover" />
                ) : (
                    session?.user?.name?.charAt(0).toUpperCase() || "U"
                )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => signOut()}>
                Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
