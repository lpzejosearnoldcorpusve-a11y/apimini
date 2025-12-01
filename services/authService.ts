import type { AuthResponse, LoginCredentials, RegisterData, User } from "@/types/auth"
import * as SecureStore from "expo-secure-store"
import { api } from "./api"

const STORAGE_KEYS = {
  USER: "turuta_user",
  TOKEN: "turuta_token",
  EXPIRES_AT: "turuta_expires_at",
} as const

export const authService = {
  // Login
  async login(
    credentials: LoginCredentials,
  ): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    const response = await api.post<AuthResponse["data"]>("/login", credentials)

    if (response.success && response.data) {
      const { usuario, token, expiresAt } = response.data

      // Guardar en SecureStore
      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(usuario)),
        SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token),
        SecureStore.setItemAsync(STORAGE_KEYS.EXPIRES_AT, expiresAt),
      ])

      return { success: true, user: usuario, token }
    }

    return { success: false, error: response.message || "Credenciales inválidas" }
  },

  // Registro
  async register(data: RegisterData): Promise<{ success: boolean; error?: string }> {
    const response = await api.post("", data)

    if (response.success) {
      return { success: true }
    }

    return { success: false, error: response.message || "Error al registrar" }
  },

  // Obtener sesión guardada
  async getStoredSession(): Promise<{ user: User | null; token: string | null }> {
    try {
      const [userJson, token, expiresAt] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.USER),
        SecureStore.getItemAsync(STORAGE_KEYS.TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.EXPIRES_AT),
      ])

      // Verificar si el token expiró
      if (expiresAt && new Date(expiresAt) < new Date()) {
        await authService.clearSession()
        return { user: null, token: null }
      }

      if (userJson && token) {
        return { user: JSON.parse(userJson), token }
      }
    } catch (error) {
      console.error("Error getting stored session:", error)
    }

    return { user: null, token: null }
  },

  // Cerrar sesión
  async clearSession(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.USER),
      SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.EXPIRES_AT),
    ])
  },
}
