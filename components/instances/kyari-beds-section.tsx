"use client";

import { useEffect, useState } from "react";
import { kyariBedsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { LayoutGrid, Loader2, Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCan } from "@/lib/permissions";

function AddKyariBedsDialog({ instanceId, onCreated }: { instanceId: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [beds, setBeds] = useState<any[]>([{ bedLabel: "", areaAcres: "", notes: "" }]);
  const { toast } = useToast();

  const handleSubmit = async () => {
    const validBeds = beds.filter((b) => b.areaAcres);
    if (validBeds.length === 0) {
      return toast({ title: "Enter an area for at least one bed", variant: "destructive" });
    }
    setSubmitting(true);
    try {
      await kyariBedsApi.bulkCreate(
        instanceId,
        validBeds.map((b) => ({
          bedLabel: b.bedLabel || undefined,
          areaAcres: Number(b.areaAcres),
          notes: b.notes || undefined,
        })),
      );
      toast({ title: `Added ${validBeds.length} Kyari bed(s)` });
      setOpen(false);
      setBeds([{ bedLabel: "", areaAcres: "", notes: "" }]);
      onCreated();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        title: "Error",
        description: Array.isArray(msg) ? msg.join(", ") : msg || "Failed to add Kyari beds",
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
          <Plus className="mr-2 h-4 w-4" /> Add Beds
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Kyari Beds</DialogTitle>
          <DialogDescription>Record one or more Kyari (bed) areas for this plot</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {beds.map((bed, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_1fr_1.5fr_auto] gap-2 p-2 bg-gray-50 border rounded items-end">
              <Input
                placeholder="Label (e.g. Bed 1)"
                value={bed.bedLabel}
                onChange={(e) => {
                  const next = [...beds];
                  next[idx].bedLabel = e.target.value;
                  setBeds(next);
                }}
              />
              <Input
                placeholder="Area (acres)"
                type="number"
                step="0.01"
                min="0"
                value={bed.areaAcres}
                onChange={(e) => {
                  const next = [...beds];
                  next[idx].areaAcres = e.target.value;
                  setBeds(next);
                }}
              />
              <Input
                placeholder="Notes (optional)"
                value={bed.notes}
                onChange={(e) => {
                  const next = [...beds];
                  next[idx].notes = e.target.value;
                  setBeds(next);
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                disabled={beds.length === 1}
                onClick={() => setBeds(beds.filter((_, i) => i !== idx))}
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setBeds([...beds, { bedLabel: "", areaAcres: "", notes: "" }])}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Row
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Beds
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function KyariBedsSection({ instanceId }: { instanceId: string }) {
  const can = useCan();
  const [beds, setBeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refresh = async () => {
    try {
      const res = await kyariBedsApi.getByInstance(instanceId);
      setBeds(Array.isArray(res.data) ? res.data : []);
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

  const handleDelete = async (id: string) => {
    try {
      await kyariBedsApi.delete(id);
      toast({ title: "Kyari bed removed" });
      refresh();
    } catch (err: any) {
      toast({ title: "Failed to remove bed", variant: "destructive" });
    }
  };

  const totalArea = beds.reduce((sum, b) => sum + Number(b.areaAcres || 0), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Kyari Beds ({beds.length})</CardTitle>
            <CardDescription>
              Total Kyari area: {totalArea.toFixed(2)} acres
            </CardDescription>
          </div>
          {can("editFieldData") && <AddKyariBedsDialog instanceId={instanceId} onCreated={refresh} />}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : beds.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
            <LayoutGrid className="h-8 w-8 text-gray-200" />
            <p>No Kyari beds recorded yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Area (acres)</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {beds.map((bed) => (
                <TableRow key={bed.id}>
                  <TableCell className="font-medium">{bed.bedLabel || "—"}</TableCell>
                  <TableCell>{Number(bed.areaAcres).toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{bed.notes || "—"}</TableCell>
                  <TableCell className="text-right">
                    {can("deleteRecords") && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(bed.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
