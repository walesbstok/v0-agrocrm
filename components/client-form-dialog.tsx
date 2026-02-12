"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCRMStore } from "@/lib/store"
import type { Client, ClientStatus, OpportunityStatus } from "@/lib/types"

interface ClientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editClient?: Client | null
}

export function ClientFormDialog({ open, onOpenChange, editClient }: ClientFormDialogProps) {
  const { addClient, updateClient } = useCRMStore()

  const [form, setForm] = useState({
    nazwa_firmy: "",
    nip: "",
    email: "",
    telefon: "",
    ulica: "",
    kod_pocztowy: "",
    miasto: "",
    wojewodztwo: "",
    kraj: "PL",
    status_klienta: "Prospekt" as ClientStatus,
    status_szansy: "Nowa" as OpportunityStatus,
    potencjal_wartosc: 0,
    uwagi: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editClient) {
      setForm({
        nazwa_firmy: editClient.nazwa_firmy,
        nip: editClient.nip,
        email: editClient.email,
        telefon: editClient.telefon,
        ulica: editClient.ulica,
        kod_pocztowy: editClient.kod_pocztowy,
        miasto: editClient.miasto,
        wojewodztwo: editClient.wojewodztwo,
        kraj: editClient.kraj,
        status_klienta: editClient.status_klienta,
        status_szansy: editClient.status_szansy,
        potencjal_wartosc: editClient.potencjal_wartosc,
        uwagi: editClient.uwagi,
      })
    } else {
      setForm({
        nazwa_firmy: "",
        nip: "",
        email: "",
        telefon: "",
        ulica: "",
        kod_pocztowy: "",
        miasto: "",
        wojewodztwo: "",
        kraj: "PL",
        status_klienta: "Prospekt",
        status_szansy: "Nowa",
        potencjal_wartosc: 0,
        uwagi: "",
      })
    }
    setErrors({})
  }, [editClient, open])

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.nazwa_firmy.trim()) e.nazwa_firmy = "Wymagane"
    if (!/^\d{10}$/.test(form.nip)) e.nip = "NIP musi miec 10 cyfr"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Niepoprawny email"
    if (!form.ulica.trim()) e.ulica = "Wymagane"
    if (!form.kod_pocztowy.trim()) e.kod_pocztowy = "Wymagane"
    if (!form.miasto.trim()) e.miasto = "Wymagane"
    if (form.potencjal_wartosc < 0) e.potencjal_wartosc = "Wartosc >= 0"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    if (editClient) {
      updateClient(editClient.id, {
        ...form,
        geo_lat: editClient.geo_lat,
        geo_lng: editClient.geo_lng,
      })
    } else {
      addClient({
        ...form,
        ostatni_kontakt: null,
        data_nastepnej_akcji: null,
        geo_lat: null,
        geo_lng: null,
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editClient ? "Edytuj klienta" : "Dodaj klienta"}</DialogTitle>
          <DialogDescription>
            {editClient ? "Zaktualizuj dane klienta" : "Wypelnij formularz, aby dodac nowego klienta"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="nazwa_firmy">Nazwa firmy *</Label>
              <Input id="nazwa_firmy" value={form.nazwa_firmy} onChange={(e) => setForm({ ...form, nazwa_firmy: e.target.value })} />
              {errors.nazwa_firmy && <p className="text-xs text-destructive">{errors.nazwa_firmy}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nip">NIP *</Label>
              <Input id="nip" value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10 cyfr" />
              {errors.nip && <p className="text-xs text-destructive">{errors.nip}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefon">Telefon</Label>
              <Input id="telefon" value={form.telefon} onChange={(e) => setForm({ ...form, telefon: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ulica">Ulica *</Label>
              <Input id="ulica" value={form.ulica} onChange={(e) => setForm({ ...form, ulica: e.target.value })} />
              {errors.ulica && <p className="text-xs text-destructive">{errors.ulica}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kod_pocztowy">Kod pocztowy *</Label>
              <Input id="kod_pocztowy" value={form.kod_pocztowy} onChange={(e) => setForm({ ...form, kod_pocztowy: e.target.value })} />
              {errors.kod_pocztowy && <p className="text-xs text-destructive">{errors.kod_pocztowy}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="miasto">Miasto *</Label>
              <Input id="miasto" value={form.miasto} onChange={(e) => setForm({ ...form, miasto: e.target.value })} />
              {errors.miasto && <p className="text-xs text-destructive">{errors.miasto}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wojewodztwo">Wojewodztwo</Label>
              <Input id="wojewodztwo" value={form.wojewodztwo} onChange={(e) => setForm({ ...form, wojewodztwo: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status_klienta">Status klienta</Label>
              <Select value={form.status_klienta} onValueChange={(v) => setForm({ ...form, status_klienta: v as ClientStatus })}>
                <SelectTrigger id="status_klienta"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Prospekt">Prospekt</SelectItem>
                  <SelectItem value="Aktywny">Aktywny</SelectItem>
                  <SelectItem value="Utracony">Utracony</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status_szansy">Status szansy</Label>
              <Select value={form.status_szansy} onValueChange={(v) => setForm({ ...form, status_szansy: v as OpportunityStatus })}>
                <SelectTrigger id="status_szansy"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nowa">Nowa</SelectItem>
                  <SelectItem value="Kwalifikacja">Kwalifikacja</SelectItem>
                  <SelectItem value="Oferta">Oferta</SelectItem>
                  <SelectItem value="Negocjacje">Negocjacje</SelectItem>
                  <SelectItem value="Wygrana">Wygrana</SelectItem>
                  <SelectItem value="Przegrana">Przegrana</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="potencjal">Potencjal (PLN)</Label>
              <Input id="potencjal" type="number" min={0} value={form.potencjal_wartosc} onChange={(e) => setForm({ ...form, potencjal_wartosc: Number(e.target.value) })} />
              {errors.potencjal_wartosc && <p className="text-xs text-destructive">{errors.potencjal_wartosc}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="uwagi">Uwagi</Label>
            <Textarea id="uwagi" value={form.uwagi} onChange={(e) => setForm({ ...form, uwagi: e.target.value })} rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Anuluj</Button>
            <Button type="submit">{editClient ? "Zapisz" : "Dodaj klienta"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
