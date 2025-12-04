"use client"

import { tarjetaService } from "@/services/tarjetaService"
import type { Tarjeta } from "@/types/tarjeta"
import { useCallback, useEffect, useState } from "react"

interface NFCState {
  isSupported: boolean
  isEnabled: boolean
  isScanning: boolean
  lastScannedCard: Tarjeta | null
  error: string | null
}

export function useNFC() {
  const [state, setState] = useState<NFCState>({
    isSupported: false,
    isEnabled: false,
    isScanning: false,
    lastScannedCard: null,
    error: null,
  })

  // Verificar soporte NFC al montar
  useEffect(() => {
    checkNFCSupport()
  }, [])

  const checkNFCSupport = async () => {
    try {
      // En React Native usariamos react-native-nfc-manager
      // Aqui simulamos la verificacion
      const isSupported = typeof navigator !== "undefined" && "NDEFReader" in window
      setState((prev) => ({ ...prev, isSupported, isEnabled: isSupported }))
    } catch (error) {
      setState((prev) => ({ ...prev, isSupported: false, error: "NFC no disponible" }))
    }
  }

  const startScan = useCallback(async (): Promise<Tarjeta | null> => {
    if (!state.isSupported) {
      setState((prev) => ({ ...prev, error: "NFC no soportado en este dispositivo" }))
      return null
    }

    setState((prev) => ({ ...prev, isScanning: true, error: null }))

    try {
      
      if ("NDEFReader" in window) {
        const ndef = new (window as any).NDEFReader()
        await ndef.scan()

        return new Promise((resolve) => {
          ndef.addEventListener("reading", async ({ serialNumber }: { serialNumber: string }) => {
            // Normalizar el codigo RFID
            const rfidCode = serialNumber.replace(/:/g, "").toUpperCase()

            // Buscar tarjeta por codigo RFID
            const result = await tarjetaService.findByRfidCode(rfidCode)

            setState((prev) => ({
              ...prev,
              isScanning: false,
              lastScannedCard: result.data || null,
              error: result.success ? null : result.error || "Tarjeta no encontrada",
            }))

            resolve(result.data || null)
          })

          ndef.addEventListener("readingerror", () => {
            setState((prev) => ({
              ...prev,
              isScanning: false,
              error: "Error al leer la tarjeta NFC",
            }))
            resolve(null)
          })
        })
      }

      setState((prev) => ({ ...prev, isScanning: false, error: "NFC no disponible" }))
      return null
    } catch (error: any) {
      const errorMessage = error?.message || "Error al escanear NFC"
      setState((prev) => ({ ...prev, isScanning: false, error: errorMessage }))
      return null
    }
  }, [state.isSupported])

  const stopScan = useCallback(() => {
    setState((prev) => ({ ...prev, isScanning: false }))
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const clearLastCard = useCallback(() => {
    setState((prev) => ({ ...prev, lastScannedCard: null }))
  }, [])

  return {
    ...state,
    startScan,
    stopScan,
    clearError,
    clearLastCard,
    checkNFCSupport,
  }
}
