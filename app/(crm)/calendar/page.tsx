"use client"

import { useMemo, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useCRMStore } from "@/lib/store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ArrowRight } from "lucide-react"

const CalendarView = dynamic(() => import("@/components/calendar-view"), { ssr: false })

export default function CalendarPage() {
  const router = useRouter()
  const { activities, clients } = useCRMStore()
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)

  const events = useMemo(() => {
    return activities.map((a) => {
      const client = clients.find((c) => c.id === a.clientId)
      const colorMap: Record<string, string> = {
        "Telefon": "#1565C0",
        "Spotkanie": "#2E7D32",
        "E-mail": "#E65100",
        "Wizyta": "#6A1B9A",
        "Oferta": "#C62828",
      }
      return {
        id: a.id,
        title: `${a.tytul} - ${client?.nazwa_firmy || ""}`,
        start: a.termin,
        backgroundColor: colorMap[a.typ] || "#2E7D32",
        borderColor: colorMap[a.typ] || "#2E7D32",
        extendedProps: { activityId: a.id },
      }
    })
  }, [activities, clients])

  const activity = selectedActivity ? activities.find((a) => a.id === selectedActivity) : null
  const activityClient = activity ? clients.find((c) => c.id === activity.clientId) : null

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Kalendarz</h1>
        <p className="text-sm text-muted-foreground">Przegladaj zaplanowane aktywnosci</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-2 sm:p-4">
        <CalendarView events={events} onEventClick={(id: string) => setSelectedActivity(id)} />
      </div>

      <Dialog open={!!selectedActivity} onOpenChange={(o) => !o && setSelectedActivity(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{activity?.tytul}</DialogTitle>
            <DialogDescription>{activity?.typ}</DialogDescription>
          </DialogHeader>
          {activity && (
            <div className="space-y-3 text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Termin</p>
                  <p className="font-medium text-foreground">{format(new Date(activity.termin), "dd.MM.yyyy HH:mm")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium text-foreground capitalize">{activity.status}</p>
                </div>
              </div>
              {activity.opis && (
                <div>
                  <p className="text-muted-foreground">Opis</p>
                  <p className="text-foreground">{activity.opis}</p>
                </div>
              )}
              {activityClient && (
                <div>
                  <p className="text-muted-foreground">Klient</p>
                  <p className="font-medium text-foreground">{activityClient.nazwa_firmy}</p>
                </div>
              )}
              {activity.rezultat !== "brak" && (
                <div>
                  <p className="text-muted-foreground">Rezultat</p>
                  <p className="font-medium text-foreground capitalize">{activity.rezultat}</p>
                </div>
              )}
              {activityClient && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => { setSelectedActivity(null); router.push(`/clients/${activityClient.id}`) }}
                >
                  Karta klienta <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
