"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    name: "Priya Sharma",
    email: "priya.s@carbongrounds.com",
    role: "Data Analyst",
    department: "Research",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "PS",
  },
  {
    id: 4,
    name: "David Okafor",
    email: "david.o@carbongrounds.com",
    role: "Field Coordinator",
    department: "Field Operations",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "DO",
  },
  {
    id: 5,
    name: "Emma Wilson",
    email: "emma.w@carbongrounds.com",
    role: "Sustainability Expert",
    department: "Research",
    status: "On Leave",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "EW",
  },
  {
    id: 6,
    name: "Raj Patel",
    email: "raj.p@carbongrounds.com",
    role: "Technical Lead",
    department: "Technology",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "RP",
  },
];

export function TeamTable() {
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<any>(null);

  const handleEdit = (member: any) => {
    setCurrentMember({ ...member });
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    if (currentMember) {
      setTeamMembers(
        teamMembers.map((member) =>
          member.id === currentMember.id ? currentMember : member,
        ),
      );
      setIsEditDialogOpen(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "Project Manager":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Data Analyst":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "Field Coordinator":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "Sustainability Expert":
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
      case "Technical Lead":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "On Leave":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "Inactive":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <>
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
            {teamMembers.map((member) => (
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
                      <div className="font-medium">{member.name}</div>
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
                      <DropdownMenuItem onClick={() => handleEdit(member)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update team member details and permissions
            </DialogDescription>
          </DialogHeader>
          {currentMember && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={currentMember.name}
                  onChange={(e) =>
                    setCurrentMember({ ...currentMember, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={currentMember.email}
                  onChange={(e) =>
                    setCurrentMember({
                      ...currentMember,
                      email: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={currentMember.role}
                  onValueChange={(value) =>
                    setCurrentMember({ ...currentMember, role: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Project Manager">
                      Project Manager
                    </SelectItem>
                    <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                    <SelectItem value="Field Coordinator">
                      Field Coordinator
                    </SelectItem>
                    <SelectItem value="Sustainability Expert">
                      Sustainability Expert
                    </SelectItem>
                    <SelectItem value="Technical Lead">
                      Technical Lead
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Department
                </Label>
                <Select
                  value={currentMember.department}
                  onValueChange={(value) =>
                    setCurrentMember({ ...currentMember, department: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Field Operations">
                      Field Operations
                    </SelectItem>
                    <SelectItem value="Research">Research</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={currentMember.status}
                  onValueChange={(value) =>
                    setCurrentMember({ ...currentMember, status: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-green-700 hover:bg-green-800"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
