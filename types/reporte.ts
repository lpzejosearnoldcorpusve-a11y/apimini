export type TipoReporte = "trameaje" | "exceso_velocidad" | "parada_no_autorizada" | "otro"
export type PrioridadReporte = "baja" | "media" | "alta" | "urgente"
export type EstadoReporte = "pendiente" | "en_revision" | "verificado" | "rechazado" | "resuelto"

export interface CreateReporteData {
  placa: string
  linea: string
  horaSuceso: string
  usuarioAppId?: string
  latitud?: number
  longitud?: number
  direccion?: string
  evidenciaImagenes?: string[]
  evidenciaVideos?: string[]
  evidenciaAudios?: string[]
  mensaje?: string
  tipoReporte?: TipoReporte
  prioridad?: PrioridadReporte
}

export interface Reporte {
  id: string
  placa: string
  linea: string
  usuarioAppId: string | null
  horaReporte: string
  horaSuceso: string
  latitud: number | null
  longitud: number | null
  direccion: string | null
  evidenciaImagenes: string[]
  evidenciaVideos: string[]
  evidenciaAudios: string[]
  mensaje: string | null
  tipoReporte: TipoReporte
  estado: EstadoReporte
  prioridad: PrioridadReporte
  notasRevision: string | null
  revisadoPor: string | null
  fechaRevision: string | null
  infraccionId: string | null
  createdAt: string
  updatedAt: string
}
