// Servicio para APIs de transporte
const API_BASE = "https://miniweb-omega.vercel.app/api"

import type { Minibus, Teleferico } from "@/types/transport"

export const transportService = {
  async getMinibuses(): Promise<Minibus[]> {
    try {
      const response = await fetch(`${API_BASE}/minibuses`)
      if (!response.ok) throw new Error("Error al cargar minibuses")
      return await response.json()
    } catch (error) {
      console.error("Error fetching minibuses:", error)
      return []
    }
  },

  async getTelefericos(): Promise<Teleferico[]> {
    try {
      const response = await fetch(`${API_BASE}/telefericos`)
      if (!response.ok) throw new Error("Error al cargar teleféricos")
      return await response.json()
    } catch (error) {
      console.error("Error fetching telefericos:", error)
      return []
    }
  },
}
