const API_BASE = "https://miniweb-omega.vercel.app/api/usuarios-app"

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json()

  if (!response.ok) {
    return {
      success: false,
      message: data.message || data.error || "Error en la solicitud",
    }
  }

  return data
}

export const api = {
  async post<T>(endpoint: string, body: object): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      return handleResponse<T>(response)
    } catch (error) {
      return {
        success: false,
        message: "Error de conexión. Intenta nuevamente.",
      }
    }
  },

  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (token) headers["Authorization"] = `Bearer ${token}`

      const response = await fetch(`${API_BASE}${endpoint}`, { headers })
      return handleResponse<T>(response)
    } catch (error) {
      return {
        success: false,
        message: "Error de conexión. Intenta nuevamente.",
      }
    }
  },
}
