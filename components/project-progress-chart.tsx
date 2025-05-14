"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    Agroforestry: 65,
    "Soil Carbon": 45,
    "Renewable Energy": 30,
  },
  {
    name: "Feb",
    Agroforestry: 59,
    "Soil Carbon": 48,
    "Renewable Energy": 38,
  },
  {
    name: "Mar",
    Agroforestry: 80,
    "Soil Carbon": 52,
    "Renewable Energy": 42,
  },
  {
    name: "Apr",
    Agroforestry: 81,
    "Soil Carbon": 56,
    "Renewable Energy": 45,
  },
  {
    name: "May",
    Agroforestry: 76,
    "Soil Carbon": 61,
    "Renewable Energy": 48,
  },
  {
    name: "Jun",
    Agroforestry: 84,
    "Soil Carbon": 65,
    "Renewable Energy": 52,
  },
]

export function ProjectProgressChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Agroforestry" fill="#4ade80" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Soil Carbon" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Renewable Energy" fill="#a3e635" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
