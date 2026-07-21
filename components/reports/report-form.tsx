"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Upload,
  File,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, reportsApi, projectsApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";

export function ReportForm({ id }: { id?: string }) {
  const isEditMode = !!id;
  const router = useRouter();
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    url: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [viewingFile, setViewingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    project: "",
    status: "",
    date: "",
    summary: "",
    content: "",
  });

  // Load projects for dropdown
  useEffect(() => {
    projectsApi.getAll().then((res) => setProjects(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchReport = async () => {
        setLoading(true);
        try {
          const res = await reportsApi.getOne(id);
          const r = res.data;
          setFormData({
            title: r.title ?? "",
            type: r.type ?? "",
            project: r.projectId ?? "",
            status: r.status ?? "",
            date: r.date ? r.date.slice(0, 10) : "",
            summary: r.summary ?? "",
            content: r.content ?? "",
          });
          if (r.fileUrl && r.fileName) {
            setUploadedFile({ name: r.fileName, url: r.fileUrl });
          }
        } catch (error) {
          console.error("Error fetching report:", error);
          router.push("/dashboard/reports");
        } finally {
          setLoading(false);
        }
      };
      fetchReport();
    }
  }, [id, isEditMode, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ─── File Handling ───────────────────────────────────────────────────────────

  const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];

  const validateFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only PDF, Word, Excel, and image files are allowed.",
        variant: "destructive",
      });
      return false;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 20 MB.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const onFileSelect = (file: File) => {
    if (!validateFile(file)) return;
    setSelectedFile(file);
    setUploadedFile(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleViewFile = async () => {
    if (!uploadedFile) return;
    setViewingFile(true);
    try {
      const res = await api.get(uploadedFile.url, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch {
      toast({ title: "Failed to open file", variant: "destructive" });
    } finally {
      setViewingFile(false);
    }
  };

  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "📄";
    if (["doc", "docx"].includes(ext ?? "")) return "📝";
    if (["xls", "xlsx"].includes(ext ?? "")) return "📊";
    if (["png", "jpg", "jpeg"].includes(ext ?? "")) return "🖼️";
    return "📎";
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        type: formData.type,
        projectId: formData.project || undefined,
        status: formData.status,
        date: formData.date || undefined,
        summary: formData.summary,
        content: formData.content,
      };

      let reportId = id;
      if (isEditMode && id) {
        await reportsApi.update(id, payload);
        toast({ title: "Report updated successfully!" });
      } else {
        const res = await reportsApi.create(payload);
        reportId = res.data.id;
        toast({ title: "Report created successfully!" });
      }

      // Upload file if one was selected
      if (selectedFile && reportId) {
        setUploading(true);
        try {
          await reportsApi.uploadFile(reportId, selectedFile);
          toast({ title: "File uploaded successfully!" });
        } catch {
          toast({
            title: "File upload failed",
            description: "Report saved but file could not be uploaded.",
            variant: "destructive",
          });
        } finally {
          setUploading(false);
        }
      }

      router.push("/dashboard/reports");
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      toast({
        title: "Error",
        description: Array.isArray(msg)
          ? msg.join(", ")
          : msg ?? "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Link href="/dashboard/reports">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {isEditMode ? "Edit Report" : "Create New Report"}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Report Information</CardTitle>
            <CardDescription>
              {isEditMode
                ? "Update the details of your existing report"
                : "Enter the details of your new report"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="content">Report Content</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Report Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter report title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Report Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        handleSelectChange("type", value)
                      }
                      required
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Quarterly Summary">
                          Quarterly Summary
                        </SelectItem>
                        <SelectItem value="Monthly Summary">
                          Monthly Summary
                        </SelectItem>
                        <SelectItem value="Verification Report">
                          Verification Report
                        </SelectItem>
                        <SelectItem value="Impact Report">
                          Impact Report
                        </SelectItem>
                        <SelectItem value="Audit Report">Audit Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="project">Related Project</Label>
                    <Select
                      value={formData.project}
                      onValueChange={(value) =>
                        handleSelectChange("project", value)
                      }
                    >
                      <SelectTrigger id="project">
                        <SelectValue placeholder="Select project (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleSelectChange("status", value)
                      }
                      required
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Report Date</Label>
                    <DatePicker
                      value={formData.date}
                      onChange={(date) => handleDateChange("date", date)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    name="summary"
                    placeholder="Brief summary of the report"
                    rows={3}
                    value={formData.summary}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* ─── File Upload ─────────────────────────────────────────── */}
                <div className="space-y-2">
                  <Label>Attachment</Label>

                  {/* Already uploaded file */}
                  {uploadedFile && !selectedFile && (
                    <div className="flex items-center gap-3 rounded-md border border-green-200 bg-green-50 p-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                      <span className="text-sm font-medium">
                        {getFileIcon(uploadedFile.name)} {uploadedFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={handleViewFile}
                        disabled={viewingFile}
                        className="ml-auto text-xs text-green-700 underline disabled:opacity-50"
                      >
                        {viewingFile ? "Opening..." : "View"}
                      </button>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Selected but not yet uploaded */}
                  {selectedFile && (
                    <div className="flex items-center gap-3 rounded-md border border-blue-200 bg-blue-50 p-3">
                      <File className="h-5 w-5 text-blue-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {getFileIcon(selectedFile.name)} {selectedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB —
                          will upload on save
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-gray-400 hover:text-red-500 shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Drop zone (hidden when file selected) */}
                  {!selectedFile && !uploadedFile && (
                    <div
                      className={`rounded-md border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
                        isDragging
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-400 hover:bg-gray-50"
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm font-medium text-gray-700">
                        Drag & drop a file here, or{" "}
                        <span className="text-green-600 underline">
                          browse
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        PDF, Word, Excel, Images — max 20 MB
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="content">Report Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Write your report content here..."
                    rows={15}
                    value={formData.content}
                    onChange={handleChange}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end gap-4">
              <Button asChild variant="outline">
                <Link href="/dashboard/reports">Cancel</Link>
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={submitting || uploading}
              >
                {submitting || uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploading
                      ? "Uploading file..."
                      : isEditMode
                      ? "Updating..."
                      : "Creating..."}
                  </>
                ) : isEditMode ? (
                  "Update Report"
                ) : (
                  "Create Report"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
