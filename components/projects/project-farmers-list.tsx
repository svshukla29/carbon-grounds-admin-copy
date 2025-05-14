"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";

// Mock farmers data
const farmersData = [
  {
    id: "1",
    name: "Nguyen Van Minh",
    location: "Mekong Delta, Vietnam",
    area: "2.5 hectares",
    crops: ["Rice", "Vegetables"],
    status: "Verified",
    joinDate: "2023-04-10",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "NM",
  },
  {
    id: "2",
    name: "Tran Thi Lan",
    location: "Mekong Delta, Vietnam",
    area: "1.8 hectares",
    crops: ["Rice"],
    status: "Verified",
    joinDate: "2023-04-15",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "TL",
  },
  {
    id: "3",
    name: "Le Van Hung",
    location: "Mekong Delta, Vietnam",
    area: "3.2 hectares",
    crops: ["Rice", "Fruit Trees"],
    status: "Pending",
    joinDate: "2023-05-02",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "LH",
  },
  {
    id: "4",
    name: "Pham Thi Mai",
    location: "Mekong Delta, Vietnam",
    area: "2.1 hectares",
    crops: ["Rice", "Vegetables"],
    status: "Verified",
    joinDate: "2023-05-10",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "PM",
  },
  {
    id: "5",
    name: "Hoang Van Duc",
    location: "Mekong Delta, Vietnam",
    area: "1.5 hectares",
    crops: ["Rice"],
    status: "Pending",
    joinDate: "2023-05-22",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "HD",
  },
];

export function ProjectFarmersList({ projectId }: { projectId: string }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter farmers based on search query
  const filteredFarmers = farmersData.filter((farmer) =>
    farmer.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Verified":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Search farmers..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Area</TableHead>
              <TableHead className="hidden md:table-cell">Crops</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFarmers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No farmers found.
                </TableCell>
              </TableRow>
            ) : (
              filteredFarmers.map((farmer) => (
                <TableRow key={farmer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={farmer.avatar || "/placeholder.svg"}
                          alt={farmer.name}
                        />
                        <AvatarFallback className="bg-green-100 text-green-800">
                          {farmer.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{farmer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {farmer.location}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {farmer.area}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {farmer.crops.join(", ")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusBadgeColor(farmer.status)}
                    >
                      {farmer.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" size="sm">
          View All Farmers
        </Button>
      </div>
    </div>
  );
}
