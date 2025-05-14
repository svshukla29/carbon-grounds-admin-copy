"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, Loader2, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"

const teamFormSchema = z.object({
  name: z.string().min(2, {
    message: "Team name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  lead: z.string().min(2, {
    message: "Team lead name is required.",
  }),
  status: z.enum(["active", "inactive", "archived"]),
  enableNotifications: z.boolean().default(true),
  availableRoles: z.array(z.string()).min(1, {
    message: "Select at least one role.",
  }),
})

type TeamFormValues = z.infer<typeof teamFormSchema>

interface TeamFormProps {
  id?: string
}

export function TeamForm({ id }: TeamFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!id

  // Default values for the form
  const defaultValues: Partial<TeamFormValues> = {
    name: isEditMode ? "Carbon Sequestration Team" : "",
    description: isEditMode ? "Team focused on carbon sequestration projects and initiatives" : "",
    lead: isEditMode ? "Jane Smith" : "",
    status: isEditMode ? "active" : "active",
    enableNotifications: true,
    availableRoles: isEditMode ? ["admin", "project_manager", "field_agent", "data_analyst", "viewer"] : [],
  }

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues,
  })

  const onSubmit = async (data: TeamFormValues) => {
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Form submitted:", data)

      toast({
        title: isEditMode ? "Team updated" : "Team created",
        description: isEditMode
          ? `Team "${data.name}" has been updated successfully.`
          : `Team "${data.name}" has been created successfully.`,
      })

      router.push("/dashboard/teams")
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "There was an error saving the team. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const roles = [
    { id: "admin", label: "Admin" },
    { id: "project_manager", label: "Project Manager" },
    { id: "field_agent", label: "Field Agent" },
    { id: "data_analyst", label: "Data Analyst" },
    { id: "viewer", label: "Viewer" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/teams">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? "Edit Team" : "Create Team"}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Users className="mr-2 h-5 w-5 text-green-600" />
            {isEditMode ? "Edit Team Details" : "New Team Details"}
          </CardTitle>
          <CardDescription>
            {isEditMode ? "Update the information for this team." : "Fill in the information to create a new team."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter team name" {...field} />
                      </FormControl>
                      <FormDescription>The name of the team as it will appear in the system.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lead"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Lead</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter team lead name" {...field} />
                      </FormControl>
                      <FormDescription>The person who will lead this team.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter team description" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormDescription>A brief description of the team's purpose and responsibilities.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>The current status of this team.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Enable Notifications</FormLabel>
                        <FormDescription>Send notifications to team members about updates and changes.</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="availableRoles"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Available Roles</FormLabel>
                      <FormDescription>Select the roles that will be available for this team.</FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {roles.map((role) => (
                        <FormField
                          key={role.id}
                          control={form.control}
                          name="availableRoles"
                          render={({ field }) => {
                            return (
                              <FormItem key={role.id} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(role.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, role.id])
                                        : field.onChange(field.value?.filter((value) => value !== role.id))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{role.label}</FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/teams">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? "Update Team" : "Create Team"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
