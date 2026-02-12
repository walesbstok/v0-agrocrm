import { create } from "zustand"
import type { Client, Activity, ClientStatus, OpportunityStatus, Segment, ActivityType, ActivityStatus, ActivityResult } from "./types"
import { computeSegment } from "./types"
import { seedClients, seedActivities } from "./seed-data"

interface CRMStore {
  clients: Client[]
  activities: Activity[]

  // Client actions
  addClient: (client: Omit<Client, "id" | "segment" | "createdAt" | "updatedAt">) => Client
  updateClient: (id: string, data: Partial<Client>) => void
  deleteClient: (id: string) => void

  // Activity actions
  addActivity: (activity: Omit<Activity, "id" | "createdAt" | "updatedAt">) => Activity
  updateActivity: (id: string, data: Partial<Activity>) => void
  deleteActivity: (id: string) => void

  // Pipeline
  updateClientOpportunityStatus: (clientId: string, status: OpportunityStatus) => void

  // Helpers
  getClientById: (id: string) => Client | undefined
  getActivitiesByClientId: (id: string) => Activity[]
}

let idCounter = 100

function generateId(): string {
  idCounter++
  return `gen_${idCounter}_${Date.now()}`
}

export const useCRMStore = create<CRMStore>((set, get) => ({
  clients: seedClients,
  activities: seedActivities,

  addClient: (data) => {
    const now = new Date().toISOString()
    const newClient: Client = {
      ...data,
      id: generateId(),
      segment: computeSegment(data.potencjal_wartosc),
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({ clients: [...state.clients, newClient] }))
    return newClient
  },

  updateClient: (id, data) => {
    set((state) => ({
      clients: state.clients.map((c) => {
        if (c.id !== id) return c
        const updated = { ...c, ...data, updatedAt: new Date().toISOString() }
        if (data.potencjal_wartosc !== undefined) {
          updated.segment = computeSegment(data.potencjal_wartosc)
        }
        return updated
      }),
    }))
  },

  deleteClient: (id) => {
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
      activities: state.activities.filter((a) => a.clientId !== id),
    }))
  },

  addActivity: (data) => {
    const now = new Date().toISOString()
    const newActivity: Activity = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    set((state) => {
      const newActivities = [...state.activities, newActivity]
      // Update client's last contact
      const clientActivities = newActivities.filter((a) => a.clientId === data.clientId)
      const latestTermin = clientActivities
        .map((a) => new Date(a.termin).getTime())
        .reduce((max, t) => Math.max(max, t), 0)

      let clientUpdates: Partial<Client> = {
        ostatni_kontakt: new Date(latestTermin).toISOString(),
        updatedAt: now,
      }

      // If result is "wygrana", update client status
      if (data.rezultat === "wygrana") {
        clientUpdates.status_szansy = "Wygrana"
        clientUpdates.status_klienta = "Aktywny"
      }

      // If activity type is "Oferta" and client status is below "Oferta"
      if (data.typ === "Oferta") {
        const client = state.clients.find((c) => c.id === data.clientId)
        if (client) {
          const statusOrder: OpportunityStatus[] = ["Nowa", "Kwalifikacja", "Oferta", "Negocjacje", "Wygrana", "Przegrana"]
          const currentIdx = statusOrder.indexOf(client.status_szansy)
          const ofertaIdx = statusOrder.indexOf("Oferta")
          if (currentIdx < ofertaIdx) {
            clientUpdates.status_szansy = "Oferta"
          }
        }
      }

      return {
        activities: newActivities,
        clients: state.clients.map((c) =>
          c.id === data.clientId ? { ...c, ...clientUpdates } : c
        ),
      }
    })
    return newActivity
  },

  updateActivity: (id, data) => {
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
      ),
    }))
  },

  deleteActivity: (id) => {
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    }))
  },

  updateClientOpportunityStatus: (clientId, status) => {
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === clientId
          ? { ...c, status_szansy: status, updatedAt: new Date().toISOString() }
          : c
      ),
    }))
  },

  getClientById: (id) => {
    return get().clients.find((c) => c.id === id)
  },

  getActivitiesByClientId: (id) => {
    return get().activities.filter((a) => a.clientId === id)
  },
}))
