import type { NearbyRoute, RouteRecommendation, SearchSuggestion } from "@/types/search"
import type { Minibus, Teleferico } from "@/types/transport"
import * as Network from 'expo-network'

const NOMINATIM_API = "https://nominatim.openstreetmap.org"

// Cache en memoria
const searchCache = new Map<string, { data: SearchSuggestion[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Zonas conocidas de La Paz para sugerencias locales
const KNOWN_ZONES = [
  { name: "Centro", lat: -16.4955, lng: -68.1336 },
  { name: "Sopocachi", lat: -16.5095, lng: -68.1272 },
  { name: "Miraflores", lat: -16.5089, lng: -68.1189 },
  { name: "Obrajes", lat: -16.5244, lng: -68.1039 },
  { name: "Calacoto", lat: -16.5350, lng: -68.0850 },
  { name: "San Miguel", lat: -16.5280, lng: -68.0780 },
  { name: "Achumani", lat: -16.5400, lng: -68.0650 },
  { name: "Irpavi", lat: -16.5280, lng: -68.0620 },
  { name: "Cota Cota", lat: -16.5350, lng: -68.0690 },
  { name: "Villa Fátima", lat: -16.4880, lng: -68.1200 },
  { name: "El Alto", lat: -16.5050, lng: -68.1700 },
  { name: "San Pedro", lat: -16.4960, lng: -68.1420 },
  { name: "Tembladerani", lat: -16.5120, lng: -68.1410 },
  { name: "Garita de Lima", lat: -16.4900, lng: -68.1520 },
  { name: "Cementerio", lat: -16.4920, lng: -68.1480 },
  { name: "Plaza del Estudiante", lat: -16.5050, lng: -68.1290 },
  { name: "Plaza San Francisco", lat: -16.4955, lng: -68.1377 },
  { name: "Prado", lat: -16.5000, lng: -68.1350 },
  { name: "Max Paredes", lat: -16.4920, lng: -68.1420 },
  { name: "Cotahuma", lat: -16.5150, lng: -68.1450 },
]

export const searchService = {
  // Buscar con autocompletado
  async searchWithAutocomplete(
    query: string,
    minibuses: Minibus[],
    telefericos: Teleferico[]
  ): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = []
    const trimmedQuery = query.trim().toLowerCase()
    
    if (!trimmedQuery || trimmedQuery.length < 2) {
      return []
    }

    // 1. Buscar en paradas de minibuses
    minibuses.forEach(minibus => {
      // Buscar por número de línea
      if (minibus.linea.toLowerCase().includes(trimmedQuery)) {
        suggestions.push({
          id: `minibus-${minibus.id}-inicio`,
          name: `Línea ${minibus.linea} - Inicio`,
          description: `${minibus.sindicato} - ${minibus.rutaNombre}`,
          type: 'stop',
          lat: minibus.ruta[0].lat,
          lng: minibus.ruta[0].lng,
          icon: 'bus',
          color: '#0891b2',
          transportId: minibus.id,
          transportType: 'minibus',
        })
        
        if (minibus.ruta.length > 1) {
          suggestions.push({
            id: `minibus-${minibus.id}-fin`,
            name: `Línea ${minibus.linea} - Final`,
            description: `${minibus.sindicato} - ${minibus.rutaNombre}`,
            type: 'stop',
            lat: minibus.ruta[minibus.ruta.length - 1].lat,
            lng: minibus.ruta[minibus.ruta.length - 1].lng,
            icon: 'bus',
            color: '#0891b2',
            transportId: minibus.id,
            transportType: 'minibus',
          })
        }
      }
      
      // Buscar por nombre de sindicato o ruta
      if (minibus.sindicato.toLowerCase().includes(trimmedQuery) ||
          minibus.rutaNombre.toLowerCase().includes(trimmedQuery)) {
        suggestions.push({
          id: `minibus-${minibus.id}`,
          name: `Línea ${minibus.linea}`,
          description: `${minibus.sindicato} - ${minibus.rutaNombre}`,
          type: 'stop',
          lat: minibus.ruta[0].lat,
          lng: minibus.ruta[0].lng,
          icon: 'bus',
          color: '#0891b2',
          transportId: minibus.id,
          transportType: 'minibus',
        })
      }
    })

    // 2. Buscar en estaciones de teleférico
    telefericos.forEach(teleferico => {
      teleferico.estaciones.forEach(estacion => {
        if (estacion.nombre.toLowerCase().includes(trimmedQuery) ||
            teleferico.nombre.toLowerCase().includes(trimmedQuery)) {
          suggestions.push({
            id: `estacion-${estacion.id}`,
            name: estacion.nombre,
            description: `${teleferico.nombre} - Estación ${estacion.orden}`,
            type: 'station',
            lat: estacion.lat,
            lng: estacion.lng,
            icon: 'train',
            color: teleferico.color,
            transportId: teleferico.id,
            transportType: 'teleferico',
          })
        }
      })
    })

    // 3. Buscar en zonas conocidas
    KNOWN_ZONES.forEach(zone => {
      if (zone.name.toLowerCase().includes(trimmedQuery)) {
        suggestions.push({
          id: `zone-${zone.name}`,
          name: zone.name,
          description: 'Zona / Barrio de La Paz',
          type: 'zone',
          lat: zone.lat,
          lng: zone.lng,
          icon: 'building',
        })
      }
    })

    // 4. Buscar en Nominatim (API de mapas) solo si hay conexión
    try {
      const nominatimResults = await this.searchNominatim(trimmedQuery)
      suggestions.push(...nominatimResults)
    } catch (error) {
      console.warn('Error buscando en Nominatim:', error)
    }

    // Eliminar duplicados y limitar resultados
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) =>
      index === self.findIndex(s => s.id === suggestion.id)
    )

    return uniqueSuggestions.slice(0, 15)
  },

  // Buscar en Nominatim
  async searchNominatim(query: string): Promise<SearchSuggestion[]> {
    try {
      // Verificar caché
      const cacheKey = query.toLowerCase()
      const cached = searchCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data
      }

      // Verificar conexión
      try {
        const networkState = await Network.getNetworkStateAsync()
        if (!networkState.isConnected) {
          return []
        }
      } catch (e) {
        // Continuar si no se puede verificar
      }

      const params = new URLSearchParams({
        q: `${query}, La Paz, Bolivia`,
        format: 'json',
        limit: '5',
        countrycodes: 'bo',
        'accept-language': 'es',
        addressdetails: '1',
        viewbox: '-68.22,-16.58,-68.00,-16.40',
        bounded: '1'
      })

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${NOMINATIM_API}/search?${params}`, {
        signal: controller.signal,
        headers: {
          "User-Agent": "TurutaApp/1.0",
          "Accept": "application/json",
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) return []

      const data = await response.json()
      
      const suggestions: SearchSuggestion[] = data.map((item: any) => ({
        id: `nominatim-${item.place_id}`,
        name: this.formatPlaceName(item),
        description: this.formatAddress(item),
        type: 'street' as const,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        icon: 'map-pin' as const,
      }))

      // Guardar en caché
      searchCache.set(cacheKey, { data: suggestions, timestamp: Date.now() })

      return suggestions
    } catch (error) {
      console.warn('Error en searchNominatim:', error)
      return []
    }
  },

  // Formatear nombre del lugar
  formatPlaceName(item: any): string {
    if (item.address?.road) {
      return item.address.road
    }
    const parts = item.display_name.split(',')
    return parts[0] || 'Ubicación'
  },

  // Formatear dirección
  formatAddress(item: any): string {
    const parts = []
    if (item.address?.suburb) parts.push(item.address.suburb)
    if (item.address?.city) parts.push(item.address.city)
    return parts.join(', ') || 'La Paz, Bolivia'
  },

  // Hacer geocodificación inversa
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lng.toString(),
        format: 'json',
        'accept-language': 'es',
        zoom: '18'
      })

      const response = await fetch(`${NOMINATIM_API}/reverse?${params}`, {
        headers: {
          "User-Agent": "TurutaApp/1.0",
          "Accept": "application/json",
        },
      })

      if (!response.ok) throw new Error("Error")
      
      const data = await response.json()
      
      // Formatear dirección corta
      const addr = data.address || {}
      const parts = []
      if (addr.road) parts.push(addr.road)
      if (addr.house_number) parts.push(addr.house_number)
      if (addr.suburb) parts.push(addr.suburb)
      
      return parts.length > 0 ? parts.join(' ') : data.display_name?.split(',')[0] || 'Ubicación seleccionada'
    } catch (error) {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    }
  },

  // Encontrar rutas cercanas a un punto
  findNearbyRoutes(
    lat: number,
    lng: number,
    minibuses: Minibus[],
    telefericos: Teleferico[],
    maxDistanceKm: number = 1
  ): NearbyRoute[] {
    const routes: NearbyRoute[] = []

    // Tipo para la info de parada/estación
    interface PointInfo {
      name: string
      lat: number
      lng: number
      index: number
      distance: number
    }

    // Buscar minibuses cercanos
    for (const minibus of minibuses) {
      let nearestStop: PointInfo | null = null

      for (let index = 0; index < minibus.ruta.length; index++) {
        const coord = minibus.ruta[index]
        const distance = this.calculateDistance(lat, lng, coord.lat, coord.lng)
        if (distance <= maxDistanceKm) {
          if (!nearestStop || distance < nearestStop.distance) {
            nearestStop = {
              name: index === 0 
                ? `Inicio - ${minibus.rutaNombre}`
                : index === minibus.ruta.length - 1 
                  ? `Final - ${minibus.rutaNombre}`
                  : `Parada ${index + 1}`,
              lat: coord.lat,
              lng: coord.lng,
              index,
              distance,
            }
          }
        }
      }

      if (nearestStop !== null) {
        routes.push({
          id: minibus.id,
          name: `Línea ${minibus.linea} - ${minibus.sindicato}`,
          type: 'minibus',
          color: '#0891b2',
          distance: nearestStop.distance * 1000, // convertir a metros
          nearestStop: {
            name: nearestStop.name,
            lat: nearestStop.lat,
            lng: nearestStop.lng,
            index: nearestStop.index,
          },
          estimatedTime: this.calculateWalkingTime(nearestStop.distance),
        })
      }
    }

    // Buscar teleféricos cercanos
    for (const teleferico of telefericos) {
      let nearestStation: PointInfo | null = null

      for (let index = 0; index < teleferico.estaciones.length; index++) {
        const estacion = teleferico.estaciones[index]
        const distance = this.calculateDistance(lat, lng, estacion.lat, estacion.lng)
        if (distance <= maxDistanceKm) {
          if (!nearestStation || distance < nearestStation.distance) {
            nearestStation = {
              name: estacion.nombre,
              lat: estacion.lat,
              lng: estacion.lng,
              index,
              distance,
            }
          }
        }
      }

      if (nearestStation !== null) {
        routes.push({
          id: teleferico.id,
          name: teleferico.nombre,
          type: 'teleferico',
          color: teleferico.color,
          distance: nearestStation.distance * 1000,
          nearestStop: {
            name: nearestStation.name,
            lat: nearestStation.lat,
            lng: nearestStation.lng,
            index: nearestStation.index,
          },
          estimatedTime: this.calculateWalkingTime(nearestStation.distance),
        })
      }
    }

    // Ordenar por distancia
    routes.sort((a, b) => a.distance - b.distance)

    return routes.slice(0, 10)
  },

  // Calcular distancia entre dos puntos (Haversine)
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Radio de la tierra en km
    const dLat = this.toRad(lat2 - lat1)
    const dLng = this.toRad(lng2 - lng1)
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  },

  toRad(deg: number): number {
    return deg * (Math.PI / 180)
  },

  // Calcular tiempo caminando
  calculateWalkingTime(distanceKm: number): string {
    const walkingSpeedKmH = 5 // km/h promedio caminando
    const minutes = Math.round((distanceKm / walkingSpeedKmH) * 60)
    
    if (minutes < 1) return 'menos de 1 min'
    if (minutes < 60) return `${minutes} min`
    return `${Math.floor(minutes / 60)}h ${minutes % 60}min`
  },

  // Obtener recomendación de rutas para un destino
  getRouteRecommendation(
    destinationLat: number,
    destinationLng: number,
    destinationName: string,
    minibuses: Minibus[],
    telefericos: Teleferico[]
  ): RouteRecommendation {
    const nearbyRoutes = this.findNearbyRoutes(
      destinationLat,
      destinationLng,
      minibuses,
      telefericos,
      1.5 // Radio de 1.5 km
    )

    return {
      destinationName,
      destinationLat,
      destinationLng,
      routes: nearbyRoutes,
    }
  },
}
