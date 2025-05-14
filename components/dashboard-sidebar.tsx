"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Users, FileText, Settings, Leaf, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    {
      label: "Dashboard",
      icon: BarChart3,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Team Management",
      icon: Users,
      href: "/dashboard/team",
      active: pathname === "/dashboard/team",
    },
    {
      label: "Projects",
      icon: Leaf,
      href: "/dashboard/projects",
      active: pathname === "/dashboard/projects",
    },
    {
      label: "Reports",
      icon: FileText,
      href: "/dashboard/reports",
      active: pathname === "/dashboard/reports",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
  ]

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-40 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-4 w-4" />
      </Button>
      <div
        className={cn("fixed inset-0 z-30 bg-black/60 md:hidden", isOpen ? "block" : "hidden")}
        onClick={() => setIsOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform border-r bg-white transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-700" />
            <span className="font-bold text-green-800">Carbon Grounds</span>
          </Link>
        </div>
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900",
                    route.active ? "bg-gray-100 text-gray-900" : "text-gray-500",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 w-full border-t p-4">
          <Button
            variant="outline"
            className="w-full justify-start text-gray-500 hover:text-gray-900"
            onClick={() => (window.location.href = "/")}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>
    </>
  )
}
