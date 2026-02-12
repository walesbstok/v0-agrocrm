"use client"

import { useMemo } from "react"
import { useCRMStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SegmentBadge } from "@/components/segment-badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { TrendingUp, Users, BarChart3 } from "lucide-react"
import type { OpportunityStatus, ActivityType } from "@/lib/types"

const ACTIVITY_COLORS = "#2E7D32"
const PIE_COLORS = ["#2E7D32", "#E6A817", "#1565C0"]
const SEGMENT_COLORS = { A: "#7C3AED", B: "#7C3AED", C: "#7C3AED" }

export default function ReportsPage() {
  const { clients, activities } = useCRMStore()

  const activityByType = useMemo(() => {
    const types: ActivityType[] = ["Spotkanie", "Telefon", "Oferta", "Wizyta", "E-mail"]
    return types.map((t) => ({
      name: t,
      count: activities.filter((a) => a.typ === t).length,
    }))
  }, [activities])

  const clientsByStatus = useMemo(() => {
    const statuses = ["Aktywny", "Prospekt", "Utracony"] as const
    return statuses.map((s) => ({
      name: s === "Utracony" ? "Utracony" : s,
      value: clients.filter((c) => c.status_klienta === s).length,
    }))
  }, [clients])

  const pipelineByStage = useMemo(() => {
    const stages: OpportunityStatus[] = ["Nowa", "Oferta", "Negocjacje", "Wygrana", "Kwalifikacja", "Przegrana"]
    return stages.map((s) => ({
      name: s,
      count: clients.filter((c) => c.status_szansy === s).length,
    }))
  }, [clients])

  const valueBySegment = useMemo(() => {
    return [
      { name: "Segment C", value: clients.filter((c) => c.segment === "C").reduce((s, c) => s + c.potencjal_wartosc, 0) },
      { name: "Segment B", value: clients.filter((c) => c.segment === "B").reduce((s, c) => s + c.potencjal_wartosc, 0) },
      { name: "Segment A", value: clients.filter((c) => c.segment === "A").reduce((s, c) => s + c.potencjal_wartosc, 0) },
    ]
  }, [clients])

  const segmentSummary = useMemo(() => {
    return (["C", "B", "A"] as const).map((seg) => {
      const segClients = clients.filter((c) => c.segment === seg)
      return {
        segment: seg,
        count: segClients.length,
        value: segClients.reduce((s, c) => s + c.potencjal_wartosc, 0),
      }
    })
  }, [clients])

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Raporty</h1>
        <p className="text-sm text-muted-foreground">Analiza danych sprzedazowych</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Activity by type - horizontal bar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-primary" />
              Aktywnosci wedlug typu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={activityByType} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [value, "Ilosc"]} />
                <Bar dataKey="count" fill={ACTIVITY_COLORS} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Clients by status - pie */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              Klienci wedlug statusu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={clientsByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {clientsByStatus.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value, "Klientow"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline by stage - vertical bar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Pipeline wedlug etapu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pipelineByStage} margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, angle: -30 }} height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value: number) => [value, "Klientow"]} />
                <Bar dataKey="count" fill="#1565C0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Value by segment - vertical bar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              Wartosc wedlug segmentu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={valueBySegment} margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [`${value.toLocaleString("pl-PL")} zl`, "Wartosc"]} />
                <Bar dataKey="value" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Segment summary cards */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {segmentSummary.map((s) => (
          <Card key={s.segment}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Segment {s.segment}</p>
                <p className="text-2xl font-bold text-foreground">{s.value.toLocaleString("pl-PL")} zl</p>
                <p className="text-xs text-muted-foreground">{s.count} klientow</p>
              </div>
              <SegmentBadge segment={s.segment} size="lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
