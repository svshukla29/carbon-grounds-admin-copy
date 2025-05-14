import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SettingsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" defaultValue="john.doe@carbongrounds.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input id="title" defaultValue="Project Manager" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select defaultValue="field-operations">
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="field-operations">Field Operations</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Language</Label>
                      <p className="text-sm text-muted-foreground">Select your preferred language</p>
                    </div>
                    <Select defaultValue="en">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Time Zone</Label>
                      <p className="text-sm text-muted-foreground">Set your local time zone</p>
                    </div>
                    <Select defaultValue="utc">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                        <SelectItem value="est">Eastern (GMT-5)</SelectItem>
                        <SelectItem value="cst">Central (GMT-6)</SelectItem>
                        <SelectItem value="pst">Pacific (GMT-8)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-green-600 hover:bg-green-700">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex flex-col items-center gap-2 rounded-md border p-4">
                    <div className="h-20 w-full rounded-md bg-white"></div>
                    <Label className="text-center">Light</Label>
                    <div className="flex items-center">
                      <Switch defaultChecked id="theme-light" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-md border p-4">
                    <div className="h-20 w-full rounded-md bg-gray-950"></div>
                    <Label className="text-center">Dark</Label>
                    <div className="flex items-center">
                      <Switch id="theme-dark" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-md border p-4">
                    <div className="h-20 w-full rounded-md bg-gradient-to-b from-white to-gray-950"></div>
                    <Label className="text-center">System</Label>
                    <div className="flex items-center">
                      <Switch id="theme-system" />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Dashboard Layout</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">Use a more compact layout for the dashboard</p>
                    </div>
                    <Switch id="compact-mode" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Sidebar Position</Label>
                      <p className="text-sm text-muted-foreground">Choose the position of the sidebar</p>
                    </div>
                    <Select defaultValue="left">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-green-600 hover:bg-green-700">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Project Updates</Label>
                      <p className="text-sm text-muted-foreground">Receive emails about project status changes</p>
                    </div>
                    <Switch defaultChecked id="email-projects" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Farmer Verifications</Label>
                      <p className="text-sm text-muted-foreground">Receive emails when farmers need verification</p>
                    </div>
                    <Switch defaultChecked id="email-farmers" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Team Activity</Label>
                      <p className="text-sm text-muted-foreground">Receive emails about team member actions</p>
                    </div>
                    <Switch id="email-team" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">In-App Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">All Notifications</Label>
                      <p className="text-sm text-muted-foreground">Enable or disable all in-app notifications</p>
                    </div>
                    <Switch defaultChecked id="app-all" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Sound Alerts</Label>
                      <p className="text-sm text-muted-foreground">Play sound when receiving notifications</p>
                    </div>
                    <Switch id="app-sound" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-green-600 hover:bg-green-700">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Password</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="md:col-span-2 md:h-0"></div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
                <Button className="mt-2">Change Password</Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable 2FA</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account with two-factor authentication
                    </p>
                  </div>
                  <Switch id="enable-2fa" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Session Management</h3>
                <div className="rounded-md border">
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-muted-foreground">Chrome on Windows • 192.168.1.1</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Active now</p>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">Mobile App</p>
                      <p className="text-sm text-muted-foreground">iPhone 13 • 192.168.1.2</p>
                    </div>
                    <p className="text-sm text-muted-foreground">3 days ago</p>
                  </div>
                </div>
                <Button variant="outline" className="mt-2">
                  Sign Out All Devices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
