"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportsApi } from "@/lib/api";
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
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    project: "",
    status: "",
    date: "",
    summary: "",
    content: "",
  });

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
            project: r.project?.id ?? "",
            status: r.status ?? "",
            date: r.createdAt ? r.createdAt.slice(0, 10) : "",
            summary: r.summary ?? "",
            content: r.content ?? "",
          });
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        type: formData.type,
        projectId: formData.project || undefined,
        status: formData.status,
        summary: formData.summary,
        content: formData.content,
      };
      if (isEditMode && id) {
        await reportsApi.update(id, payload);
        toast({ title: "Report updated successfully!" });
      } else {
        await reportsApi.create(payload);
        toast({ title: "Report created successfully!" });
      }
      router.push("/dashboard/reports");
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      toast({
        title: "Error",
        description: Array.isArray(msg) ? msg.join(", ") : msg ?? "Something went wrong",
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
                        <SelectItem value="Audit Report">
                          Audit Report
                        </SelectItem>
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
                      required
                    >
                      <SelectTrigger id="project">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sustainable Rice Cultivation">
                          Sustainable Rice Cultivation
                        </SelectItem>
                        <SelectItem value="Community Forest Management">
                          Community Forest Management
                        </SelectItem>
                        <SelectItem value="Regenerative Grazing Initiative">
                          Regenerative Grazing Initiative
                        </SelectItem>
                        <SelectItem value="Mangrove Restoration">
                          Mangrove Restoration
                        </SelectItem>
                        <SelectItem value="Sustainable Coffee Production">
                          Sustainable Coffee Production
                        </SelectItem>
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
                        <SelectItem value="Under Review">
                          Under Review
                        </SelectItem>
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

                <div className="space-y-2">
                  <Label>Attachments</Label>
                  <div className="rounded-md border border-dashed p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Drag and drop files here, or click to browse
                    </p>
                    <Button variant="outline" className="mt-4">
                      Browse Files
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="content">Report Content</Label>
                  <div className="rounded-md border">
                    <div className="flex items-center gap-1 border-b bg-muted/50 px-2 py-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="font-bold">B</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="italic">I</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="underline">U</span>
                      </Button>
                      <span className="mx-1 h-4 w-px bg-border"></span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                      >
                        Heading 1
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                      >
                        Heading 2
                      </Button>
                      <span className="mx-1 h-4 w-px bg-border"></span>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M4 7V4h16v3" />
                          <path d="M9 20h6" />
                          <path d="M12 4v16" />
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M8 4h13" />
                          <path d="M8 12h13" />
                          <path d="M8 20h13" />
                          <path d="M3 4h.01" />
                          <path d="M3 12h.01" />
                          <path d="M3 20h.01" />
                        </svg>
                      </Button>
                    </div>
                    <Textarea
                      id="content"
                      name="content"
                      placeholder="Write your report content here..."
                      rows={15}
                      value={formData.content}
                      onChange={handleChange}
                      className="border-0 focus-visible:ring-0"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can use HTML formatting for headings, paragraphs, and
                    other elements.
                  </p>
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
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
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
