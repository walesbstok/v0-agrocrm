// Client types
export type ClientStatus = "Prospekt" | "Aktywny" | "Utracony"
export type OpportunityStatus = "Nowa" | "Kwalifikacja" | "Oferta" | "Negocjacje" | "Wygrana" | "Przegrana"
export type Segment = "A" | "B" | "C"

export interface Client {
  id: string
  nazwa_firmy: string
  nip: string
  email: string
  telefon: string
  ulica: string
  kod_pocztowy: string
  miasto: string
  wojewodztwo: string
  kraj: string
  status_klienta: ClientStatus
  status_szansy: OpportunityStatus
  potencjal_wartosc: number
  segment: Segment
  ostatni_kontakt: string | null
  data_nastepnej_akcji: string | null
  geo_lat: number | null
  geo_lng: number | null
  uwagi: string
  createdAt: string
  updatedAt: string
}

// Activity types
export type ActivityType = "Telefon" | "Spotkanie" | "E-mail" | "Wizyta" | "Oferta"
export type ActivityStatus = "planowana" | "zrealizowana"
export type ActivityResult = "wygrana" | "przegrana" | "brak"

export interface Activity {
  id: string
  clientId: string
  typ: ActivityType
  tytul: string
  opis: string
  termin: string
  status: ActivityStatus
  rezultat: ActivityResult
  szansa_prawdopodobienstwo?: number
  wartosc_oferty?: number
  createdAt: string
  updatedAt: string
}

// Helper to compute segment
export function computeSegment(value: number): Segment {
  if (value > 200000) return "A"
  if (value >= 50000) return "B"
  return "C"
}

// Default titles by activity type
export const DEFAULT_ACTIVITY_TITLES: Record<ActivityType, string> = {
  "Telefon": "Telefon do klienta",
  "Spotkanie": "Spotkanie sprzedazowe",
  "E-mail": "Wiadomosc e-mail do klienta",
  "Wizyta": "Wizyta u klienta",
  "Oferta": "Oferta handlowa",
}
