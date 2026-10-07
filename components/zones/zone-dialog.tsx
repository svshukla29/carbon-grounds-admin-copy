"use client";

import { useEffect, useState } from "react";
import { mastersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Pencil, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DOMAINS = ["Tropical", "Subtropical", "Temperate", "Boreal", "Polar"];
const NO_DOMAIN = "none";
const EMPTY_FORM = { name: "", domain: NO_DOMAIN, rootShootRatio: "", source: "" };

export function ZoneDialog({ zone, onSaved }: { zone?: any; onSaved: () => void }) {
  const isEditMode = !!zone;
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setForm(
        zone
          ? {
              name: zone.name ?? "",
              domain: zone.domain ?? NO_DOMAIN,
              rootShootRatio: zone.rootShootRatio != null ? String(Number(zone.rootShootRatio)) : "",
              source: zone.source ?? "",
            }
          : EMPTY_FORM,
      );
    }
  }, [open, zone]);

  const handleSubmit = async () => {
    const ratio = Number(form.rootShootRatio);
    if (!form.name.trim()) return toast({ title: "Zone name is required", variant: "destructive" });
    if (form.rootShootRatio === "" || Number.isNaN(ratio) || ratio < 0 || ratio > 9.99) {
      return toast({ title: "Root:shoot ratio must be a number between 0 and 9.99", variant: "destructive" });
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        domain: form.domain === NO_DOMAIN ? undefined : form.domain,
        rootShootRatio: Math.round(ratio * 100) / 100,
        source: form.source.trim() || undefined,
      };
      if (isEditMode) {
        await mastersApi.updateEcologicalZone(zone.id, payload);
        toast({ title: "Zone updated" });
      } else {
        await mastersApi.createEcologicalZone(payload);
        toast({ title: "Zone added" });
      }
      setOpen(false);
      onSaved();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        title: "Error",
        description: Array.isArray(msg) ? msg.join(", ") : msg || "Failed to save zone",
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
          <Button variant="ghost" size="sm" title="Edit zone">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="bg-green-700 hover:bg-green-800">
            <Plus className="mr-2 h-4 w-4" /> Add Zone
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Climatic Zone" : "Add Climatic Zone"}</DialogTitle>
          <DialogDescription>
            The root:shoot ratio is used by the carbon calculation for every plot in this zone.
            {isEditMode && " Changing it affects future calculations only — saved results keep the ratio they used."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="zone-name">Zone Name <span className="text-red-500">*</span></Label>
            <Input
              id="zone-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Tropical Moist Deciduous"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zone-domain">IPCC Climate Domain</Label>
              <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v })}>
                <SelectTrigger id="zone-domain">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_DOMAIN}>Not specified</SelectItem>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zone-ratio">Root:Shoot Ratio (R) <span className="text-red-500">*</span></Label>
              <Input
                id="zone-ratio"
                type="number"
                step="0.01"
                min="0"
                max="9.99"
                value={form.rootShootRatio}
                onChange={(e) => setForm({ ...form, rootShootRatio: e.target.value })}
                placeholder="e.g. 0.24"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="zone-source">Source / Reference</Label>
            <Textarea
              id="zone-source"
              rows={2}
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              placeholder="e.g. IPCC 2006 GL Table 4.4 — Tropical moist deciduous forest"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button className="bg-green-700 hover:bg-green-800" onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Save Changes" : "Add Zone"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
