"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building, Calendar, Download, FileEdit, Globe, Mail, Phone, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock partner data
const partnersData = [
  {
    id: "1",
    name: "Global Climate Fund",
    type: "Funding Agency",
    location: "Geneva, Switzerland",
    projects: [
      { id: "1", name: "Sustainable Rice Cultivation", role: "Funder", joinDate: "2022-10-20" },
      { id: "3", name: "Regenerative Grazing Initiative", role: "Funder", joinDate: "2023-01-15" },
      { id: "4", name: "Mangrove Restoration", role: "Funder", joinDate: "2022-12-05" },
    ],
    status: "Active",
    joinDate: "2022-10-15",
    logo: "/placeholder.svg?height=100&width=100",
    description:
      "The Global Climate Fund is an international organization dedicated to financing climate change mitigation and adaptation projects in developing countries. They provide grants and low-interest loans to support sustainable agriculture, renewable energy, and ecosystem restoration initiatives.",
    contactInfo: {
      address: "123 Climate Avenue, Geneva, Switzerland",
      phone: "+41 22 123 4567",
      email: "info@globalclimatefund.org",
      website: "https://www.globalclimatefund.org",
    },
    primaryContact: {
      name: "Dr. Elena Müller",
      position: "Partnership Director",
      email: "elena.muller@globalclimatefund.org",
      phone: "+41 22 123 4568",
    },
    agreements: [
      {
        id: "1",
        title: "Master Funding Agreement",
        type: "Funding",
        status: "Active",
        startDate: "2022-10-15",
        endDate: "2025-10-14",
      },
      {
        id: "2",
        title: "Carbon Credit Purchase Agreement",
        type: "Carbon Credits",
        status: "Active",
        startDate: "2023-01-01",
        endDate: "2025-12-31",
      },
    ],
  },
]

export function PartnerDetails({ id }: { id: string }) {
  const [partner, setPartner] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simulate API fetch
    const fetchPartner = async () => {
      setLoading(true)
      try {
        // In a real app, this would be an API call
        const foundPartner = partnersData.find((p) => p.id === id)

        if (foundPartner) {
          setPartner(foundPartner)
        } else {
          // Partner not found
          router.push("/dashboard/partners")
        }
      } catch (error) {
        console.error("Error fetching partner:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPartner()
  }, [id, router])

  const handleDelete = () => {
    // In a real app, this would be an API call to delete the partner
    router.push("/dashboard/partners")
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading partner details...</p>
        </div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <p className="text-lg text-gray-500">Partner not found</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/dashboard/partners">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Partners
          </Link>
        </Button>
      </div>
    )
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Inactive":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
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
              <Link href="/dashboard/partners">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{partner.name}</h1>
            <Badge variant="outline" className={getStatusBadgeColor(partner.status)}>
              {partner.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{partner.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild variant="outline">
            <Link href={`/dashboard/partners/edit/${partner.id}`}>
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
            <CardTitle>Partner Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4 pb-6 text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={partner.logo || "/placeholder.svg"} alt={partner.name} />
                <AvatarFallback className="bg-blue-100 text-blue-800">
                  {partner.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{partner.name}</h3>
                <p className="text-sm text-muted-foreground">{partner.type}</p>
              </div>
              <Badge variant="outline" className={getStatusBadgeColor(partner.status)}>
                {partner.status}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium">Contact Information</h4>
                <div className="space-y-2 rounded-md border p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Building className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <span>{partner.contactInfo.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{partner.contactInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{partner.contactInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={partner.contactInfo.website} className="text-blue-600 hover:underline">
                      {partner.contactInfo.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium">Primary Contact</h4>
                <div className="space-y-2 rounded-md border p-3 text-sm">
                  <p className="font-medium">{partner.primaryContact.name}</p>
                  <p className="text-muted-foreground">{partner.primaryContact.position}</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{partner.primaryContact.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{partner.primaryContact.phone}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium">Partnership Details</h4>
                <div className="space-y-2 rounded-md border p-3 text-sm">
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="col-span-2">{partner.type}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="col-span-2">{partner.location}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Joined:</span>
                    <span className="col-span-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {new Date(partner.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-muted-foreground">Projects:</span>
                    <span className="col-span-2">{partner.projects.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Partnership Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="projects">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="agreements">Agreements</TabsTrigger>
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
                      {partner.projects.map((project: any) => (
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
              <TabsContent value="agreements" className="pt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agreement Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Period</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partner.agreements.map((agreement: any) => (
                        <TableRow key={agreement.id}>
                          <TableCell className="font-medium">{agreement.title}</TableCell>
                          <TableCell>{agreement.type}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeColor(agreement.status)}>
                              {agreement.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(agreement.startDate).toLocaleDateString()} -{" "}
                            {new Date(agreement.endDate).toLocaleDateString()}
                          </TableCell>
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
    </div>
  )
}
