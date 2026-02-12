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
} from "recharts"
import { TrendingUp, Users, BarChart3 } from "lucide-react"
import type { OpportunityStatus, ActivityType } from "@/lib/types"

const ACTIVITY_COLORS = "#2E7D32"
const PIE_COLORS = ["#2E7D32", "#E6A817", "#1565C0"]

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
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Raporty</h1>
        <p className="text-sm text-muted-foreground">Analiza danych sprzedazowych</p>
      </div>

      {/* Charts grid - single col on mobile, 2 cols on desktop */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Activity by type - horizontal bar */}
        <Card>
          <CardHeader className="pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <BarChart3 className="h-4 w-4 text-primary" />
              Aktywnosci wedlug typu
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4 sm:px-6 sm:pb-6">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activityByType} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => [value, "Ilosc"]} />
                <Bar dataKey="count" fill={ACTIVITY_COLORS} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Clients by status - pie */}
        <Card>
          <CardHeader className="pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Users className="h-4 w-4 text-primary" />
              Klienci wedlug statusu
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4 sm:px-6 sm:pb-6">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={clientsByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
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
          <CardHeader className="pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Pipeline wedlug etapu
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4 sm:px-6 sm:pb-6">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pipelineByStage} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, angle: -30 }} height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => [value, "Klientow"]} />
                <Bar dataKey="count" fill="#1565C0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Value by segment - vertical bar */}
        <Card>
          <CardHeader className="pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Users className="h-4 w-4 text-primary" />
              Wartosc wedlug segmentu
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4 sm:px-6 sm:pb-6">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={valueBySegment} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => [`${value.toLocaleString("pl-PL")} zl`, "Wartosc"]} />
                <Bar dataKey="value" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Segment summary cards */}
      <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-3">
        {segmentSummary.map((s) => (
          <Card key={s.segment}>
            <CardContent className="flex items-center justify-between p-3 sm:p-4">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Segment {s.segment}</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground truncate">{s.value.toLocaleString("pl-PL")} zl</p>
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
