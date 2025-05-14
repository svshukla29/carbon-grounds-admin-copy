import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";

interface ProjectStatsProps {
  title: string;
  value: string;
  description: string;
  trend: "increase" | "decrease" | "neutral";
}

export function ProjectStats({
  title,
  value,
  description,
  trend,
}: ProjectStatsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {trend === "increase" && <ArrowUp className="h-4 w-4 text-green-600" />}
        {trend === "decrease" && <ArrowDown className="h-4 w-4 text-red-600" />}
        {trend === "neutral" && (
          <ArrowRight className="h-4 w-4 text-gray-600" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
