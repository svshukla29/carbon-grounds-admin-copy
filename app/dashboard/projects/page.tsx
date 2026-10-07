"use client";

import { useEffect, useState } from "react";
import { projectsApi } from "@/lib/api";
import { useCan } from "@/lib/permissions";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Building2, Download, FolderKanban, Leaf, Loader2, Ruler, Sprout, Trash2, TreePine, Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "—";

export default function ProjectsPage() {
  const can = useCan();
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadProjects = async (selectAfter?: string | null) => {
    setLoading(true);
    try {
      const res = await projectsApi.getAll();
      const list = Array.isArray(res.data) ? res.data : [];
      setProjects(list);
      const keep = selectAfter !== undefined ? selectAfter : selectedId;
      setSelectedId(list.some((p) => p.id === keep) ? keep : list[0]?.id ?? null);
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to load projects", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetails(null);
      setSummary(null);
      return;
    }
    setLoadingDetails(true);
    Promise.all([projectsApi.getOne(selectedId), projectsApi.getSummary(selectedId)])
      .then(([detailRes, summaryRes]) => {
        setDetails(detailRes.data);
        setSummary(summaryRes.data);
      })
      .catch((err) => {
        console.error(err);
        toast({ title: "Failed to load project details", variant: "destructive" });
      })
      .finally(() => setLoadingDetails(false));
  }, [selectedId, toast]);

  const handleDownloadReport = async () => {
    if (!details) return;
    setDownloading(true);
    try {
      const res = await projectsApi.downloadReport(details.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${details.name}-report.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Failed to download report", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!details) return;
    try {
      await projectsApi.delete(details.id);
      toast({ title: "Project deleted", description: "Its Gram Panchayats are kept and are now unassigned." });
      setConfirmDelete(false);
      loadProjects(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({ title: "Error", description: msg || "Failed to delete project", variant: "destructive" });
    }
  };

  const stats = summary
    ? [
        { label: "Gram Panchayats", value: summary.gramPanchayatCount, icon: Building2 },
        { label: "Farmers", value: summary.farmerCount, icon: Users },
        { label: "Farm Plots", value: summary.totalPlots, icon: Sprout },
        { label: "Area", value: `${Number(summary.totalAreaAcres ?? 0).toFixed(2)} acres`, icon: Ruler },
        { label: "Trees", value: summary.totalTrees, icon: TreePine },
        { label: "Verified Credits", value: `${Number(summary.verifiedNetCredits ?? 0).toFixed(2)} tCO₂e`, icon: Leaf },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            The top of the hierarchy: Project → Gram Panchayat → Farmer → Plot → Tree
          </p>
        </div>
        {can("manageProjects") && <ProjectDialog onSaved={() => loadProjects()} />}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <FolderKanban className="h-10 w-10 text-gray-300" />
            <p>No projects yet.</p>
            {can("manageProjects") && (
              <p className="text-sm">Create one, then link Gram Panchayats to it from each GP&apos;s edit form.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Project list */}
          <Card className="h-fit">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">All Projects ({projects.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-2">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={cn(
                    "w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-green-50",
                    selectedId === p.id && "bg-green-100 font-medium text-green-800 hover:bg-green-100",
                  )}
                >
                  {p.name}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Selected project */}
          {loadingDetails || !details ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <CardTitle>{details.name}</CardTitle>
                      {details.description && <CardDescription>{details.description}</CardDescription>}
                      <p className="text-sm text-muted-foreground">
                        {formatDate(details.startDate)} – {formatDate(details.endDate)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={handleDownloadReport} disabled={downloading}>
                        {downloading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Download className="mr-1 h-4 w-4" />}
                        Report
                      </Button>
                      {can("manageProjects") && (
                        <ProjectDialog project={details} onSaved={() => loadProjects(details.id)} />
                      )}
                      {can("deleteRecords") && (
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => setConfirmDelete(true)}>
                          <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {stats.map((s) => (
                      <div key={s.label} className="rounded-lg border bg-green-50/50 p-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <s.icon className="h-3.5 w-3.5 text-green-700" /> {s.label}
                        </div>
                        <p className="mt-1 text-lg font-semibold">{s.value}</p>
                      </div>
                    ))}
                  </div>
                  {summary && Number(summary.pendingNetCredits) > 0 && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Plus {Number(summary.pendingNetCredits).toFixed(2)} tCO₂e pending verification.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Gram Panchayats in this Project ({details.gramPanchayats?.length ?? 0})
                  </CardTitle>
                  <CardDescription>
                    To add or remove a GP, open it under Gram Panchayats → Edit GP and choose the project.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!details.gramPanchayats?.length ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">No Gram Panchayats linked yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Gram Panchayat</TableHead>
                          <TableHead>LGD Code</TableHead>
                          <TableHead>Block</TableHead>
                          <TableHead>District</TableHead>
                          <TableHead>State</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {details.gramPanchayats.map((gp: any) => (
                          <TableRow key={gp.id}>
                            <TableCell className="font-medium">{gp.gpName}</TableCell>
                            <TableCell><Badge variant="outline">{gp.lgdCode || "—"}</Badge></TableCell>
                            <TableCell>{gp.block || "—"}</TableCell>
                            <TableCell>{gp.district || "—"}</TableCell>
                            <TableCell>{gp.state || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &quot;{details?.name}&quot;? Its Gram Panchayats, farmers, plots and trees are not deleted — the
              GPs simply become unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
