"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { instancesApi, treesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, Loader2, TreePine, MapPin, Sprout, Calendar,
  Droplets, Zap, Wifi, AlertTriangle,
} from "lucide-react";
import { TreeRowActions } from "@/components/instances/tree-row-actions";
import { MonitoringSection } from "@/components/instances/monitoring-section";

export default function InstanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [instance, setInstance] = useState<any>(null);
  const [trees, setTrees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      instancesApi.getOne(id),
      treesApi.getByInstance(id),
    ])
      .then(([instRes, treesRes]) => {
        setInstance(instRes.data);
        setTrees(Array.isArray(treesRes.data) ? treesRes.data : []);
      })
      .catch(() => router.push("/dashboard/instances"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const refreshTrees = async () => {
    if (!id) return;
    try {
      const treesRes = await treesApi.getByInstance(id);
      setTrees(Array.isArray(treesRes.data) ? treesRes.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!instance) return null;

  const aliveTrees = trees.filter((t) => !t.lossDate).length;
  const lostTrees = trees.filter((t) => t.lossDate).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/instances"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{instance.instanceId}</h1>
              <Badge className="bg-green-100 text-green-700">{instance.monitoringFrequency}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Farm Plot — {instance.farmer?.farmerName} •{" "}
              {instance.farmer?.villageName}, {instance.farmer?.district}
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/instances/edit/${id}`}>Edit Plot</Link>
        </Button>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Area", value: `${parseFloat(instance.areaAcres || 0).toFixed(2)} acres`, icon: Sprout, color: "green" },
          { label: "Trees", value: instance.totalPlantingUnits || trees.length, icon: TreePine, color: "emerald" },
          { label: "Alive", value: aliveTrees, icon: TreePine, color: "teal" },
          { label: "Lost", value: lostTrees, icon: AlertTriangle, color: "red" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2">
                <div className={`rounded-full bg-${s.color}-100 p-1.5`}>
                  <s.icon className={`h-4 w-4 text-${s.color}-700`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Details Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Plot Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Plot Information</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: "Instance ID", value: instance.instanceId },
              { label: "Land Use Type", value: instance.landUseType || "—" },
              { label: "Ecological Zone", value: instance.ecologicalZone || "—" },
              { label: "Survey Date", value: instance.surveyDate ? new Date(instance.surveyDate).toLocaleDateString("en-IN") : "—" },
              { label: "Khasra No", value: instance.farmer?.khasraNo || "—" },
            ].map((r) => (
              <div key={r.label} className="flex justify-between border-b pb-2 last:border-0">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-medium">{r.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Infrastructure */}
        <Card>
          <CardHeader><CardTitle className="text-base">Infrastructure</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: "Irrigation", value: instance.irrigationType || "Rainfed", icon: Droplets },
              { label: "Power", value: instance.powerAvailability || "—", icon: Zap },
              { label: "Internet", value: instance.internetAvailability || "—", icon: Wifi },
              { label: "Monitoring", value: instance.monitoringFrequency || "ANNUAL", icon: Calendar },
            ].map((r) => (
              <div key={r.label} className="flex justify-between border-b pb-2 last:border-0">
                <span className="text-muted-foreground flex items-center gap-1">
                  <r.icon className="h-3.5 w-3.5" /> {r.label}
                </span>
                <span className="font-medium">{r.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Farmer Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Farmer Details</CardTitle>
              {instance.farmerId && (
                <Button asChild variant="ghost" size="sm" className="text-green-700">
                  <Link href={`/dashboard/farmers/${instance.farmerId}`}>View Profile →</Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: "Name", value: instance.farmer?.farmerName || "—" },
              { label: "Mobile", value: instance.farmer?.mobileNo || "—" },
              { label: "Category", value: instance.farmer?.category || "—" },
              { label: "Village", value: instance.farmer?.villageName || "—" },
              { label: "District", value: instance.farmer?.district || "—" },
              { label: "State", value: instance.farmer?.state || "—" },
            ].map((r) => (
              <div key={r.label} className="flex justify-between border-b pb-2 last:border-0">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-medium">{r.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* GIS */}
        {instance.boundaryGeojson && (
          <Card>
            <CardHeader><CardTitle className="text-base">GIS Boundary</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-green-700 mb-2">
                <MapPin className="h-4 w-4" />
                <span>GeoJSON boundary recorded</span>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/dashboard/map?highlight=${instance.id}`}>
                  View on Map
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trees Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tree Records ({trees.length})</CardTitle>
              <CardDescription>Individual trees registered on this plot</CardDescription>
            </div>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => window.location.href = `/dashboard/instances/${id}/add-trees`}>
              <TreePine className="mr-2 h-4 w-4" /> Add Trees
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {trees.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground gap-2">
              <TreePine className="h-10 w-10 text-gray-200" />
              <p>No tree records for this plot yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tree ID</TableHead>
                  <TableHead>Species</TableHead>
                  <TableHead>DBH (cm)</TableHead>
                  <TableHead>Height (m)</TableHead>
                  <TableHead>Planting Date</TableHead>
                  <TableHead>GPS</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trees.map((tree) => (
                  <TableRow key={tree.id}>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                        {tree.treeId}
                      </code>
                    </TableCell>
                    <TableCell className="font-medium">
                      {tree.species?.commonName || tree.species?.scientificName || "—"}
                    </TableCell>
                    <TableCell>{tree.dbhCm ?? "—"}</TableCell>
                    <TableCell>{tree.heightM ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tree.plantingDate
                        ? new Date(tree.plantingDate).toLocaleDateString("en-IN")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {tree.gpsLat && tree.gpsLng
                        ? `${Number(tree.gpsLat).toFixed(4)}, ${Number(tree.gpsLng).toFixed(4)}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {tree.lossDate ? (
                        <Badge className="bg-red-100 text-red-700">Lost</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700">Alive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <TreeRowActions tree={tree} onUpdated={refreshTrees} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Monitoring & Calculations */}
      <MonitoringSection instanceId={id} />
    </div>
  );
}
