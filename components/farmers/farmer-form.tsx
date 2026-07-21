"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { farmersApi, gramPanchayatApi, mastersApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export function FarmerForm({ id }: { id?: string }) {
  const isEdit = !!id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const lockedGpId = !isEdit ? searchParams.get("gpId") : null;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [gps, setGps] = useState<any[]>([]);
  const [tribes, setTribes] = useState<any[]>([]);

  const [form, setForm] = useState({
    farmerName: "",
    gender: "",
    mobileNo: "",
    category: "",
    tribeId: "",
    bpl: false,
    gramPanchayatId: lockedGpId || "",
    villageName: "",
    villageLgdCode: "",
    block: "",
    district: "",
    tehsil: "",
    pinCode: "",
    state: "Chhattisgarh",
    khasraNo: "",
  });

  // Load dropdowns
  useEffect(() => {
    gramPanchayatApi.getAll()
      .then((r) => setGps(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(console.error);

    mastersApi.getTribes()
      .then((r) => setTribes(r.data || []))
      .catch(console.error);
  }, []);

  // Load existing farmer in edit mode
  useEffect(() => {
    if (!isEdit || !id) return;
    setLoading(true);
    farmersApi.getOne(id)
      .then((r) => {
        const f = r.data;
        setForm({
          farmerName: f.farmerName || "",
          gender: f.gender || "",
          mobileNo: f.mobileNo || "",
          category: f.category || "",
          tribeId: f.tribeId || "",
          bpl: f.bpl || false,
          gramPanchayatId: f.gramPanchayatId || "",
          villageName: f.villageName || "",
          villageLgdCode: f.villageLgdCode || "",
          block: f.block || "",
          district: f.district || "",
          tehsil: f.tehsil || "",
          pinCode: f.pinCode || "",
          state: f.state || "Chhattisgarh",
          khasraNo: f.khasraNo || "",
        });
      })
      .catch(() => router.push("/dashboard/farmers"))
      .finally(() => setLoading(false));
  }, [id, isEdit, router]);

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.farmerName.trim()) return toast({ title: "Farmer name required", variant: "destructive" });
    if (!form.gender) return toast({ title: "Gender required", variant: "destructive" });
    if (!form.mobileNo.trim()) return toast({ title: "Mobile number required", variant: "destructive" });
    if (!form.category) return toast({ title: "Category required", variant: "destructive" });
    if (!form.villageName.trim()) return toast({ title: "Village name required", variant: "destructive" });
    if (!form.khasraNo.trim()) return toast({ title: "Khasra number required", variant: "destructive" });

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        bpl: form.bpl,
        tribeId: form.category === "ST" && form.tribeId ? form.tribeId : undefined,
      };

      if (isEdit && id) {
        await farmersApi.update(id, payload);
        toast({ title: "Farmer updated successfully!" });
        router.push("/dashboard/farmers");
      } else {
        await farmersApi.create(payload);
        toast({ title: "Farmer registered successfully!" });
        router.push(
          lockedGpId
            ? `/dashboard/gram-panchayat?gpId=${lockedGpId}`
            : "/dashboard/farmers"
        );
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

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/farmers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit Farmer" : "Register New Farmer"}</h1>
          <p className="text-sm text-muted-foreground">
            Farmer ID will be auto-generated (e.g. FR-GP5-5)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Details</CardTitle>
            <CardDescription>Basic farmer identification information</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="farmerName">Full Name *</Label>
              <Input id="farmerName" value={form.farmerName}
                onChange={(e) => set("farmerName", e.target.value)}
                placeholder="e.g. Jagat Singh Lakra" required />
            </div>

            <div className="space-y-2">
              <Label>Gender *</Label>
              <Select value={form.gender} onValueChange={(v) => set("gender", v)} required>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHERS">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNo">Mobile Number *</Label>
              <Input id="mobileNo" value={form.mobileNo}
                onChange={(e) => set("mobileNo", e.target.value)}
                placeholder="10-digit mobile" maxLength={10} required />
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)} required>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ST">ST (Scheduled Tribe)</SelectItem>
                  <SelectItem value="SC">SC (Scheduled Caste)</SelectItem>
                  <SelectItem value="OBC">OBC</SelectItem>
                  <SelectItem value="GEN">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.category === "ST" && (
              <div className="space-y-2 sm:col-span-2">
                <Label>Tribe Name *</Label>
                <Select value={form.tribeId} onValueChange={(v) => set("tribeId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select tribe" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {tribes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} {t.isPvtg ? "(PVTG)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center gap-3 sm:col-span-2">
              <input
                type="checkbox"
                id="bpl"
                checked={form.bpl}
                onChange={(e) => set("bpl", e.target.checked)}
                className="h-4 w-4 accent-green-700"
              />
              <Label htmlFor="bpl" className="cursor-pointer font-normal">
                BPL (Below Poverty Line) cardholder
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Location Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Location Details</CardTitle>
            <CardDescription>Village and administrative location</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Gram Panchayat</Label>
              {lockedGpId ? (
                <>
                  <Input
                    disabled
                    value={
                      gps.find((gp) => gp.id === lockedGpId)
                        ? `${gps.find((gp) => gp.id === lockedGpId).gpName} — ${gps.find((gp) => gp.id === lockedGpId).district}`
                        : "Loading…"
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Registering under this Gram Panchayat
                  </p>
                </>
              ) : (
                <Select value={form.gramPanchayatId} onValueChange={(v) => set("gramPanchayatId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select GP (optional)" /></SelectTrigger>
                  <SelectContent>
                    {gps.map((gp) => (
                      <SelectItem key={gp.id} value={gp.id}>
                        {gp.gpName} — {gp.district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="villageName">Village Name *</Label>
              <Input id="villageName" value={form.villageName}
                onChange={(e) => set("villageName", e.target.value)}
                placeholder="e.g. Sonpur" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="villageLgdCode">Village LGD Code</Label>
              <Input id="villageLgdCode" value={form.villageLgdCode}
                onChange={(e) => set("villageLgdCode", e.target.value)}
                placeholder="e.g. 471234" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="block">Block</Label>
              <Input id="block" value={form.block}
                onChange={(e) => set("block", e.target.value)}
                placeholder="e.g. Kunkuri" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tehsil">Tehsil</Label>
              <Input id="tehsil" value={form.tehsil}
                onChange={(e) => set("tehsil", e.target.value)}
                placeholder="e.g. Pathalgaon" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input id="district" value={form.district}
                onChange={(e) => set("district", e.target.value)}
                placeholder="e.g. Jashpur" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={form.state}
                onChange={(e) => set("state", e.target.value)}
                placeholder="e.g. Chhattisgarh" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pinCode">PIN Code</Label>
              <Input id="pinCode" value={form.pinCode}
                onChange={(e) => set("pinCode", e.target.value)}
                placeholder="e.g. 496001" maxLength={6} />
            </div>
          </CardContent>
        </Card>

        {/* Land Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Land Details</CardTitle>
            <CardDescription>Revenue record information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="khasraNo">Khasra Number *</Label>
              <Input id="khasraNo" value={form.khasraNo}
                onChange={(e) => set("khasraNo", e.target.value)}
                placeholder="e.g. 245/1" required />
              <p className="text-xs text-muted-foreground">Revenue record / land parcel number</p>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/farmers">Cancel</Link>
          </Button>
          <Button type="submit" className="bg-green-700 hover:bg-green-800" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Farmer" : "Register Farmer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
