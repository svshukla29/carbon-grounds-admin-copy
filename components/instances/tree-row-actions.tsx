"use client";

import { useState } from "react";
import { treesApi, speciesApi, treeMeasurementsApi } from "@/lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { MeasurementInput } from "@/components/ui/measurement-input";
import { DBH_UNITS, HEIGHT_UNITS, dbhToCm, heightToM, cmToDbhUnit, mToHeightUnit } from "@/lib/units";
import { Pencil, Leaf, AlertTriangle, Loader2, Camera, Repeat, History as HistoryIcon, Ruler } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TreePhotoHistoryDialog } from "@/components/trees/tree-photo-history-dialog";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCan } from "@/lib/permissions";

export function TreeRowActions({ tree, onUpdated }: { tree: any; onUpdated: () => void }) {
  const can = useCan();
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
    healthStatus: tree.healthStatus || "",
    qrCode: tree.qrCode || "",
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
        healthStatus: form.healthStatus || undefined,
        qrCode: form.qrCode || undefined,
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
  const [lossStatus, setLossStatus] = useState<"DEAD" | "LOST">("LOST");
  const [lossReason, setLossReason] = useState("");
  const [markingLost, setMarkingLost] = useState(false);
  const [markingAlive, setMarkingAlive] = useState(false);

  const handleMarkLost = async () => {
    setMarkingLost(true);
    try {
      await treesApi.markLost(tree.id, lossDate, lossStatus, lossReason || undefined);
      toast({ title: `Tree marked as ${lossStatus.toLowerCase()}` });
      setLossOpen(false);
      setLossReason("");
      onUpdated();
    } catch {
      toast({ title: "Failed to update tree status", variant: "destructive" });
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

  // ── Replace Tree dialog ──────────────────────────────────────────
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [replaceForm, setReplaceForm] = useState({
    dbh: "", dbhUnit: "cm", height: "", heightUnit: "m",
    plantingDate: new Date().toISOString().slice(0, 10),
    gpsLat: "", gpsLng: "", reason: "",
  });

  const handleReplace = async () => {
    setReplacing(true);
    try {
      const res = await treesApi.replace(tree.id, {
        dbhCm: replaceForm.dbh ? dbhToCm(Number(replaceForm.dbh), replaceForm.dbhUnit) : undefined,
        heightM: replaceForm.height ? heightToM(Number(replaceForm.height), replaceForm.heightUnit) : undefined,
        plantingDate: replaceForm.plantingDate || undefined,
        gpsLat: replaceForm.gpsLat ? Number(replaceForm.gpsLat) : undefined,
        gpsLng: replaceForm.gpsLng ? Number(replaceForm.gpsLng) : undefined,
        reason: replaceForm.reason || undefined,
      });
      toast({ title: `Tree replaced — new ID: ${res.data?.treeId}` });
      setReplaceOpen(false);
      onUpdated();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        title: "Error",
        description: Array.isArray(msg) ? msg.join(", ") : msg || "Failed to replace tree",
        variant: "destructive",
      });
    } finally {
      setReplacing(false);
    }
  };

  // ── History dialog ───────────────────────────────────────────────
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [history, setHistory] = useState<any>(null);
  const [measurements, setMeasurements] = useState<any[]>([]);

  const openHistory = async () => {
    setHistoryOpen(true);
    setLoadingHistory(true);
    try {
      const [historyRes, measurementsRes] = await Promise.all([
        treesApi.getHistory(tree.id),
        treeMeasurementsApi.getByTree(tree.id),
      ]);
      setHistory(historyRes.data);
      setMeasurements(Array.isArray(measurementsRes.data) ? measurementsRes.data : []);
    } catch {
      toast({ title: "Failed to load tree history", variant: "destructive" });
    } finally {
      setLoadingHistory(false);
    }
  };

  // ── Log Measurement dialog ───────────────────────────────────────
  const [measureOpen, setMeasureOpen] = useState(false);
  const [logging, setLogging] = useState(false);
  const [measureForm, setMeasureForm] = useState({
    dbh: "", dbhUnit: "cm", height: "", heightUnit: "m",
    healthStatus: "HEALTHY", measuredAt: new Date().toISOString().slice(0, 10), notes: "",
  });

  const handleLogMeasurement = async () => {
    setLogging(true);
    try {
      await treeMeasurementsApi.create({
        plantingUnitId: tree.id,
        dbhCm: measureForm.dbh ? dbhToCm(Number(measureForm.dbh), measureForm.dbhUnit) : undefined,
        heightM: measureForm.height ? heightToM(Number(measureForm.height), measureForm.heightUnit) : undefined,
        healthStatus: measureForm.healthStatus || undefined,
        measuredAt: measureForm.measuredAt || undefined,
        notes: measureForm.notes || undefined,
      });
      toast({ title: "Measurement logged" });
      setMeasureOpen(false);
      setMeasureForm((p) => ({ ...p, dbh: "", height: "", notes: "" }));
      onUpdated();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        title: "Error",
        description: Array.isArray(msg) ? msg.join(", ") : msg || "Failed to log measurement",
        variant: "destructive",
      });
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="flex justify-end gap-1">
      {can("editFieldData") && (
        <Button variant="ghost" size="sm" onClick={openEdit} title="Edit tree">
          <Pencil className="h-4 w-4" />
        </Button>
      )}

      <TreePhotoHistoryDialog
        plantingUnitId={tree.id}
        treeLabel={tree.treeId}
        trigger={
          <Button variant="ghost" size="sm" title="Photos">
            <Camera className="h-4 w-4 text-blue-600" />
          </Button>
        }
      />

      <Button variant="ghost" size="sm" onClick={openHistory} title="History">
        <HistoryIcon className="h-4 w-4 text-muted-foreground" />
      </Button>

      {can("editFieldData") && (
        <>
          <Button variant="ghost" size="sm" onClick={() => setMeasureOpen(true)} title="Log Measurement">
            <Ruler className="h-4 w-4 text-blue-600" />
          </Button>

          {tree.lossDate ? (
            <Button variant="ghost" size="sm" onClick={handleMarkAlive} disabled={markingAlive} title="Mark as alive">
              {markingAlive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Leaf className="h-4 w-4 text-green-600" />}
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setLossOpen(true)} title="Mark Dead/Lost">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setReplaceOpen(true)} title="Replace with new tree">
                <Repeat className="h-4 w-4 text-amber-600" />
              </Button>
            </>
          )}
        </>
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Health Status</Label>
                <Input
                  value={form.healthStatus}
                  onChange={(e) => setForm((p) => ({ ...p, healthStatus: e.target.value }))}
                  placeholder="e.g. HEALTHY"
                />
              </div>
              <div className="space-y-1">
                <Label>QR Code</Label>
                <Input
                  value={form.qrCode}
                  onChange={(e) => setForm((p) => ({ ...p, qrCode: e.target.value }))}
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

      {/* Mark Dead/Lost Dialog */}
      <Dialog open={lossOpen} onOpenChange={setLossOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Mark Tree Dead / Lost</DialogTitle>
            <DialogDescription>Record what happened to this tree ({tree.treeId}).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={lossStatus} onValueChange={(v) => setLossStatus(v as "DEAD" | "LOST")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEAD">Dead</SelectItem>
                  <SelectItem value="LOST">Lost (missing, stolen, uprooted)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Date</Label>
              <DatePicker value={lossDate} onChange={setLossDate} />
            </div>
            <div className="space-y-1">
              <Label>Reason (optional)</Label>
              <Textarea
                value={lossReason}
                onChange={(e) => setLossReason(e.target.value)}
                placeholder="e.g. Fungal infection, storm damage..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLossOpen(false)} disabled={markingLost}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleMarkLost} disabled={markingLost}>
              {markingLost && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Replace Tree Dialog */}
      <Dialog open={replaceOpen} onOpenChange={setReplaceOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Replace {tree.treeId}</DialogTitle>
            <DialogDescription>
              Marks this tree as replaced and plants a new one — same species and location by default.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>DBH (new sapling)</Label>
                <MeasurementInput
                  value={replaceForm.dbh}
                  onValueChange={(v) => setReplaceForm((p) => ({ ...p, dbh: v }))}
                  unit={replaceForm.dbhUnit}
                  onUnitChange={(u) => setReplaceForm((p) => ({ ...p, dbhUnit: u }))}
                  units={DBH_UNITS}
                  placeholder="e.g., 2.5"
                />
              </div>
              <div className="space-y-1">
                <Label>Height (new sapling)</Label>
                <MeasurementInput
                  value={replaceForm.height}
                  onValueChange={(v) => setReplaceForm((p) => ({ ...p, height: v }))}
                  unit={replaceForm.heightUnit}
                  onUnitChange={(u) => setReplaceForm((p) => ({ ...p, heightUnit: u }))}
                  units={HEIGHT_UNITS}
                  placeholder="e.g., 0.5"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Planting Date</Label>
              <DatePicker value={replaceForm.plantingDate} onChange={(v) => setReplaceForm((p) => ({ ...p, plantingDate: v }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>GPS Latitude (defaults to old tree's)</Label>
                <Input
                  type="number" step="0.0001"
                  placeholder={tree.gpsLat ?? "—"}
                  value={replaceForm.gpsLat}
                  onChange={(e) => setReplaceForm((p) => ({ ...p, gpsLat: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>GPS Longitude (defaults to old tree's)</Label>
                <Input
                  type="number" step="0.0001"
                  placeholder={tree.gpsLng ?? "—"}
                  value={replaceForm.gpsLng}
                  onChange={(e) => setReplaceForm((p) => ({ ...p, gpsLng: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Reason for replacement</Label>
              <Textarea
                value={replaceForm.reason}
                onChange={(e) => setReplaceForm((p) => ({ ...p, reason: e.target.value }))}
                placeholder="e.g. Original tree died of disease"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplaceOpen(false)} disabled={replacing}>Cancel</Button>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleReplace} disabled={replacing}>
              {replacing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Replace Tree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Measurement Dialog */}
      <Dialog open={measureOpen} onOpenChange={setMeasureOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Measurement — {tree.treeId}</DialogTitle>
            <DialogDescription>
              Adds a new dated record without erasing previous ones — like tracking growth over time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>DBH</Label>
                <MeasurementInput
                  value={measureForm.dbh}
                  onValueChange={(v) => setMeasureForm((p) => ({ ...p, dbh: v }))}
                  unit={measureForm.dbhUnit}
                  onUnitChange={(u) => setMeasureForm((p) => ({ ...p, dbhUnit: u }))}
                  units={DBH_UNITS}
                  placeholder="e.g., 14.2"
                />
              </div>
              <div className="space-y-1">
                <Label>Height</Label>
                <MeasurementInput
                  value={measureForm.height}
                  onValueChange={(v) => setMeasureForm((p) => ({ ...p, height: v }))}
                  unit={measureForm.heightUnit}
                  onUnitChange={(u) => setMeasureForm((p) => ({ ...p, heightUnit: u }))}
                  units={HEIGHT_UNITS}
                  placeholder="e.g., 5.1"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Date Measured</Label>
              <DatePicker value={measureForm.measuredAt} onChange={(v) => setMeasureForm((p) => ({ ...p, measuredAt: v }))} />
            </div>
            <div className="space-y-1">
              <Label>Health Status</Label>
              <Select value={measureForm.healthStatus} onValueChange={(v) => setMeasureForm((p) => ({ ...p, healthStatus: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HEALTHY">Healthy</SelectItem>
                  <SelectItem value="AVERAGE">Average</SelectItem>
                  <SelectItem value="DISEASED">Diseased</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Notes (optional)</Label>
              <Textarea
                value={measureForm.notes}
                onChange={(e) => setMeasureForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="e.g. New leaf growth observed"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMeasureOpen(false)} disabled={logging}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleLogMeasurement} disabled={logging}>
              {logging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Log Measurement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-lg max-h-[75vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>History — {tree.treeId}</DialogTitle>
            <DialogDescription>Full lifecycle timeline for this tree.</DialogDescription>
          </DialogHeader>
          {loadingHistory ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            </div>
          ) : history ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    history.tree.status === "ALIVE" ? "bg-green-100 text-green-700"
                      : history.tree.status === "REPLACED" ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  }
                >
                  {history.tree.status}
                </Badge>
                {history.predecessor && (
                  <span className="text-xs text-muted-foreground">
                    Replaces {history.predecessor.treeId}
                  </span>
                )}
                {history.successor && (
                  <span className="text-xs text-muted-foreground">
                    Replaced by {history.successor.treeId}
                  </span>
                )}
              </div>

              {measurements.length >= 2 && (
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Growth Over Time</h4>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[...measurements]
                          .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime())
                          .map((m) => ({
                            date: new Date(m.measuredAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }),
                            dbhCm: m.dbhCm != null ? Number(m.dbhCm) : null,
                            heightM: m.heightM != null ? Number(m.heightM) : null,
                          }))}
                        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="dbhCm" name="DBH (cm)" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="heightM" name="Height (m)" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {history.events.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No events recorded yet.</p>
              ) : (
                <ol className="space-y-2 border-l-2 border-muted pl-4">
                  {history.events.map((e: any, i: number) => (
                    <li key={i} className="text-sm">
                      <span className="text-xs text-muted-foreground">
                        {new Date(e.date).toLocaleDateString("en-IN")}
                      </span>
                      {" — "}
                      <span className="font-medium">{e.type}</span>
                      {": "}
                      {e.description}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No history available.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
