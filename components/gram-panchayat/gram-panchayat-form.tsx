"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { gramPanchayatApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EMPTY_FORM = {
  gpName: "",
  lgdCode: "",
  state: "Chhattisgarh",
  district: "",
  block: "",
  sachivName: "",
  sachivPhone: "",
  contact1Name: "",
  contact1Phone: "",
};

export function GramPanchayatForm({ id }: { id?: string } = {}) {
  const isEditMode = !!id;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isEditMode || !id) return;
    gramPanchayatApi.getOne(id)
      .then((res) => {
        const gp = res.data;
        setFormData({
          gpName: gp.gpName ?? "",
          lgdCode: gp.lgdCode ?? "",
          state: gp.state ?? "Chhattisgarh",
          district: gp.district ?? "",
          block: gp.block ?? "",
          sachivName: gp.sachivName ?? "",
          sachivPhone: gp.sachivPhone ?? "",
          contact1Name: gp.contact1Name ?? "",
          contact1Phone: gp.contact1Phone ?? "",
        });
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load Gram Panchayat details.");
      })
      .finally(() => setLoadingData(false));
  }, [isEditMode, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStateChange = (value: string) => {
    setFormData((prev) => ({ ...prev, state: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEditMode && id) {
        await gramPanchayatApi.update(id, formData);
      } else {
        await gramPanchayatApi.create(formData);
      }
      router.push("/dashboard/gram-panchayat");
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to save Gram Panchayat.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/gram-panchayat">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? "Edit Gram Panchayat" : "Add Gram Panchayat"}</h1>
          <p className="text-muted-foreground">{isEditMode ? "Update GP details" : "Register a new GP in the system"}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gram Panchayat Details</CardTitle>
          <CardDescription>Enter the official details and LGD code.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gpName">GP Name <span className="text-red-500">*</span></Label>
                <Input id="gpName" name="gpName" required value={formData.gpName} onChange={handleChange} placeholder="e.g. Kondagaon" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lgdCode">LGD Code <span className="text-red-500">*</span></Label>
                <Input id="lgdCode" name="lgdCode" required value={formData.lgdCode} onChange={handleChange} placeholder="e.g. 123456" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                <Select value={formData.state} onValueChange={handleStateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                    <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District <span className="text-red-500">*</span></Label>
                <Input id="district" name="district" required value={formData.district} onChange={handleChange} placeholder="e.g. Bastar" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="block">Block</Label>
                <Input id="block" name="block" value={formData.block} onChange={handleChange} placeholder="Optional" />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sachivName">Panchayat Sachiv Name</Label>
                  <Input id="sachivName" name="sachivName" value={formData.sachivName} onChange={handleChange} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sachivPhone">Sachiv Phone</Label>
                  <Input id="sachivPhone" name="sachivPhone" value={formData.sachivPhone} onChange={handleChange} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact1Name">Additional Contact Name</Label>
                  <Input id="contact1Name" name="contact1Name" value={formData.contact1Name} onChange={handleChange} placeholder="Optional" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact1Phone">Additional Contact Phone</Label>
                  <Input id="contact1Phone" name="contact1Phone" value={formData.contact1Phone} onChange={handleChange} placeholder="Optional" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/gram-panchayat">Cancel</Link>
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isEditMode ? "Save Changes" : "Save Gram Panchayat"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
