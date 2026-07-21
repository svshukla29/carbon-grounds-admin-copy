"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { treesApi, speciesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TreePine, Plus, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MeasurementInput } from "@/components/ui/measurement-input";
import { DBH_UNITS, HEIGHT_UNITS, dbhToCm, heightToM } from "@/lib/units";

export function AddTreesDialog({ instanceId, onTreesAdded }: { instanceId: string; onTreesAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [submitting, setSubmitting] = useState(false);
  const [species, setSpecies] = useState<any[]>([]);
  const [loadingSpecies, setLoadingSpecies] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<string>("");
  const [speciesOpen, setSpeciesOpen] = useState(false);
  const { toast } = useToast();

  const [singleForm, setSingleForm] = useState({ dbh: "", dbhUnit: "cm", height: "", heightUnit: "m", plantingDate: "", gpsLat: "", gpsLng: "" });
  const [bulkUnits, setBulkUnits] = useState({ dbhUnit: "cm", heightUnit: "m" });
  const [bulkTrees, setBulkTrees] = useState<any[]>([{ dbh: "", height: "", plantingDate: "", gpsLat: "", gpsLng: "" }]);

  // Load species on dialog open
  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && species.length === 0) {
      setLoadingSpecies(true);
      try {
        const res = await speciesApi.getAll();
        setSpecies(res.data || []);
      } catch (err) {
        console.error(err);
        toast({ title: "Failed to load species", variant: "destructive" });
      } finally {
        setLoadingSpecies(false);
      }
    }
  };

  const handleAddSingleTree = async () => {
    if (!selectedSpecies) {
      return toast({ title: "Please select a species", variant: "destructive" });
    }

    setSubmitting(true);
    try {
      const res = await treesApi.create({
        instanceId,
        speciesId: selectedSpecies,
        dbhCm: singleForm.dbh ? dbhToCm(Number(singleForm.dbh), singleForm.dbhUnit) : undefined,
        heightM: singleForm.height ? heightToM(Number(singleForm.height), singleForm.heightUnit) : undefined,
        plantingDate: singleForm.plantingDate || undefined,
        gpsLat: singleForm.gpsLat ? Number(singleForm.gpsLat) : undefined,
        gpsLng: singleForm.gpsLng ? Number(singleForm.gpsLng) : undefined,
      });

      toast({ title: `Tree added successfully! ID: ${res.data?.treeId}` });
      setSingleForm({ dbh: "", dbhUnit: "cm", height: "", heightUnit: "m", plantingDate: "", gpsLat: "", gpsLng: "" });
      setSelectedSpecies("");
      onTreesAdded();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        title: "Error",
        description: Array.isArray(msg) ? msg.join(", ") : msg || "Failed to add tree",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddBulkTrees = async () => {
    if (bulkTrees.length === 0) {
      return toast({ title: "Please add at least one tree", variant: "destructive" });
    }
    if (!selectedSpecies) {
      return toast({ title: "Please select a species for all trees", variant: "destructive" });
    }

    setSubmitting(true);
    try {
      const units = bulkTrees.map((t) => ({
        speciesId: selectedSpecies,
        dbhCm: t.dbh ? dbhToCm(Number(t.dbh), bulkUnits.dbhUnit) : undefined,
        heightM: t.height ? heightToM(Number(t.height), bulkUnits.heightUnit) : undefined,
        plantingDate: t.plantingDate || undefined,
        gpsLat: t.gpsLat ? Number(t.gpsLat) : undefined,
        gpsLng: t.gpsLng ? Number(t.gpsLng) : undefined,
      }));

      await treesApi.bulkCreate(instanceId, units);

      toast({ title: `Added ${units.length} tree(s) successfully!` });
      setBulkTrees([{ dbh: "", height: "", plantingDate: "", gpsLat: "", gpsLng: "" }]);
      setSelectedSpecies("");
      setOpen(false);
      onTreesAdded();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        title: "Error",
        description: Array.isArray(msg) ? msg.join(", ") : msg || "Failed to add trees",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleOpenChange(true)}>
        <Plus className="mr-2 h-4 w-4" /> Add Trees
      </Button>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Trees to Plot</DialogTitle>
          <DialogDescription>Add one or multiple tree records to this farm plot</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode selector */}
          <div className="flex gap-4 border-b pb-4">
            {(["single", "bulk"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`pb-2 px-2 border-b-2 transition ${
                  mode === m ? "border-green-600 text-green-600 font-medium" : "border-transparent text-muted-foreground"
                }`}
              >
                {m === "single" ? "Add Single Tree" : "Bulk Add (Multiple)"}
              </button>
            ))}
          </div>

          {/* Species selector (common to both) */}
          <div className="space-y-2">
            <Label>Species *</Label>
            {loadingSpecies ? (
              <div className="text-sm text-muted-foreground">Loading species...</div>
            ) : (
              <Popover open={speciesOpen} onOpenChange={setSpeciesOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={speciesOpen}
                    className="w-full justify-between font-normal"
                  >
                    {selectedSpecies
                      ? species.find((s) => s.id === selectedSpecies)?.commonName ||
                        species.find((s) => s.id === selectedSpecies)?.scientificName
                      : "Select a species..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search species..." />
                    <CommandList>
                      <CommandEmpty>No species found.</CommandEmpty>
                      <CommandGroup>
                        {species.map((s) => (
                          <CommandItem
                            key={s.id}
                            value={s.id}
                            onSelect={() => {
                              setSelectedSpecies(s.id);
                              setSpeciesOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedSpecies === s.id ? "opacity-100 text-green-600" : "opacity-0"
                              )}
                            />
                            {s.commonName} ({s.scientificName})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {mode === "single" ? (
            /* Single Tree Form */
            <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="single-dbh" className="text-sm">
                    DBH
                  </Label>
                  <MeasurementInput
                    id="single-dbh"
                    placeholder="e.g., 12.5"
                    value={singleForm.dbh}
                    onValueChange={(v) => setSingleForm((p) => ({ ...p, dbh: v }))}
                    unit={singleForm.dbhUnit}
                    onUnitChange={(u) => setSingleForm((p) => ({ ...p, dbhUnit: u }))}
                    units={DBH_UNITS}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="single-height" className="text-sm">
                    Height
                  </Label>
                  <MeasurementInput
                    id="single-height"
                    placeholder="e.g., 4.2"
                    value={singleForm.height}
                    onValueChange={(v) => setSingleForm((p) => ({ ...p, height: v }))}
                    unit={singleForm.heightUnit}
                    onUnitChange={(u) => setSingleForm((p) => ({ ...p, heightUnit: u }))}
                    units={HEIGHT_UNITS}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="single-date" className="text-sm">
                    Planting Date
                  </Label>
                  <Input
                    id="single-date"
                    type="date"
                    value={singleForm.plantingDate}
                    onChange={(e) => setSingleForm((p) => ({ ...p, plantingDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="single-lat" className="text-sm">
                    GPS Latitude
                  </Label>
                  <Input
                    id="single-lat"
                    type="number"
                    step="0.0001"
                    placeholder="e.g., 22.6736"
                    value={singleForm.gpsLat}
                    onChange={(e) => setSingleForm((p) => ({ ...p, gpsLat: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="single-lng" className="text-sm">
                    GPS Longitude
                  </Label>
                  <Input
                    id="single-lng"
                    type="number"
                    step="0.0001"
                    placeholder="e.g., 83.7066"
                    value={singleForm.gpsLng}
                    onChange={(e) => setSingleForm((p) => ({ ...p, gpsLng: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Bulk Trees Form */
            <div className="space-y-3 border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 p-2 bg-white border rounded">
                <div className="space-y-1">
                  <Label className="text-sm">DBH Unit (applies to all rows)</Label>
                  <Select value={bulkUnits.dbhUnit} onValueChange={(v) => setBulkUnits((p) => ({ ...p, dbhUnit: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DBH_UNITS.map((u) => (
                        <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Height Unit (applies to all rows)</Label>
                  <Select value={bulkUnits.heightUnit} onValueChange={(v) => setBulkUnits((p) => ({ ...p, heightUnit: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HEIGHT_UNITS.map((u) => (
                        <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {bulkTrees.map((tree, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-5 gap-2 p-2 bg-white border rounded items-end"
                >
                  <Input
                    placeholder={`DBH (${bulkUnits.dbhUnit})`}
                    type="number"
                    step="0.1"
                    value={tree.dbh}
                    onChange={(e) => {
                      const newTrees = [...bulkTrees];
                      newTrees[idx].dbh = e.target.value;
                      setBulkTrees(newTrees);
                    }}
                  />
                  <Input
                    placeholder={`Height (${bulkUnits.heightUnit})`}
                    type="number"
                    step="0.1"
                    value={tree.height}
                    onChange={(e) => {
                      const newTrees = [...bulkTrees];
                      newTrees[idx].height = e.target.value;
                      setBulkTrees(newTrees);
                    }}
                  />
                  <Input
                    placeholder="Planting Date"
                    type="date"
                    value={tree.plantingDate}
                    onChange={(e) => {
                      const newTrees = [...bulkTrees];
                      newTrees[idx].plantingDate = e.target.value;
                      setBulkTrees(newTrees);
                    }}
                  />
                  <Input
                    placeholder="Lat"
                    type="number"
                    step="0.0001"
                    value={tree.gpsLat}
                    onChange={(e) => {
                      const newTrees = [...bulkTrees];
                      newTrees[idx].gpsLat = e.target.value;
                      setBulkTrees(newTrees);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBulkTrees(bulkTrees.filter((_, i) => i !== idx))}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setBulkTrees([...bulkTrees, { dbh: "", height: "", plantingDate: "", gpsLat: "", gpsLng: "" }])}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Row
              </Button>
            </div>
          )}

          {/* Submit button */}
          <div className="flex gap-3 justify-end border-t pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={mode === "single" ? handleAddSingleTree : handleAddBulkTrees}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              {mode === "single" ? "Add Tree" : `Add ${bulkTrees.length} Tree(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
