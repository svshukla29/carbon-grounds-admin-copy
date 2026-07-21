"use client";

import { useEffect, useState } from "react";
import { treesApi, instancesApi, speciesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TreePine, Loader2, AlertTriangle, Download } from "lucide-react";
import { AddTreesDialog } from "@/components/instances/add-trees-dialog";
import { TreeRowActions } from "@/components/instances/tree-row-actions";
import { useToast } from "@/hooks/use-toast";

export default function TreesPage() {
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  const [trees, setTrees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInstances, setLoadingInstances] = useState(true);
  const [species, setSpecies] = useState<{ id: string; commonName: string }[]>([]);
  const [exportSpecies, setExportSpecies] = useState("all");
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    instancesApi.getAll({ limit: 100 })
      .then((res) => setInstances(res.data?.data || []))
      .catch(console.error)
      .finally(() => setLoadingInstances(false));
    speciesApi.getAll()
      .then((res) => setSpecies(res.data || []))
      .catch(console.error);
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await treesApi.export({
        species: exportSpecies !== "all" ? exportSpecies : undefined,
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "trees-export.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Failed to export trees", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const refreshTrees = () => {
    if (!selectedInstance) return;
    setLoading(true);
    treesApi.getByInstance(selectedInstance)
      .then((res) => setTrees(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!selectedInstance) return;
    refreshTrees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInstance]);

  const aliveTrees = trees.filter((t) => !t.lossDate);
  const lostTrees = trees.filter((t) => t.lossDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trees</h1>
          <p className="text-muted-foreground">View individual tree records by farm plot</p>
        </div>
        <div className="flex gap-2">
          <Select value={exportSpecies} onValueChange={setExportSpecies}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Species" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Species</SelectItem>
              {species.map((s) => (
                <SelectItem key={s.id} value={s.commonName}>{s.commonName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <Download className="mr-2 h-4 w-4" />}
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Plot selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium shrink-0">Select Farm Plot:</label>
            {loadingInstances ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                <SelectTrigger className="w-80">
                  <SelectValue placeholder="Choose a plot to view trees..." />
                </SelectTrigger>
                <SelectContent>
                  {instances.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.instanceId} — {inst.farmer?.farmerName || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedInstance && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <TreePine className="h-4 w-4 text-green-700" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Trees</p>
                    <p className="text-2xl font-bold">{trees.length}</p>
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
                    <p className="text-xs text-muted-foreground">Alive</p>
                    <p className="text-2xl font-bold text-emerald-700">{aliveTrees.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-red-100 p-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Lost</p>
                    <p className="text-2xl font-bold text-red-600">{lostTrees.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trees table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tree Records</CardTitle>
                  <CardDescription>Individual trees registered on this plot</CardDescription>
                </div>
                <AddTreesDialog instanceId={selectedInstance} onTreesAdded={refreshTrees} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-green-600" />
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
                      <TableHead>GPS Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No trees registered for this plot
                        </TableCell>
                      </TableRow>
                    ) : (
                      trees.map((tree) => (
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
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedInstance && (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <TreePine className="h-12 w-12 text-green-200" />
          <p className="text-lg font-medium">Select a farm plot above to view its trees</p>
          <p className="text-sm">Each plot has individual tree records with DBH, height, GPS location</p>
        </div>
      )}
    </div>
  );
}
