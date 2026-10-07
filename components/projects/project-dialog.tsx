"use client";

import { useEffect, useState } from "react";
import { projectsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EMPTY_FORM = { name: "", description: "", startDate: "", endDate: "" };

/** Dates come back from the API as full ISO strings; <input type="date"> wants YYYY-MM-DD. */
const toDateInput = (value?: string | null) => (value ? String(value).slice(0, 10) : "");

export function ProjectDialog({ project, onSaved }: { project?: any; onSaved: () => void }) {
  const isEditMode = !!project;
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setForm(
        project
          ? {
              name: project.name ?? "",
              description: project.description ?? "",
              startDate: toDateInput(project.startDate),
              endDate: toDateInput(project.endDate),
            }
          : EMPTY_FORM
      );
    }
  }, [open, project]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      return toast({ title: "Project name is required", variant: "destructive" });
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      return toast({ title: "End date cannot be before start date", variant: "destructive" });
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      };
      if (isEditMode) {
        await projectsApi.update(project.id, payload);
        toast({ title: "Project updated successfully!" });
      } else {
        await projectsApi.create(payload);
        toast({ title: "Project created successfully!" });
      }
      setOpen(false);
      onSaved();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        title: "Error",
        description: Array.isArray(msg) ? msg.join(", ") : msg || "Failed to save project",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditMode ? (
          <Button variant="outline" size="sm">
            <Pencil className="mr-1 h-4 w-4" /> Edit
          </Button>
        ) : (
          <Button className="bg-green-700 hover:bg-green-800">
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Project" : "New Project"}</DialogTitle>
          <DialogDescription>
            A project groups Gram Panchayats. Link GPs to it from each Gram Panchayat&apos;s edit form.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name <span className="text-red-500">*</span></Label>
            <Input
              id="project-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Jashpur Agroforestry Project"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Covers all Gram Panchayats in Manora and Kunkuri blocks"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-start">Start Date</Label>
              <Input
                id="project-start"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-end">End Date</Label>
              <Input
                id="project-end"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button className="bg-green-700 hover:bg-green-800" onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Save Changes" : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
