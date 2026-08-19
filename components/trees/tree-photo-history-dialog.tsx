"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { treePhotosApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AuthImage } from "@/components/ui/auth-image";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { UploadTreePhotoDialog } from "@/components/trees/upload-tree-photo-dialog";
import { Camera, ImageOff, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function TreePhotoHistoryDialog({
  plantingUnitId,
  treeLabel,
  trigger,
}: {
  plantingUnitId: string;
  treeLabel?: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await treePhotosApi.getByTree(plantingUnitId);
      setPhotos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleDelete = async (id: string) => {
    try {
      await treePhotosApi.delete(id);
      toast({ title: "Photo deleted" });
      refresh();
    } catch {
      toast({ title: "Failed to delete photo", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div>
              <DialogTitle>Photo History{treeLabel ? ` — ${treeLabel}` : ""}</DialogTitle>
              <DialogDescription>Dated photos captured for this tree</DialogDescription>
            </div>
            <UploadTreePhotoDialog
              plantingUnitId={plantingUnitId}
              treeLabel={treeLabel}
              onUploaded={refresh}
              trigger={
                <Button size="sm" variant="outline">
                  <Camera className="mr-2 h-4 w-4" /> Add Photo
                </Button>
              }
            />
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-muted-foreground gap-2">
            <ImageOff className="h-10 w-10 text-gray-200" />
            <p>No photos uploaded for this tree yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            {photos.map((photo) => (
              <div key={photo.id} className="rounded-lg border overflow-hidden">
                <AuthImage
                  src={photo.photoUrl}
                  alt={photo.fileName}
                  className="w-full h-40 object-cover"
                />
                <div className="p-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium">
                      {photo.takenAt ? new Date(photo.takenAt).toLocaleDateString("en-IN") : "—"}
                    </p>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(photo.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-600" />
                    </Button>
                  </div>
                  {photo.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{photo.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
