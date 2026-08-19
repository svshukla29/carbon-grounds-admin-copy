"use client";

import { useEffect, useState } from "react";
import { treePhotosApi, instancesApi, speciesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AuthImage } from "@/components/ui/auth-image";
import { TreePhotoHistoryDialog } from "@/components/trees/tree-photo-history-dialog";
import { Images, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 24;

export default function TreeGalleryPage() {
  const [instances, setInstances] = useState<any[]>([]);
  const [species, setSpecies] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState("all");
  const [selectedSpecies, setSelectedSpecies] = useState("all");
  const [photos, setPhotos] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    instancesApi.getAll({ limit: 100 }).then((res) => setInstances(res.data?.data || [])).catch(console.error);
    speciesApi.getAll().then((res) => setSpecies(res.data || [])).catch(console.error);
  }, []);

  const refresh = () => {
    setLoading(true);
    treePhotosApi
      .getAll({
        instanceId: selectedInstance !== "all" ? selectedInstance : undefined,
        speciesId: selectedSpecies !== "all" ? selectedSpecies : undefined,
        page,
        limit: PAGE_SIZE,
      })
      .then((res) => {
        setPhotos(res.data?.data || []);
        setTotal(res.data?.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInstance, selectedSpecies, page]);

  useEffect(() => setPage(1), [selectedInstance, selectedSpecies]);

  // Group photos by tree, latest photo first as the thumbnail
  const treeGroups = Object.values(
    photos.reduce((acc: Record<string, any>, photo) => {
      const treeId = photo.plantingUnitId;
      if (!acc[treeId]) {
        acc[treeId] = { plantingUnit: photo.plantingUnit, photos: [] as any[] };
      }
      acc[treeId].photos.push(photo);
      return acc;
    }, {}),
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tree Gallery</h1>
        <p className="text-muted-foreground">Photographic documentation of planted trees, by monitoring visit</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium shrink-0">Farm Plot:</label>
              <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plots</SelectItem>
                  {instances.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.instanceId} — {inst.farmer?.farmerName || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium shrink-0">Species:</label>
              <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Species</SelectItem>
                  {species.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.commonName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
        </div>
      ) : treeGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
          <Images className="h-12 w-12 text-green-200" />
          <p className="text-lg font-medium">No tree photos yet</p>
          <p className="text-sm">Upload photos from the Trees page to build the gallery</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {treeGroups.map((group: any) => {
              const unit = group.plantingUnit;
              const latest = group.photos[0];
              return (
                <TreePhotoHistoryDialog
                  key={unit?.id}
                  plantingUnitId={unit?.id}
                  treeLabel={unit?.treeId}
                  trigger={
                    <button className="text-left rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative">
                        <AuthImage
                          src={latest.photoUrl}
                          alt={unit?.treeId || "Tree photo"}
                          className="w-full h-32 object-cover"
                        />
                        <Badge className="absolute top-1 right-1 bg-black/60 text-white hover:bg-black/60">
                          {group.photos.length}
                        </Badge>
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium truncate">{unit?.treeId || "—"}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {unit?.species?.commonName || "—"}
                        </p>
                      </div>
                    </button>
                  }
                />
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
