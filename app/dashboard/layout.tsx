"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { can, pagePermission } from "@/lib/permissions";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert } from "lucide-react";

const DashboardLayoutPage = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // redirecting...
  }

  const required = pagePermission(pathname);
  if (required && !can(user?.role, required)) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <ShieldAlert className="h-10 w-10 text-amber-500" />
          <h2 className="text-xl font-semibold">You don&apos;t have access to this page</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Your role can view records but not create or change them here. Ask an administrator if you need this access.
          </p>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

export default DashboardLayoutPage;
