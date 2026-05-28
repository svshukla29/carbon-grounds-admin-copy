"use client";

import { useEffect, useState } from "react";
import { monitoringApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, ShieldCheck, CheckCircle, Clock, XCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function MonitoringPage() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [all, pend] = await Promise.all([
        monitoringApi.getAll(),
        monitoringApi.getPending(),
      ]);
      setPeriods(all.data || []);
      setPending(pend.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string, comments?: string) => {
    setUpdatingId(id);
    try {
      await monitoringApi.updateStatus(id, status, comments);
      await load();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Monitoring & Verification</h1>
        <p className="text-muted-foreground">Review and approve field monitoring submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: periods.length, icon: ShieldCheck, color: "green" },
          { label: "Pending", value: pending.length, icon: Clock, color: "blue" },
          { label: "Approved", value: periods.filter(p => p.status === "APPROVED").length, icon: CheckCircle, color: "emerald" },
          { label: "Rejected", value: periods.filter(p => p.status === "REJECTED").length, icon: XCircle, color: "red" },
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

      {/* Pending Verification */}
      {pending.length > 0 && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Verification ({pending.length})
            </CardTitle>
            <CardDescription>These submissions are waiting for your review</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Farm Plot</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.periodName || `Period ${p.periodNumber}`}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.instance?.instanceId || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.submittedAt ? new Date(p.submittedAt).toLocaleDateString("en-IN") : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-700 hover:bg-green-800"
                          disabled={updatingId === p.id}
                          onClick={() => updateStatus(p.id, "APPROVED")}
                        >
                          {updatingId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={updatingId === p.id}
                          onClick={() => updateStatus(p.id, "REJECTED", "Does not meet criteria")}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Periods */}
      <Card>
        <CardHeader>
          <CardTitle>All Monitoring Periods</CardTitle>
          <CardDescription>{periods.length} total periods</CardDescription>
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
                  <TableHead>Period</TableHead>
                  <TableHead>Instance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Admin Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No monitoring periods yet
                    </TableCell>
                  </TableRow>
                ) : (
                  periods.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {p.periodName || `Period ${p.periodNumber}`}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                          {p.instanceId?.substring(0, 8)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[p.status] || "bg-gray-100 text-gray-600"}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.startDate ? new Date(p.startDate).toLocaleDateString("en-IN") : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.endDate ? new Date(p.endDate).toLocaleDateString("en-IN") : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {p.adminComments || "—"}
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
