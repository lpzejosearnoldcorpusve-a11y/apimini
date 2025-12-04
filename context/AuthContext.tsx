"use client"

import { authService } from "@/services/authService"
import type { RegisterData, User } from "@/types/auth"
import { router } from "expo-router"
import * as SecureStore from "expo-secure-store"
import type React from "react"
import { createContext, useCallback, useContext, useEffect, useState } from "react"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (carnetIdentidad: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const session = await authService.getStoredSession()
      if (session.user && session.token) {
        setUser(session.user)
        setToken(session.token)
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = useCallback(async () => {
    try {
      const userJson = await SecureStore.getItemAsync("turuta_user")
      if (userJson) {
        const updatedUser = JSON.parse(userJson)
        setUser(updatedUser)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
    }
  }, [])

  const login = useCallback(async (carnetIdentidad: string, password: string) => {
    try {
      setIsLoading(true)
      const result = await authService.login({ carnetIdentidad, password })

      if (result.success && result.user) {
        setUser(result.user)
        setToken(result.token || null)
        router.replace("/(tabs)/routes")
        return { success: true }
      }

      return { success: false, error: result.error }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        setIsLoading(true)
        const result = await authService.register(data)

        if (result.success) {
          return await login(data.carnetIdentidad, data.password)
        }

        return { success: false, error: result.error }
      } finally {
        setIsLoading(false)
      }
    },
    [login],
  )

  const logout = useCallback(async () => {
    await authService.clearSession()
    setUser(null)
    setToken(null)
    router.replace("/(auth)/login")
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        refreshUser, // Added to provider
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
