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
  type: "station" | "stop" | "place" | "saved"
  transportType?: "minibus" | "teleferico" | "pumakatari"
  lineInfo?: string
  address?: string
  savedType?: "home" | "work" | "favorite" | "other"
}

// Interfaces para modales
export interface SavedLocation {
  id: string
  name: string
  address: string
  type: 'home' | 'work' | 'favorite' | 'other'
  lat: number
  lng: number
}

export interface IncidentReport {
  id?: string
  type: 'traffic' | 'accident' | 'roadwork' | 'closure' | 'protest' | 'other'
  severity: 'low' | 'medium' | 'high'
  description: string
  location: string
  coordinates?: Coordenada
  userId?: string
  timestamp: string
  status: 'pending' | 'verified' | 'resolved'
  upvotes?: number
  downvotes?: number
}

export interface PopularRoute {
  id: string
  name: string
  from: string
  to: string
  frequency: string
  travelTime: string
  fare: string
  peakHours: string[]
  rating: number
  routeType: "minibus" | "teleferico" | "pumakatari" | "mixed"
  averageLoad: "low" | "medium" | "high"
  lastUpdated: string
}

// Interfaces de tarifas de referencia
export interface FareReference {
  id: string
  route: string
  fare: number
  currency: "Bs"
  schedule?: string
  frequency?: string
  lastUpdated: string
  source: "official" | "user_reported"
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
  // Nuevos campos para incidentes en segmentos
  hasIncidents?: boolean
  incidentCount?: number
  incidents?: RouteIncident[]
  // Información de frecuencia
  frequency?: string
  // Información de disponibilidad
  isAvailable?: boolean
  nextArrival?: string // timestamp
}

// Incidentes específicos de ruta
export interface RouteIncident {
  id: string
  type: 'traffic' | 'accident' | 'roadwork' | 'closure' | 'protest' | 'delay' | 'other'
  severity: 'low' | 'medium' | 'high'
  description: string
  location: Coordenada
  segmentId: string
  reportedAt: string
  estimatedResolution?: string
  verified: boolean
}

export interface RouteOption {
  id: string
  totalDuration: number // minutos
  totalCost: number // bolivianos
  totalDistance: number // metros
  transfers: number
  segments: RouteSegment[]
  recommended?: boolean
  // Nuevos campos para comparación de rutas
  comfortScore?: number // 1-5
  reliabilityScore?: number // 1-5
  overallRating?: number // 1-5
  hasIncidents?: boolean
  incidentSummary?: {
    total: number
    traffic: number
    delays: number
    closures: number
  }
  // Información de horario
  departureTime?: string
  arrivalTime?: string
  // Puntuación alternativa
  alternativeScore?: number
}

export interface RoutePlanRequest {
  origin: Coordenada
  destination: Coordenada
  originName?: string
  destinationName?: string
  preferences?: RoutePreferences
  departureTime?: string // ISO string
  avoidIncidents?: boolean
  maxTransfers?: number
  maxWalkDistance?: number // metros
}

export interface RoutePreferences {
  minimizeCost?: boolean
  minimizeTime?: boolean
  minimizeTransfers?: boolean
  preferTeleferico?: boolean
  preferPumakatari?: boolean
  avoidCrowded?: boolean
  accessibility?: boolean
}

export interface NavigationInstruction {
  id: string
  type: "start" | "walk" | "board" | "ride" | "transfer" | "exit" | "arrive" | "alert"
  icon: string
  mainText: string
  subText?: string
  distance?: string
  duration?: string
  segmentIndex: number
  isActive?: boolean
  // Campos para alertas e incidentes
  alertType?: "incident" | "delay" | "crowding" | "fare"
  alertSeverity?: "low" | "medium" | "high"
  // Información de transporte
  transportInfo?: {
    line: string
    color: string
    nextStop?: string
    eta?: string
  }
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
  // Nuevos campos para navegación mejorada
  currentLocation?: Coordenada
  nextInstruction?: NavigationInstruction
  upcomingAlerts: NavigationAlert[]
  alternativeRoutes?: RouteOption[]
  // Estadísticas de viaje
  travelStats: {
    distanceTraveled: number
    timeElapsed: number
    costIncurred: number
    segmentsCompleted: number
  }
}

export interface NavigationAlert {
  id: string
  type: "incident" | "delay" | "crowding" | "fare" | "safety" | "weather"
  severity: "low" | "medium" | "high"
  title: string
  message: string
  location?: Coordenada
  distanceAhead?: number // metros
  segmentId?: string
  timestamp: string
  isDismissed?: boolean
}

// Interfaces para modales y estados UI
export interface QuickAction {
  id: 'search' | 'saved' | 'incidents' | 'routes' | 'fares'
  icon: string
  label: string
  color: string
  bgColor: string
}

export interface ModalState {
  type: "saved" | "incidents" | "routes" | "fares" | null
  data?: any
  isOpen: boolean
}

// Interfaces para transporte en tiempo real
export interface TransportUnit {
  id: string
  type: "minibus" | "teleferico" | "pumakatari"
  line: string
  coordinates: Coordenada
  heading: number
  speed: number
  lastUpdate: string
  occupancy?: "low" | "medium" | "high"
  nextStop?: string
  eta?: number // segundos
}

// Interfaces para estadísticas y análisis
export interface RouteStatistics {
  routeId: string
  averageDuration: number
  averageCost: number
  reliabilityScore: number
  popularity: number
  peakHours: string[]
  commonIncidents: string[]
  userRatings: UserRating[]
}

export interface UserRating {
  userId: string
  rating: number
  comment?: string
  timestamp: string
  routeId: string
}

// Interfaces para historial de viajes
export interface TripHistory {
  id: string
  origin: {
    name: string
    coordinates: Coordenada
  }
  destination: {
    name: string
    coordinates: Coordenada
  }
  route: RouteOption
  startedAt: string
  completedAt: string
  actualDuration: number
  actualCost?: number
  rating?: number
  feedback?: string
  incidentsEncountered?: number
}

export interface FareAdjustment {
  route: string
  newFare: number
  effectiveDate: string
  source: string
  verified: boolean
}