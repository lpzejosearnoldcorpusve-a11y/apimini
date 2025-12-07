"use client"

import { tarjetaService } from "@/services/tarjetaService"
import type { Tarjeta } from "@/types/tarjeta"
import { useCallback, useEffect, useState } from "react"
import { Alert, Platform } from "react-native"

// Importación dinámica para evitar crash cuando no está disponible
let NfcManager: any = null
let NfcTech: any = null
let Ndef: any = null
let NfcEvents: any = null

try {
  const nfcModule = require("react-native-nfc-manager")
  NfcManager = nfcModule.default
  NfcTech = nfcModule.NfcTech
  Ndef = nfcModule.Ndef
  NfcEvents = nfcModule.NfcEvents
} catch (e) {
  console.log("NFC module not available")
}

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

  // Inicializar NFC al montar
  useEffect(() => {
    initNFC()
    return () => {
      // Cleanup al desmontar
      if (NfcManager && NfcEvents) {
        try {
          NfcManager.setEventListener(NfcEvents.DiscoverTag, null)
          NfcManager.setEventListener(NfcEvents.SessionClosed, null)
        } catch (e) {
          // Ignorar errores de cleanup
        }
      }
    }
  }, [])

  const initNFC = async () => {
    // Verificar si el módulo NFC está disponible
    if (!NfcManager) {
      console.log("NFC module not loaded - running in Expo Go or emulator")
      setState((prev) => ({ 
        ...prev, 
        isSupported: false, 
        isEnabled: false,
        error: "NFC no disponible. Usa un build de desarrollo para probar NFC real."
      }))
      return
    }

    try {
      // Verificar si el dispositivo soporta NFC
      const isSupported = await NfcManager.isSupported()
      
      if (isSupported) {
        // Inicializar el manager de NFC
        await NfcManager.start()
        
        // Verificar si NFC está habilitado
        const isEnabled = await NfcManager.isEnabled()
        
        setState((prev) => ({ 
          ...prev, 
          isSupported: true, 
          isEnabled,
          error: isEnabled ? null : "NFC está desactivado. Por favor actívalo en configuración."
        }))
      } else {
        setState((prev) => ({ 
          ...prev, 
          isSupported: false, 
          isEnabled: false,
          error: "Este dispositivo no soporta NFC"
        }))
      }
    } catch (error: any) {
      console.error("Error inicializando NFC:", error)
      
      // Si el error es porque no hay módulo nativo, no es un error crítico
      const isModuleError = error?.message?.includes("null") || 
                           error?.message?.includes("undefined") ||
                           error?.message?.includes("Cannot convert")
      
      setState((prev) => ({ 
        ...prev, 
        isSupported: false, 
        isEnabled: false,
        error: isModuleError 
          ? "NFC no disponible en este entorno. Necesitas un build de desarrollo."
          : "Error al inicializar NFC" 
      }))
    }
  }

  const checkNFCSupport = async () => {
    await initNFC()
  }

  // Abrir configuración de NFC (Android)
  const openNFCSettings = async () => {
    if (!NfcManager) {
      Alert.alert("Info", "NFC no disponible en este entorno")
      return
    }
    
    if (Platform.OS === 'android') {
      try {
        await NfcManager.goToNfcSetting()
      } catch (error) {
        Alert.alert("Error", "No se pudo abrir la configuración de NFC")
      }
    } else {
      Alert.alert("Info", "Por favor ve a Configuración > NFC para activarlo")
    }
  }

  // Escanear tarjeta NFC
  const startScan = useCallback(async (): Promise<Tarjeta | null> => {
    if (!NfcManager || !NfcTech) {
      setState((prev) => ({ ...prev, error: "NFC no disponible en este entorno" }))
      return null
    }

    if (!state.isSupported) {
      setState((prev) => ({ ...prev, error: "NFC no soportado en este dispositivo" }))
      return null
    }

    if (!state.isEnabled) {
      setState((prev) => ({ ...prev, error: "NFC está desactivado" }))
      openNFCSettings()
      return null
    }

    setState((prev) => ({ ...prev, isScanning: true, error: null }))

    try {
      // Solicitar tecnología NFC (intentamos varias)
      await NfcManager.requestTechnology([
        NfcTech.Ndef,
        NfcTech.NfcA,
        NfcTech.NfcB,
        NfcTech.NfcF,
        NfcTech.NfcV,
        NfcTech.IsoDep,
        NfcTech.MifareClassic,
        NfcTech.MifareUltralight,
      ])

      // Obtener el tag
      const tag = await NfcManager.getTag()
      
      if (!tag) {
        throw new Error("No se detectó ninguna tarjeta")
      }

      console.log("📱 Tag NFC detectado:", tag)

      // Obtener el ID único de la tarjeta (UID/Serial Number)
      let rfidCode = ""
      
      if (tag.id) {
        // El ID viene como string hexadecimal
        rfidCode = tag.id.toUpperCase().replace(/:/g, "")
      } else if (tag.ndefMessage && tag.ndefMessage.length > 0 && Ndef) {
        // Si tiene mensaje NDEF, intentar leerlo
        const ndefRecord = tag.ndefMessage[0]
        if (ndefRecord.payload) {
          const payload = Ndef.text.decodePayload(new Uint8Array(ndefRecord.payload))
          rfidCode = payload.toUpperCase()
        }
      }

      if (!rfidCode) {
        throw new Error("No se pudo leer el código de la tarjeta")
      }

      console.log("🔑 Código RFID:", rfidCode)

      // Buscar tarjeta en el servicio
      const result = await tarjetaService.findByRfidCode(rfidCode)

      // Cancelar la sesión NFC
      await NfcManager.cancelTechnologyRequest()

      if (result.success && result.data) {
        setState((prev) => ({
          ...prev,
          isScanning: false,
          lastScannedCard: result.data || null,
          error: null,
        }))
        return result.data
      } else {
        // Tarjeta no registrada - devolver info básica para vincular
        const unregisteredCard: Tarjeta = {
          id: "",
          nombre: "Tarjeta Nueva",
          celular: "",
          montoBs: 0,
          estado: "inactiva",
          usuarioAppId: null,
          rfidCode: rfidCode,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        setState((prev) => ({
          ...prev,
          isScanning: false,
          lastScannedCard: unregisteredCard,
          error: "Tarjeta no registrada. ¿Deseas vincularla?",
        }))
        return unregisteredCard
      }

    } catch (error: any) {
      console.error("Error escaneando NFC:", error)
      
      // Asegurar que cancelamos la sesión
      try {
        await NfcManager.cancelTechnologyRequest()
      } catch (e) {
        // Ignorar error de cancelación
      }

      let errorMessage = "Error al escanear la tarjeta"
      
      if (error?.message?.includes("cancelled")) {
        errorMessage = "Escaneo cancelado"
      } else if (error?.message?.includes("timeout")) {
        errorMessage = "Tiempo de espera agotado. Acerca la tarjeta nuevamente"
      } else if (error?.message) {
        errorMessage = error.message
      }

      setState((prev) => ({ 
        ...prev, 
        isScanning: false, 
        error: errorMessage 
      }))
      return null
    }
  }, [state.isSupported, state.isEnabled])

  // Detener escaneo
  const stopScan = useCallback(async () => {
    if (!NfcManager) return
    
    try {
      await NfcManager.cancelTechnologyRequest()
    } catch (error) {
      // Ignorar si ya estaba cancelado
    }
    setState((prev) => ({ ...prev, isScanning: false }))
  }, [])

  // Leer datos NDEF de una tarjeta
  const readNdefMessage = useCallback(async (): Promise<string | null> => {
    if (!NfcManager || !NfcTech || !Ndef) return null
    if (!state.isSupported || !state.isEnabled) return null

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef)
      const tag = await NfcManager.getTag()
      
      if (tag?.ndefMessage && tag.ndefMessage.length > 0) {
        const ndefRecord = tag.ndefMessage[0]
        if (ndefRecord.payload) {
          const text = Ndef.text.decodePayload(new Uint8Array(ndefRecord.payload))
          await NfcManager.cancelTechnologyRequest()
          return text
        }
      }
      
      await NfcManager.cancelTechnologyRequest()
      return null
    } catch (error) {
      await NfcManager?.cancelTechnologyRequest?.().catch(() => {})
      return null
    }
  }, [state.isSupported, state.isEnabled])

  // Escribir datos NDEF a una tarjeta
  const writeNdefMessage = useCallback(async (message: string): Promise<boolean> => {
    if (!NfcManager || !NfcTech || !Ndef) {
      setState((prev) => ({ ...prev, error: "NFC no disponible" }))
      return false
    }
    
    if (!state.isSupported || !state.isEnabled) {
      setState((prev) => ({ ...prev, error: "NFC no disponible" }))
      return false
    }

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef)
      
      const bytes = Ndef.encodeMessage([Ndef.textRecord(message)])
      
      if (bytes) {
        await NfcManager.ndefHandler.writeNdefMessage(bytes)
        await NfcManager.cancelTechnologyRequest()
        return true
      }
      
      await NfcManager.cancelTechnologyRequest()
      return false
    } catch (error) {
      console.error("Error escribiendo NFC:", error)
      await NfcManager?.cancelTechnologyRequest?.().catch(() => {})
      setState((prev) => ({ ...prev, error: "Error al escribir en la tarjeta" }))
      return false
    }
  }, [state.isSupported, state.isEnabled])

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
    readNdefMessage,
    writeNdefMessage,
    clearError,
    clearLastCard,
    checkNFCSupport,
    openNFCSettings,
  }
}
