import type { CreateLocationData, SavedLocation, SearchResult } from "@/types/location"
import * as Network from 'expo-network'

const NOMINATIM_API = "https://nominatim.openstreetmap.org"

// Cache simple en memoria
const searchCache = new Map<string, { data: SearchResult[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export const locationService = {
  // Buscar ubicaciones - Versión optimizada para Expo
  async searchLocation(query: string): Promise<SearchResult[]> {
    try {
      // 1. Validar entrada
      const trimmedQuery = query.trim()
      if (!trimmedQuery || trimmedQuery.length < 2) {
        return []
      }

      // 2. Verificar caché
      const cacheKey = trimmedQuery.toLowerCase()
      const cached = searchCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log("📦 Retornando desde caché")
        return cached.data
      }

      // 3. Verificar conexión
      try {
        const networkState = await Network.getNetworkStateAsync()
        if (!networkState.isConnected || !networkState.isInternetReachable) {
          console.warn("📵 Sin conexión a internet")
          throw new Error("No hay conexión a internet")
        }
      } catch (networkError) {
        console.log("⚠️ No se pudo verificar el estado de la red")
      }

      // 4. Construir URL optimizada para La Paz
      const params = new URLSearchParams({
        q: trimmedQuery,
        format: 'json',
        limit: '8',
        countrycodes: 'bo',
        'accept-language': 'es',
        addressdetails: '1',
        viewbox: '-68.22,-16.58,-68.08,-16.45', // Bounding box de La Paz
        bounded: '1'
      })

      const url = `${NOMINATIM_API}/search?${params}`
      console.log("🌐 Buscando en:", url)

      // 5. Fetch con timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "TurutaApp/1.0 (contacto@turuta.com)",
          "Accept": "application/json",
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.warn(`⚠️ API respondió con status: ${response.status}`)
        return []
      }

      const data = await response.json()
      
      // 6. Filtrar y priorizar La Paz ciudad
      const filteredResults = this.filterLaPazResults(Array.isArray(data) ? data : [])
      console.log(`✅ Encontrados ${filteredResults.length} resultados`)
      
      // 7. Guardar en caché
      searchCache.set(cacheKey, {
        data: filteredResults,
        timestamp: Date.now()
      })
      
      return filteredResults

    } catch (error: any) {
      console.error("❌ Error en búsqueda:", {
        name: error.name,
        message: error.message,
        isAbort: error.name === 'AbortError'
      })
      
      // Si es timeout, mostrar mensaje específico
      if (error.name === 'AbortError') {
        throw new Error("La búsqueda tardó demasiado. Verifica tu conexión.")
      }
      
      throw new Error("Error al buscar ubicaciones. Intenta nuevamente.")
    }
  },

  // Filtrar resultados para priorizar La Paz ciudad
  filterLaPazResults(results: SearchResult[]): SearchResult[] {
    return results
      .filter(result => {
        // Priorizar resultados que estén en La Paz departamento
        return result.display_name?.includes("La Paz") || 
               result.display_name?.includes("Bolivia")
      })
      .sort((a, b) => {
        // Dar mayor prioridad a resultados en La Paz ciudad
        const aScore = this.calculatePriorityScore(a.display_name)
        const bScore = this.calculatePriorityScore(b.display_name)
        return bScore - aScore
      })
  },

  calculatePriorityScore(displayName: string): number {
    let score = 0
    if (displayName.includes("La Paz, La Paz")) score += 10 // Ciudad de La Paz
    if (displayName.includes("Centro, La Paz")) score += 5 // Zona centro
    if (displayName.includes("Miraflores, La Paz")) score += 5 // Barrio conocido
    if (displayName.includes("Sopocachi")) score += 5
    if (displayName.includes("Calacoto")) score += 5
    if (displayName.includes("Obrajes")) score += 5
    if (displayName.includes("San Miguel")) score += 5
    return score
  },

  // Reverse geocoding
  async reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        format: 'json',
        'accept-language': 'es',
        zoom: '18'
      })

      const url = `${NOMINATIM_API}/reverse?${params}`
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": "TurutaApp/1.0",
          "Accept": "application/json",
        },
      })

      if (!response.ok) throw new Error("Error en geocoding inverso")
      
      const data = await response.json()
      return data.display_name || "Ubicación no identificada"

    } catch (error) {
      console.error("Error en reverseGeocode:", error)
      return `Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`
    }
  },

  // Guardar ubicación
  async saveLocation(data: CreateLocationData): Promise<SavedLocation> {
    const newLocation: SavedLocation = {
      id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      userId: "current-user-id",
      createdAt: new Date().toISOString(),
    }
    
    // Simular async
    return new Promise(resolve => {
      setTimeout(() => resolve(newLocation), 300)
    })
  },

  // Obtener ubicaciones guardadas
  async getSavedLocations(): Promise<SavedLocation[]> {
    return []
  },

  // Eliminar ubicación
  async deleteLocation(id: string): Promise<void> {
    console.log("🗑️ Eliminando ubicación:", id)
  },
}