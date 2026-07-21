"use client";

import { useEffect, useState } from "react";
import { speciesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EMPTY_FORM = {
  commonName: "",
  scientificName: "",
  woodDensity: "",
  carbonFraction: "",
  allometricA: "",
  allometricB: "",
  maxRotationYears: "",
};

export function SpeciesDialog({ species, onSaved }: { species?: any; onSaved: () => void }) {
  const isEditMode = !!species;
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setForm(
        species
          ? {
              commonName: species.commonName ?? "",
              scientificName: species.scientificName ?? "",
              woodDensity: species.woodDensity != null ? String(species.woodDensity) : "",
              carbonFraction: species.carbonFraction != null ? String(species.carbonFraction) : "",
              allometricA: species.allometricA != null ? String(species.allometricA) : "",
              allometricB: species.allometricB != null ? String(species.allometricB) : "",
              maxRotationYears: species.maxRotationYears != null ? String(species.maxRotationYears) : "",
            }
          : EMPTY_FORM
      );
    }
  }, [open, species]);

  const handleSubmit = async () => {
    if (!form.commonName || !form.scientificName) {
      return toast({ title: "Common name and scientific name are required", variant: "destructive" });
    }

    setSubmitting(true);
    try {
      const payload = {
        commonName: form.commonName,
        scientificName: form.scientificName,
        woodDensity: form.woodDensity ? Number(form.woodDensity) : undefined,
        carbonFraction: form.carbonFraction ? Number(form.carbonFraction) : undefined,
        allometricA: form.allometricA ? Number(form.allometricA) : undefined,
        allometricB: form.allometricB ? Number(form.allometricB) : undefined,
        maxRotationYears: form.maxRotationYears ? Number(form.maxRotationYears) : undefined,
      };

      if (isEditMode) {
        await speciesApi.update(species.id, payload);
        toast({ title: "Species updated successfully!" });
      } else {
        await speciesApi.create(payload);
        toast({ title: "Species added successfully!" });
      }
      setOpen(false);
      onSaved();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        title: "Error",
        description: Array.isArray(msg) ? msg.join(", ") : msg || "Failed to save species",
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
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="bg-green-700 hover:bg-green-800">
            <Plus className="mr-2 h-4 w-4" /> Add Species
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Species" : "Add Species"}</DialogTitle>
          <DialogDescription>
            Tree species details and allometric coefficients used for carbon calculations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="commonName">Common Name *</Label>
              <Input
                id="commonName"
                placeholder="e.g., Teak"
                value={form.commonName}
                onChange={(e) => setForm((p) => ({ ...p, commonName: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="scientificName">Scientific Name *</Label>
              <Input
                id="scientificName"
                placeholder="e.g., Tectona grandis"
                value={form.scientificName}
                onChange={(e) => setForm((p) => ({ ...p, scientificName: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="woodDensity">Wood Density (g/cm³)</Label>
              <Input
                id="woodDensity"
                type="number"
                step="0.001"
                placeholder="e.g., 0.65"
                value={form.woodDensity}
                onChange={(e) => setForm((p) => ({ ...p, woodDensity: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="carbonFraction">Carbon Fraction</Label>
              <Input
                id="carbonFraction"
                type="number"
                step="0.01"
                placeholder="e.g., 0.47"
                value={form.carbonFraction}
                onChange={(e) => setForm((p) => ({ ...p, carbonFraction: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="allometricA">Allometric a</Label>
              <Input
                id="allometricA"
                type="number"
                step="0.000001"
                placeholder="e.g., -2.134"
                value={form.allometricA}
                onChange={(e) => setForm((p) => ({ ...p, allometricA: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="allometricB">Allometric b</Label>
              <Input
                id="allometricB"
                type="number"
                step="0.000001"
                placeholder="e.g., 2.53"
                value={form.allometricB}
                onChange={(e) => setForm((p) => ({ ...p, allometricB: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxRotationYears">Max Age (yrs)</Label>
              <Input
                id="maxRotationYears"
                type="number"
                step="1"
                placeholder="e.g., 40"
                value={form.maxRotationYears}
                onChange={(e) => setForm((p) => ({ ...p, maxRotationYears: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Save Changes" : "Add Species"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
