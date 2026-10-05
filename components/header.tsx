"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Menu, Search, User, LogOut, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { monitoringApi } from "@/lib/api";
import { ProfileDialog } from "@/components/profile-dialog";

export function Header({
  setSidebarOpen,
}: {
  setSidebarOpen: (open: boolean) => void;
}) {
  const [pending, setPending] = useState<any[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const loadPending = () => {
      monitoringApi
        .getPending()
        .then((res) => setPending(res.data || []))
        .catch(() => {});
    };
    loadPending();
    const interval = setInterval(loadPending, 60000);
    return () => clearInterval(interval);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const roleLabel: Record<string, string> = {
    ADMIN: "Admin",
    PROJECT_MANAGER: "Project Manager",
    FIELD_OFFICER: "Field Officer",
    ANALYST: "Analyst",
    VIEWER: "Viewer",
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="hidden items-center gap-2 md:flex">
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
      </div>

      <div className="hidden flex-1 px-8 md:block">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-full border-gray-200 bg-gray-50 pl-8 focus-visible:ring-green-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {pending.length > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 p-0 text-xs text-white">
                  {pending.length}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Pending Verifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {pending.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-gray-500">
                No pending monitoring periods
              </div>
            ) : (
              pending.slice(0, 6).map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => router.push("/dashboard/monitoring")}
                >
                  <ClipboardCheck className="mr-2 h-4 w-4 shrink-0 text-yellow-600" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm">
                      {p.instance?.name ?? `Instance ${p.instanceId?.slice(0, 8) ?? ""}`}
                    </span>
                    <span className="text-xs text-gray-500">{p.status?.replace("_", " ")}</span>
                  </div>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer justify-center text-sm font-medium text-green-700"
              onClick={() => router.push("/dashboard/monitoring")}
            >
              View all
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-green-100 text-green-800 font-semibold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name ?? "Loading..."}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                {user?.role && (
                  <span className="text-xs text-green-700 font-medium">
                    {roleLabel[user.role] ?? user.role}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => setProfileOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 cursor-pointer"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </header>
  );
}
