"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, BarChart3, Download, Clock } from "lucide-react";

const plannedReports = [
  {
    icon: FileText,
    title: "Farmer Registration Report",
    description: "Complete list of registered farmers with land details, category, and GP info",
    format: "PDF / Excel",
    status: "Planned",
  },
  {
    icon: BarChart3,
    title: "Carbon Credit Summary",
    description: "Total carbon credits generated per instance, per farmer, and platform-wide",
    format: "PDF",
    status: "Planned",
  },
  {
    icon: FileText,
    title: "Monitoring Field Report",
    description: "Field visit records, tree survival rates, and monitoring period summaries",
    format: "PDF / Excel",
    status: "Planned",
  },
  {
    icon: Download,
    title: "GIS Data Export",
    description: "Farm plot boundaries and tree GPS coordinates in GeoJSON / KML format",
    format: "GeoJSON / KML",
    status: "Planned",
  },
];

export function ReportsList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports</h2>
          <p className="text-muted-foreground">
            Downloadable reports — coming in the next phase
          </p>
        </div>
        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
          <Clock className="mr-1 h-3 w-3" /> Coming Soon
        </Badge>
      </div>

      <Card className="border-amber-100 bg-amber-50/40">
        <CardContent className="pt-6 flex items-start gap-4">
          <Clock className="h-8 w-8 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">Reports module is under development</p>
            <p className="text-sm text-amber-700 mt-1">
              Once monitoring data and carbon calculations are recorded, this section will
              generate downloadable PDF and Excel reports automatically.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {plannedReports.map((report) => (
          <Card key={report.title} className="opacity-70">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-gray-100 p-2">
                    <report.icon className="h-4 w-4 text-gray-500" />
                  </div>
                  <CardTitle className="text-sm">{report.title}</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{report.format}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">{report.description}</CardDescription>
              <div className="mt-3">
                <Badge className="bg-gray-100 text-gray-500 text-xs">
                  <Clock className="mr-1 h-3 w-3" /> {report.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
