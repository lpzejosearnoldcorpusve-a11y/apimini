export interface SavedLocation {
  id: string
  type: "home" | "work" | "other"
  name: string
  address: string
  latitude: number
  longitude: number
  userId: string
  createdAt: string
}

export interface SearchResult {
  place_id: string
  display_name: string
  lat: string
  lon: string
  type: string
  address: {
    road?: string
    suburb?: string
    city?: string
    state?: string
    country?: string
  }
}

export interface CreateLocationData {
  type: "home" | "work" | "other"
  name: string
  address: string
  latitude: number
  longitude: number
}
