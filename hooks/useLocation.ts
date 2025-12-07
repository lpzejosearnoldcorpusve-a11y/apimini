"use client"

import type { Coordenada } from "@/types/transport"
import * as Location from "expo-location"
import { useCallback, useEffect, useState } from "react"

interface UseLocationReturn {
  location: Coordenada | null
  error: string | null
  loading: boolean
  getCurrentLocation: () => Promise<Coordenada | null>
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<Coordenada | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getCurrentLocation = useCallback(async (): Promise<Coordenada | null> => {
    try {
      setLoading(true)
      setError(null)

      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setError("Permiso de ubicación denegado")
        setLoading(false)
        return null
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })

      const coords: Coordenada = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }

      setLocation(coords)
      setLoading(false)
      return coords
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      setLoading(false)
      console.error("Error getting location:", err)
      return null
    }
  }, [])

  // Auto-get location on mount
  useEffect(() => {
    getCurrentLocation()
  }, [getCurrentLocation])

  return {
    location,
    error,
    loading,
    getCurrentLocation,
  }
}
