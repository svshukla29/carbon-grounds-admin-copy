"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { treeMeasurementsApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, Ruler, HeartPulse, AlertTriangle, MapPin } from "lucide-react";

const healthColors: Record<string, string> = {
  HEALTHY: "bg-green-100 text-green-700",
  AVERAGE: "bg-yellow-100 text-yellow-700",
  DISEASED: "bg-red-100 text-red-700",
};

export default function MonitoringVisitsPage() {
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    treeMeasurementsApi.getRecent()
      .then((r) => setMeasurements(Array.isArray(r.data) ? r.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const diseasedCount = measurements.filter((m) => m.healthStatus === "DISEASED").length;
  const withGps = measurements.filter((m) => m.gpsLat && m.gpsLng).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Monitoring Visits</h1>
        <p className="text-muted-foreground">
          Field remeasurements (height, DBH, health status) logged from the farmer app
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Visits", value: measurements.length, icon: Ruler, color: "green" },
          { label: "Diseased Flagged", value: diseasedCount, icon: AlertTriangle, color: "red" },
          { label: "With GPS", value: withGps, icon: MapPin, color: "blue" },
          { label: "Trees Covered", value: new Set(measurements.map((m) => m.plantingUnitId)).size, icon: HeartPulse, color: "emerald" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`rounded-full bg-${s.color}-100 p-2`}>
                  <s.icon className={`h-4 w-4 text-${s.color}-700`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Monitoring Visits</CardTitle>
          <CardDescription>
            Most recent {measurements.length} measurement{measurements.length === 1 ? "" : "s"}, newest first
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
                  <TableHead>Tree ID</TableHead>
                  <TableHead>Species</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Plot</TableHead>
                  <TableHead>Height (m)</TableHead>
                  <TableHead>DBH (cm)</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>GPS</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Measured On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {measurements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      No monitoring visits logged yet
                    </TableCell>
                  </TableRow>
                ) : (
                  measurements.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        {m.plantingUnit?.instanceId ? (
                          <Link
                            href={`/dashboard/instances/${m.plantingUnit.instanceId}`}
                            className="text-xs bg-gray-100 hover:bg-gray-200 px-1.5 py-0.5 rounded font-mono"
                          >
                            {m.plantingUnit?.treeId || "—"}
                          </Link>
                        ) : (
                          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                            {m.plantingUnit?.treeId || "—"}
                          </code>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {m.plantingUnit?.species?.commonName || "—"}
                      </TableCell>
                      <TableCell>
                        {m.plantingUnit?.instance?.farmerId ? (
                          <Link
                            href={`/dashboard/farmers/${m.plantingUnit.instance.farmerId}`}
                            className="text-green-700 hover:underline"
                          >
                            {m.plantingUnit?.instance?.farmer?.farmerName || "—"}
                          </Link>
                        ) : (
                          m.plantingUnit?.instance?.farmer?.farmerName || "—"
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {m.plantingUnit?.instance?.instanceId || "—"}
                      </TableCell>
                      <TableCell>{m.heightM ?? "—"}</TableCell>
                      <TableCell>{m.dbhCm ?? "—"}</TableCell>
                      <TableCell>
                        {m.healthStatus ? (
                          <Badge className={healthColors[m.healthStatus] || "bg-gray-100 text-gray-600"}>
                            {m.healthStatus}
                          </Badge>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {m.gpsLat && m.gpsLng
                          ? `${Number(m.gpsLat).toFixed(4)}, ${Number(m.gpsLng).toFixed(4)}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {m.notes || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {m.measuredAt ? new Date(m.measuredAt).toLocaleDateString("en-IN") : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
