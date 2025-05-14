"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Building,
  FileText,
  Leaf,
  Settings,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  const routes = [
    {
      label: "Dashboard",
      icon: BarChart3,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Projects",
      icon: Leaf,
      href: "/dashboard/projects",
      active: pathname.startsWith("/dashboard/projects"),
    },
    {
      label: "Farmers",
      icon: UserPlus,
      href: "/dashboard/farmers",
      active: pathname.startsWith("/dashboard/farmers"),
    },
    {
      label: "Partners",
      icon: Building,
      href: "/dashboard/partners",
      active: pathname.startsWith("/dashboard/partners"),
    },
    {
      label: "Reports",
      icon: FileText,
      href: "/dashboard/reports",
      active: pathname.startsWith("/dashboard/reports"),
    },
    {
      label: "Teams",
      icon: Users,
      href: "/dashboard/teams",
      active: pathname.startsWith("/dashboard/teams"),
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname.startsWith("/dashboard/settings"),
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-white transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M18 8c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4zM6 15c0-2.2 1.8-4 4-4M14 15c0-2.2 1.8-4 4-4M8 9c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM20 9c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM12 17c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM16 17c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-green-800">
              Carbon Grounds
            </span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="space-y-1 p-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  route.active
                    ? "bg-green-50 text-green-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <route.icon
                  className={cn(
                    "h-5 w-5",
                    route.active ? "text-green-700" : "text-gray-500",
                  )}
                />
                {route.label}
              </Link>
            ))}
          </div>

          <div className="mt-6 px-3">
            <div className="rounded-lg bg-green-50 p-3">
              <h3 className="font-medium text-green-800">Carbon Impact</h3>
              <p className="mt-1 text-xs text-green-700">
                Your projects have offset 1,240 tons of CO₂ this quarter!
              </p>
              <div className="mt-3">
                <div className="h-2 w-full rounded-full bg-green-200">
                  <div className="h-2 w-3/4 rounded-full bg-green-600"></div>
                </div>
                <p className="mt-1 text-xs text-green-700">
                  75% of quarterly goal
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
