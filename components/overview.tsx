"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Jan",
    total: 420,
  },
  {
    name: "Feb",
    total: 380,
  },
  {
    name: "Mar",
    total: 510,
  },
  {
    name: "Apr",
    total: 580,
  },
  {
    name: "May",
    total: 620,
  },
  {
    name: "Jun",
    total: 590,
  },
  {
    name: "Jul",
    total: 640,
  },
  {
    name: "Aug",
    total: 680,
  },
  {
    name: "Sep",
    total: 720,
  },
  {
    name: "Oct",
    total: 750,
  },
  {
    name: "Nov",
    total: 790,
  },
  {
    name: "Dec",
    total: 830,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip
          formatter={(value) => [`${value} tons`, "Carbon Credits"]}
          labelFormatter={(label) => `${label} 2023`}
        />
        <Bar dataKey="total" fill="#4ade80" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
