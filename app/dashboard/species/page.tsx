"use client";

import { useEffect, useState } from "react";
import { speciesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Leaf, Loader2 } from "lucide-react";
import { SpeciesDialog } from "@/components/species/species-dialog";

export default function SpeciesPage() {
  const [species, setSpecies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshSpecies = () => {
    speciesApi.getAll()
      .then((res) => setSpecies(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshSpecies();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Species Master</h1>
          <p className="text-muted-foreground">Tree species with biomass coefficients for carbon calculation</p>
        </div>
        <SpeciesDialog onSaved={refreshSpecies} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-700" />
            All Species
          </CardTitle>
          <CardDescription>{species.length} species registered</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Common Name</TableHead>
                  <TableHead>Scientific Name</TableHead>
                  <TableHead>Wood Density (g/cm³)</TableHead>
                  <TableHead>Carbon Fraction</TableHead>
                  <TableHead>Allometric a</TableHead>
                  <TableHead>Allometric b</TableHead>
                  <TableHead>Max Age (yrs)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {species.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No species found
                    </TableCell>
                  </TableRow>
                ) : (
                  species.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Leaf className="h-4 w-4 text-green-500" />
                          {s.commonName}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm italic text-muted-foreground">
                        {s.scientificName}
                      </TableCell>
                      <TableCell className="text-sm">{s.woodDensity ?? "—"}</TableCell>
                      <TableCell className="text-sm">{s.carbonFraction ?? 0.47}</TableCell>
                      <TableCell className="text-sm font-mono">{s.allometricA ?? "—"}</TableCell>
                      <TableCell className="text-sm font-mono">{s.allometricB ?? "—"}</TableCell>
                      <TableCell className="text-sm">{s.maxRotationYears ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <SpeciesDialog species={s} onSaved={refreshSpecies} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-100 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-blue-800">How Species Data is Used in Calculations</p>
          <p className="text-sm text-blue-700 mt-1">
            Each tree&apos;s biomass is calculated using: <code className="bg-blue-100 px-1 rounded">ABG = exp(a + b × ln(DBH))</code>.
            Wood density and carbon fraction are used to convert biomass to carbon stock.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
