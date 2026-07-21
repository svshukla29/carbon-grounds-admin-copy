"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Check, ChevronsUpDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { instancesApi, farmersApi, mastersApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function InstanceForm({ id }: { id?: string } = {}) {
  const isEditMode = !!id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const lockedFarmerId = searchParams.get("farmerId");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [lockedFarmer, setLockedFarmer] = useState<any>(null);
  const [farmers, setFarmers] = useState<any[]>([]);
  const [farmerComboOpen, setFarmerComboOpen] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>(lockedFarmerId || "");

  const [dropdowns, setDropdowns] = useState<{
    landUseTypes: string[];
    ecologicalZones: string[];
    irrigationTypes: string[];
    monitoringFrequencies: string[];
  }>({ landUseTypes: [], ecologicalZones: [], irrigationTypes: [], monitoringFrequencies: [] });

  const [form, setForm] = useState({
    areaAcres: "",
    landUseType: "",
    ecologicalZone: "",
    irrigationType: "Rainfed",
    monitoringFrequency: "ANNUAL",
    surveyDate: "",
    gpsLat: "",
    gpsLng: "",
    powerAvailability: false,
    internetAvailability: false,
  });

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Load dropdown options
  useEffect(() => {
    mastersApi.getDropdowns()
      .then((r) => setDropdowns((prev) => ({ ...prev, ...r.data })))
      .catch(console.error);
  }, []);

  // Load locked farmer (came from a farmer's profile page), farmer list (manual selection),
  // or existing instance data (edit mode)
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (isEditMode && id) {
          const r = await instancesApi.getOne(id);
          const inst = r.data;
          setLockedFarmer(inst.farmer);
          setSelectedFarmerId(inst.farmerId);
          setForm({
            areaAcres: inst.areaAcres != null ? String(inst.areaAcres) : "",
            landUseType: inst.landUseType || "",
            ecologicalZone: inst.ecologicalZone || "",
            irrigationType: inst.irrigationType || "Rainfed",
            monitoringFrequency: inst.monitoringFrequency || "ANNUAL",
            surveyDate: inst.surveyDate ? String(inst.surveyDate).slice(0, 10) : "",
            gpsLat: inst.gpsLat != null ? String(inst.gpsLat) : "",
            gpsLng: inst.gpsLng != null ? String(inst.gpsLng) : "",
            powerAvailability: !!inst.powerAvailability,
            internetAvailability: !!inst.internetAvailability,
          });
        } else if (lockedFarmerId) {
          const r = await farmersApi.getOne(lockedFarmerId);
          setLockedFarmer(r.data);
        } else {
          const r = await farmersApi.getAll({ limit: 200 });
          setFarmers(r.data?.data || []);
        }
      } catch (e) {
        console.error(e);
        toast({ title: "Failed to load farm plot details", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isEditMode, id, lockedFarmerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFarmerId) return toast({ title: "Please select a farmer", variant: "destructive" });
    if (!form.areaAcres || Number(form.areaAcres) <= 0) {
      return toast({ title: "Plot area (acres) is required", variant: "destructive" });
    }

    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        farmerId: selectedFarmerId,
        areaAcres: Number(form.areaAcres),
        landUseType: form.landUseType || undefined,
        ecologicalZone: form.ecologicalZone || undefined,
        irrigationType: form.irrigationType || undefined,
        monitoringFrequency: form.monitoringFrequency || undefined,
        surveyDate: form.surveyDate || undefined,
        gpsLat: form.gpsLat ? Number(form.gpsLat) : undefined,
        gpsLng: form.gpsLng ? Number(form.gpsLng) : undefined,
        powerAvailability: form.powerAvailability,
        internetAvailability: form.internetAvailability,
      };

      if (isEditMode && id) {
        await instancesApi.update(id, payload);
        toast({ title: "Farm plot updated successfully!" });
        router.push(`/dashboard/instances/${id}`);
      } else {
        await instancesApi.create(payload);
        toast({ title: "Farm plot registered successfully!" });
        router.push(`/dashboard/farmers/${selectedFarmerId}`);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        title: "Error",
        description: Array.isArray(msg) ? msg.join(", ") : msg || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  const backHref = isEditMode
    ? `/dashboard/instances/${id}`
    : lockedFarmerId
      ? `/dashboard/farmers/${lockedFarmerId}`
      : "/dashboard/instances";

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href={backHref}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditMode ? "Edit Farm Plot" : "Register New Farm Plot"}</h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode ? "Update farm plot details" : "Plot ID will be auto-generated (e.g. INS-FR5-1)"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Farmer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Farmer</CardTitle>
            <CardDescription>
              {isEditMode ? "This farm plot belongs to" : "The farm plot will be registered under this farmer"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lockedFarmer ? (
              <div className="flex items-center gap-3 rounded-md border bg-green-50/50 p-3">
                <User className="h-5 w-5 text-green-700" />
                <div>
                  <div className="font-medium">{lockedFarmer.farmerName}</div>
                  <div className="text-xs text-muted-foreground">
                    {lockedFarmer.instanceId} • {lockedFarmer.villageName}
                    {lockedFarmer.gramPanchayat ? ` • ${lockedFarmer.gramPanchayat.gpName}` : ""}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Select Farmer *</Label>
                <Popover open={farmerComboOpen} onOpenChange={setFarmerComboOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={farmerComboOpen}
                      className="w-full justify-between font-normal"
                    >
                      {selectedFarmerId
                        ? farmers.find((f) => f.id === selectedFarmerId)?.farmerName
                        : "Search and select a farmer..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search by name, ID or village..." />
                      <CommandList>
                        <CommandEmpty>No farmer found.</CommandEmpty>
                        <CommandGroup>
                          {farmers.map((f) => (
                            <CommandItem
                              key={f.id}
                              value={`${f.farmerName} ${f.instanceId} ${f.villageName}`}
                              onSelect={() => {
                                setSelectedFarmerId(f.id);
                                setFarmerComboOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedFarmerId === f.id ? "opacity-100 text-green-600" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{f.farmerName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {f.instanceId} • {f.villageName}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plot Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plot Details</CardTitle>
            <CardDescription>Land use and area information</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="areaAcres">Area (acres) *</Label>
              <Input id="areaAcres" type="number" step="0.01" min="0" value={form.areaAcres}
                onChange={(e) => set("areaAcres", e.target.value)}
                placeholder="e.g. 2.5" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surveyDate">Survey Date</Label>
              <Input id="surveyDate" type="date" value={form.surveyDate}
                onChange={(e) => set("surveyDate", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Land Use Type</Label>
              <Select value={form.landUseType} onValueChange={(v) => set("landUseType", v)}>
                <SelectTrigger><SelectValue placeholder="Select land use type" /></SelectTrigger>
                <SelectContent>
                  {dropdowns.landUseTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ecological Zone</Label>
              <Select value={form.ecologicalZone} onValueChange={(v) => set("ecologicalZone", v)}>
                <SelectTrigger><SelectValue placeholder="Select ecological zone" /></SelectTrigger>
                <SelectContent>
                  {dropdowns.ecologicalZones.map((z) => (
                    <SelectItem key={z} value={z}>{z}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Irrigation Type</Label>
              <Select value={form.irrigationType} onValueChange={(v) => set("irrigationType", v)}>
                <SelectTrigger><SelectValue placeholder="Select irrigation type" /></SelectTrigger>
                <SelectContent>
                  {dropdowns.irrigationTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Monitoring Frequency</Label>
              <Select value={form.monitoringFrequency} onValueChange={(v) => set("monitoringFrequency", v)}>
                <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                <SelectContent>
                  {dropdowns.monitoringFrequencies.map((f) => (
                    <SelectItem key={f} value={f}>{f.replace("_", "-")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Location & Infrastructure */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Location & Infrastructure</CardTitle>
            <CardDescription>GPS coordinates and on-site facilities</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gpsLat">GPS Latitude</Label>
              <Input id="gpsLat" type="number" step="any" value={form.gpsLat}
                onChange={(e) => set("gpsLat", e.target.value)}
                placeholder="e.g. 21.2787" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpsLng">GPS Longitude</Label>
              <Input id="gpsLng" type="number" step="any" value={form.gpsLng}
                onChange={(e) => set("gpsLng", e.target.value)}
                placeholder="e.g. 81.8661" />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="powerAvailability"
                checked={form.powerAvailability}
                onChange={(e) => set("powerAvailability", e.target.checked)}
                className="h-4 w-4 accent-green-700"
              />
              <Label htmlFor="powerAvailability" className="cursor-pointer font-normal">
                Power available on site
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="internetAvailability"
                checked={form.internetAvailability}
                onChange={(e) => set("internetAvailability", e.target.checked)}
                className="h-4 w-4 accent-green-700"
              />
              <Label htmlFor="internetAvailability" className="cursor-pointer font-normal">
                Internet available on site
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href={backHref}>Cancel</Link>
          </Button>
          <Button type="submit" className="bg-green-700 hover:bg-green-800" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Register Farm Plot
          </Button>
        </div>
      </form>
    </div>
  );
}
