"use client";

import { useEffect, useState } from "react";
import { farmersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, Plus, Users, Leaf, Eye, Loader2 } from "lucide-react";
import Link from "next/link";

const categoryColors: Record<string, string> = {
  ST: "bg-green-100 text-green-700",
  SC: "bg-blue-100 text-blue-700",
  OBC: "bg-yellow-100 text-yellow-700",
  GEN: "bg-gray-100 text-gray-700",
};

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const loadFarmers = async (q?: string) => {
    setLoading(true);
    try {
      if (q && q.length > 1) {
        const res = await farmersApi.search(q);
        setFarmers(res.data);
        setTotal(res.data.length);
      } else {
        const res = await farmersApi.getAll({ page, limit });
        setFarmers(res.data.data || []);
        setTotal(res.data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFarmers(); }, [page]);

  useEffect(() => {
    const t = setTimeout(() => loadFarmers(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Farmers</h1>
          <p className="text-muted-foreground">
            Manage all registered farmers and their land details
          </p>
        </div>
        <Button asChild className="bg-green-700 hover:bg-green-800">
          <Link href="/dashboard/farmers/create">
            <Plus className="mr-2 h-4 w-4" /> Add Farmer
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <Users className="h-4 w-4 text-green-700" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <Leaf className="h-4 w-4 text-green-700" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ST Category</p>
                <p className="text-xl font-bold">
                  {farmers.filter((f) => f.category === "ST").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-2">
                <Leaf className="h-4 w-4 text-amber-700" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">PVTG</p>
                <p className="text-xl font-bold">
                  {farmers.filter((f) => f.isPvtg).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Users className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">BPL</p>
                <p className="text-xl font-bold">
                  {farmers.filter((f) => f.bpl).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>All Farmers</CardTitle>
              <CardDescription>
                {total} total registered farmers
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search name, mobile, village..."
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
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instance ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Village</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>GP</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farmers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No farmers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    farmers.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                            {f.instanceId}
                          </code>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>{f.farmerName}</div>
                          {f.isPvtg && (
                            <Badge className="mt-0.5 bg-amber-100 text-amber-700 text-xs">PVTG</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {f.mobileNo || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge className={categoryColors[f.category] || "bg-gray-100 text-gray-700"}>
                            {f.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{f.villageName}</TableCell>
                        <TableCell className="text-sm">{f.district}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {f.gramPanchayat?.gpName || "—"}
                        </TableCell>
                        <TableCell>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/dashboard/farmers/${f.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {!search && total > limit && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page * limit >= total}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
