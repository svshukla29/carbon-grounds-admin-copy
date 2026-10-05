"use client";

import { useEffect, useState } from "react";
import { cropAreasApi } from "@/lib/api";
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
import { Wheat, Loader2, Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCan } from "@/lib/permissions";

function AddCropAreasDialog({ instanceId, onCreated }: { instanceId: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [areas, setAreas] = useState<any[]>([{ cropName: "", areaAcres: "", notes: "" }]);
  const { toast } = useToast();

  const handleSubmit = async () => {
    const validAreas = areas.filter((a) => a.areaAcres);
    if (validAreas.length === 0) {
      return toast({ title: "Enter an area for at least one crop area", variant: "destructive" });
    }
    setSubmitting(true);
    try {
      await cropAreasApi.bulkCreate(
        instanceId,
        validAreas.map((a) => ({
          cropName: a.cropName || undefined,
          areaAcres: Number(a.areaAcres),
          notes: a.notes || undefined,
        })),
      );
      toast({ title: `Added ${validAreas.length} crop area(s)` });
      setOpen(false);
      setAreas([{ cropName: "", areaAcres: "", notes: "" }]);
      onCreated();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        title: "Error",
        description: Array.isArray(msg) ? msg.join(", ") : msg || "Failed to add crop areas",
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
          <Plus className="mr-2 h-4 w-4" /> Add Crop Areas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Crop Areas</DialogTitle>
          <DialogDescription>Record one or more intercropped areas for this plot</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {areas.map((area, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_1fr_1.5fr_auto] gap-2 p-2 bg-gray-50 border rounded items-end">
              <Input
                placeholder="Crop (e.g. Turmeric)"
                value={area.cropName}
                onChange={(e) => {
                  const next = [...areas];
                  next[idx].cropName = e.target.value;
                  setAreas(next);
                }}
              />
              <Input
                placeholder="Area (acres)"
                type="number"
                step="0.01"
                min="0"
                value={area.areaAcres}
                onChange={(e) => {
                  const next = [...areas];
                  next[idx].areaAcres = e.target.value;
                  setAreas(next);
                }}
              />
              <Input
                placeholder="Notes (optional)"
                value={area.notes}
                onChange={(e) => {
                  const next = [...areas];
                  next[idx].notes = e.target.value;
                  setAreas(next);
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                disabled={areas.length === 1}
                onClick={() => setAreas(areas.filter((_, i) => i !== idx))}
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setAreas([...areas, { cropName: "", areaAcres: "", notes: "" }])}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Row
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Crop Areas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CropAreasSection({ instanceId }: { instanceId: string }) {
  const can = useCan();
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refresh = async () => {
    try {
      const res = await cropAreasApi.getByInstance(instanceId);
      setAreas(Array.isArray(res.data) ? res.data : []);
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
      await cropAreasApi.delete(id);
      toast({ title: "Crop area removed" });
      refresh();
    } catch (err: any) {
      toast({ title: "Failed to remove crop area", variant: "destructive" });
    }
  };

  const totalArea = areas.reduce((sum, a) => sum + Number(a.areaAcres || 0), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Crop Areas ({areas.length})</CardTitle>
            <CardDescription>
              Total crop area: {totalArea.toFixed(2)} acres
            </CardDescription>
          </div>
          {can("editFieldData") && <AddCropAreasDialog instanceId={instanceId} onCreated={refresh} />}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : areas.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
            <Wheat className="h-8 w-8 text-gray-200" />
            <p>No crop areas recorded yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Crop</TableHead>
                <TableHead>Area (acres)</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell className="font-medium">{area.cropName || "—"}</TableCell>
                  <TableCell>{Number(area.areaAcres).toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{area.notes || "—"}</TableCell>
                  <TableCell className="text-right">
                    {can("deleteRecords") && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(area.id)}>
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
