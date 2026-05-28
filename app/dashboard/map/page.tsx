"use client";

import { useEffect, useRef, useState } from "react";
import { instancesApi } from "@/lib/api";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin, Loader2, Layers, TreePine, Sprout, ExternalLink,
  Navigation, Info,
} from "lucide-react";
import Link from "next/link";

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [treeMode, setTreeMode] = useState(false);

  useEffect(() => {
    instancesApi.getAllGeoJson()
      .then((res) => setGeoData(res.data))
      .catch(() => setError("Failed to load map data. Make sure backend is running."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!geoData || !mapRef.current || mapInstanceRef.current) return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const initMap = () => {
      if (!mapRef.current) return;
      const L = (window as any).L;
      if (!L) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 20,
      });

      const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "© Esri Satellite", maxZoom: 20 }
      );

      // Google Satellite as best option
      const googleSat = L.tileLayer(
        "http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
        {
          maxZoom: 21,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
          attribution: "© Google",
        }
      );

      const map = L.map(mapRef.current, {
        center: [21.2787, 81.8661],
        zoom: 7,
        layers: [googleSat], // Default: Google Satellite
      });

      mapInstanceRef.current = map;

      L.control.layers(
        {
          "🛰️ Google Satellite": googleSat,
          "🛰️ Esri Satellite": satelliteLayer,
          "🗺️ Street Map": streetLayer,
        },
        {},
        { position: "topright", collapsed: false }
      ).addTo(map);

      // Scale bar
      L.control.scale({ imperial: false }).addTo(map);

      // ── Plot Boundaries (GeoJSON Polygons) ────────────────────────────────────
      if (geoData?.features?.length > 0) {
        const geoLayer = L.geoJSON(geoData, {
          style: () => ({
            color: "#facc15",        // yellow outline — visible on satellite
            weight: 2.5,
            opacity: 1,
            fillColor: "#22c55e",
            fillOpacity: 0.25,
            dashArray: "4",
          }),
          onEachFeature: (feature: any, layer: any) => {
            const p = feature.properties;
            const area = parseFloat(p.areaAcres || 0).toFixed(2);
            layer.bindPopup(
              `<div style="font-family:system-ui;min-width:200px;padding:6px">
                <div style="font-weight:700;color:#15803d;font-size:14px">🌿 ${p.farmerName || "Unknown"}</div>
                <div style="color:#6b7280;font-size:11px;margin:2px 0 6px">
                  📋 ${p.instanceId}
                </div>
                <div style="font-size:12px;background:#f0fdf4;padding:6px;border-radius:6px">
                  📐 Area: <b>${area} acres</b>
                </div>
                <div style="margin-top:8px">
                  <a href="/dashboard/instances/${p.id}" 
                     style="display:block;text-align:center;background:#15803d;color:white;padding:4px 8px;border-radius:4px;text-decoration:none;font-size:12px">
                    View Full Details →
                  </a>
                </div>
              </div>`,
              { maxWidth: 240 }
            );
            layer.on("click", () => setSelected(p));
            layer.on("mouseover", () => layer.setStyle({ fillOpacity: 0.5, weight: 3.5 }));
            layer.on("mouseout", () => layer.setStyle({ fillOpacity: 0.25, weight: 2.5 }));
          },
        }).addTo(map);

        try {
          map.fitBounds(geoLayer.getBounds(), { padding: [60, 60] });
        } catch {
          map.setView([22.0, 82.5], 8);
        }
      } else {
        // No data — center on Chhattisgarh
        map.setView([21.2787, 81.8661], 8);
        const marker = L.marker([21.2787, 81.8661]).addTo(map);
        marker.bindPopup(
          "<b>No farm plots with GPS boundaries yet</b><br>" +
          "Use SW Maps app in the field to record boundaries,<br>" +
          "then upload GeoJSON to admin panel."
        ).openPopup();
      }

      // ── Tree Markers (GPS points) ──────────────────────────────────────────────
      // Custom tree icon
      const treeIcon = L.divIcon({
        html: `<div style="background:#15803d;color:white;border-radius:50%;width:16px;height:16px;
                           display:flex;align-items:center;justify-content:center;font-size:10px;
                           border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)">🌳</div>`,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      // TODO: When real tree GPS data comes from DB, add markers here
      // For now show instruction
      (mapInstanceRef.current as any)._treeIcon = treeIcon;
    };

    const existingScript = document.getElementById("leaflet-js");
    if (existingScript && (window as any).L) {
      initMap();
    } else if (!existingScript) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      script.onerror = () => setError("Failed to load Leaflet. Check internet connection.");
      document.head.appendChild(script);
    } else {
      // Script exists but L not ready yet
      const check = setInterval(() => {
        if ((window as any).L) {
          clearInterval(check);
          initMap();
        }
      }, 100);
    }
  }, [geoData]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const totalPlots = geoData?.features?.length || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">GIS Map</h1>
          <p className="text-muted-foreground">
            {totalPlots} farm plots with boundaries • Google Satellite view
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/trees">
              <TreePine className="mr-2 h-4 w-4" /> Trees
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-green-700 hover:bg-green-800">
            <Link href="/dashboard/instances">
              <Sprout className="mr-2 h-4 w-4" /> Farm Plots
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* How real data works — info banner */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800">
            <span className="font-semibold">Real Boundaries Kaise Aayengi?</span>{" "}
            Field mein{" "}
            <span className="font-medium">SW Maps</span> (Android) ya{" "}
            <span className="font-medium">Google Earth Pro</span> se khet ki boundary trace karo → 
            GeoJSON export karo → Admin panel mein plot edit karke upload karo → 
            Map pe satellite pe exact boundary dikhegi. Tree GPS coordinates bhi isi tarah add karo.
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {/* Map */}
        <Card className="lg:col-span-3 overflow-hidden">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-5 w-5 text-green-700" />
              Farm Plot Boundaries — Chhattisgarh
              <Badge className="bg-yellow-100 text-yellow-800 ml-2">
                {totalPlots} plots
              </Badge>
            </CardTitle>
            <CardDescription>
              🛰️ Google Satellite view • Yellow outline = khet boundary • Click karo details ke liye
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex h-[560px] items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-green-600 mx-auto" />
                  <p className="mt-3 text-sm text-muted-foreground">Loading satellite map...</p>
                </div>
              </div>
            ) : (
              <div
                ref={mapRef}
                style={{ height: "560px", width: "100%" }}
              />
            )}
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div className="space-y-3">
          {/* Selected */}
          {selected ? (
            <Card className="border-green-300 bg-green-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-800 flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> Selected Plot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Farmer</p>
                  <p className="font-bold text-base">{selected.farmerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Instance ID</p>
                  <code className="text-xs bg-white px-2 py-1 rounded border block font-mono">
                    {selected.instanceId}
                  </code>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Area</p>
                  <p className="font-bold text-green-700 text-lg">
                    {parseFloat(selected.areaAcres || 0).toFixed(2)} acres
                  </p>
                </div>
                {selected.id && (
                  <Button asChild size="sm" className="w-full bg-green-700 hover:bg-green-800">
                    <Link href={`/dashboard/instances/${selected.id}`}>
                      <ExternalLink className="mr-2 h-3.5 w-3.5" />
                      Full Details + Trees
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-5 text-center text-sm text-muted-foreground">
                <Navigation className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>Click on a plot boundary to see details</p>
              </CardContent>
            </Card>
          )}

          {/* How to get real data */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-amber-800">📱 Real GPS Data Kaise Add Karein</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-amber-700 space-y-1.5">
              <p><b>Khet boundary:</b></p>
              <p>1. SW Maps app (Android) se field mein trace karo</p>
              <p>2. GeoJSON export → Plot edit mein upload</p>
              <p className="mt-2"><b>Trees GPS:</b></p>
              <p>1. Tree lagaate waqt GPS note karo</p>
              <p>2. Tree record mein lat/lng enter karo</p>
              <p className="mt-2 text-amber-600 font-medium">
                Desktop pe: FIELD-GPS-GUIDE.txt dekho
              </p>
            </CardContent>
          </Card>

          {/* All Plots List */}
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">All Plots ({totalPlots})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-56 overflow-y-auto divide-y">
                {totalPlots === 0 && (
                  <p className="text-xs text-muted-foreground p-4 text-center">
                    No plots with GPS boundaries yet
                  </p>
                )}
                {(geoData?.features || []).map((f: any) => (
                  <div
                    key={f.properties.id}
                    className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-green-50 transition-colors text-sm ${
                      selected?.id === f.properties.id ? "bg-green-50 border-l-2 border-green-600" : ""
                    }`}
                    onClick={() => setSelected(f.properties)}
                  >
                    <div className="h-2 w-2 rounded-full bg-green-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate">{f.properties.farmerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {parseFloat(f.properties.areaAcres || 0).toFixed(1)} acres
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
