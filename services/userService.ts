import type { UpdateUserData, User } from "@/types/auth";
import * as SecureStore from "expo-secure-store";

const API_BASE = "https://miniweb-omega.vercel.app/api/usuarios-app"

export const userService = {
  // Actualizar usuario (solo celular y/o password)
  async updateUser(
    userId: string,
    userData: Partial<UpdateUserData>,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (data.success && data.data) {
        // Actualizar usuario en SecureStore
        await SecureStore.setItemAsync("turuta_user", JSON.stringify(data.data))
        return { success: true, user: data.data }
      }

      return { success: false, error: data.message || "Error al actualizar" }
    } catch (error) {
      console.error("Error updating user:", error)
      return { success: false, error: "Error de conexión" }
    }
  },

  // Actualizar solo celular
  async updatePhone(
    userId: string,
    celular: string,
    currentUserData: UpdateUserData,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    return userService.updateUser(userId, {
      ...currentUserData,
      celular,
    })
  },

  // Actualizar contraseña
  async updatePassword(
    userId: string,
    newPassword: string,
    currentUserData: UpdateUserData,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    return userService.updateUser(userId, {
      ...currentUserData,
      password: newPassword,
    })
  },
}
