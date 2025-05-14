import { ArrowLeft, Edit, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamMembersTable } from "./team-members-table";
import { RoleManagement } from "./role-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TeamDetailsProps {
  id: string;
}

export function TeamDetails({ id }: TeamDetailsProps) {
  // In a real application, you would fetch the team data based on the ID
  const team = {
    id,
    name: "Carbon Sequestration Team",
    description:
      "Team focused on carbon sequestration projects and initiatives",
    createdAt: "2023-05-15",
    members: 8,
    lead: "Jane Smith",
    status: "Active",
    projects: 5,
    roles: [
      "Admin",
      "Project Manager",
      "Field Agent",
      "Data Analyst",
      "Viewer",
    ],
  };

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
          <h1 className="text-2xl font-bold tracking-tight">Team Details</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/teams/edit/${id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Team
            </Link>
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Team
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Users className="mr-2 h-5 w-5 text-green-600" />
            {team.name}
          </CardTitle>
          <CardDescription>{team.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Team Lead
                </h3>
                <p>{team.lead}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Created On
                </h3>
                <p>{team.createdAt}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Status
                </h3>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                >
                  {team.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Team Members
                </h3>
                <p>{team.members} members</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Projects
                </h3>
                <p>{team.projects} active projects</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Available Roles
                </h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {team.roles.map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage the members of this team and their roles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamMembersTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="roles" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>
                Configure roles and permissions for this team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoleManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
