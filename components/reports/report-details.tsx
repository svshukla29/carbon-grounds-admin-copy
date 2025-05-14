"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Download,
  FileEdit,
  Printer,
  Share2,
  Trash2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock report data
const reportsData = [
  {
    id: "1",
    title: "Q2 2023 Carbon Credits Report",
    type: "Quarterly Summary",
    project: "Sustainable Rice Cultivation",
    author: {
      name: "Sarah Chen",
      email: "sarah.chen@carbongrounds.com",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SC",
    },
    status: "Published",
    date: "2023-07-15",
    summary:
      "This quarterly report summarizes the carbon credit generation and verification for the Sustainable Rice Cultivation project during Q2 2023. The project has shown significant progress in reducing methane emissions and improving farmer livelihoods.",
    content: `
      <h2>Executive Summary</h2>
      <p>The Sustainable Rice Cultivation project has successfully implemented alternate wetting and drying techniques across 124 farms in the Mekong Delta region. This has resulted in a 32% reduction in methane emissions compared to traditional cultivation methods.</p>
      
      <h2>Carbon Credit Generation</h2>
      <p>During Q2 2023, the project generated 450 tons of verified carbon credits. This represents a 15% increase from the previous quarter and puts the project on track to meet its annual target of 1,800 tons.</p>
      
      <h2>Farmer Participation</h2>
      <p>Farmer participation has increased by 12% this quarter, with 15 new farmers joining the program. Training sessions on sustainable practices were conducted for all participants, with a 95% attendance rate.</p>
      
      <h2>Challenges and Solutions</h2>
      <p>The main challenge faced this quarter was water management during unexpected dry periods. The project team implemented improved irrigation scheduling and provided additional support to affected farmers.</p>
      
      <h2>Next Steps</h2>
      <p>In Q3, the project will focus on expanding to neighboring communities and implementing digital monitoring tools to improve data collection efficiency.</p>
    `,
    attachments: [
      {
        name: "Q2_2023_Data_Summary.xlsx",
        size: "2.4 MB",
        type: "spreadsheet",
      },
      {
        name: "Farmer_Verification_Photos.zip",
        size: "15.8 MB",
        type: "archive",
      },
      { name: "Carbon_Credit_Certificates.pdf", size: "1.2 MB", type: "pdf" },
    ],
    comments: [
      {
        id: 1,
        user: {
          name: "Michael Rodriguez",
          avatar: "/placeholder.svg?height=32&width=32",
          initials: "MR",
        },
        text: "Great report! The increase in farmer participation is particularly encouraging.",
        date: "2023-07-16",
      },
      {
        id: 2,
        user: {
          name: "Emma Wilson",
          avatar: "/placeholder.svg?height=32&width=32",
          initials: "EW",
        },
        text: "Could we add more details about the water management solutions for the next report?",
        date: "2023-07-17",
      },
    ],
  },
];

export function ReportDetails({ id }: { id: string }) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate API fetch
    const fetchReport = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        const foundReport = reportsData.find((r) => r.id === id);

        if (foundReport) {
          setReport(foundReport);
        } else {
          // Report not found
          router.push("/dashboard/reports");
        }
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, router]);

  const handleDelete = () => {
    // In a real app, this would be an API call to delete the report
    router.push("/dashboard/reports");
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-600"></div>
          <p className="mt-2 text-sm text-gray-500">
            Loading report details...
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center">
        <p className="text-lg text-gray-500">Report not found</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/dashboard/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Link>
        </Button>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Draft":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Link href="/dashboard/reports">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {report.title}
            </h1>
            <Badge
              variant="outline"
              className={getStatusBadgeColor(report.status)}
            >
              {report.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{report.summary}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button asChild variant="outline">
            <Link href={`/dashboard/reports/edit/${report.id}`}>
              <FileEdit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Report Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-4 pb-6 text-center">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={report.author.avatar || "/placeholder.svg"}
                    alt={report.author.name}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-800">
                    {report.author.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{report.author.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {report.author.email}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium">Report Details</h4>
                  <div className="space-y-2 rounded-md border p-3 text-sm">
                    <div className="grid grid-cols-3">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="col-span-2">{report.type}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-muted-foreground">Project:</span>
                      <span className="col-span-2">{report.project}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="col-span-2 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(report.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="col-span-2">
                        <Badge
                          variant="outline"
                          className={getStatusBadgeColor(report.status)}
                        >
                          {report.status}
                        </Badge>
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium">Attachments</h4>
                  <div className="space-y-2">
                    {report.attachments.map(
                      (attachment: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-md border p-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            {attachment.type === "pdf" && (
                              <div className="rounded-md bg-red-100 p-1">
                                <FileText className="h-3 w-3 text-red-600" />
                              </div>
                            )}
                            {attachment.type === "spreadsheet" && (
                              <div className="rounded-md bg-green-100 p-1">
                                <FileText className="h-3 w-3 text-green-600" />
                              </div>
                            )}
                            {attachment.type === "archive" && (
                              <div className="rounded-md bg-yellow-100 p-1">
                                <FileText className="h-3 w-3 text-yellow-600" />
                              </div>
                            )}
                            <span>{attachment.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {attachment.size}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Report Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>
              <TabsContent value="content" className="pt-4">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: report.content }}
                ></div>
              </TabsContent>
              <TabsContent value="comments" className="pt-4">
                <div className="space-y-4">
                  {report.comments.map((comment: any) => (
                    <div key={comment.id} className="rounded-md border p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={comment.user.avatar || "/placeholder.svg"}
                            alt={comment.user.name}
                          />
                          <AvatarFallback className="bg-green-100 text-green-800">
                            {comment.user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{comment.user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(comment.date).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="mt-1 text-sm">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="mt-4 rounded-md border p-4">
                    <h4 className="mb-2 text-sm font-medium">Add a Comment</h4>
                    <textarea
                      className="w-full rounded-md border p-2 text-sm"
                      rows={3}
                      placeholder="Write your comment here..."
                    ></textarea>
                    <div className="mt-2 flex justify-end">
                      <Button className="bg-green-600 hover:bg-green-700">
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
