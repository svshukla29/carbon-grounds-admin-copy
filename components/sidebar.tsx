"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  FileText,
  Leaf,
  Settings,
  Users,
  X,
  Map,
  TreePine,
  Building2,
  ShieldCheck,
  Calculator,
  Sprout,
  LogOut,
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
      label: "Gram Panchayats",
      icon: Building2,
      href: "/dashboard/gram-panchayat",
      active: pathname.startsWith("/dashboard/gram-panchayat"),
    },
    {
      label: "Farmers",
      icon: Users,
      href: "/dashboard/farmers",
      active: pathname.startsWith("/dashboard/farmers"),
    },
    {
      label: "Farm Plots",
      icon: Sprout,
      href: "/dashboard/instances",
      active: pathname.startsWith("/dashboard/instances"),
    },
    {
      label: "Trees",
      icon: TreePine,
      href: "/dashboard/trees",
      active: pathname.startsWith("/dashboard/trees"),
    },
    {
      label: "GIS Map",
      icon: Map,
      href: "/dashboard/map",
      active: pathname.startsWith("/dashboard/map"),
    },
    {
      label: "Monitoring",
      icon: ShieldCheck,
      href: "/dashboard/monitoring",
      active: pathname.startsWith("/dashboard/monitoring"),
    },
    {
      label: "Carbon Credits",
      icon: Calculator,
      href: "/dashboard/calculations",
      active: pathname.startsWith("/dashboard/calculations"),
    },
    {
      label: "Species Master",
      icon: Leaf,
      href: "/dashboard/species",
      active: pathname.startsWith("/dashboard/species"),
    },
    {
      label: "Reports",
      icon: FileText,
      href: "/dashboard/reports",
      active: pathname.startsWith("/dashboard/reports"),
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
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-white transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-700 text-white shrink-0">
              <Leaf className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-green-800 block leading-tight">
                Carbon Grounds
              </span>
              <span className="text-xs text-gray-400">Admin Panel</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Nav Links */}
        <ScrollArea className="flex-1">
          <div className="space-y-0.5 p-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  route.active
                    ? "bg-green-50 text-green-900 border-l-2 border-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <route.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    route.active ? "text-green-700" : "text-gray-400",
                  )}
                />
                {route.label}
              </Link>
            ))}
          </div>

          {/* Carbon Impact Box */}
          <div className="mt-4 mx-3 mb-4">
            <div className="rounded-lg bg-green-50 border border-green-100 p-3">
              <h3 className="text-xs font-semibold text-green-800">
                Platform Status
              </h3>
              <p className="mt-1 text-xs text-green-700">
                Chhattisgarh Demo — 10 farmers, 318 trees registered
              </p>
              <div className="mt-2">
                <div className="h-1.5 w-full rounded-full bg-green-200">
                  <div className="h-1.5 w-1/4 rounded-full bg-green-600" />
                </div>
                <p className="mt-1 text-xs text-green-600">Phase 1 of 4</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Logout */}
        <div className="border-t p-3 shrink-0">
          <button
            onClick={() => {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
