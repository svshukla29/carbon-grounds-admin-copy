"use client";

import { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { publicApi } from "@/lib/api";
import { Users, MapPin, TreePine, Ruler, Building2, Leaf, Loader2 } from "lucide-react";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

interface Summary {
  totalFarmers: number;
  totalPlots: number;
  totalTrees: number;
  totalGramPanchayats: number;
  statesCovered: number;
  totalAreaAcres: number;
  verifiedNetCredits: number;
}

const stats = (s: Summary) => [
  { label: "Farmers Empowered", value: s.totalFarmers, icon: Users },
  { label: "Farm Plots Registered", value: s.totalPlots, icon: MapPin },
  { label: "Trees Growing", value: s.totalTrees, icon: TreePine },
  { label: "Area Under Cultivation", value: `${s.totalAreaAcres.toFixed(1)} acres`, icon: Ruler },
  { label: "Gram Panchayats Reached", value: s.totalGramPanchayats, icon: Building2 },
  { label: "Verified Carbon Credits", value: `${s.verifiedNetCredits.toFixed(2)} tCO₂e`, icon: Leaf },
];

export function PublicSummaryContent() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    publicApi
      .getSummary()
      .then((res) => setSummary(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={`${poppins.className} min-h-screen bg-white`}>
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#376146]">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-[#1f2937]">Carbon Grounds</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-gray-600">
          <a href="/" className="hover:text-[#376146]">
            Home
          </a>
          <Link href="/login" className="rounded-full bg-[#376146] px-4 py-2 text-white hover:bg-[#2c4d38]">
            Staff Login
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#1f3d2c] to-[#376146] px-6 py-20 text-center sm:px-10">
        <h1 className="mx-auto max-w-3xl text-3xl font-bold text-white sm:text-5xl">
          Real-Time Impact, Grown From the Ground Up
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-200 sm:text-lg">
          A live look at the farmers, plots and trees behind our carbon credit program in Jashpur district, Chhattisgarh.
        </p>
      </section>

      {/* Stats */}
      <section className="bg-[#376146]/10 px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-[#1f2937] sm:text-3xl">Our Impact So Far</h2>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#376146]" />
            </div>
          ) : error || !summary ? (
            <p className="mt-8 text-center text-gray-500">Unable to load live numbers right now — please check back shortly.</p>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stats(summary).map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg bg-[#376146] p-6 text-slate-100 shadow-lg shadow-green-100"
                >
                  <s.icon className="h-6 w-6 text-[#22C55E]" />
                  <p className="mt-3 text-3xl font-bold">{s.value}</p>
                  <p className="mt-1 text-sm text-slate-300">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center sm:px-10">
        <h2 className="text-2xl font-bold text-[#1f2937] sm:text-3xl">
          Sustainable Farming Through <span className="text-[#22C55E]">Carbon Credit</span> Solutions
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-gray-600">
          Every number above represents a real farmer, plot and tree — verified through our on-the-ground monitoring process.
        </p>
        <a
          href="/"
          className="mt-6 inline-block rounded-full bg-[#376146] px-6 py-3 text-sm font-medium text-white hover:bg-[#2c4d38]"
        >
          Learn more about Carbon Grounds
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-[#376146]/90 px-6 py-10 text-gray-300 sm:px-10">
        <div className="mx-auto max-w-5xl text-center text-sm">
          <p className="font-semibold text-white">Carbon Grounds</p>
          <p className="mt-1">An initiative by IIT Roorkee</p>
          <p className="mt-4 text-xs text-gray-400">
            Data shown is aggregate and updated live from our monitoring system.
          </p>
        </div>
      </footer>
    </div>
  );
}
