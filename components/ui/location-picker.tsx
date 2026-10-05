"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Crosshair, Loader2 } from "lucide-react";

const LocationPickerMap = dynamic(() => import("./location-picker-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Loading map...
    </div>
  ),
});

export function LocationPicker({
  lat,
  lng,
  onChange,
}: {
  lat: string;
  lng: string;
  onChange: (lat: string, lng: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftLat, setDraftLat] = useState<number | null>(lat ? Number(lat) : null);
  const [draftLng, setDraftLng] = useState<number | null>(lng ? Number(lng) : null);
  const [locating, setLocating] = useState(false);

  const handleOpen = (next: boolean) => {
    setOpen(next);
    if (next) {
      setDraftLat(lat ? Number(lat) : null);
      setDraftLng(lng ? Number(lng) : null);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDraftLat(pos.coords.latitude);
        setDraftLng(pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleConfirm = () => {
    if (draftLat != null && draftLng != null) {
      onChange(draftLat.toFixed(6), draftLng.toFixed(6));
    }
    setOpen(false);
  };

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => handleOpen(true)}>
        <MapPin className="mr-1.5 h-3.5 w-3.5" /> Pick on map
      </Button>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pick GPS Location</DialogTitle>
            <DialogDescription>
              Click on the satellite map to drop a pin, or use your current location.
            </DialogDescription>
          </DialogHeader>

          <div className="h-96 rounded-lg overflow-hidden border">
            <LocationPickerMap
              lat={draftLat}
              lng={draftLng}
              onPick={(la, ln) => {
                setDraftLat(la);
                setDraftLng(ln);
              }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground font-mono">
              {draftLat != null && draftLng != null
                ? `${draftLat.toFixed(6)}, ${draftLng.toFixed(6)}`
                : "No location selected yet"}
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={handleUseCurrentLocation} disabled={locating}>
              {locating ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Crosshair className="mr-1.5 h-3.5 w-3.5" />}
              Use current location
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleConfirm}
              disabled={draftLat == null || draftLng == null}
            >
              Confirm Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
