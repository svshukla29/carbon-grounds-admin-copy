"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { monitoringChecklistApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ClipboardCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function MonitoringChecklistDialog({
  periodId,
  periodLabel,
  trigger,
}: {
  periodId: string;
  periodLabel?: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    monitoringChecklistApi
      .getForPeriod(periodId)
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, periodId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await monitoringChecklistApi.bulkUpdate(
        periodId,
        items.map((item) => ({ id: item.id, completed: item.completed, remarks: item.remarks || undefined })),
      );
      toast({ title: "Checklist saved" });
      setOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        title: "Error",
        description: Array.isArray(msg) ? msg.join(", ") : msg || "Failed to save checklist",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const completedCount = items.filter((i) => i.completed).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <ClipboardCheck className="mr-2 h-3.5 w-3.5" /> Checklist
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Monitoring Checklist{periodLabel ? ` — ${periodLabel}` : ""}</DialogTitle>
          <DialogDescription>
            Record which monitoring tasks were completed, for audit and verification evidence
            {items.length > 0 ? ` (${completedCount}/${items.length} complete)` : ""}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {items.map((item, idx) => (
              <div key={item.id} className="space-y-2 border-b pb-3 last:border-0">
                <label className="flex items-start gap-2 cursor-pointer">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) => {
                      const next = [...items];
                      next[idx].completed = checked === true;
                      setItems(next);
                    }}
                  />
                  <span className="text-sm font-medium leading-tight">{item.label}</span>
                </label>
                <Textarea
                  placeholder="Remarks (optional)"
                  rows={1}
                  value={item.remarks || ""}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx].remarks = e.target.value;
                    setItems(next);
                  }}
                  className="ml-6 w-[calc(100%-1.5rem)]"
                />
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave} disabled={saving || loading}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Checklist
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
