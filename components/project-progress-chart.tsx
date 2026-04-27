"use client";

import { BarChart2 } from "lucide-react";

export function ProjectProgressChart() {
  return (
    <div className="h-[300px] w-full flex flex-col items-center justify-center text-muted-foreground gap-2">
      <BarChart2 className="h-10 w-10 opacity-30" />
      <p className="text-sm">No project data to display yet.</p>
      <p className="text-xs opacity-70">Add projects to see progress charts here.</p>
    </div>
  );
}
