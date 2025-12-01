"use client"

import { transportService } from "@/services/transportService"
import type { Minibus, Teleferico } from "@/types/transport"
import { useCallback, useEffect, useState } from "react"

export function useMinibuses() {
  const [minibuses, setMinibuses] = useState<Minibus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMinibuses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await transportService.getMinibuses()
      setMinibuses(data)
    } catch (err) {
      setError("Error al cargar minibuses")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMinibuses()
  }, [fetchMinibuses])

  return { minibuses, loading, error, refetch: fetchMinibuses }
}

export function useTelefericos() {
  const [telefericos, setTelefericos] = useState<Teleferico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTelefericos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await transportService.getTelefericos()
      setTelefericos(data)
    } catch (err) {
      setError("Error al cargar teleféricos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTelefericos()
  }, [fetchTelefericos])

  return { telefericos, loading, error, refetch: fetchTelefericos }
}
