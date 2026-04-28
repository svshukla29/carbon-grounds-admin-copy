"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, FileEdit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { farmersApi } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DeleteFarmerDialog } from "@/components/farmers/delete-farmer-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";



export function FarmerDetails({ id }: { id: string }) {
  const [farmer, setFarmer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchFarmer = async () => {
      setLoading(true);
      try {
        const res = await farmersApi.getOne(id);
        setFarmer(res.data);
      } catch (error) {
        console.error("Error fetching farmer:", error);
        router.push("/dashboard/farmers");
      } finally {
        setLoading(false);
      }
    };
    fetchFarmer();
  }, [id, router]);

  const handleDelete = () => setDeleteDialogOpen(true);

  const handleDeleteConfirm = async () => {
    try {
      await farmersApi.delete(id);
    } catch (e) {
      console.error(e);
    }
    setDeleteDialogOpen(false);
    router.push("/dashboard/farmers");
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-600"></div>
          <p className="mt-2 text-sm text-gray-500">
            Loading farmer details...
          </p>
        </div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <p className="text-lg text-gray-500">Farmer not found</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/dashboard/farmers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Farmers
          </Link>
        </Button>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Verified":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Link href="/dashboard/farmers">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {farmer.name}
            </h1>
            <Badge
              variant="outline"
              className={getStatusBadgeColor(farmer.status)}
            >
              {farmer.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{farmer.bio}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild variant="outline">
            <Link href={`/dashboard/farmers/edit/${farmer.id}`}>
              <FileEdit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Farmer Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4 pb-6 text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={farmer.avatar || "/placeholder.svg"}
                  alt={farmer.name}
                />
                <AvatarFallback className="bg-green-100 text-green-800 text-xl">
                  {farmer.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{farmer.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {farmer.location}
                </p>
              </div>
              <Badge
                variant="outline"
                className={getStatusBadgeColor(farmer.status)}
              >
                {farmer.status}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium">
                  Contact Information
                </h4>
                <div className="space-y-2 rounded-md border p-3 text-sm">
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="col-span-2">{farmer.phone ?? "—"}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="col-span-2">{farmer.email ?? "—"}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="col-span-2">{farmer.address ?? "—"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium">Farm Details</h4>
                <div className="space-y-2 rounded-md border p-3 text-sm">
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Area:</span>
                    <span className="col-span-2">{farmer.area} ha</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Joined:</span>
                    <span className="col-span-2">
                      {farmer.joinDate
                        ? new Date(farmer.joinDate).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {(farmer.certifications || []).map((cert: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-blue-50 text-blue-700"
                    >
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Farmer Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="landDetails">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="landDetails">Land Details</TabsTrigger>
                <TabsTrigger value="carbon">Carbon Credits</TabsTrigger>
                <TabsTrigger value="plantDetails">Plant Details</TabsTrigger>
              </TabsList>

              {/* Land Details Tab (replaces Projects) */}
              <TabsContent value="landDetails" className="pt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Land ID / Project</TableHead>
                        <TableHead>Area (ha)</TableHead>
                        <TableHead>Land Type</TableHead>
                        <TableHead>Soil Type</TableHead>
                        <TableHead>Water Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(farmer.projects || []).length > 0 ? (
                        (farmer.projects || []).map((project: any) => (
                          <TableRow key={project.id}>
                            <TableCell className="font-medium">
                              {project.name ?? project.id ?? "—"}
                            </TableCell>
                            <TableCell>{project.landArea ?? "—"}</TableCell>
                            <TableCell>{project.landType ?? "—"}</TableCell>
                            <TableCell>{project.soilType ?? "—"}</TableCell>
                            <TableCell>{project.waterSource ?? "—"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No land details available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Carbon Credits Tab */}
              <TabsContent value="carbon" className="pt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Carbon Credits Generated
                    </CardTitle>
                    <CardDescription>
                      Total credits: {farmer.carbonCredits ?? 0} tons CO₂e
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] w-full">
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-green-600">
                            {farmer.carbonCredits ?? 0}
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            tons of CO₂ equivalent
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Plant Details Tab (replaces Farm History) */}
              <TabsContent value="plantDetails" className="pt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plant / Crop Type</TableHead>
                        <TableHead>Variety</TableHead>
                        <TableHead>Season</TableHead>
                        <TableHead>Area Planted (ha)</TableHead>
                        <TableHead>Year</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(farmer.farmHistory || farmer.crops || []).length > 0 ? (
                        // Try farmHistory first, fallback to crops array
                        (farmer.farmHistory || []).length > 0
                          ? (farmer.farmHistory || []).map(
                              (entry: any, index: number) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">
                                    {Array.isArray(entry.crops)
                                      ? entry.crops.join(", ")
                                      : entry.crops ?? "—"}
                                  </TableCell>
                                  <TableCell>{entry.variety ?? "—"}</TableCell>
                                  <TableCell>{entry.season ?? "—"}</TableCell>
                                  <TableCell>{entry.area ?? "—"}</TableCell>
                                  <TableCell>{entry.year ?? "—"}</TableCell>
                                </TableRow>
                              )
                            )
                          : (farmer.crops || []).map(
                              (crop: string, index: number) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{crop}</TableCell>
                                  <TableCell>—</TableCell>
                                  <TableCell>—</TableCell>
                                  <TableCell>—</TableCell>
                                  <TableCell>—</TableCell>
                                </TableRow>
                              )
                            )
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No plant details available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <DeleteFarmerDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        farmerName={farmer.name}
      />
    </div>
  );
}
