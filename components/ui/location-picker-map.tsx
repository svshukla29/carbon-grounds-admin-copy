"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom divIcon avoids Leaflet's default marker image paths, which break
// under Next.js/webpack bundling without extra asset config.
const markerIcon = L.divIcon({
  html: `<div style="background:#16a34a;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 4px rgba(0,0,0,0.6)"></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerMap({
  lat,
  lng,
  onPick,
}: {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
}) {
  // Defaults to a Chhattisgarh-wide view when no point is set yet.
  const center: [number, number] = lat != null && lng != null ? [lat, lng] : [21.2787, 81.8661];

  return (
    <MapContainer center={center} zoom={lat != null ? 17 : 7} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="&copy; Esri Satellite"
        maxZoom={20}
      />
      <ClickHandler onPick={onPick} />
      {lat != null && lng != null && <Marker position={[lat, lng]} icon={markerIcon} />}
    </MapContainer>
  );
}
