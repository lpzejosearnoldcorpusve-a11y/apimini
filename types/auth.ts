// Tipos para autenticación y usuario
export interface User {
  id: string
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  carnetIdentidad: string
  ciudad: string
  complemento: string | null
  fechaNacimiento: string
  celular: string
  ultimaConexion: string
  estado: "activo" | "inactivo"
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  success: boolean
  data: {
    usuario: User
    token: string
    expiresAt: string
  }
}

export interface RegisterData {
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  carnetIdentidad: string
  ciudad: string
  complemento: string
  fechaNacimiento: string
  celular: string
  password: string
}

export interface LoginCredentials {
  carnetIdentidad: string
  password: string
}

export interface AuthState {
  user: User | null
  token: string | null
  expiresAt: string | null
  isLoading: boolean
  isAuthenticated: boolean
}
