"use client"

import dynamic from "next/dynamic"

const MapContent = dynamic(() => import("@/components/map-content"), { ssr: false })

export default function MapPage() {
  return (
    <div className="flex h-[calc(100vh-56px)] md:h-full flex-col">
      <div className="px-4 pt-4 pb-2 lg:px-6 lg:pt-6">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Mapa</h1>
        <p className="text-sm text-muted-foreground">Lokalizacja klientow</p>
      </div>
      <div className="flex-1 px-4 pb-4 lg:px-6 lg:pb-6 min-h-0">
        <MapContent />
      </div>
    </div>
  )
}
