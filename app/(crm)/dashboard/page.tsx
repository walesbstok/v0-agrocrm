"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCRMStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SegmentBadge } from "@/components/segment-badge"
import { ClientFormDialog } from "@/components/client-form-dialog"
import { ActivityFormDialog } from "@/components/activity-form-dialog"
import {
  Users,
  TrendingUp,
  CalendarDays,
  Plus,
  CalendarPlus,
  ArrowRight,
  DollarSign,
  Target,
  Activity as ActivityIcon,
} from "lucide-react"
import { format, isToday, isTomorrow, isFuture, parseISO } from "date-fns"

export default function DashboardPage() {
  const router = useRouter()
  const { clients, activities } = useCRMStore()
  const [clientDialog, setClientDialog] = useState(false)
  const [activityDialog, setActivityDialog] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const stats = useMemo(() => {
    const totalClients = clients.length
    const activeClients = clients.filter((c) => c.status_klienta === "Aktywny").length
    const totalValue = clients.reduce((sum, c) => sum + c.potencjal_wartosc, 0)
    const segA = clients.filter((c) => c.segment === "A")
    const segB = clients.filter((c) => c.segment === "B")
    const segC = clients.filter((c) => c.segment === "C")
    const segAVal = segA.reduce((s, c) => s + c.potencjal_wartosc, 0)
    const segBVal = segB.reduce((s, c) => s + c.potencjal_wartosc, 0)
    const segCVal = segC.reduce((s, c) => s + c.potencjal_wartosc, 0)
    const plannedActivities = activities.filter((a) => a.status === "planowana").length
    const upcomingActivities = activities
      .filter((a) => a.status === "planowana" && isFuture(parseISO(a.termin)))
      .sort((a, b) => new Date(a.termin).getTime() - new Date(b.termin).getTime())
      .slice(0, 5)

    return {
      totalClients,
      activeClients,
      totalValue,
      segA: { count: segA.length, value: segAVal },
      segB: { count: segB.length, value: segBVal },
      segC: { count: segC.length, value: segCVal },
      plannedActivities,
      upcomingActivities,
    }
  }, [clients, activities])

  const pipelineSummary = useMemo(() => {
    const stages = ["Nowa", "Kwalifikacja", "Oferta", "Negocjacje", "Wygrana", "Przegrana"] as const
    return stages.map((s) => ({
      name: s,
      count: clients.filter((c) => c.status_szansy === s).length,
    }))
  }, [clients])

  function formatCurrency(val: number) {
    return val.toLocaleString("pl-PL") + " zl"
  }

  function getActivityDateLabel(dateStr: string) {
    const d = parseISO(dateStr)
    if (isToday(d)) return "Dzis"
    if (isTomorrow(d)) return "Jutro"
    return format(d, "dd.MM.yyyy")
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header with actions */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Przeglad aktywnosci i sprzedazy</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button variant="outline" onClick={() => setActivityDialog(true)} className="gap-2">
            <CalendarPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Aktywnosc</span>
          </Button>
          <Button onClick={() => setClientDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Klient</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards - stacked on mobile, 2-col on sm, 4-col on lg */}
      <div className="mb-4 grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push("/clients")}
        >
          <CardContent className="flex items-center gap-3 p-3 sm:p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Klienci</p>
              <p className="text-xl font-bold text-foreground sm:text-2xl">{stats.totalClients}</p>
              <p className="text-[10px] text-muted-foreground sm:text-xs">{stats.activeClients} aktywnych</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push("/reports")}
        >
          <CardContent className="flex items-center gap-3 p-3 sm:p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Pipeline</p>
              <p className="text-lg font-bold text-foreground sm:text-2xl truncate">{formatCurrency(stats.totalValue)}</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push("/pipeline")}
        >
          <CardContent className="flex items-center gap-3 p-3 sm:p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Otwarte</p>
              <p className="text-xl font-bold text-foreground sm:text-2xl">{clients.filter((c) => !["Wygrana", "Przegrana"].includes(c.status_szansy)).length}</p>
              <p className="text-[10px] text-muted-foreground sm:text-xs">szans</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => router.push("/calendar")}
        >
          <CardContent className="flex items-center gap-3 p-3 sm:p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
              <ActivityIcon className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Planowane</p>
              <p className="text-xl font-bold text-foreground sm:text-2xl">{stats.plannedActivities}</p>
              <p className="text-[10px] text-muted-foreground sm:text-xs">aktywnosci</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two-column grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Upcoming Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <CalendarDays className="h-4 w-4 text-primary" />
              Nadchodzace aktywnosci
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push("/calendar")} className="gap-1 text-xs h-8">
              <span className="hidden sm:inline">Kalendarz</span> <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            {stats.upcomingActivities.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Brak zaplanowanych aktywnosci</p>
            ) : (
              <div className="space-y-2">
                {stats.upcomingActivities.map((a) => {
                  const client = clients.find((c) => c.id === a.clientId)
                  return (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-2.5 sm:p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => client && router.push(`/clients/${client.id}`)}
                    >
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                        {mounted ? format(parseISO(a.termin), "dd") : "--"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-foreground truncate">{a.tytul}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{client?.nazwa_firmy} | {mounted ? `${getActivityDateLabel(a.termin)} ${format(parseISO(a.termin), "HH:mm")}` : "..."}</p>
                      </div>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] sm:text-xs text-muted-foreground shrink-0">{a.typ}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Pipeline
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push("/pipeline")} className="gap-1 text-xs h-8">
              <span className="hidden sm:inline">Kanban</span> <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="space-y-1.5 sm:space-y-2">
              {pipelineSummary.map((s) => (
                <div key={s.name} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                  <span className="text-xs sm:text-sm text-foreground">{s.name}</span>
                  <span className="text-xs sm:text-sm font-bold text-foreground">{s.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Segment Cards */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle className="text-sm sm:text-base">Segmentacja klientow</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
              {([
                { seg: "A" as const, ...stats.segA },
                { seg: "B" as const, ...stats.segB },
                { seg: "C" as const, ...stats.segC },
              ]).map((s) => (
                <div
                  key={s.seg}
                  className="flex items-center justify-between rounded-lg border border-border p-3 sm:p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => router.push(`/clients?segment=${s.seg}`)}
                >
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Segment {s.seg}</p>
                    <p className="text-lg sm:text-xl font-bold text-foreground truncate">{formatCurrency(s.value)}</p>
                    <p className="text-xs text-muted-foreground">{s.count} klientow</p>
                  </div>
                  <SegmentBadge segment={s.seg} size="lg" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <ClientFormDialog open={clientDialog} onOpenChange={setClientDialog} />
      <ActivityFormDialog open={activityDialog} onOpenChange={setActivityDialog} />
    </div>
  )
}
