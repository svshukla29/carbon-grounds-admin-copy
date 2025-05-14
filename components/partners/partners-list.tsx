"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, ExternalLink, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Mock data for partners
const initialPartners = [
  {
    id: "1",
    name: "Global Climate Fund",
    type: "Funding Agency",
    location: "Geneva, Switzerland",
    projects: 3,
    status: "Active",
    joinDate: "2022-10-15",
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Vietnam Agricultural Research Institute",
    type: "Research Institution",
    location: "Hanoi, Vietnam",
    projects: 1,
    status: "Active",
    joinDate: "2023-01-20",
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Mekong Farmers Cooperative",
    type: "Farmer Organization",
    location: "Mekong Delta, Vietnam",
    projects: 1,
    status: "Active",
    joinDate: "2023-02-05",
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "Kenya Forest Service",
    type: "Government Agency",
    location: "Nairobi, Kenya",
    projects: 1,
    status: "Active",
    joinDate: "2022-12-10",
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    name: "African Conservation Trust",
    type: "NGO",
    location: "Nairobi, Kenya",
    projects: 1,
    status: "Active",
    joinDate: "2023-01-15",
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "6",
    name: "Sustainable Agriculture Alliance",
    type: "NGO",
    location: "Brussels, Belgium",
    projects: 0,
    status: "Pending",
    joinDate: "2023-04-20",
    logo: "/placeholder.svg?height=40&width=40",
  },
];

export function PartnersList() {
  const [partners, setPartners] = useState(initialPartners);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<string | null>(null);
  const router = useRouter();

  const handleDeleteClick = (partnerId: string) => {
    setPartnerToDelete(partnerId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (partnerToDelete) {
      setPartners(partners.filter((partner) => partner.id !== partnerToDelete));
      setDeleteDialogOpen(false);
      setPartnerToDelete(null);
    }
  };

  const filteredPartners = partners.filter((partner) => {
    const matchesSearch =
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || partner.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || partner.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Partners
          </h1>
          <p className="text-muted-foreground">
            Manage your partner organizations and collaborators
          </p>
        </div>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/dashboard/partners/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Partner
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Partners</CardTitle>
          <CardDescription>
            View and manage all your partner organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search partners..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="NGO">NGO</SelectItem>
                  <SelectItem value="Funding Agency">Funding Agency</SelectItem>
                  <SelectItem value="Research Institution">
                    Research Institution
                  </SelectItem>
                  <SelectItem value="Farmer Organization">
                    Farmer Organization
                  </SelectItem>
                  <SelectItem value="Government Agency">
                    Government Agency
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No partners found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPartners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={partner.logo || "/placeholder.svg"}
                              alt={partner.name}
                            />
                            <AvatarFallback>
                              {partner.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <Link
                            href={`/dashboard/partners/${partner.id}`}
                            className="font-medium"
                          >
                            {partner.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>{partner.type}</TableCell>
                      <TableCell>{partner.location}</TableCell>
                      <TableCell>{partner.projects}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(partner.status)}>
                          {partner.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(partner.joinDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              router.push(`/dashboard/partners/${partner.id}`);
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              router.push(
                                `/dashboard/partners/edit/${partner.id}`
                              );
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(partner.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Partner</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this partner? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
