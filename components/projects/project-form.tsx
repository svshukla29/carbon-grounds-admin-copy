"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePicker } from "@/components/ui/date-picker"

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
    budget: 250000,
    partners: ["Vietnam Agricultural Research Institute", "Mekong Farmers Cooperative", "Global Climate Fund"],
    objectives: [
      "Reduce methane emissions from rice paddies by 40%",
      "Increase farmer income by 25%",
      "Improve water use efficiency by 30%",
      "Generate verifiable carbon credits",
    ],
    progress: 65,
  },
]

export function ProjectForm({ id }: { id?: string }) {
  const isEditMode = !!id
  const router = useRouter()
  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    location: "",
    status: "",
    startDate: "",
    endDate: "",
    budget: "",
    objectives: "",
    partners: "",
  })

  useEffect(() => {
    if (isEditMode) {
      // Simulate API fetch for edit mode
      const fetchProject = async () => {
        setLoading(true)
        try {
          // In a real app, this would be an API call
          const foundProject = projectsData.find((p) => p.id === id)

          if (foundProject) {
            setFormData({
              name: foundProject.name,
              description: foundProject.description,
              type: foundProject.type,
              location: foundProject.location,
              status: foundProject.status,
              startDate: foundProject.startDate,
              endDate: foundProject.endDate,
              budget: foundProject.budget.toString(),
              objectives: foundProject.objectives.join("\n"),
              partners: foundProject.partners.join("\n"),
            })
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
    }
  }, [id, isEditMode, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, this would be an API call to create or update the project
      console.log("Submitting form data:", formData)

      // Redirect to projects list after successful submission
      router.push("/dashboard/projects")
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading project data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {isEditMode ? "Edit Project" : "Create New Project"}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>
              {isEditMode
                ? "Update the details of your existing project"
                : "Enter the details of your new sustainability project"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="details">Additional Details</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter project name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Project Type</Label>
                    <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)} required>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Agroforestry">Agroforestry</SelectItem>
                        <SelectItem value="Reforestation">Reforestation</SelectItem>
                        <SelectItem value="Soil Carbon">Soil Carbon</SelectItem>
                        <SelectItem value="Blue Carbon">Blue Carbon</SelectItem>
                        <SelectItem value="Renewable Energy">Renewable Energy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the project and its goals"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="Project location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange("status", value)}
                      required
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <DatePicker value={formData.startDate} onChange={(date) => handleDateChange("startDate", date)} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <DatePicker value={formData.endDate} onChange={(date) => handleDateChange("endDate", date)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (USD)</Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    placeholder="Project budget"
                    value={formData.budget}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="objectives">Project Objectives</Label>
                  <Textarea
                    id="objectives"
                    name="objectives"
                    placeholder="Enter each objective on a new line"
                    rows={4}
                    value={formData.objectives}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground">Enter each objective on a new line</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partners">Project Partners</Label>
                  <Textarea
                    id="partners"
                    name="partners"
                    placeholder="Enter each partner on a new line"
                    rows={4}
                    value={formData.partners}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground">Enter each partner organization on a new line</p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end gap-4">
              <Button asChild variant="outline">
                <Link href="/dashboard/projects">Cancel</Link>
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : isEditMode ? (
                  "Update Project"
                ) : (
                  "Create Project"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
