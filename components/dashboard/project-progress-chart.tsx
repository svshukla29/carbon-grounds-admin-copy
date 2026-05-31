"use client";

import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend,
} from "recharts";

// Represents monthly tree planting targets vs actual for CG project
const data = [
  { month: "Jan", "Trees Planted": 0, "Target": 50 },
  { month: "Feb", "Trees Planted": 0, "Target": 50 },
  { month: "Mar", "Trees Planted": 0, "Target": 60 },
  { month: "Apr", "Trees Planted": 0, "Target": 60 },
  { month: "May", "Trees Planted": 308, "Target": 300 },
  { month: "Jun", "Trees Planted": 0, "Target": 100 },
];

export function ProjectProgressChart() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
            formatter={(value: any, name: string) => [`${value} trees`, name]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Target" fill="#d1fae5" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Trees Planted" fill="#16a34a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
