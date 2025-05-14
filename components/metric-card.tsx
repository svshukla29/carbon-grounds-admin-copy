import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowDown, ArrowUp, DollarSign, Leaf, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  description: string;
  icon: "leaf" | "users" | "carbon" | "dollar";
}

export function MetricCard({
  title,
  value,
  trend,
  trendValue,
  description,
  icon,
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="rounded-full p-1">
          {icon === "leaf" && <Leaf className="h-4 w-4 text-green-600" />}
          {icon === "users" && <Users className="h-4 w-4 text-blue-600" />}
          {icon === "carbon" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-amber-600"
            >
              <path d="M21 10H3M21 6H3M21 14H3M21 18H3" />
            </svg>
          )}
          {icon === "dollar" && (
            <DollarSign className="h-4 w-4 text-emerald-600" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="mt-1 flex items-center gap-1">
          {trend === "up" && <ArrowUp className="h-3 w-3 text-green-600" />}
          {trend === "down" && <ArrowDown className="h-3 w-3 text-red-600" />}
          <p
            className={cn(
              "text-xs",
              trend === "up" && "text-green-600",
              trend === "down" && "text-red-600",
              trend === "neutral" && "text-gray-600",
            )}
          >
            {trendValue}
          </p>
        </div>
        <CardDescription className="mt-1">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
