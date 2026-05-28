"use client";

import { useEffect, useState } from "react";
import { gramPanchayatApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, Plus, Building2, Loader2, Phone } from "lucide-react";
import Link from "next/link";

export default function GramPanchayatPage() {
  const [gps, setGps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async (q?: string) => {
    setLoading(true);
    try {
      const res = q && q.length > 1
        ? await gramPanchayatApi.search(q)
        : await gramPanchayatApi.getAll();
      // GP API returns array directly
      setGps(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };


  useEffect(() => { load(); }, []);
  useEffect(() => {
    const t = setTimeout(() => load(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gram Panchayats</h1>
          <p className="text-muted-foreground">Manage Gram Panchayat records with LGD codes</p>
        </div>
        <Button asChild className="bg-green-700 hover:bg-green-800">
          <Link href="/dashboard/gram-panchayat/create">
            <Plus className="mr-2 h-4 w-4" /> Add GP
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>All Gram Panchayats</CardTitle>
              <CardDescription>{gps.length} registered GPs</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, district..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
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
                  <TableHead>GP Name</TableHead>
                  <TableHead>LGD Code</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Block</TableHead>
                  <TableHead>Panchayat Sachiv</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Farmers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No Gram Panchayats found
                    </TableCell>
                  </TableRow>
                ) : (
                  gps.map((gp) => (
                    <TableRow key={gp.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-green-600" />
                          {gp.gpName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                          {gp.lgdCode || "—"}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm">{gp.state}</TableCell>
                      <TableCell className="text-sm">{gp.district}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{gp.block || "—"}</TableCell>
                      <TableCell className="text-sm">{gp.panchayatSachiv || "—"}</TableCell>
                      <TableCell className="text-sm">
                        {gp.contact1 ? (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {gp.contact1}
                          </div>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-green-700">
                        {gp.farmers?.length ?? 0}
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
