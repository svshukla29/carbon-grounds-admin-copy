"use client";

import { useEffect, useState } from "react";
import { monitoringApi, calculationsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Calculator, Loader2, Plus, CalendarRange, ListTree } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MonitoringChecklistDialog } from "@/components/instances/monitoring-checklist-dialog";

const STATUS_OPTIONS = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"];

function CreatePeriodDialog({ instanceId, onCreated }: { instanceId: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ periodNumber: "", periodName: "", startDate: "", endDate: "" });
  const { toast } = useToast();

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await monitoringApi.create({
        instanceId,
        periodNumber: form.periodNumber ? Number(form.periodNumber) : undefined,
        periodName: form.periodName || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      });
      toast({ title: "Monitoring period created" });
      setOpen(false);
      setForm({ periodNumber: "", periodName: "", startDate: "", endDate: "" });
      onCreated();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        title: "Error",
        description: Array.isArray(msg) ? msg.join(", ") : msg || "Failed to create monitoring period",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" /> New Period
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Monitoring Period</DialogTitle>
          <DialogDescription>Define a new reporting period for this plot</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="periodNumber">Period Number</Label>
              <Input
                id="periodNumber" type="number" min="1" placeholder="e.g., 1"
                value={form.periodNumber}
                onChange={(e) => setForm((p) => ({ ...p, periodNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="periodName">Period Name</Label>
              <Input
                id="periodName" placeholder="e.g., Year 1 Monitoring"
                value={form.periodName}
                onChange={(e) => setForm((p) => ({ ...p, periodName: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate" type="date"
                value={form.startDate}
                onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate" type="date"
                value={form.endDate}
                onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Period
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CalculationDetailsDialog({ calculationId }: { calculationId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ calculation: any; details: any[] } | null>(null);

  const handleOpen = async (next: boolean) => {
    setOpen(next);
    if (next && !data) {
      setLoading(true);
      try {
        const res = await calculationsApi.getDetails(calculationId);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <ListTree className="mr-1.5 h-3.5 w-3.5" /> Show work
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Calculation Breakdown</DialogTitle>
          <DialogDescription>
            Every input and formula used to produce this result — a full audit trail, not just the final number.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Ecological zone used: </span>
                <span className="font-medium">{data.calculation.ecologicalZoneNameUsed || "None (default applied)"}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Root:shoot ratio (R): </span>
                <span className="font-medium">{data.calculation.rootShootRatioUsed ?? "—"}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Formula version: </span>
                <span className="font-mono text-xs">{data.calculation.formulaVersion}</span>
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tree</TableHead>
                  <TableHead>Species</TableHead>
                  <TableHead>DBH (cm)</TableHead>
                  <TableHead>AGB (kg)</TableHead>
                  <TableHead>Carbon (kg)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.details.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.treeIdUsed}</TableCell>
                    <TableCell>{d.speciesNameUsed}</TableCell>
                    <TableCell>{Number(d.dbhCmUsed).toFixed(1)}</TableCell>
                    <TableCell>{Number(d.agbBiomassKg).toFixed(2)}</TableCell>
                    <TableCell>{Number(d.carbonStockKg).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Formula, per tree</h4>
              <div className="max-h-48 overflow-y-auto rounded-lg border bg-muted/20 p-3 space-y-2">
                {data.details.map((d) => (
                  <p key={d.id} className="font-mono text-xs text-muted-foreground">
                    <span className="text-foreground font-medium">{d.treeIdUsed}: </span>
                    {d.formula}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-8 text-center">No per-tree detail available for this calculation.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RunCalculationDialog({
  instanceId, periodId, periodLabel, onRun,
}: { instanceId: string; periodId: string; periodLabel: string; onRun: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const { toast } = useToast();

  const handleOpen = async (next: boolean) => {
    setOpen(next);
    if (next) {
      setPreview(null);
      setLoading(true);
      try {
        const res = await calculationsApi.preview(instanceId);
        setPreview(res.data);
      } catch (err: any) {
        const msg = err?.response?.data?.message;
        toast({
          title: "Failed to preview calculation",
          description: Array.isArray(msg) ? msg.join(", ") : msg,
          variant: "destructive",
        });
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConfirmRun = async () => {
    setRunning(true);
    try {
      await calculationsApi.run(instanceId, periodId);
      toast({ title: "Calculation completed" });
      setOpen(false);
      onRun();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        title: "Calculation failed",
        description: Array.isArray(msg) ? msg.join(", ") : msg,
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Calculator className="mr-2 h-3.5 w-3.5" />
          Run Calculation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Before Running — {periodLabel}</DialogTitle>
          <DialogDescription>
            These are the exact inputs and formula that will be used. Nothing is saved until you confirm.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : preview ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Trees included</p>
                <p className="text-lg font-semibold">{preview.treeCount}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Ecological Zone</p>
                <p className="text-sm font-medium">{preview.ecologicalZoneName || "None (default applied)"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Root:Shoot Ratio (R)</p>
                <p className="text-lg font-semibold">{Number(preview.rootShootRatio).toFixed(2)}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">CO2:C Ratio (IPCC)</p>
                <p className="text-lg font-semibold">{Number(preview.co2ToCRatio).toFixed(4)}</p>
              </div>
            </div>

            <div className="rounded-lg bg-green-50 border border-green-200 p-3 grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
              <div>
                <p className="text-xs text-green-700">AGB Biomass</p>
                <p className="text-base font-bold text-green-800">{Number(preview.agbBiomass).toFixed(2)} kg</p>
              </div>
              <div>
                <p className="text-xs text-green-700">Carbon Stock</p>
                <p className="text-base font-bold text-green-800">{Number(preview.carbonStock).toFixed(4)} tC</p>
              </div>
              <div>
                <p className="text-xs text-green-700">CO2e</p>
                <p className="text-base font-bold text-green-800">{Number(preview.co2e).toFixed(4)} t</p>
              </div>
              <div>
                <p className="text-xs text-green-700">Net Credits</p>
                <p className="text-base font-bold text-green-800">{Number(preview.netCredits).toFixed(4)}</p>
              </div>
            </div>

            {preview.treeCount === 0 ? (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                No living trees with a recorded DBH and a species with allometric constants were found — running
                this will produce a zero-credit calculation.
              </p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tree</TableHead>
                      <TableHead>Species</TableHead>
                      <TableHead>DBH (cm)</TableHead>
                      <TableHead>AGB (kg)</TableHead>
                      <TableHead>Carbon (kg)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.details.map((d: any) => (
                      <TableRow key={d.plantingUnitId}>
                        <TableCell className="font-medium">{d.treeIdUsed}</TableCell>
                        <TableCell>{d.speciesNameUsed}</TableCell>
                        <TableCell>{Number(d.dbhCmUsed).toFixed(1)}</TableCell>
                        <TableCell>{Number(d.agbBiomassKg).toFixed(2)}</TableCell>
                        <TableCell>{Number(d.carbonStockKg).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Formula, per tree</h4>
                  <div className="max-h-40 overflow-y-auto rounded-lg border bg-muted/20 p-3 space-y-2">
                    {preview.details.map((d: any) => (
                      <p key={d.plantingUnitId} className="font-mono text-xs text-muted-foreground">
                        <span className="text-foreground font-medium">{d.treeIdUsed}: </span>
                        {d.formula}
                      </p>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={running}>Cancel</Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleConfirmRun}
            disabled={loading || running || !preview}
          >
            {running && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm & Run
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MonitoringSection({ instanceId }: { instanceId: string }) {
  const [periods, setPeriods] = useState<any[]>([]);
  const [calculations, setCalculations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refresh = async () => {
    try {
      const [periodsRes, calcsRes] = await Promise.all([
        monitoringApi.getAll({ instanceId }),
        calculationsApi.getByInstance(instanceId),
      ]);
      setPeriods(Array.isArray(periodsRes.data) ? periodsRes.data : []);
      setCalculations(Array.isArray(calcsRes.data) ? calcsRes.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId]);

  const handleStatusChange = async (periodId: string, status: string) => {
    try {
      await monitoringApi.updateStatus(periodId, status);
      toast({ title: "Status updated" });
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        title: "Failed to update status",
        description: Array.isArray(msg) ? msg.join(", ") : msg,
        variant: "destructive",
      });
    }
  };

  const latestCalcByPeriod = (periodId: string) =>
    calculations.find((c) => c.periodId === periodId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Monitoring & Calculations</CardTitle>
            <CardDescription>Monitoring periods and carbon credit calculations for this plot</CardDescription>
          </div>
          <CreatePeriodDialog instanceId={instanceId} onCreated={refresh} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : periods.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
            <CalendarRange className="h-8 w-8 text-gray-200" />
            <p>No monitoring periods yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Net Credits (tCO2e)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map((period) => {
                const calc = latestCalcByPeriod(period.id);
                return (
                  <TableRow key={period.id}>
                    <TableCell className="font-medium">
                      {period.periodName || `Period ${period.periodNumber ?? "—"}`}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {period.startDate ? new Date(period.startDate).toLocaleDateString("en-IN") : "—"}
                      {" – "}
                      {period.endDate ? new Date(period.endDate).toLocaleDateString("en-IN") : "—"}
                    </TableCell>
                    <TableCell>
                      <Select value={period.status} onValueChange={(v) => handleStatusChange(period.id, v)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{calc ? Number(calc.netCredits).toFixed(2) : "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <MonitoringChecklistDialog
                          periodId={period.id}
                          periodLabel={period.periodName || `Period ${period.periodNumber ?? "—"}`}
                        />
                        <RunCalculationDialog
                          instanceId={instanceId}
                          periodId={period.id}
                          periodLabel={period.periodName || `Period ${period.periodNumber ?? "—"}`}
                          onRun={refresh}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {calculations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Calculation History</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>AGB Biomass (kg)</TableHead>
                  <TableHead>Carbon Stock (tC)</TableHead>
                  <TableHead>CO2e (t)</TableHead>
                  <TableHead>Net Credits</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Breakdown</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculations.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.period?.periodName || `Period ${c.period?.periodNumber ?? "—"}`}</TableCell>
                    <TableCell>{Number(c.agbBiomass).toFixed(2)}</TableCell>
                    <TableCell>{Number(c.carbonStock).toFixed(4)}</TableCell>
                    <TableCell>{Number(c.co2e).toFixed(4)}</TableCell>
                    <TableCell className="font-medium">{Number(c.netCredits).toFixed(4)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <CalculationDetailsDialog calculationId={c.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
