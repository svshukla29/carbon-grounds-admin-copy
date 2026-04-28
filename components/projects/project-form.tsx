"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projectsApi, farmersApi } from "@/lib/api";
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
import { DatePicker } from "@/components/ui/date-picker";

interface Farmer {
  id: string;
  name: string;
  location: string;
}

export function ProjectForm({ id }: { id?: string }) {
  const isEditMode = !!id;
  const router = useRouter();
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [farmers, setFarmers] = useState<Farmer[]>([]);

  const [formData, setFormData] = useState({
    projectId: "",
    description: "",
    type: "",
    location: "",
    startDate: "",
    endDate: "",
    // Land details
    landArea: "",
    landType: "",
    soilType: "",
    waterSource: "",
    elevation: "",
    coordinates: "",
    // Farmer selection
    selectedFarmerId: "",
  });

  // Fetch farmers for the dropdown
  useEffect(() => {
    const loadFarmers = async () => {
      try {
        const res = await farmersApi.getAll();
        setFarmers(res.data);
      } catch (err) {
        console.error("Failed to load farmers", err);
      }
    };
    loadFarmers();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchProject = async () => {
        setLoading(true);
        try {
          const res = await projectsApi.getOne(id);
          const p = res.data;
          setFormData({
            projectId: p.id ?? "",
            description: p.description ?? "",
            type: p.type ?? "",
            location: p.location ?? "",
            startDate: p.startDate ? p.startDate.slice(0, 10) : "",
            endDate: p.endDate ? p.endDate.slice(0, 10) : "",
            landArea: p.landArea ? String(p.landArea) : "",
            landType: p.landType ?? "",
            soilType: p.soilType ?? "",
            waterSource: p.waterSource ?? "",
            elevation: p.elevation ? String(p.elevation) : "",
            coordinates: p.coordinates ?? "",
            selectedFarmerId: p.farmerId ?? "",
          });
        } catch (error) {
          console.error("Error fetching project:", error);
          router.push("/dashboard/projects");
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
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
        name: formData.projectId,
        description: formData.description || undefined,
        type: formData.type,
        location: formData.location,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        landArea: formData.landArea ? parseFloat(formData.landArea) : undefined,
        landType: formData.landType || undefined,
        soilType: formData.soilType || undefined,
        waterSource: formData.waterSource || undefined,
        elevation: formData.elevation ? parseFloat(formData.elevation) : undefined,
        coordinates: formData.coordinates || undefined,
        farmerId: formData.selectedFarmerId || undefined,
      };
      if (isEditMode && id) {
        await projectsApi.update(id, payload);
        toast({ title: "Project updated successfully!" });
      } else {
        await projectsApi.create(payload);
        toast({ title: "Project created successfully!" });
      }
      router.push("/dashboard/projects");
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
          <p className="mt-2 text-sm text-gray-500">Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {isEditMode ? "Edit Project" : "Create New Project"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>
              {isEditMode
                ? "Update the details of your existing project"
                : "Enter the details of your new sustainability project"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="projectId">Project ID <span className="text-red-500">*</span></Label>
                <Input
                  id="projectId"
                  name="projectId"
                  placeholder="Enter unique project ID (e.g. PRJ-001)"
                  value={formData.projectId}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Project Type <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                  required
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Agroforestry">Agroforestry</SelectItem>
                    <SelectItem value="Reforestation">Reforestation</SelectItem>
                    <SelectItem value="Soil Carbon">Soil Carbon</SelectItem>
                    <SelectItem value="Blue Carbon">Blue Carbon</SelectItem>
                    <SelectItem value="Renewable Energy">Renewable Energy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description{" "}
                <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the project and its goals"
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Project location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="selectedFarmerId">Select Farmer for this Project</Label>
                <Select
                  value={formData.selectedFarmerId}
                  onValueChange={(value) =>
                    handleSelectChange("selectedFarmerId", value)
                  }
                >
                  <SelectTrigger id="selectedFarmerId">
                    <SelectValue placeholder="Select a farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    {farmers.map((farmer) => (
                      <SelectItem key={farmer.id} value={farmer.id}>
                        {farmer.name} — {farmer.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <DatePicker
                  value={formData.startDate}
                  onChange={(date) => handleDateChange("startDate", date)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <DatePicker
                  value={formData.endDate}
                  onChange={(date) => handleDateChange("endDate", date)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Land Details */}
        <Card>
          <CardHeader>
            <CardTitle>Land Details</CardTitle>
            <CardDescription>
              Provide information about the land associated with this project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="landArea">Land Area (hectares)</Label>
                <Input
                  id="landArea"
                  name="landArea"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 25.5"
                  value={formData.landArea}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="landType">Land Type</Label>
                <Select
                  value={formData.landType}
                  onValueChange={(value) =>
                    handleSelectChange("landType", value)
                  }
                >
                  <SelectTrigger id="landType">
                    <SelectValue placeholder="Select land type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Agricultural">Agricultural</SelectItem>
                    <SelectItem value="Forest">Forest</SelectItem>
                    <SelectItem value="Grassland">Grassland</SelectItem>
                    <SelectItem value="Wetland">Wetland</SelectItem>
                    <SelectItem value="Degraded">Degraded Land</SelectItem>
                    <SelectItem value="Mixed">Mixed Use</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="soilType">Soil Type</Label>
                <Select
                  value={formData.soilType}
                  onValueChange={(value) =>
                    handleSelectChange("soilType", value)
                  }
                >
                  <SelectTrigger id="soilType">
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Clay">Clay</SelectItem>
                    <SelectItem value="Sandy">Sandy</SelectItem>
                    <SelectItem value="Loam">Loam</SelectItem>
                    <SelectItem value="Silt">Silt</SelectItem>
                    <SelectItem value="Peat">Peat</SelectItem>
                    <SelectItem value="Chalk">Chalk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="waterSource">Water Source</Label>
                <Select
                  value={formData.waterSource}
                  onValueChange={(value) =>
                    handleSelectChange("waterSource", value)
                  }
                >
                  <SelectTrigger id="waterSource">
                    <SelectValue placeholder="Select water source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rainfed">Rainfed</SelectItem>
                    <SelectItem value="Irrigation">Irrigation</SelectItem>
                    <SelectItem value="Groundwater">Groundwater</SelectItem>
                    <SelectItem value="River">River / Stream</SelectItem>
                    <SelectItem value="Mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="elevation">Elevation (meters above sea level)</Label>
                <Input
                  id="elevation"
                  name="elevation"
                  type="number"
                  step="1"
                  placeholder="e.g. 340"
                  value={formData.elevation}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coordinates">GPS Coordinates</Label>
                <Input
                  id="coordinates"
                  name="coordinates"
                  placeholder="e.g. 10.7645° N, 106.7019° E"
                  value={formData.coordinates}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button asChild variant="outline">
            <Link href="/dashboard/projects">Cancel</Link>
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
              "Update Project"
            ) : (
              "Create Project"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
