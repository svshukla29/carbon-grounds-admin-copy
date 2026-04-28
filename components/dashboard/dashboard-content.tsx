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
import { MetricCard } from "@/components/dashboard/metric-card";
import { ProjectProgressChart } from "@/components/dashboard/project-progress-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { dashboardApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface DashboardStats {
  totalProjects: number;
  activeFarmers: number;
  totalVillages: number;
  totalCarbonCredits: number;
  totalFarmers: number;
  totalReports: number;
  totalTeamMembers: number;
}

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardApi.getStats();
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your sustainability projects.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              <span className="ml-2 text-muted-foreground">
                Loading stats...
              </span>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                title="Active Projects"
                value={stats?.totalProjects?.toString() ?? "0"}
                trend="up"
                trendValue="Live"
                icon="leaf"
                description="Total sustainability projects"
              />
              <MetricCard
                title="Active Farmers"
                value={stats?.activeFarmers?.toLocaleString() ?? "0"}
                trend="up"
                trendValue="Verified"
                icon="users"
                description={`${stats?.totalFarmers ?? 0} total registered`}
              />
              <MetricCard
                title="Total Villages"
                value={stats?.totalVillages?.toString() ?? "0"}
                trend="up"
                trendValue="Locations"
                icon="dollar"
                description="Distinct villages / locations covered"
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
              <CardContent>
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
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and insights will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-[400px] items-center justify-center">
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
            <CardContent className="flex h-[400px] items-center justify-center">
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
