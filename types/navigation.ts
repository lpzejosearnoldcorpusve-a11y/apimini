export interface NavigationDestination {
  name: string
  lat: number
  lng: number
  type: 'parada' | 'estacion'
}

export interface NavigationStep {
  instruction: string
  distance: string
  duration: string
  maneuver: 'straight' | 'turn-left' | 'turn-right' | 'u-turn' | 'arrive' | 'depart'
}

export interface NavigationRoute {
  totalDistance: string
  totalDuration: string
  steps: NavigationStep[]
}

export interface NavigationState {
  isNavigating: boolean
  currentStep: number
  destination: NavigationDestination | null
  route: NavigationRoute | null
  userLocation: {
    lat: number
    lng: number
  } | null
}
