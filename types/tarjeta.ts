// Tipos para tarjetas RFID
export interface Tarjeta {
  id: string
  uid: string
  nombre: string
  celular: string
  montoBs: number
  estado: "activa" | "inactiva"
  usuarioAppId: string | null
  createdAt: string
  updatedAt: string
}

export interface TarjetaVinculada extends Tarjeta {
  usuarioAppId: string
}

export interface VincularTarjetaRequest {
  usuarioAppId: string
  tarjetaId: string
}

export interface VincularTarjetaResponse {
  success: boolean
  message: string
}

export interface NFCReadResult {
  rfidCode: string
  isSupported: boolean
  error?: string
}
