"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import { useCRMStore } from "@/lib/store"
import { SegmentBadge } from "@/components/segment-badge"
import { Button } from "@/components/ui/button"
import { Navigation, Eye, Phone, Mail, Building2 } from "lucide-react"
import type { Segment } from "@/lib/types"
import "leaflet/dist/leaflet.css"

function createSegmentIcon(segment: Segment): L.DivIcon {
  const colors: Record<Segment, string> = {
    A: "#2E7D32",
    B: "#1565C0",
    C: "#E6A817",
  }
  return L.divIcon({
    html: `<div style="
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: ${colors[segment]};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">${segment}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  })
}

function FitBoundsOnLoad({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap()
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 7 })
    }
  }, [map, bounds])
  return null
}

export default function MapContent() {
  const router = useRouter()
  const { clients } = useCRMStore()

  const geoClients = useMemo(
    () => clients.filter((c) => c.geo_lat !== null && c.geo_lng !== null),
    [clients]
  )

  const bounds = useMemo(() => {
    if (geoClients.length === 0) return null
    if (geoClients.length === 1) {
      const c = geoClients[0]
      return L.latLngBounds(
        [c.geo_lat! - 1, c.geo_lng! - 1],
        [c.geo_lat! + 1, c.geo_lng! + 1]
      )
    }
    return L.latLngBounds(geoClients.map((c) => [c.geo_lat!, c.geo_lng!] as [number, number]))
  }, [geoClients])

  function getGoogleMapsUrl(c: typeof clients[0]) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${c.ulica}, ${c.kod_pocztowy} ${c.miasto}, ${c.kraj}`)}`
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="relative flex-1 overflow-hidden rounded-lg border border-border">
        <MapContainer
          center={[51.9, 19.1]}
          zoom={6}
          className="h-full w-full"
          style={{ minHeight: "400px", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBoundsOnLoad bounds={bounds} />
          {geoClients.map((client) => (
            <Marker
              key={client.id}
              position={[client.geo_lat!, client.geo_lng!]}
              icon={createSegmentIcon(client.segment)}
            >
              <Popup maxWidth={280} className="crm-popup">
                <div className="space-y-2 p-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-semibold text-foreground text-sm">{client.nazwa_firmy}</span>
                  </div>
                  <div className="inline-flex">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      client.segment === "A" ? "bg-emerald-100 text-emerald-800" :
                      client.segment === "B" ? "bg-blue-100 text-blue-800" :
                      "bg-amber-100 text-amber-800"
                    }`}>
                      Segment {client.segment}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span>&#128205;</span>
                      <span>{client.ulica}, {client.miasto}</span>
                    </div>
                    {client.telefon && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3" />
                        <a href={`tel:${client.telefon}`} className="text-secondary hover:underline">{client.telefon}</a>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${client.email}`} className="text-secondary hover:underline">{client.email}</a>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <a
                      href={getGoogleMapsUrl(client)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Navigation className="h-3 w-3" />
                      Nawiguj
                    </a>
                    <button
                      onClick={() => router.push(`/clients/${client.id}`)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      Szczegoly
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card px-4 py-3">
        <span className="text-sm font-medium text-foreground">Legenda:</span>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">A</div>
          <span className="text-sm text-muted-foreground">{"Segment A (> 200k PLN)"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">B</div>
          <span className="text-sm text-muted-foreground">Segment B (50-200k PLN)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">C</div>
          <span className="text-sm text-muted-foreground">{"Segment C (< 50k PLN)"}</span>
        </div>
      </div>
    </div>
  )
}
