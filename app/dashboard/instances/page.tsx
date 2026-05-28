"use client";

import { useEffect, useState } from "react";
import { instancesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Plus, Eye, Loader2, Sprout, TreePine, MapPin, Search,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function InstancesPage() {
  const [instances, setInstances] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 15;

  const load = (pg = 1) => {
    setLoading(true);
    instancesApi.getAll({ page: pg, limit })
      .then((res) => {
        const data = res.data?.data || [];
        setInstances(data);
        setTotal(res.data?.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]);

  // Fix: areaAcres is a string from DB — parse it
  const totalTrees = instances.reduce((s, i) => s + (Number(i.totalPlantingUnits) || 0), 0);
  const totalArea = instances.reduce((s, i) => s + (parseFloat(i.areaAcres) || 0), 0);

  const filtered = search
    ? instances.filter((i) =>
        i.instanceId?.toLowerCase().includes(search.toLowerCase()) ||
        i.farmer?.farmerName?.toLowerCase().includes(search.toLowerCase())
      )
    : instances;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Farm Plots</h1>
          <p className="text-muted-foreground">
            All registered farm plots — click <Eye className="inline h-3 w-3" /> to view details
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/map">
              <MapPin className="mr-2 h-4 w-4" /> View Map
            </Link>
          </Button>
          <Button asChild className="bg-green-700 hover:bg-green-800">
            <Link href="/dashboard/instances/create">
              <Plus className="mr-2 h-4 w-4" /> Add Plot
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <Sprout className="h-4 w-4 text-green-700" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Plots</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-100 p-2">
                <TreePine className="h-4 w-4 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Trees</p>
                <p className="text-2xl font-bold text-emerald-700">{totalTrees.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <MapPin className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Area</p>
                <p className="text-2xl font-bold text-blue-700">{totalArea.toFixed(1)} ac</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>All Farm Plots</CardTitle>
              <CardDescription>{total} registered plots</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search plot ID or farmer..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plot ID</TableHead>
                    <TableHead>Farmer Name</TableHead>
                    <TableHead>Area (acres)</TableHead>
                    <TableHead>Trees</TableHead>
                    <TableHead>Land Use</TableHead>
                    <TableHead>Eco Zone</TableHead>
                    <TableHead>Irrigation</TableHead>
                    <TableHead>Monitoring</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                        {search ? "No plots match your search" : "No farm plots registered yet"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((inst) => (
                      <TableRow key={inst.id} className="hover:bg-green-50/50">
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                            {inst.instanceId}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/dashboard/farmers/${inst.farmerId}`}
                            className="font-medium text-green-700 hover:underline"
                          >
                            {inst.farmer?.farmerName || "—"}
                          </Link>
                        </TableCell>
                        <TableCell className="font-medium">
                          {parseFloat(inst.areaAcres || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-emerald-700">
                            {inst.totalPlantingUnits || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {inst.landUseType || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {inst.ecologicalZone || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {inst.irrigationType || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              inst.monitoringFrequency === "ANNUAL"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-gray-100 text-gray-600"
                            }
                          >
                            {inst.monitoringFrequency || "ANNUAL"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button asChild variant="ghost" size="sm" className="hover:bg-green-100">
                            <Link href={`/dashboard/instances/${inst.id}`}>
                              <Eye className="h-4 w-4 text-green-700" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} — {total} total plots
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline" size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
