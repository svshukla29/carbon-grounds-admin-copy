import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamTable } from "@/components/team-table"
import { PlusCircle } from "lucide-react"

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Manage team members and their access permissions</p>
        </div>
        <Button className="bg-green-700 hover:bg-green-800">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>View and manage all team members and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamTable />
        </CardContent>
      </Card>
    </div>
  )
}
