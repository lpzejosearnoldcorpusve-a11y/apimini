// Tipos para búsqueda y navegación avanzada

export interface SearchSuggestion {
  id: string
  name: string
  description: string
  type: 'street' | 'zone' | 'poi' | 'stop' | 'station' | 'custom'
  lat: number
  lng: number
  icon?: 'map-pin' | 'bus' | 'train' | 'building' | 'home' | 'star'
  color?: string
  transportId?: string // ID del minibus o teleférico asociado
  transportType?: 'minibus' | 'teleferico'
}

export interface NearbyRoute {
  id: string
  name: string
  type: 'minibus' | 'teleferico'
  color: string
  distance: number // en metros
  nearestStop: {
    name: string
    lat: number
    lng: number
    index: number
  }
  estimatedTime: string // tiempo caminando
}

export interface RouteRecommendation {
  destinationName: string
  destinationLat: number
  destinationLng: number
  routes: NearbyRoute[]
}

export interface MapPoint {
  lat: number
  lng: number
  address?: string
}
