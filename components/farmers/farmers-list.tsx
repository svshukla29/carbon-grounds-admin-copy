"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowUpDown, Download, Eye, FileEdit, MoreHorizontal, Search, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DeleteFarmerDialog } from "@/components/farmers/delete-farmer-dialog"

// Mock data for farmers
const initialFarmers = [
  {
    id: "1",
    name: "Nguyen Van Minh",
    location: "Mekong Delta, Vietnam",
    area: "2.5 hectares",
    crops: ["Rice", "Vegetables"],
    status: "Verified",
    joinDate: "2023-04-10",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "NM",
  },
  {
    id: "2",
    name: "Tran Thi Lan",
    location: "Mekong Delta, Vietnam",
    area: "1.8 hectares",
    crops: ["Rice"],
    status: "Verified",
    joinDate: "2023-04-15",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "TL",
  },
  {
    id: "3",
    name: "Le Van Hung",
    location: "Mekong Delta, Vietnam",
    area: "3.2 hectares",
    crops: ["Rice", "Fruit Trees"],
    status: "Pending",
    joinDate: "2023-05-02",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "LH",
  },
  {
    id: "4",
    name: "Pham Thi Mai",
    location: "Mekong Delta, Vietnam",
    area: "2.1 hectares",
    crops: ["Rice", "Vegetables"],
    status: "Verified",
    joinDate: "2023-05-10",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "PM",
  },
  {
    id: "5",
    name: "Hoang Van Duc",
    location: "Mekong Delta, Vietnam",
    area: "1.5 hectares",
    crops: ["Rice"],
    status: "Pending",
    joinDate: "2023-05-22",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "HD",
  },
  {
    id: "6",
    name: "John Mwangi",
    location: "Central Kenya",
    area: "3.0 hectares",
    crops: ["Coffee", "Maize"],
    status: "Verified",
    joinDate: "2023-02-15",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "JM",
  },
  {
    id: "7",
    name: "Grace Wanjiku",
    location: "Central Kenya",
    area: "2.2 hectares",
    crops: ["Coffee", "Beans"],
    status: "Verified",
    joinDate: "2023-02-20",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "GW",
  },
  {
    id: "8",
    name: "David Kamau",
    location: "Central Kenya",
    area: "1.8 hectares",
    crops: ["Coffee"],
    status: "Pending",
    joinDate: "2023-03-05",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "DK",
  },
]

export function FarmersList() {
  const [farmers, setFarmers] = useState(initialFarmers)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [farmerToDelete, setFarmerToDelete] = useState<string | null>(null)
  const router = useRouter()

  const handleDeleteClick = (farmerId: string) => {
    setFarmerToDelete(farmerId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (farmerToDelete) {
      setFarmers(farmers.filter((farmer) => farmer.id !== farmerToDelete))
      setDeleteDialogOpen(false)
      setFarmerToDelete(null)
    }
  }

  const filteredFarmers = farmers.filter((farmer) => {
    const matchesSearch =
      farmer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || farmer.status === statusFilter
    const matchesLocation = locationFilter === "all" || farmer.location.includes(locationFilter)

    return matchesSearch && matchesStatus && matchesLocation
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Verified":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Farmers</h1>
          <p className="text-muted-foreground">Manage farmers participating in your sustainability projects</p>
        </div>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/dashboard/farmers/create">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Farmer
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Farmers</CardTitle>
          <CardDescription>View and manage all farmers in your projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search farmers..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Mekong Delta">Mekong Delta</SelectItem>
                  <SelectItem value="Central Kenya">Central Kenya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center">
                        Farmer Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Location</TableHead>
                    <TableHead className="hidden md:table-cell">Area</TableHead>
                    <TableHead className="hidden lg:table-cell">Crops</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFarmers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No farmers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFarmers.map((farmer) => (
                      <TableRow key={farmer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={farmer.avatar || "/placeholder.svg"} alt={farmer.name} />
                              <AvatarFallback className="bg-green-100 text-green-800">{farmer.initials}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{farmer.name}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{farmer.location}</TableCell>
                        <TableCell className="hidden md:table-cell">{farmer.area}</TableCell>
                        <TableCell className="hidden lg:table-cell">{farmer.crops.join(", ")}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadgeColor(farmer.status)}>
                            {farmer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/farmers/${farmer.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/farmers/edit/${farmer.id}`)}>
                                <FileEdit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Export Data
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(farmer.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteFarmerDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteConfirm} />
    </div>
  )
}
