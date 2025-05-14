"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, MoreHorizontal, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock team data
const initialTeamMembers = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@carbongrounds.com",
    role: "Admin",
    department: "Management",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "SC",
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    email: "michael.r@carbongrounds.com",
    role: "Project Manager",
    department: "Field Operations",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "MR",
  },
  {
    id: 3,
    name: "Aisha Patel",
    email: "aisha.p@carbongrounds.com",
    role: "Field Officer",
    department: "Field Operations",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "AP",
  },
  {
    id: 4,
    name: "David Okafor",
    email: "david.o@carbongrounds.com",
    role: "Analyst",
    department: "Research",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "DO",
  },
  {
    id: 5,
    name: "Emma Wilson",
    email: "emma.w@carbongrounds.com",
    role: "Viewer",
    department: "Partners",
    status: "Pending",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "EW",
  },
];

export function TeamMembersTable() {
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || member.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "Project Manager":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Field Officer":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "Analyst":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "Viewer":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "Inactive":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search team members..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Project Manager">Project Manager</SelectItem>
            <SelectItem value="Field Officer">Field Officer</SelectItem>
            <SelectItem value="Analyst">Analyst</SelectItem>
            <SelectItem value="Viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Department</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No team members found.
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={member.avatar || "/placeholder.svg"}
                          alt={member.name}
                        />
                        <AvatarFallback className="bg-green-100 text-green-800">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div>
                          <Link
                            className="font-medium"
                            href={`/dashboard/teams/${member.id}`}
                          >
                            {member.name}
                          </Link>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getRoleBadgeColor(member.role)}
                    >
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {member.department}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant="outline"
                      className={getStatusBadgeColor(member.status)}
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
