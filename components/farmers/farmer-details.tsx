"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileEdit, Trash2, Phone, MapPin, TreePine, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { farmersApi, instancesApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DeleteFarmerDialog } from "@/components/farmers/delete-farmer-dialog";

export function FarmerDetails({ id }: { id: string }) {
  const [farmer, setFarmer] = useState<any>(null);
  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    farmersApi.getOne(id)
      .then((res) => {
        setFarmer(res.data);
        // Load their farm plots
        return instancesApi.getAll({ farmerId: id, limit: 50 });
      })
      .then((res) => setInstances(res.data?.data || []))
      .catch(() => router.push("/dashboard/farmers"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleDeleteConfirm = async () => {
    try { await farmersApi.delete(id); } catch (e) { console.error(e); }
    setDeleteDialogOpen(false);
    router.push("/dashboard/farmers");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-600" />
      </div>
    );
  }

  if (!farmer) return null;

  const initials = farmer.farmerName
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const totalTrees = instances.reduce((s, i) => s + (Number(i.totalPlantingUnits) || 0), 0);
  const totalArea = instances.reduce((s, i) => s + (parseFloat(i.areaAcres) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/farmers"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-800 font-bold text-lg shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{farmer.farmerName}</h1>
              <Badge className="bg-green-100 text-green-700">{farmer.category}</Badge>
              {farmer.isPvtg && <Badge className="bg-orange-100 text-orange-700">PVTG</Badge>}
              {farmer.bpl && <Badge className="bg-blue-100 text-blue-700">BPL</Badge>}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {farmer.villageName}, {farmer.district}, {farmer.state}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/farmers/edit/${farmer.id}`}>
              <FileEdit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Instance ID", value: farmer.instanceId, mono: true },
          { label: "Mobile", value: farmer.mobileNo, icon: Phone },
          { label: "Farm Plots", value: instances.length, icon: Sprout },
          { label: "Total Trees", value: totalTrees.toLocaleString(), icon: TreePine },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-base font-bold mt-0.5 ${s.mono ? "font-mono text-sm" : ""}`}>
                {s.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Personal Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              { label: "Full Name", value: farmer.farmerName },
              { label: "Gender", value: farmer.gender },
              { label: "Category", value: farmer.category },
              { label: "Tribe", value: farmer.tribeName || "N/A" },
              { label: "PVTG", value: farmer.isPvtg ? "Yes" : "No" },
              { label: "BPL", value: farmer.bpl ? "Yes" : "No" },
              { label: "Mobile", value: farmer.mobileNo },
            ].map((r) => (
              <div key={r.label} className="flex justify-between border-b pb-1.5 last:border-0">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-medium">{r.value || "—"}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Location Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Location Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              { label: "Village", value: farmer.villageName },
              { label: "Village LGD Code", value: farmer.villageLgdCode },
              { label: "Block", value: farmer.block },
              { label: "Tehsil", value: farmer.tehsil },
              { label: "District", value: farmer.district },
              { label: "State", value: farmer.state },
              { label: "PIN Code", value: farmer.pinCode },
              { label: "Khasra No", value: farmer.khasraNo },
            ].map((r) => (
              <div key={r.label} className="flex justify-between border-b pb-1.5 last:border-0">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-medium">{r.value || "—"}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Farm Plots */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Farm Plots ({instances.length}) — Total {totalArea.toFixed(2)} acres, {totalTrees} trees
            </CardTitle>
            <Button asChild size="sm" className="bg-green-700 hover:bg-green-800">
              <Link href="/dashboard/instances/create">Add Plot</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {instances.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-muted-foreground gap-2">
              <Sprout className="h-10 w-10 text-gray-200" />
              <p>No farm plots registered for this farmer yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plot ID</TableHead>
                  <TableHead>Area (acres)</TableHead>
                  <TableHead>Trees</TableHead>
                  <TableHead>Land Use</TableHead>
                  <TableHead>Eco Zone</TableHead>
                  <TableHead>Survey Date</TableHead>
                  <TableHead>View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instances.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                        {inst.instanceId}
                      </code>
                    </TableCell>
                    <TableCell>{parseFloat(inst.areaAcres || 0).toFixed(2)}</TableCell>
                    <TableCell className="font-semibold text-emerald-700">
                      {inst.totalPlantingUnits || 0}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {inst.landUseType || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {inst.ecologicalZone || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {inst.surveyDate ? new Date(inst.surveyDate).toLocaleDateString("en-IN") : "—"}
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm" className="text-green-700 hover:bg-green-50">
                        <Link href={`/dashboard/instances/${inst.id}`}>View →</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DeleteFarmerDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        farmerName={farmer.farmerName}
      />
    </div>
  );
}
