"use client";

import { useEffect, useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ProjectProgressChart } from "@/components/dashboard/project-progress-chart";
import { dashboardApi } from "@/lib/api";
import { Loader2, Users, Sprout, TreePine, MapPin, Leaf, Building2 } from "lucide-react";
import Link from "next/link";

export function DashboardContent() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">
          Carbon Credit Platform — Chhattisgarh Overview
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          <span className="ml-2 text-muted-foreground">Loading stats...</span>
        </div>
      ) : (
        <>
          {/* Stat Cards — Real Data */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Total Farmers"
              value={stats?.totalFarmers?.toLocaleString() ?? "0"}
              trend="up"
              trendValue="Registered"
              icon="users"
              description="Farmers enrolled in the platform"
            />
            <MetricCard
              title="Farm Plots"
              value={stats?.totalInstances?.toLocaleString() ?? "0"}
              trend="up"
              trendValue="Active"
              icon="leaf"
              description="Registered plots with GeoJSON boundaries"
            />
            <MetricCard
              title="Total Trees"
              value={stats?.totalTrees?.toLocaleString() ?? "0"}
              trend="up"
              trendValue="Planted"
              icon="dollar"
              description="Individual trees monitored on all plots"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Gram Panchayats",
                value: stats?.totalGramPanchayats ?? 0,
                icon: Building2,
                color: "blue",
                href: "/dashboard/gram-panchayat",
              },
              {
                label: "Tree Species",
                value: stats?.totalSpecies ?? 0,
                icon: Leaf,
                color: "teal",
                href: "/dashboard/species",
              },
              {
                label: "Carbon Credits",
                value: stats?.totalCarbonCredits ?? 0,
                icon: Sprout,
                color: "green",
                href: "/dashboard/calculations",
                suffix: " tCO₂e",
              },
              {
                label: "Monitoring Visits",
                value: stats?.totalReports ?? 0,
                icon: MapPin,
                color: "purple",
                href: "/dashboard/monitoring",
              },
            ].map((s) => (
              <Link key={s.label} href={s.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full bg-${s.color}-100 p-2 shrink-0`}>
                        <s.icon className={`h-4 w-4 text-${s.color}-700`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className="text-xl font-bold">
                          {s.value?.toLocaleString()}{s.suffix || ""}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Tree Planting Progress</CardTitle>
                <CardDescription>
                  Monthly planting targets vs actual (sample data — updates when monitoring data available)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectProgressChart />
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Platform usage summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    icon: "👨‍🌾",
                    label: "Farmers registered",
                    value: stats?.totalFarmers ?? 0,
                    sub: "Total enrolled farmers",
                  },
                  {
                    icon: "🌾",
                    label: "Farm plots mapped",
                    value: stats?.totalInstances ?? 0,
                    sub: "Plots with GPS boundary",
                  },
                  {
                    icon: "🌳",
                    label: "Trees monitored",
                    value: stats?.totalTrees ?? 0,
                    sub: "Individual tree records",
                  },
                  {
                    icon: "🏘️",
                    label: "Gram Panchayats",
                    value: stats?.totalGramPanchayats ?? 0,
                    sub: "CG GPs in system",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.sub}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-green-700">
                      {item.value?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
