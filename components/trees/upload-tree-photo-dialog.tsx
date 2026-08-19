"use client";

import { useRef, useState } from "react";
import type React from "react";
import { treePhotosApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Camera, File, Loader2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export function UploadTreePhotoDialog({
  plantingUnitId,
  treeLabel,
  trigger,
  onUploaded,
}: {
  plantingUnitId: string;
  treeLabel?: string;
  trigger?: React.ReactNode;
  onUploaded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [takenAt, setTakenAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Only PNG, JPEG, and WEBP images are allowed.", variant: "destructive" });
      return false;
    }
    if (file.size > MAX_SIZE) {
      toast({ title: "File too large", description: "Maximum file size is 10 MB.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const onFileSelect = (file: File) => {
    if (!validateFile(file)) return;
    setSelectedFile(file);
  };

  const reset = () => {
    setSelectedFile(null);
    setNotes("");
    setTakenAt(new Date().toISOString().slice(0, 10));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      return toast({ title: "Select a photo to upload", variant: "destructive" });
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("plantingUnitId", plantingUnitId);
      formData.append("takenAt", takenAt);
      if (notes) formData.append("notes", notes);
      await treePhotosApi.upload(formData);
      toast({ title: "Photo uploaded" });
      setOpen(false);
      reset();
      onUploaded();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast({
        title: "Error",
        description: Array.isArray(msg) ? msg.join(", ") : msg || "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <Camera className="mr-2 h-4 w-4" /> Upload Photo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Tree Photo</DialogTitle>
          <DialogDescription>
            {treeLabel ? `Add a dated photo for ${treeLabel}` : "Add a dated photo for this tree"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {selectedFile ? (
            <div className="flex items-center gap-3 rounded-md border border-blue-200 bg-blue-50 p-3">
              <File className="h-5 w-5 text-blue-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button type="button" onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-red-500 shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              className={`rounded-md border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
                isDragging ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-400 hover:bg-gray-50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) onFileSelect(file);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-gray-700">
                Drag & drop a photo here, or <span className="text-green-600 underline">browse</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">PNG, JPEG, WEBP — max 10 MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelect(file);
            }}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Date Taken</Label>
              <Input type="date" value={takenAt} onChange={(e) => setTakenAt(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Notes (optional)</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Post-monsoon growth check" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={uploading}>Cancel</Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmit} disabled={uploading}>
            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
