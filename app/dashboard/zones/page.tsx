"use client";

import { useEffect, useState } from "react";
import { mastersApi } from "@/lib/api";
import { useCan } from "@/lib/permissions";
import { ZoneDialog } from "@/components/zones/zone-dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ClimaticZonesPage() {
  const can = useCan();
  const { toast } = useToast();
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const res = await mastersApi.getEcologicalZones(true);
      setZones(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to load climatic zones", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleActive = async (zone: any) => {
    setTogglingId(zone.id);
    try {
      await mastersApi.updateEcologicalZone(zone.id, { isActive: !zone.isActive });
      toast({ title: zone.isActive ? `"${zone.name}" hidden from forms` : `"${zone.name}" available in forms again` });
      await refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to update zone", variant: "destructive" });
    } finally {
      setTogglingId(null);
    }
  };

  const activeCount = zones.filter((z) => z.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Climatic Zones</h1>
          <p className="text-muted-foreground">
            Ecological zones offered on the plot form, with the IPCC root:shoot ratio each one uses in the carbon calculation
          </p>
        </div>
        {can("manageZones") && <ZoneDialog onSaved={refresh} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {activeCount} active zone{activeCount === 1 ? "" : "s"}
            {zones.length > activeCount && ` · ${zones.length - activeCount} inactive`}
          </CardTitle>
          <CardDescription>
            Choose &quot;Other&quot; on a plot for a zone not listed here; it uses the IPCC default ratio. Inactive zones are
            hidden from the plot form, but plots already using them keep their ratio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone</TableHead>
                  <TableHead>IPCC Domain</TableHead>
                  <TableHead className="text-right">Root:Shoot (R)</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  {can("manageZones") && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {zones.map((z) => (
                  <TableRow key={z.id} className={z.isActive ? "" : "opacity-60"}>
                    <TableCell className="font-medium">{z.name}</TableCell>
                    <TableCell>{z.domain || "—"}</TableCell>
                    <TableCell className="text-right font-mono">{Number(z.rootShootRatio).toFixed(2)}</TableCell>
                    <TableCell className="max-w-sm text-xs text-muted-foreground">{z.source || "—"}</TableCell>
                    <TableCell>
                      {z.isActive ? (
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    {can("manageZones") && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <ZoneDialog zone={z} onSaved={refresh} />
                          {z.name !== "Other" && (
                            <Switch
                              checked={z.isActive}
                              disabled={togglingId === z.id}
                              onCheckedChange={() => toggleActive(z)}
                              title={z.isActive ? "Hide from forms" : "Show in forms"}
                            />
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
