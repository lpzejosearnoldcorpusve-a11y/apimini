export interface Coordenada {
  lat: number
  lng: number
}

export interface Minibus {
  id: string
  sindicato: string
  linea: string
  rutaNombre: string
  tipo: string
  createdAt: string
  ruta: Coordenada[]
}

export interface Estacion {
  id: string
  telefericoId: string
  nombre: string
  lat: number
  lng: number
  orden: number
  createdAt: string
}

export interface Teleferico {
  id: string
  nombre: string
  color: string
  createdAt: string
  estaciones: Estacion[]
}

// Tipo genérico para selección
export interface TransportSelection {
  type: "minibus" | "teleferico"
  id: string
}
