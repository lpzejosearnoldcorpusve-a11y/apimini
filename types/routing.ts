export interface Coordenada {
  lat: number
  lng: number
}

export interface SearchResult {
  id: string
  name: string
  displayName: string
  lat: number
  lng: number
  type: "station" | "stop" | "place"
  transportType?: "minibus" | "teleferico" | "pumakatari"
  lineInfo?: string
}

export interface RouteSegment {
  id: string
  type: "walk" | "minibus" | "teleferico" | "pumakatari"
  from: {
    name: string
    lat: number
    lng: number
  }
  to: {
    name: string
    lat: number
    lng: number
  }
  line?: string
  color?: string
  duration: number // minutos
  distance?: number // metros
  cost?: number // bolivianos
  instructions: string
  coordinates: Coordenada[]
}

export interface RouteOption {
  id: string
  totalDuration: number // minutos
  totalCost: number // bolivianos
  totalDistance: number // metros
  transfers: number
  segments: RouteSegment[]
  recommended?: boolean
}

export interface RoutePlanRequest {
  origin: Coordenada
  destination: Coordenada
  originName?: string
  destinationName?: string
}

export interface NavigationInstruction {
  id: string
  type: "start" | "walk" | "board" | "ride" | "transfer" | "exit" | "arrive"
  icon: string
  mainText: string
  subText?: string
  distance?: string
  duration?: string
  segmentIndex: number
  isActive?: boolean
}

export interface NavigationState {
  isActive: boolean
  isPaused: boolean
  currentSegmentIndex: number
  currentInstructionIndex: number
  completedSegments: string[]
  startedAt: Date | null
  estimatedArrival: Date | null
  remainingDuration: number
  remainingDistance: number
}
