"use client"

import dynamic from "next/dynamic"

const MapContent = dynamic(() => import("@/components/map-content"), { ssr: false })

export default function MapPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="p-4 lg:p-6 pb-0 lg:pb-0">
        <h1 className="text-2xl font-bold text-foreground">Mapa</h1>
        <p className="text-sm text-muted-foreground">Lokalizacja klientow</p>
      </div>
      <div className="flex-1 p-4 lg:p-6 pt-3 lg:pt-3">
        <MapContent />
      </div>
    </div>
  )
}
