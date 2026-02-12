"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCRMStore } from "@/lib/store"
import type { ActivityType, ActivityStatus, ActivityResult } from "@/lib/types"
import { DEFAULT_ACTIVITY_TITLES } from "@/lib/types"

interface ActivityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prefillClientId?: string | null
}

export function ActivityFormDialog({ open, onOpenChange, prefillClientId }: ActivityFormDialogProps) {
  const { addActivity, clients } = useCRMStore()

  const [form, setForm] = useState({
    clientId: "",
    typ: "Telefon" as ActivityType,
    tytul: DEFAULT_ACTIVITY_TITLES["Telefon"],
    opis: "",
    termin: "",
    status: "planowana" as ActivityStatus,
    rezultat: "brak" as ActivityResult,
    szansa_prawdopodobienstwo: 50,
    wartosc_oferty: 0,
  })

  useEffect(() => {
    if (open) {
      const now = new Date()
      const localDatetime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      setForm({
        clientId: prefillClientId || "",
        typ: "Telefon",
        tytul: DEFAULT_ACTIVITY_TITLES["Telefon"],
        opis: "",
        termin: localDatetime,
        status: "planowana",
        rezultat: "brak",
        szansa_prawdopodobienstwo: 50,
        wartosc_oferty: 0,
      })
    }
  }, [open, prefillClientId])

  function handleTypeChange(typ: ActivityType) {
    setForm((prev) => ({
      ...prev,
      typ,
      tytul: DEFAULT_ACTIVITY_TITLES[typ],
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.clientId || !form.termin) return

    addActivity({
      clientId: form.clientId,
      typ: form.typ,
      tytul: form.tytul,
      opis: form.opis,
      termin: new Date(form.termin).toISOString(),
      status: form.status,
      rezultat: form.rezultat,
      ...(form.typ === "Oferta"
        ? {
            szansa_prawdopodobienstwo: form.szansa_prawdopodobienstwo,
            wartosc_oferty: form.wartosc_oferty,
          }
        : {}),
    })
    onOpenChange(false)
  }

  const isWizyta = form.typ === "Wizyta"
  const isOferta = form.typ === "Oferta"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dodaj aktywnosc</DialogTitle>
          <DialogDescription>Zaplanuj nowa aktywnosc dla klienta</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="act-client">Klient *</Label>
            <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
              <SelectTrigger id="act-client"><SelectValue placeholder="Wybierz klienta" /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nazwa_firmy}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="act-type">Typ aktywnosci</Label>
            <Select value={form.typ} onValueChange={(v) => handleTypeChange(v as ActivityType)}>
              <SelectTrigger id="act-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Telefon">Telefon</SelectItem>
                <SelectItem value="Spotkanie">Spotkanie</SelectItem>
                <SelectItem value="E-mail">E-mail</SelectItem>
                <SelectItem value="Wizyta">Wizyta</SelectItem>
                <SelectItem value="Oferta">Oferta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="act-title">Tytul</Label>
            <Input id="act-title" value={form.tytul} readOnly={isWizyta} onChange={(e) => setForm({ ...form, tytul: e.target.value })} className={isWizyta ? "bg-muted" : ""} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="act-termin">Termin *</Label>
            <Input id="act-termin" type="datetime-local" value={form.termin} onChange={(e) => setForm({ ...form, termin: e.target.value })} />
          </div>

          {!isWizyta && (
            <div className="space-y-1.5">
              <Label htmlFor="act-opis">Opis</Label>
              <Textarea id="act-opis" value={form.opis} onChange={(e) => setForm({ ...form, opis: e.target.value })} rows={2} />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="act-status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ActivityStatus })}>
                <SelectTrigger id="act-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planowana">Planowana</SelectItem>
                  <SelectItem value="zrealizowana">Zrealizowana</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="act-result">Rezultat</Label>
              <Select value={form.rezultat} onValueChange={(v) => setForm({ ...form, rezultat: v as ActivityResult })}>
                <SelectTrigger id="act-result"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="brak">Brak</SelectItem>
                  <SelectItem value="wygrana">Wygrana</SelectItem>
                  <SelectItem value="przegrana">Przegrana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isOferta && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="act-szansa">Szansa (%)</Label>
                <Input id="act-szansa" type="number" min={0} max={100} value={form.szansa_prawdopodobienstwo} onChange={(e) => setForm({ ...form, szansa_prawdopodobienstwo: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="act-wartosc">Wartosc oferty (PLN)</Label>
                <Input id="act-wartosc" type="number" min={0} value={form.wartosc_oferty} onChange={(e) => setForm({ ...form, wartosc_oferty: Number(e.target.value) })} />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Anuluj</Button>
            <Button type="submit" disabled={!form.clientId || !form.termin}>Dodaj aktywnosc</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
