"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Download,
  FileEdit,
  Trash2,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api, reportsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function ReportDetails({ id }: { id: string }) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await reportsApi.getOne(id);
        setReport(res.data);
      } catch (error) {
        console.error("Error fetching report:", error);
        router.push("/dashboard/reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, router]);

  const handleDelete = async () => {
    try {
      await reportsApi.delete(id);
      toast({ title: "Report deleted" });
      router.push("/dashboard/reports");
    } catch {
      toast({ title: "Failed to delete report", variant: "destructive" });
    } finally {
      setConfirmDelete(false);
    }
  };

  const handleDownload = async () => {
    if (!report?.fileUrl) return;
    setDownloading(true);
    try {
      const res = await api.get(report.fileUrl, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = report.fileName || "report-file";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Failed to download file", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-600"></div>
          <p className="mt-2 text-sm text-gray-500">
            Loading report details...
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <p className="text-lg text-gray-500">Report not found</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/dashboard/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Link>
        </Button>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Draft":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Link href="/dashboard/reports">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {report.title}
            </h1>
            <Badge
              variant="outline"
              className={getStatusBadgeColor(report.status)}
            >
              {report.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{report.summary}</p>
        </div>
        <div className="flex gap-2">
          {report.fileUrl && (
            <Button variant="outline" onClick={handleDownload} disabled={downloading}>
              {downloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href={`/dashboard/reports/edit/${report.id}`}>
              <FileEdit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Report Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 rounded-md border p-3 text-sm">
              <div className="grid grid-cols-3">
                <span className="text-muted-foreground">Type:</span>
                <span className="col-span-2">{report.type}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-muted-foreground">Project:</span>
                <span className="col-span-2">{report.project?.name || "—"}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-muted-foreground">Date:</span>
                <span className="col-span-2 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  {report.date ? new Date(report.date).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-muted-foreground">Status:</span>
                <span className="col-span-2">
                  <Badge
                    variant="outline"
                    className={getStatusBadgeColor(report.status)}
                  >
                    {report.status}
                  </Badge>
                </span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-muted-foreground">Created By:</span>
                <span className="col-span-2">{report.createdBy?.name || "—"}</span>
              </div>
            </div>

            {report.fileName && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium">Attachment</h4>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex w-full items-center justify-between rounded-md border p-2 text-sm hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-red-100 p-1">
                      <FileText className="h-3 w-3 text-red-600" />
                    </div>
                    <span className="truncate">{report.fileName}</span>
                  </div>
                  {downloading ? (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  ) : (
                    <Download className="h-3 w-3 text-muted-foreground" />
                  )}
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Report Content</CardTitle>
          </CardHeader>
          <CardContent>
            {report.content ? (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: report.content }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">No additional content provided.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{report.title}</strong>? This action cannot be undone.
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
