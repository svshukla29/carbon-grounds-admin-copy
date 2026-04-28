"use client";

import { useEffect, useState, useCallback } from "react";
import { projectsApi } from "@/lib/api";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Eye,
  FileEdit,
  Leaf,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
  type: string;
  location: string;
  farmerCount?: number;
  carbonCredits?: number;
  status: string;
  startDate?: string;
}

export function ProjectsList() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await projectsApi.getAll(params);
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => fetchProjects(), 400);
    return () => clearTimeout(t);
  }, [fetchProjects]);

  const handleDelete = async () => {
    if (!projectToDelete) return;
    await projectsApi.delete(projectToDelete.id);
    setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const statusColor: Record<string, string> = {
    Active: "bg-green-100 text-green-800 hover:bg-green-100",
    Completed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    Pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    Paused: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Projects
          </h1>
          <p className="text-muted-foreground">
            Manage your sustainability projects
          </p>
        </div>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/dashboard/projects/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>
            {projects.length} project{projects.length !== 1 ? "s" : ""} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search projects..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              <span className="ml-2 text-muted-foreground">Loading projects...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Leaf className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No projects found.</p>
              <Link href="/dashboard/projects/create">
                <Button className="mt-4 bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" /> Create First Project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Farmer Name</TableHead>
                    <TableHead>Carbon Credits</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {project.id}
                      </TableCell>
                      <TableCell>{project.type || "—"}</TableCell>
                      <TableCell>{project.location || "—"}</TableCell>
                      <TableCell>{project.farmerCount ? `${project.farmerCount} farmer(s)` : "—"}</TableCell>
                      <TableCell>
                        {project.carbonCredits
                          ? Number(project.carbonCredits).toLocaleString()
                          : "0"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            statusColor[project.status] ??
                            "bg-gray-100 text-gray-800"
                          }
                        >
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {project.startDate
                          ? new Date(project.startDate).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/dashboard/projects/${project.id}`)
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/projects/edit/${project.id}`
                                )
                              }
                            >
                              <FileEdit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setProjectToDelete(project);
                                setDeleteDialogOpen(true);
                              }}
                            >
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
          )}
        </CardContent>
      </Card>

      {projectToDelete && (
        <DeleteProjectDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setProjectToDelete(null);
          }}
          onConfirm={handleDelete}
          projectName={projectToDelete.name}
        />
      )}
    </div>
  );
}
