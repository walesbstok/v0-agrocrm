"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useCRMStore } from "@/lib/store"
import { SegmentBadge } from "@/components/segment-badge"
import { StatusBadge } from "@/components/status-badge"
import type { OpportunityStatus, Client } from "@/lib/types"
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useDroppable } from "@dnd-kit/core"
import { GripVertical } from "lucide-react"

const STAGES: OpportunityStatus[] = [
  "Nowa",
  "Kwalifikacja",
  "Oferta",
  "Negocjacje",
  "Wygrana",
  "Przegrana",
]

const stageColors: Record<OpportunityStatus, string> = {
  Nowa: "bg-slate-500",
  Kwalifikacja: "bg-blue-500",
  Oferta: "bg-amber-500",
  Negocjacje: "bg-purple-500",
  Wygrana: "bg-emerald-500",
  Przegrana: "bg-red-500",
}

function KanbanCard({ client, onClick }: { client: Client; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: client.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-border bg-card p-3 cursor-pointer hover:shadow-sm transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{client.nazwa_firmy}</p>
          <p className="text-xs text-muted-foreground">{client.miasto}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <SegmentBadge segment={client.segment} />
          <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground" aria-label="Przeciagnij">
            <GripVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">
          {client.potencjal_wartosc.toLocaleString("pl-PL")} zl
        </span>
        <StatusBadge status={client.status_klienta} />
      </div>
    </div>
  )
}

function KanbanColumn({ stage, clients, onCardClick }: { stage: OpportunityStatus; clients: Client[]; onCardClick: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })

  return (
    <div className="flex w-[240px] sm:w-[280px] shrink-0 flex-col rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 p-3 pb-2">
        <div className={`h-2.5 w-2.5 rounded-full ${stageColors[stage]}`} />
        <h3 className="text-sm font-semibold text-foreground">{stage}</h3>
        <span className="ml-auto rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {clients.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 overflow-y-auto p-2 pt-0 min-h-[200px] transition-colors ${isOver ? "bg-primary/5 rounded-b-lg" : ""}`}
      >
        {clients.map((c) => (
          <KanbanCard key={c.id} client={c} onClick={() => onCardClick(c.id)} />
        ))}
        {clients.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border">
            <p className="text-xs text-muted-foreground">Przeciagnij tutaj</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const router = useRouter()
  const { clients, updateClientOpportunityStatus } = useCRMStore()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const columns = useMemo(() => {
    return STAGES.map((stage) => ({
      stage,
      clients: clients.filter((c) => c.status_szansy === stage),
    }))
  }, [clients])

  const activeClient = activeId ? clients.find((c) => c.id === activeId) : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const clientId = active.id as string
    const newStage = over.id as OpportunityStatus
    if (STAGES.includes(newStage)) {
      updateClientOpportunityStatus(clientId, newStage)
    }
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Pipeline</h1>
        <p className="text-sm text-muted-foreground">Zarzadzaj szansami sprzedazowymi</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 180px)" }}>
          {columns.map((col) => (
            <KanbanColumn
              key={col.stage}
              stage={col.stage}
              clients={col.clients}
              onCardClick={(id) => router.push(`/clients/${id}`)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeClient ? (
            <div className="w-[264px] rounded-lg border border-border bg-card p-3 shadow-lg">
              <p className="text-sm font-medium text-foreground">{activeClient.nazwa_firmy}</p>
              <p className="text-xs text-muted-foreground">{activeClient.miasto}</p>
              <p className="mt-2 text-xs font-semibold text-foreground">
                {activeClient.potencjal_wartosc.toLocaleString("pl-PL")} zl
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
