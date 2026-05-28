"use client";

import { useEffect, useState } from "react";
import { calculationsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, Calculator, Leaf, TrendingUp } from "lucide-react";

export default function CalculationsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculationsApi.getSummary()
      .then((res) => setSummary(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Carbon Credits</h1>
        <p className="text-muted-foreground">
          Carbon calculation results based on IPCC methodology
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-3">
                    <Leaf className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Total Carbon Credits</p>
                    <p className="text-3xl font-bold text-green-800">
                      {summary?.totalNetCredits?.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-xs text-green-600">tCO₂e</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-3">
                    <Calculator className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Calculations</p>
                    <p className="text-3xl font-bold">{summary?.totalCalculations || 0}</p>
                    <p className="text-xs text-muted-foreground">runs completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-amber-100 p-3">
                    <TrendingUp className="h-5 w-5 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total CO₂ Sequestered</p>
                    <p className="text-3xl font-bold">{summary?.totalCo2e?.toFixed(2) || "0.00"}</p>
                    <p className="text-xs text-muted-foreground">tCO₂e gross</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How Carbon Calculations Work</CardTitle>
              <CardDescription>IPCC-based biomass calculation methodology</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    step: "1",
                    title: "ABG Biomass",
                    desc: "Above Ground Biomass using allometric equations: exp(a + b × ln(DBH))",
                  },
                  {
                    step: "2",
                    title: "Carbon Stock",
                    desc: "Total biomass × carbon fraction (0.47) for aboveground + belowground",
                  },
                  {
                    step: "3",
                    title: "CO₂ Equivalent",
                    desc: "Carbon stock × 44/12 (molecular weight ratio) to get CO₂e",
                  },
                  {
                    step: "4",
                    title: "Net Credits",
                    desc: "Gross CO₂e minus emissions, uncertainty deduction, and leakage",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-3 rounded-lg border p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-700 text-white text-sm font-bold">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-sm font-medium text-green-800">
                  To run a calculation: Go to Farm Plots → Select a plot → Select a Monitoring Period → Click "Run Calculation"
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
