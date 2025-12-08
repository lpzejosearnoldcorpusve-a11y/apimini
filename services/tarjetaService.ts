import type { Tarjeta, VincularTarjetaRequest, VincularTarjetaResponse } from "@/types/tarjeta";

const API_BASE = "https://miniweb-omega.vercel.app/api"

export const tarjetaService = {
  // Obtener todas las tarjetas disponibles
  async getAvailableTarjetas(): Promise<{ success: boolean; data?: Tarjeta[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/tarjetas`)
      const data = await response.json()

      if (data.success) {
        // Filtrar solo tarjetas activas y no vinculadas
        const available = (data.data || []).filter((t: Tarjeta) => !t.usuarioAppId && t.estado === "activa")
        return { success: true, data: available }
      }

      return { success: false, error: data.message || "Error al obtener tarjetas" }
    } catch (error) {
      console.error("Error fetching tarjetas:", error)
      return { success: false, error: "Error de conexión" }
    }
  },

  // Buscar tarjetas por celular
  async searchByCelular(celular: string): Promise<{ success: boolean; data?: Tarjeta[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/tarjetas`)
      const data = await response.json()

      if (data.success) {
        const filtered = (data.data || []).filter(
          (t: Tarjeta) => !t.usuarioAppId && t.estado === "activa" && t.celular.includes(celular),
        )
        return { success: true, data: filtered }
      }

      return { success: false, error: data.message || "Error al buscar tarjetas" }
    } catch (error) {
      console.error("Error searching tarjetas:", error)
      return { success: false, error: "Error de conexión" }
    }
  },

  // Vincular tarjeta a usuario
  async vincularTarjeta(request: VincularTarjetaRequest): Promise<VincularTarjetaResponse> {
    try {
      const response = await fetch(`${API_BASE}/usuarios-app/tarjetas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      })

      const data = await response.json()
      return {
        success: data.success || false,
        message: data.message || (data.success ? "Tarjeta vinculada exitosamente" : "Error al vincular"),
      }
    } catch (error) {
      console.error("Error vinculando tarjeta:", error)
      return { success: false, message: "Error de conexión" }
    }
  },

  // Obtener tarjetas vinculadas del usuario
  async getMisTarjetas(usuarioAppId: string): Promise<{ success: boolean; data?: Tarjeta[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/usuarios-app/${usuarioAppId}`)
      const data = await response.json()

      if (data.success && data.data?.tarjetas) {
        return { success: true, data: data.data.tarjetas }
      }

      return { success: false, error: data.message || "Error al obtener tarjetas" }
    } catch (error) {
      console.error("Error fetching mis tarjetas:", error)
      return { success: false, error: "Error de conexión" }
    }
  },

  // Buscar tarjeta por codigo RFID (para NFC)
  async findByRfidCode(rfidCode: string): Promise<{ success: boolean; data?: Tarjeta; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/tarjetas`)
      const data = await response.json()

      if (data.success) {
        const tarjeta = (data.data || []).find((t: Tarjeta) => t.uid === rfidCode)
        if (tarjeta) {
          return { success: true, data: tarjeta }
        }
        return { success: false, error: "Tarjeta no encontrada" }
      }

      return { success: false, error: data.message || "Error al buscar tarjeta" }
    } catch (error) {
      console.error("Error finding tarjeta by RFID:", error)
      return { success: false, error: "Error de conexión" }
    }
  },
}
