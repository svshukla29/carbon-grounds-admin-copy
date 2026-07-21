"use client";

import { useState } from "react";
import { treesApi, speciesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { MeasurementInput } from "@/components/ui/measurement-input";
import { DBH_UNITS, HEIGHT_UNITS, dbhToCm, heightToM, cmToDbhUnit, mToHeightUnit } from "@/lib/units";
import { Pencil, Leaf, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function TreeRowActions({ tree, onUpdated }: { tree: any; onUpdated: () => void }) {
  const { toast } = useToast();

  // ── Edit Tree dialog ─────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [species, setSpecies] = useState<any[]>([]);
  const [speciesOpen, setSpeciesOpen] = useState(false);
  const [form, setForm] = useState({
    speciesId: tree.speciesId || "",
    dbh: tree.dbhCm != null ? String(cmToDbhUnit(Number(tree.dbhCm), "cm")) : "",
    dbhUnit: "cm",
    height: tree.heightM != null ? String(mToHeightUnit(Number(tree.heightM), "m")) : "",
    heightUnit: "m",
    plantingDate: tree.plantingDate ? String(tree.plantingDate).slice(0, 10) : "",
    gpsLat: tree.gpsLat != null ? String(tree.gpsLat) : "",
    gpsLng: tree.gpsLng != null ? String(tree.gpsLng) : "",
  });

  const openEdit = async () => {
    setEditOpen(true);
    if (species.length === 0) {
      try {
        const res = await speciesApi.getAll();
        setSpecies(res.data || []);
      } catch {
        // ignore — species selector will just be empty
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await treesApi.update(tree.id, {
        speciesId: form.speciesId || undefined,
        dbhCm: form.dbh ? dbhToCm(Number(form.dbh), form.dbhUnit) : undefined,
        heightM: form.height ? heightToM(Number(form.height), form.heightUnit) : undefined,
        plantingDate: form.plantingDate || undefined,
        gpsLat: form.gpsLat ? Number(form.gpsLat) : undefined,
        gpsLng: form.gpsLng ? Number(form.gpsLng) : undefined,
      });
      toast({ title: "Tree updated" });
      setEditOpen(false);
      onUpdated();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        title: "Error",
        description: Array.isArray(msg) ? msg.join(", ") : msg || "Failed to update tree",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Mark Lost dialog ─────────────────────────────────────────────
  const [lossOpen, setLossOpen] = useState(false);
  const [lossDate, setLossDate] = useState(new Date().toISOString().slice(0, 10));
  const [markingLost, setMarkingLost] = useState(false);
  const [markingAlive, setMarkingAlive] = useState(false);

  const handleMarkLost = async () => {
    setMarkingLost(true);
    try {
      await treesApi.markLost(tree.id, lossDate);
      toast({ title: "Tree marked as lost" });
      setLossOpen(false);
      onUpdated();
    } catch {
      toast({ title: "Failed to mark tree as lost", variant: "destructive" });
    } finally {
      setMarkingLost(false);
    }
  };

  const handleMarkAlive = async () => {
    setMarkingAlive(true);
    try {
      await treesApi.restoreAlive(tree.id);
      toast({ title: "Tree marked as alive" });
      onUpdated();
    } catch {
      toast({ title: "Failed to restore tree", variant: "destructive" });
    } finally {
      setMarkingAlive(false);
    }
  };

  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={openEdit} title="Edit tree">
        <Pencil className="h-4 w-4" />
      </Button>

      {tree.lossDate ? (
        <Button variant="ghost" size="sm" onClick={handleMarkAlive} disabled={markingAlive} title="Mark as alive">
          {markingAlive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Leaf className="h-4 w-4 text-green-600" />}
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setLossOpen(true)} title="Mark as lost">
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </Button>
      )}

      {/* Edit Tree Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Tree {tree.treeId}</DialogTitle>
            <DialogDescription>Update measurements, species, location and planting date</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Species</Label>
              <Popover open={speciesOpen} onOpenChange={setSpeciesOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {species.find((s) => s.id === form.speciesId)?.commonName ||
                      species.find((s) => s.id === form.speciesId)?.scientificName ||
                      tree.species?.commonName ||
                      "Select a species..."}
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
                              setForm((p) => ({ ...p, speciesId: s.id }));
                              setSpeciesOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", form.speciesId === s.id ? "opacity-100 text-green-600" : "opacity-0")} />
                            {s.commonName} ({s.scientificName})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>DBH</Label>
                <MeasurementInput
                  value={form.dbh}
                  onValueChange={(v) => setForm((p) => ({ ...p, dbh: v }))}
                  unit={form.dbhUnit}
                  onUnitChange={(u) => setForm((p) => ({ ...p, dbhUnit: u }))}
                  units={DBH_UNITS}
                  placeholder="e.g., 12.5"
                />
              </div>
              <div className="space-y-1">
                <Label>Height</Label>
                <MeasurementInput
                  value={form.height}
                  onValueChange={(v) => setForm((p) => ({ ...p, height: v }))}
                  unit={form.heightUnit}
                  onUnitChange={(u) => setForm((p) => ({ ...p, heightUnit: u }))}
                  units={HEIGHT_UNITS}
                  placeholder="e.g., 4.2"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Planting Date</Label>
              <DatePicker value={form.plantingDate} onChange={(v) => setForm((p) => ({ ...p, plantingDate: v }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>GPS Latitude</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={form.gpsLat}
                  onChange={(e) => setForm((p) => ({ ...p, gpsLat: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>GPS Longitude</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={form.gpsLng}
                  onChange={(e) => setForm((p) => ({ ...p, gpsLng: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Lost Dialog */}
      <Dialog open={lossOpen} onOpenChange={setLossOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Mark Tree as Lost</DialogTitle>
            <DialogDescription>Record the date this tree ({tree.treeId}) was lost.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1">
            <Label>Loss Date</Label>
            <DatePicker value={lossDate} onChange={setLossDate} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLossOpen(false)} disabled={markingLost}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleMarkLost} disabled={markingLost}>
              {markingLost && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark as Lost
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
