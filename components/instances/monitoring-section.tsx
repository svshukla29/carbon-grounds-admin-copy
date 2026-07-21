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
import { Calculator, Loader2, Plus, CalendarRange } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export function MonitoringSection({ instanceId }: { instanceId: string }) {
  const [periods, setPeriods] = useState<any[]>([]);
  const [calculations, setCalculations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);
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

  const handleRun = async (periodId: string) => {
    setRunningId(periodId);
    try {
      await calculationsApi.run(instanceId, periodId);
      toast({ title: "Calculation completed" });
      await refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        title: "Calculation failed",
        description: Array.isArray(msg) ? msg.join(", ") : msg,
        variant: "destructive",
      });
    } finally {
      setRunningId(null);
    }
  };

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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRun(period.id)}
                        disabled={runningId === period.id}
                      >
                        {runningId === period.id
                          ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          : <Calculator className="mr-2 h-3.5 w-3.5" />}
                        Run Calculation
                      </Button>
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
