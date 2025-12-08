import { useAuth } from "@/context/AuthContext"
import { tarjetaService } from "@/services/tarjetaService"
import type { Tarjeta } from "@/types/tarjeta"
import { useCallback, useEffect, useState } from "react"

export function useMisTarjetas() {
  const { user } = useAuth()
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTarjetas = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await tarjetaService.getMisTarjetas(user.id)

      if (result.success && result.data) {
        setTarjetas(result.data)
      } else {
        setError(result.error || "Error al cargar tarjetas")
        setTarjetas([])
      }
    } catch (err) {
      setError("Error de conexión")
      setTarjetas([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchTarjetas()
  }, [fetchTarjetas])

  return {
    tarjetas,
    loading,
    error,
    refetch: fetchTarjetas,
  }
}
