"use client";

import { useEffect, useState, useCallback } from "react";
import { farmersApi } from "@/lib/api";
import { DeleteFarmerDialog } from "@/components/farmers/delete-farmer-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Eye, FileEdit, Loader2, MoreHorizontal, Search, Trash2,
  UserPlus, ChevronLeft, ChevronRight, Phone, MapPin,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function FarmersList() {
  const router = useRouter();
  const [farmers, setFarmers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [farmerToDelete, setFarmerToDelete] = useState<any>(null);
  const limit = 15;

  const fetchFarmers = useCallback(async () => {
    setIsLoading(true);
    try {
      let res;
      if (search.trim().length > 1) {
        res = await farmersApi.search(search.trim());
        const data = Array.isArray(res.data) ? res.data : [];
        setFarmers(data);
        setTotal(data.length);
      } else {
        const params: any = { page, limit };
        if (categoryFilter !== "all") params.category = categoryFilter;
        res = await farmersApi.getAll(params);
        setFarmers(res.data?.data || []);
        setTotal(res.data?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch farmers", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryFilter, page]);

  useEffect(() => {
    const t = setTimeout(fetchFarmers, 350);
    return () => clearTimeout(t);
  }, [fetchFarmers]);

  const handleDelete = async () => {
    if (!farmerToDelete) return;
    try {
      await farmersApi.delete(farmerToDelete.id);
      setFarmers((prev) => prev.filter((f) => f.id !== farmerToDelete.id));
      setTotal((t) => t - 1);
    } catch (e) { console.error(e); }
    setDeleteDialogOpen(false);
    setFarmerToDelete(null);
  };

  const getInitials = (name: string) =>
    (name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Farmers</h2>
          <p className="text-muted-foreground">
            {total} registered farmers — Chhattisgarh Carbon Credit Project
          </p>
        </div>
        <Button asChild className="bg-green-700 hover:bg-green-800">
          <Link href="/dashboard/farmers/create">
            <UserPlus className="mr-2 h-4 w-4" /> Add Farmer
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Farmers</CardTitle>
              <CardDescription>{total} farmers registered</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search name, mobile, village..."
                  className="pl-8 w-56"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="ST">ST</SelectItem>
                  <SelectItem value="SC">SC</SelectItem>
                  <SelectItem value="OBC">OBC</SelectItem>
                  <SelectItem value="GEN">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              <span className="ml-2 text-muted-foreground">Loading farmers...</span>
            </div>
          ) : farmers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground">No farmers found.</p>
              <Button asChild className="mt-4 bg-green-700 hover:bg-green-800">
                <Link href="/dashboard/farmers/create">
                  <UserPlus className="mr-2 h-4 w-4" /> Register First Farmer
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Instance ID</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Village / District</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Flags</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farmers.map((farmer) => (
                    <TableRow key={farmer.id} className="hover:bg-green-50/40">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-800 text-xs font-bold shrink-0">
                            {getInitials(farmer.farmerName)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{farmer.farmerName}</p>
                            <p className="text-xs text-muted-foreground">{farmer.gender}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                          {farmer.instanceId}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {farmer.mobileNo}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          farmer.category === "ST" ? "bg-purple-100 text-purple-700" :
                          farmer.category === "SC" ? "bg-blue-100 text-blue-700" :
                          farmer.category === "OBC" ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-700"
                        }>
                          {farmer.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                          <span>{farmer.villageName}{farmer.district ? `, ${farmer.district}` : ""}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {farmer.state || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {farmer.isPvtg && (
                            <Badge className="bg-orange-100 text-orange-700 text-xs">PVTG</Badge>
                          )}
                          {farmer.bpl && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">BPL</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/farmers/${farmer.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" /> View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/farmers/edit/${farmer.id}`)}
                            >
                              <FileEdit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setFarmerToDelete(farmer);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && !search && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} — {total} total farmers
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {farmerToDelete && (
        <DeleteFarmerDialog
          open={deleteDialogOpen}
          onClose={() => { setDeleteDialogOpen(false); setFarmerToDelete(null); }}
          onConfirm={handleDelete}
          farmerName={farmerToDelete.farmerName}
        />
      )}
    </div>
  );
}
