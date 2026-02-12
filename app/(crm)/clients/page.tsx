"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useCRMStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SegmentBadge } from "@/components/segment-badge"
import { StatusBadge } from "@/components/status-badge"
import { ClientFormDialog } from "@/components/client-form-dialog"
import { ActivityFormDialog } from "@/components/activity-form-dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import {
  Search,
  Phone,
  Mail,
  Navigation,
  Eye,
  Pencil,
  Trash2,
  CalendarPlus,
  Plus,
  Users,
  MoreVertical,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Client } from "@/lib/types"

export default function ClientsPage() {
  const router = useRouter()
  const { clients, deleteClient } = useCRMStore()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [segmentFilter, setSegmentFilter] = useState<string>("all")
  const [clientDialog, setClientDialog] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [activityDialog, setActivityDialog] = useState(false)
  const [activityClientId, setActivityClientId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        c.nazwa_firmy.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.miasto.toLowerCase().includes(q) ||
        c.telefon.includes(q)
      const matchesStatus = statusFilter === "all" || c.status_klienta === statusFilter
      const matchesSegment = segmentFilter === "all" || c.segment === segmentFilter
      return matchesSearch && matchesStatus && matchesSegment
    })
  }, [clients, search, statusFilter, segmentFilter])

  function getGoogleMapsUrl(c: Client) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${c.ulica}, ${c.kod_pocztowy} ${c.miasto}, ${c.kraj}`)}`
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Klienci</h1>
          <p className="text-sm text-muted-foreground">Zarzadzaj baza klientow</p>
        </div>
        <Button onClick={() => { setEditingClient(null); setClientDialog(true) }} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Dodaj klienta
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Szukaj po nazwie, email, miescie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Wszystkie statusy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie statusy</SelectItem>
              <SelectItem value="Aktywny">Aktywny</SelectItem>
              <SelectItem value="Prospekt">Prospekt</SelectItem>
              <SelectItem value="Utracony">Utracony</SelectItem>
            </SelectContent>
          </Select>
          <Select value={segmentFilter} onValueChange={setSegmentFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Wszystkie segmenty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie segmenty</SelectItem>
              <SelectItem value="A">Segment A</SelectItem>
              <SelectItem value="B">Segment B</SelectItem>
              <SelectItem value="C">Segment C</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0" onClick={() => router.push(`/clients/${c.id}`)}>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-foreground">{c.nazwa_firmy}</h3>
                  <SegmentBadge segment={c.segment} />
                  <StatusBadge status={c.status_klienta} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{c.miasto}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label="Wiecej opcji">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/clients/${c.id}`)}>
                    <Eye className="mr-2 h-4 w-4" /> Szczegoly
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setEditingClient(c); setClientDialog(true) }}>
                    <Pencil className="mr-2 h-4 w-4" /> Edytuj
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(c.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Usun
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{c.email}</p>
            <div className="flex items-center gap-2">
              <a
                href={getGoogleMapsUrl(c)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Navigation className="h-3.5 w-3.5" />
                Nawiguj
              </a>
              <button
                onClick={() => { setActivityClientId(c.id); setActivityDialog(true) }}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Aktywnosc
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-lg border border-border bg-card py-12 text-center text-muted-foreground">
            <Users className="mx-auto mb-2 h-8 w-8" />
            <p>Brak klientow pasujacych do filtrow</p>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Klient</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Kontakt</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Nawiguj</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Segment</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => router.push(`/clients/${c.id}`)}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{c.nazwa_firmy}</div>
                  <div className="text-xs text-muted-foreground">{c.miasto}</div>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <a href={`tel:${c.telefon}`} className="text-secondary hover:underline">{c.telefon}</a>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs mt-0.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <a href={`mailto:${c.email}`} className="text-secondary hover:underline">{c.email}</a>
                  </div>
                </td>
                <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={getGoogleMapsUrl(c)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md p-1.5 text-secondary hover:bg-muted transition-colors"
                    aria-label={`Nawiguj do ${c.nazwa_firmy}`}
                  >
                    <Navigation className="h-4 w-4" />
                  </a>
                </td>
                <td className="px-4 py-3 text-center">
                  <SegmentBadge segment={c.segment} />
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={c.status_klienta} />
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => router.push(`/clients/${c.id}`)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      aria-label="Szczegoly"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { setEditingClient(c); setClientDialog(true) }}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      aria-label="Edytuj"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(c.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-destructive transition-colors"
                      aria-label="Usun"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { setActivityClientId(c.id); setActivityDialog(true) }}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      aria-label="Dodaj aktywnosc"
                    >
                      <CalendarPlus className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  <Users className="mx-auto mb-2 h-8 w-8" />
                  <p>Brak klientow pasujacych do filtrow</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ClientFormDialog open={clientDialog} onOpenChange={setClientDialog} editClient={editingClient} />
      <ActivityFormDialog open={activityDialog} onOpenChange={setActivityDialog} prefillClientId={activityClientId} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Usunac klienta?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta operacja jest nieodwracalna. Usuniesz klienta i wszystkie jego aktywnosci.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteId) deleteClient(deleteId); setDeleteId(null) }}
            >
              Usun
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
