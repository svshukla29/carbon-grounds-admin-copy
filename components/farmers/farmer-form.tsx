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
import { Checkbox } from "@/components/ui/checkbox"

// Mock farmer data
const farmersData = [
  {
    id: "1",
    name: "Nguyen Van Minh",
    location: "Mekong Delta, Vietnam",
    area: "2.5",
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
    certifications: ["Organic Farming", "Sustainable Agriculture"],
  },
]

export function FarmerForm({ id }: { id?: string }) {
  const isEditMode = !!id
  const router = useRouter()
  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    area: "",
    status: "",
    joinDate: "",
    phone: "",
    email: "",
    address: "",
    crops: [] as string[],
    certifications: [] as string[],
  })

  const cropOptions = [
    { id: "rice", label: "Rice" },
    { id: "vegetables", label: "Vegetables" },
    { id: "coffee", label: "Coffee" },
    { id: "maize", label: "Maize" },
    { id: "fruit", label: "Fruit Trees" },
    { id: "beans", label: "Beans" },
  ]

  const certificationOptions = [
    { id: "organic", label: "Organic Farming" },
    { id: "sustainable", label: "Sustainable Agriculture" },
    { id: "fairtrade", label: "Fair Trade" },
    { id: "rainforest", label: "Rainforest Alliance" },
  ]

  useEffect(() => {
    if (isEditMode) {
      // Simulate API fetch for edit mode
      const fetchFarmer = async () => {
        setLoading(true)
        try {
          // In a real app, this would be an API call
          const foundFarmer = farmersData.find((f) => f.id === id)

          if (foundFarmer) {
            setFormData({
              name: foundFarmer.name,
              bio: foundFarmer.bio,
              location: foundFarmer.location,
              area: foundFarmer.area,
              status: foundFarmer.status,
              joinDate: foundFarmer.joinDate,
              phone: foundFarmer.contact.phone,
              email: foundFarmer.contact.email,
              address: foundFarmer.contact.address,
              crops: foundFarmer.crops,
              certifications: foundFarmer.certifications,
            })
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

  const handleCropToggle = (cropId: string) => {
    const crop = cropOptions.find((c) => c.id === cropId)?.label
    if (!crop) return

    setFormData((prev) => {
      const crops = prev.crops.includes(crop) ? prev.crops.filter((c) => c !== crop) : [...prev.crops, crop]
      return { ...prev, crops }
    })
  }

  const handleCertificationToggle = (certId: string) => {
    const cert = certificationOptions.find((c) => c.id === certId)?.label
    if (!cert) return

    setFormData((prev) => {
      const certifications = prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert]
      return { ...prev, certifications }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, this would be an API call to create or update the farmer
      console.log("Submitting form data:", formData)

      // Redirect to farmers list after successful submission
      router.push("/dashboard/farmers")
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
          <p className="mt-2 text-sm text-gray-500">Loading farmer data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Link href="/dashboard/farmers">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {isEditMode ? "Edit Farmer" : "Add New Farmer"}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Farmer Information</CardTitle>
            <CardDescription>
              {isEditMode ? "Update the details of the existing farmer" : "Enter the details of the new farmer"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="contact">Contact Details</TabsTrigger>
                <TabsTrigger value="farm">Farm Details</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter farmer's full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="Region, Country"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Brief description of the farmer's background"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="status">Verification Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange("status", value)}
                      required
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Verified">Verified</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Join Date</Label>
                    <DatePicker value={formData.joinDate} onChange={(date) => handleDateChange("joinDate", date)} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Physical Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="Enter physical address"
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </TabsContent>

              <TabsContent value="farm" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="area">Farm Area (hectares)</Label>
                  <Input
                    id="area"
                    name="area"
                    type="number"
                    step="0.1"
                    placeholder="Enter farm area in hectares"
                    value={formData.area}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Crops</Label>
                  <div className="grid grid-cols-2 gap-2 rounded-md border p-4 md:grid-cols-3">
                    {cropOptions.map((crop) => (
                      <div key={crop.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`crop-${crop.id}`}
                          checked={formData.crops.includes(crop.label)}
                          onCheckedChange={() => handleCropToggle(crop.id)}
                        />
                        <Label htmlFor={`crop-${crop.id}`} className="text-sm font-normal">
                          {crop.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Certifications</Label>
                  <div className="grid grid-cols-1 gap-2 rounded-md border p-4 md:grid-cols-2">
                    {certificationOptions.map((cert) => (
                      <div key={cert.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cert-${cert.id}`}
                          checked={formData.certifications.includes(cert.label)}
                          onCheckedChange={() => handleCertificationToggle(cert.id)}
                        />
                        <Label htmlFor={`cert-${cert.id}`} className="text-sm font-normal">
                          {cert.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end gap-4">
              <Button asChild variant="outline">
                <Link href="/dashboard/farmers">Cancel</Link>
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : isEditMode ? (
                  "Update Farmer"
                ) : (
                  "Add Farmer"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
