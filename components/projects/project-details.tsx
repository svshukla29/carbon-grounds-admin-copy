"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Download, FileEdit, MapPin, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectProgressChart } from "@/components/projects/project-progress-chart"
import { ProjectFarmersList } from "@/components/projects/project-farmers-list"
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog"

// Mock project data
const projectsData = [
  {
    id: "1",
    name: "Sustainable Rice Cultivation",
    description:
      "A project focused on implementing sustainable rice cultivation practices that reduce methane emissions while improving yields and farmer livelihoods in the Mekong Delta region.",
    type: "Agroforestry",
    location: "Mekong Delta, Vietnam",
    farmers: 124,
    carbonCredits: 450,
    status: "Active",
    startDate: "2023-03-15",
    endDate: "2025-03-15",
    budget: "$250,000",
    partners: ["Vietnam Agricultural Research Institute", "Mekong Farmers Cooperative", "Global Climate Fund"],
    objectives: [
      "Reduce methane emissions from rice paddies by 40%",
      "Increase farmer income by 25%",
      "Improve water use efficiency by 30%",
      "Generate verifiable carbon credits",
    ],
    progress: 65,
  },
  {
    id: "2",
    name: "Community Forest Management",
    description:
      "A community-based forest management project that empowers local communities to protect and sustainably manage forest resources while generating carbon credits through avoided deforestation.",
    type: "Reforestation",
    location: "Central Kenya",
    farmers: 78,
    carbonCredits: 320,
    status: "Active",
    startDate: "2023-01-10",
    endDate: "2026-01-10",
    budget: "$180,000",
    partners: ["Kenya Forest Service", "Community Forest Association", "African Conservation Trust"],
    objectives: [
      "Protect 5,000 hectares of forest from deforestation",
      "Establish sustainable harvesting practices",
      "Create alternative livelihood opportunities",
      "Strengthen community forest governance",
    ],
    progress: 42,
  },
]

export function ProjectDetails({ id }: { id: string }) {
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Simulate API fetch
    const fetchProject = async () => {
      setLoading(true)
      try {
        // In a real app, this would be an API call
        const foundProject = projectsData.find((p) => p.id === id)

        if (foundProject) {
          setProject(foundProject)
        } else {
          // Project not found
          router.push("/dashboard/projects")
        }
      } catch (error) {
        console.error("Error fetching project:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id, router])

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    // In a real app, this would be an API call to delete the project
    setDeleteDialogOpen(false)
    router.push("/dashboard/projects")
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <p className="text-lg text-gray-500">Project not found</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/dashboard/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
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
      case "Completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
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
              <Link href="/dashboard/projects">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{project.name}</h1>
            <Badge variant="outline" className={getStatusBadgeColor(project.status)}>
              {project.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild variant="outline">
            <Link href={`/dashboard/projects/edit/${project.id}`}>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Project Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.type}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div className="text-2xl font-bold">{project.location}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Farmers Engaged</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="text-2xl font-bold">{project.farmers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Carbon Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.carbonCredits} tons</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Start Date</dt>
                <dd className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(project.startDate).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">End Date</dt>
                <dd className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(project.endDate).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Budget</dt>
                <dd className="text-sm">{project.budget}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Partners</dt>
                <dd className="text-sm">
                  <ul className="list-inside list-disc space-y-1">
                    {project.partners.map((partner: string, index: number) => (
                      <li key={index}>{partner}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Objectives</dt>
                <dd className="text-sm">
                  <ul className="list-inside list-disc space-y-1">
                    {project.objectives.map((objective: string, index: number) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>Overall progress: {project.progress}%</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 h-2 w-full rounded-full bg-gray-200">
              <div className="h-2 rounded-full bg-green-600" style={{ width: `${project.progress}%` }}></div>
            </div>
            <Tabs defaultValue="progress">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="progress">Progress Chart</TabsTrigger>
                <TabsTrigger value="farmers">Farmers</TabsTrigger>
              </TabsList>
              <TabsContent value="progress" className="pt-4">
                <ProjectProgressChart />
              </TabsContent>
              <TabsContent value="farmers" className="pt-4">
                <ProjectFarmersList projectId={project.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <DeleteProjectDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteConfirm} />
    </div>
  )
}
