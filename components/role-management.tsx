"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PermissionProps {
  label: string
  description: string
  defaultChecked?: boolean
  disabled?: boolean
}

function Permission({ label, description, defaultChecked = false, disabled = false }: PermissionProps) {
  return (
    <div className="flex items-center justify-between space-y-0 rounded-lg border p-4">
      <div className="space-y-0.5">
        <Label className="text-base">{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} disabled={disabled} />
    </div>
  )
}

export function RoleManagement() {
  return (
    <Tabs defaultValue="admin">
      <TabsList className="mb-4 grid w-full grid-cols-5">
        <TabsTrigger value="admin">Admin</TabsTrigger>
        <TabsTrigger value="project-manager">Project Manager</TabsTrigger>
        <TabsTrigger value="field-officer">Field Officer</TabsTrigger>
        <TabsTrigger value="analyst">Analyst</TabsTrigger>
        <TabsTrigger value="viewer">Viewer</TabsTrigger>
      </TabsList>

      <TabsContent value="admin">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Admin Role</CardTitle>
                <CardDescription>Full access to all features and settings</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Admin role info</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Admins have full control over the platform.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Project Management</h3>
              <div className="grid gap-3">
                <Permission
                  label="Create Projects"
                  description="Create new sustainability projects"
                  defaultChecked
                  disabled
                />
                <Permission
                  label="Edit Projects"
                  description="Modify existing project details"
                  defaultChecked
                  disabled
                />
                <Permission
                  label="Delete Projects"
                  description="Remove projects from the platform"
                  defaultChecked
                  disabled
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">User Management</h3>
              <div className="grid gap-3">
                <Permission
                  label="Invite Team Members"
                  description="Send invitations to new team members"
                  defaultChecked
                  disabled
                />
                <Permission label="Manage Roles" description="Assign and modify user roles" defaultChecked disabled />
                <Permission
                  label="Remove Team Members"
                  description="Remove users from the platform"
                  defaultChecked
                  disabled
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Data & Reporting</h3>
              <div className="grid gap-3">
                <Permission
                  label="View Reports"
                  description="Access all reports and analytics"
                  defaultChecked
                  disabled
                />
                <Permission label="Export Data" description="Export data in various formats" defaultChecked disabled />
                <Permission
                  label="Manage Integrations"
                  description="Configure third-party integrations"
                  defaultChecked
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="project-manager">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Project Manager Role</CardTitle>
                <CardDescription>Manage projects and team members</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Project Manager role info</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Project Managers oversee specific projects and their teams.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Project Management</h3>
              <div className="grid gap-3">
                <Permission label="Create Projects" description="Create new sustainability projects" defaultChecked />
                <Permission label="Edit Projects" description="Modify existing project details" defaultChecked />
                <Permission label="Delete Projects" description="Remove projects from the platform" />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">User Management</h3>
              <div className="grid gap-3">
                <Permission
                  label="Invite Team Members"
                  description="Send invitations to new team members"
                  defaultChecked
                />
                <Permission label="Manage Roles" description="Assign and modify user roles" />
                <Permission label="Remove Team Members" description="Remove users from the platform" />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Data & Reporting</h3>
              <div className="grid gap-3">
                <Permission label="View Reports" description="Access all reports and analytics" defaultChecked />
                <Permission label="Export Data" description="Export data in various formats" defaultChecked />
                <Permission label="Manage Integrations" description="Configure third-party integrations" />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="field-officer">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Field Officer Role</CardTitle>
                <CardDescription>Manage on-the-ground operations and farmer verification</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Field Officer role info</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Field Officers work directly with farmers and collect data.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Project Management</h3>
              <div className="grid gap-3">
                <Permission label="Create Projects" description="Create new sustainability projects" />
                <Permission label="Edit Projects" description="Modify existing project details" />
                <Permission label="Delete Projects" description="Remove projects from the platform" />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Farmer Management</h3>
              <div className="grid gap-3">
                <Permission label="Add Farmers" description="Register new farmers in the system" defaultChecked />
                <Permission
                  label="Verify Farmers"
                  description="Verify farmer information and practices"
                  defaultChecked
                />
                <Permission
                  label="Collect Field Data"
                  description="Record measurements and observations"
                  defaultChecked
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Data & Reporting</h3>
              <div className="grid gap-3">
                <Permission label="View Reports" description="Access all reports and analytics" />
                <Permission label="Export Data" description="Export data in various formats" />
                <Permission
                  label="Submit Field Reports"
                  description="Create and submit field visit reports"
                  defaultChecked
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="analyst">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Analyst Role</CardTitle>
                <CardDescription>Analyze data and generate reports</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Analyst role info</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Analysts work with data to generate insights and reports.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Project Management</h3>
              <div className="grid gap-3">
                <Permission label="Create Projects" description="Create new sustainability projects" />
                <Permission label="Edit Projects" description="Modify existing project details" />
                <Permission label="Delete Projects" description="Remove projects from the platform" />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Data Analysis</h3>
              <div className="grid gap-3">
                <Permission label="Access Raw Data" description="View and analyze all collected data" defaultChecked />
                <Permission
                  label="Create Visualizations"
                  description="Generate charts and visual representations"
                  defaultChecked
                />
                <Permission
                  label="Run Advanced Analytics"
                  description="Perform statistical analysis and modeling"
                  defaultChecked
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Reporting</h3>
              <div className="grid gap-3">
                <Permission label="Generate Reports" description="Create standard and custom reports" defaultChecked />
                <Permission label="Export Data" description="Export data in various formats" defaultChecked />
                <Permission
                  label="Schedule Reports"
                  description="Set up automated reporting schedules"
                  defaultChecked
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="viewer">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Viewer Role</CardTitle>
                <CardDescription>Read-only access to projects and reports</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Viewer role info</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Viewers can only see information but cannot make changes.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Project Access</h3>
              <div className="grid gap-3">
                <Permission label="View Projects" description="See project details and progress" defaultChecked />
                <Permission label="View Farmers" description="See farmer profiles and status" defaultChecked />
                <Permission label="View Partners" description="See partner organizations" defaultChecked />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Reports Access</h3>
              <div className="grid gap-3">
                <Permission label="View Reports" description="Access published reports" defaultChecked />
                <Permission label="View Dashboards" description="Access analytics dashboards" defaultChecked />
                <Permission label="Export Reports" description="Download reports in various formats" />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Team Access</h3>
              <div className="grid gap-3">
                <Permission label="View Team Members" description="See team member profiles" defaultChecked />
                <Permission label="View Activity Feed" description="See recent platform activity" defaultChecked />
                <Permission label="View Notifications" description="Receive system notifications" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
