"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { gramPanchayatApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from "@/components/ui/command";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Plus, Building2, Loader2, Phone, MapPin, Check, ChevronsUpDown, Contact } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function GramPanchayatPage() {
  return (
    <Suspense fallback={null}>
      <GramPanchayatPageInner />
    </Suspense>
  );
}

function GramPanchayatPageInner() {
  const searchParams = useSearchParams();
  const [gps, setGps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Combobox state
  const [open, setOpen] = useState(false);
  const [selectedGpId, setSelectedGpId] = useState<string>("");

  // Detailed GP state
  const [gpDetails, setGpDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // 1. Fetch all GPs on mount to populate the combobox
  useEffect(() => {
    const fetchAllGps = async () => {
      setLoading(true);
      try {
        const res = await gramPanchayatApi.getAll();
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setGps(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAllGps();
  }, []);

  // 1b. Pre-select GP from ?gpId= query param (e.g. after registering a farmer)
  useEffect(() => {
    const gpId = searchParams.get("gpId");
    if (gpId) setSelectedGpId(gpId);
  }, [searchParams]);

  // 2. Fetch specific GP details (which includes farmers) when a GP is selected
  useEffect(() => {
    if (!selectedGpId) {
      setGpDetails(null);
      return;
    }

    const fetchGpDetails = async () => {
      setLoadingDetails(true);
      try {
        const res = await gramPanchayatApi.getOne(selectedGpId);
        setGpDetails(res.data);
      } catch (e) {
        console.error("Failed to fetch GP details:", e);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchGpDetails();
  }, [selectedGpId]);

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gram Panchayats</h1>
          <p className="text-muted-foreground">Select a Gram Panchayat to view details and registered farmers.</p>
        </div>
        <Button asChild className="bg-green-700 hover:bg-green-800">
          <Link href="/dashboard/gram-panchayat/create">
            <Plus className="mr-2 h-4 w-4" /> Add New GP
          </Link>
        </Button>
      </div>

      {/* GP Selection Box */}
      <Card className="border-green-100 shadow-sm">
        <CardHeader className="bg-green-50/50 pb-4 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-green-700" /> 
            Select Gram Panchayat
          </CardTitle>
          <CardDescription>
            Search through registered GPs (e.g., from Chhattisgarh, Uttarakhand)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading Gram Panchayats...
              </div>
            ) : (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full sm:w-[400px] justify-between font-normal"
                  >
                    {selectedGpId
                      ? gps.find((gp) => gp.id === selectedGpId)?.gpName
                      : "Search and select a GP..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search GP by name or LGD code..." />
                    <CommandList>
                      <CommandEmpty>No Gram Panchayat found.</CommandEmpty>
                      <CommandGroup>
                        {gps.map((gp) => (
                          <CommandItem
                            key={gp.id}
                            value={`${gp.gpName} ${gp.lgdCode} ${gp.district}`}
                            onSelect={() => {
                              setSelectedGpId(gp.id);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedGpId === gp.id ? "opacity-100 text-green-600" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{gp.gpName}</span>
                              <span className="text-xs text-muted-foreground">
                                LGD: {gp.lgdCode} • {gp.district}, {gp.state}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected GP Details */}
      {loadingDetails ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : gpDetails ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-t-4 border-t-green-600 shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-green-700" />
                    {gpDetails.gpName}
                  </CardTitle>
                  <CardDescription className="mt-1.5 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {gpDetails.district}, {gpDetails.state}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-mono">
                      LGD: {gpDetails.lgdCode}
                    </span>
                  </CardDescription>
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Registered Farmers</div>
                    <div className="text-3xl font-bold text-green-700">{gpDetails.farmers?.length || 0}</div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/gram-panchayat/edit/${gpDetails.id}`}>Edit GP</Link>
                    </Button>
                    <Button asChild size="sm" className="bg-green-700 hover:bg-green-800">
                      <Link href={`/dashboard/farmers/create?gpId=${gpDetails.id}`}>
                        <Plus className="mr-1 h-4 w-4" /> Add Farmer
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Block</div>
                  <div className="font-medium">{gpDetails.block || "—"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Contact className="h-4 w-4" /> Panchayat Sachiv
                  </div>
                  <div className="font-medium">{gpDetails.sachivName || "—"}</div>
                  {gpDetails.sachivPhone && (
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {gpDetails.sachivPhone}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Phone className="h-4 w-4" /> Additional Contact
                  </div>
                  <div className="font-medium">{gpDetails.contact1Name || "—"}</div>
                  {gpDetails.contact1Phone && (
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {gpDetails.contact1Phone}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Farmers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Farmers in {gpDetails.gpName}</CardTitle>
              <CardDescription>List of all farmers assigned to this Gram Panchayat</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farmer Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Village</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!gpDetails.farmers || gpDetails.farmers.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No farmers registered in this Gram Panchayat yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    gpDetails.farmers.map((farmer: any) => (
                      <TableRow key={farmer.id}>
                        <TableCell className="font-medium">{farmer.farmerName}</TableCell>
                        <TableCell>{farmer.mobileNo || "—"}</TableCell>
                        <TableCell>{farmer.villageName || "—"}</TableCell>
                        <TableCell>{farmer.category || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/farmers/${farmer.id}`}>View Profile</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
