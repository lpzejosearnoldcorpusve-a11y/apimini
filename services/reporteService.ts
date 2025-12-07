// Servicio para APIs de reportes
const API_BASE = "https://miniweb-omega.vercel.app/api"

import type { CreateReporteData } from "@/types/reporte"

export const reporteService = {
  // Crear reporte de trameaje
  async createReporte(data: CreateReporteData) {
    try {
      console.log("Enviando reporte a:", `${API_BASE}/reportes`)
      const response = await fetch(`${API_BASE}/reportes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const text = await response.text()
      const result = text ? JSON.parse(text) : {}

      if (!response.ok) {
        throw new Error(result.message || result.error || "Error al crear reporte")
      }

      console.log("Reporte creado exitosamente:", result)
      return result.data
    } catch (error: any) {
      console.error("Error al crear reporte:", error)
      throw new Error(error.message || "Error al crear reporte")
    }
  },

  // Obtener reporte por ID
  async getReporteById(id: string) {
    try {
      const response = await fetch(`${API_BASE}/reportes/${id}`, {
        headers: { "Content-Type": "application/json" },
      })

      const text = await response.text()
      const result = text ? JSON.parse(text) : {}

      if (!response.ok) {
        throw new Error(result.message || result.error || "Error al obtener reporte")
      }

      return result.data
    } catch (error: any) {
      console.error("Error al obtener reporte:", error)
      throw new Error(error.message || "Error al obtener reporte")
    }
  },

  // Obtener mis reportes
  async getMisReportes(usuarioAppId: string) {
    try {
      const response = await fetch(`${API_BASE}/reportes?usuarioAppId=${usuarioAppId}`, {
        headers: { "Content-Type": "application/json" },
      })

      const text = await response.text()
      const result = text ? JSON.parse(text) : {}

      if (!response.ok) {
        console.error("Error fetching reportes:", result.message)
        return []
      }

      return result.data || []
    } catch (error: any) {
      console.error("Error fetching reportes:", error)
      return []
    }
  },
}
