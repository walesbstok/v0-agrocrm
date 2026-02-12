"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useCRMStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SegmentBadge } from "@/components/segment-badge"
import { StatusBadge } from "@/components/status-badge"
import { ClientFormDialog } from "@/components/client-form-dialog"
import { ActivityFormDialog } from "@/components/activity-form-dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Navigation,
  Pencil,
  Trash2,
  CalendarPlus,
  Clock,
  TrendingUp,
  FileText,
} from "lucide-react"
import { format } from "date-fns"

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { clients, activities, deleteClient } = useCRMStore()

  const client = clients.find((c) => c.id === id)
  const clientActivities = activities
    .filter((a) => a.clientId === id)
    .sort((a, b) => new Date(b.termin).getTime() - new Date(a.termin).getTime())

  const [editDialog, setEditDialog] = useState(false)
  const [activityDialog, setActivityDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)

  if (!client) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">Klient nie znaleziony</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/clients")}>
            Powrot do listy
          </Button>
        </div>
      </div>
    )
  }

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${client.ulica}, ${client.kod_pocztowy} ${client.miasto}, ${client.kraj}`)}`

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/clients")} aria-label="Powrot" className="shrink-0 -ml-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-foreground sm:text-2xl">{client.nazwa_firmy}</h1>
              <SegmentBadge segment={client.segment} size="lg" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">{client.miasto} | NIP: {client.nip}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button variant="outline" size="sm" asChild>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="gap-1.5">
              <Navigation className="h-3.5 w-3.5" />
              Nawiguj
            </a>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setActivityDialog(true)}>
            <CalendarPlus className="h-3.5 w-3.5" />
            Aktywnosc
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditDialog(true)}>
            <Pencil className="h-3.5 w-3.5" />
            Edytuj
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:bg-red-50" onClick={() => setDeleteDialog(true)}>
            <Trash2 className="h-3.5 w-3.5" />
            Usun
          </Button>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Company info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-primary" />
              Dane firmy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Adres</p>
                <p className="font-medium text-foreground">{client.ulica}</p>
                <p className="font-medium text-foreground">{client.kod_pocztowy} {client.miasto}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Wojewodztwo</p>
                <p className="font-medium text-foreground">{client.wojewodztwo || "—"}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${client.telefon}`} className="text-secondary hover:underline">{client.telefon || "—"}</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${client.email}`} className="text-secondary hover:underline">{client.email}</a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Value */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Status i wartosc
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Status klienta</p>
                <div className="mt-1"><StatusBadge status={client.status_klienta} /></div>
              </div>
              <div>
                <p className="text-muted-foreground">Status szansy</p>
                <p className="font-medium text-foreground">{client.status_szansy}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Potencjal</p>
                <p className="text-lg font-bold text-foreground">{client.potencjal_wartosc.toLocaleString("pl-PL")} zl</p>
              </div>
              <div>
                <p className="text-muted-foreground">Segment</p>
                <div className="mt-1 flex items-center gap-2">
                  <SegmentBadge segment={client.segment} size="lg" />
                  <span className="text-foreground font-medium">
                    {client.segment === "A" ? "> 200k PLN" : client.segment === "B" ? "50-200k PLN" : "< 50k PLN"}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Ostatni kontakt</p>
                <p className="font-medium text-foreground">
                  {client.ostatni_kontakt ? format(new Date(client.ostatni_kontakt), "dd.MM.yyyy HH:mm") : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Nastepna akcja</p>
                <p className="font-medium text-foreground">
                  {client.data_nastepnej_akcji ? format(new Date(client.data_nastepnej_akcji), "dd.MM.yyyy HH:mm") : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {client.uwagi && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Uwagi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">{client.uwagi}</p>
            </CardContent>
          </Card>
        )}

        {/* Activities */}
        <Card className={client.uwagi ? "" : "lg:col-span-2"}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Aktywnosci ({clientActivities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientActivities.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Brak aktywnosci</p>
            ) : (
              <div className="space-y-3">
                {clientActivities.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${a.status === "zrealizowana" ? "bg-emerald-500" : "bg-amber-500"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-sm">{a.tytul}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{a.typ}</span>
                      </div>
                      {a.opis && <p className="mt-0.5 text-xs text-muted-foreground">{a.opis}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {format(new Date(a.termin), "dd.MM.yyyy HH:mm")} | {a.status}
                        {a.rezultat !== "brak" && ` | ${a.rezultat}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ClientFormDialog open={editDialog} onOpenChange={setEditDialog} editClient={client} />
      <ActivityFormDialog open={activityDialog} onOpenChange={setActivityDialog} prefillClientId={client.id} />

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunac klienta?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Usuniesz klienta &quot;{client.nazwa_firmy}&quot; i wszystkie jego aktywnosci.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { deleteClient(client.id); router.push("/clients") }}
            >
              Usun
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
