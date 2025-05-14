"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, FileEdit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DeleteFarmerDialog } from "@/components/farmers/delete-farmer-dialog"

// Mock farmer data
const farmersData = [
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
    bio: "Nguyen Van Minh has been farming in the Mekong Delta for over 20 years. He has transitioned to sustainable farming practices to improve soil health and reduce environmental impact.",
    contact: {
      phone: "+84 123 456 789",
      email: "nguyen.minh@example.com",
      address: "123 Farming Village, Mekong Delta, Vietnam",
    },
    projects: [
      {
        id: "1",
        name: "Sustainable Rice Cultivation",
        role: "Participant",
        joinDate: "2023-04-15",
      },
    ],
    carbonCredits: 45,
    certifications: ["Organic Farming", "Sustainable Agriculture"],
    farmHistory: [
      { year: "2020", crops: ["Rice"], area: "2.0 hectares" },
      { year: "2021", crops: ["Rice"], area: "2.0 hectares" },
      { year: "2022", crops: ["Rice", "Vegetables"], area: "2.5 hectares" },
      { year: "2023", crops: ["Rice", "Vegetables"], area: "2.5 hectares" },
    ],
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
    bio: "John Mwangi is a third-generation coffee farmer in Central Kenya. He has implemented agroforestry techniques to improve coffee quality and protect the environment.",
    contact: {
      phone: "+254 123 456 789",
      email: "john.mwangi@example.com",
      address: "456 Coffee Farm, Central Kenya",
    },
    projects: [
      {
        id: "2",
        name: "Community Forest Management",
        role: "Participant",
        joinDate: "2023-02-20",
      },
    ],
    carbonCredits: 38,
    certifications: ["Fair Trade", "Rainforest Alliance"],
    farmHistory: [
      { year: "2020", crops: ["Coffee"], area: "2.5 hectares" },
      { year: "2021", crops: ["Coffee", "Maize"], area: "2.8 hectares" },
      { year: "2022", crops: ["Coffee", "Maize"], area: "3.0 hectares" },
      { year: "2023", crops: ["Coffee", "Maize"], area: "3.0 hectares" },
    ],
  },
]

export function FarmerDetails({ id }: { id: string }) {
  const [farmer, setFarmer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Simulate API fetch
    const fetchFarmer = async () => {
      setLoading(true)
      try {
        // In a real app, this would be an API call
        const foundFarmer = farmersData.find((f) => f.id === id)

        if (foundFarmer) {
          setFarmer(foundFarmer)
        } else {
          // Farmer not found
          router.push("/dashboard/farmers")
        }
      } catch (error) {
        console.error("Error fetching farmer:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFarmer()
  }, [id, router])

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    // In a real app, this would be an API call to delete the farmer
    setDeleteDialogOpen(false)
    router.push("/dashboard/farmers")
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading farmer details...</p>
        </div>
      </div>
    )
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
    )
  }

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
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Link href="/dashboard/farmers">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{farmer.name}</h1>
            <Badge variant="outline" className={getStatusBadgeColor(farmer.status)}>
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
                <AvatarImage src={farmer.avatar || "/placeholder.svg"} alt={farmer.name} />
                <AvatarFallback className="bg-green-100 text-green-800 text-xl">{farmer.initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{farmer.name}</h3>
                <p className="text-sm text-muted-foreground">{farmer.location}</p>
              </div>
              <Badge variant="outline" className={getStatusBadgeColor(farmer.status)}>
                {farmer.status}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium">Contact Information</h4>
                <div className="space-y-2 rounded-md border p-3 text-sm">
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="col-span-2">{farmer.contact.phone}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="col-span-2">{farmer.contact.email}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="col-span-2">{farmer.contact.address}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium">Farm Details</h4>
                <div className="space-y-2 rounded-md border p-3 text-sm">
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Area:</span>
                    <span className="col-span-2">{farmer.area}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Crops:</span>
                    <span className="col-span-2">{farmer.crops.join(", ")}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Joined:</span>
                    <span className="col-span-2">{new Date(farmer.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {farmer.certifications.map((cert: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
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
            <Tabs defaultValue="projects">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="carbon">Carbon Credits</TabsTrigger>
                <TabsTrigger value="history">Farm History</TabsTrigger>
              </TabsList>
              <TabsContent value="projects" className="pt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Join Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {farmer.projects.map((project: any) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>{project.role}</TableCell>
                          <TableCell>{new Date(project.joinDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="carbon" className="pt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Carbon Credits Generated</CardTitle>
                    <CardDescription>Total credits: {farmer.carbonCredits} tons CO₂e</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] w-full">
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-green-600">{farmer.carbonCredits}</div>
                          <p className="mt-2 text-sm text-muted-foreground">tons of CO₂ equivalent</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="history" className="pt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead>Crops</TableHead>
                        <TableHead>Area</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {farmer.farmHistory.map((history: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{history.year}</TableCell>
                          <TableCell>{history.crops.join(", ")}</TableCell>
                          <TableCell>{history.area}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <DeleteFarmerDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteConfirm} />
    </div>
  )
}

// Import Table components for the Tabs content
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
