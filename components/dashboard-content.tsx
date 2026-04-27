"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCard } from "@/components/metric-card";
import { ProjectProgressChart } from "@/components/project-progress-chart";
import { ActivityFeed } from "@/components/activity-feed";
import { NotificationsPanel } from "@/components/notifications-panel";
import { dashboardApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

interface DashboardStats {
  totalFarmers: number;
  totalProjects: number;
  totalPartners: number;
  totalReports: number;
  totalTeamMembers: number;
  totalCarbonCredits: number;
}

export function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here&apos;s an overview of your sustainability projects.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              <span className="ml-2 text-muted-foreground">Loading stats...</span>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Projects"
                value={stats?.totalProjects?.toString() ?? "0"}
                trend="up"
                trendValue=""
                icon="leaf"
                description="Active carbon projects"
              />
              <MetricCard
                title="Registered Farmers"
                value={stats?.totalFarmers?.toString() ?? "0"}
                trend="up"
                trendValue=""
                icon="users"
                description="Enrolled in projects"
              />
              <MetricCard
                title="Carbon Credits"
                value={stats?.totalCarbonCredits?.toLocaleString() ?? "0"}
                trend="up"
                trendValue=""
                icon="carbon"
                description="Tons of CO₂ equivalent"
              />
              <MetricCard
                title="Partners"
                value={stats?.totalPartners?.toString() ?? "0"}
                trend="up"
                trendValue=""
                icon="dollar"
                description="Active partner organizations"
              />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-7">
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
                <CardDescription>
                  Monthly progress across all active sustainability projects
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ProjectProgressChart />
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates from your projects and team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityFeed />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Important alerts and messages requiring your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationsPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and insights will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">
                Analytics dashboard coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Generated reports and documents will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">
                Reports dashboard coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
