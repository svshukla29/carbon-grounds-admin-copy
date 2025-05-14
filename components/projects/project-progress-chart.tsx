"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Jan", credits: 42 },
  { month: "Feb", credits: 63 },
  { month: "Mar", credits: 75 },
  { month: "Apr", credits: 85 },
  { month: "May", credits: 98 },
  { month: "Jun", credits: 112 },
  { month: "Jul", credits: 132 },
  { month: "Aug", credits: 145 },
  { month: "Sep", credits: 160 },
  { month: "Oct", credits: 178 },
  { month: "Nov", credits: 195 },
  { month: "Dec", credits: 215 },
];

export function ProjectProgressChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="month"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            formatter={(value: any) => [`${value} tons`, "Carbon Credits"]}
            labelFormatter={(label) => `${label} 2023`}
          />
          <Line
            type="monotone"
            dataKey="credits"
            stroke="#16a34a"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
