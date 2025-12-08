import type {
    Coordenada,
    NavigationInstruction,
    NavigationState,
    RouteOption
} from "@/types/routing"
import * as Location from "expo-location"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Alert, BackHandler, StyleSheet, View } from "react-native"
import { NavigationHeader } from "./NavigationHeader"
import { NavigationProgress } from "./NavigationProgress"

interface NavigationModeProps {
  route: RouteOption
  onExit: () => void
}

export function NavigationMode({ route, onExit }: NavigationModeProps) {
  const [navState, setNavState] = useState<NavigationState>({
    isActive: true,
    isPaused: false,
    currentSegmentIndex: 0,
    currentInstructionIndex: 0,
    completedSegments: [],
    startedAt: new Date(),
    estimatedArrival: null,
    remainingDuration: route.totalDuration,
    remainingDistance: route.totalDistance,
    upcomingAlerts: [], // Add default value for upcomingAlerts
    travelStats: { distanceTraveled: 0, timeElapsed: 0, costIncurred: 0, segmentsCompleted: 0 }, // Add default value for travelStats
  })
  
  const [isMinimized, setIsMinimized] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<Coordenada | null>(null)
  const [locationUpdates, setLocationUpdates] = useState(0)
  const locationSubscription = useRef<Location.LocationSubscription | null>(null)

  // Solicitar permisos de ubicación
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Se necesita acceso a la ubicación para la navegación en tiempo real."
        )
        return
      }
      
      // Obtener ubicación inicial
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      })
      
      setCurrentLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      })

      // Suscribirse a actualizaciones de ubicación en tiempo real
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5, // metros
          timeInterval: 1000, // milisegundos
        },
        (location) => {
          setCurrentLocation({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          })
          setLocationUpdates(prev => prev + 1)
        }
      )
    })()

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove()
      }
    }
  }, [])

  // Generar instrucciones de navegación desde los segmentos
  const instructions = useMemo((): NavigationInstruction[] => {
    const result: NavigationInstruction[] = []

    // Instrucción inicial
    result.push({
      id: "start",
      type: "start",
      icon: "flag",
      mainText: "Iniciar navegación",
      subText: "Sigue las instrucciones paso a paso",
      segmentIndex: 0,
    })

    route.segments.forEach((segment, index) => {
      // Instrucción de inicio/caminar
      if (segment.type === "walk") {
        result.push({
          id: `${segment.id}-walk`,
          type: "walk",
          icon: "walk",
          mainText: segment.instructions,
          subText: segment.to.name,
          distance: segment.distance ? `${segment.distance}m` : undefined,
          duration: `${segment.duration} min`,
          segmentIndex: index,
        })
      } else if (segment.type === "minibus") {
        // Abordar minibus
        result.push({
          id: `${segment.id}-board`,
          type: "board",
          icon: "bus",
          mainText: `Tomar ${segment.line}`,
          subText: `Dirección: ${segment.to.name}`,
          segmentIndex: index,
        })
        // En el minibus
        result.push({
          id: `${segment.id}-ride`,
          type: "ride",
          icon: "bus",
          mainText: `Viajando en ${segment.line}`,
          subText: `Próxima parada: ${segment.to.name}`,
          distance: segment.distance ? `${(segment.distance / 1000).toFixed(1)}km` : undefined,
          duration: `${segment.duration} min`,
          segmentIndex: index,
        })
        // Bajarse
        result.push({
          id: `${segment.id}-exit`,
          type: "exit",
          icon: "exit",
          mainText: `Bajar en ${segment.to.name}`,
          subText: "Prepárate para bajar",
          segmentIndex: index,
        })
      } else if (segment.type === "teleferico") {
        // Abordar teleférico
        result.push({
          id: `${segment.id}-board`,
          type: "board",
          icon: "cable",
          mainText: `Abordar ${segment.line}`,
          subText: `Estación: ${segment.from.name}`,
          segmentIndex: index,
        })
        // En el teleférico
        result.push({
          id: `${segment.id}-ride`,
          type: "ride",
          icon: "cable",
          mainText: `Viajando en ${segment.line}`,
          subText: `Destino: ${segment.to.name}`,
          distance: segment.distance ? `${(segment.distance / 1000).toFixed(1)}km` : undefined,
          duration: `${segment.duration} min`,
          segmentIndex: index,
        })
        // Bajarse
        result.push({
          id: `${segment.id}-exit-teleferico`,
          type: "exit",
          icon: "exit",
          mainText: `Llegando a ${segment.to.name}`,
          subText: "Prepárate para salir",
          segmentIndex: index,
        })
      }
    })

    // Instrucción final
    result.push({
      id: "arrive",
      type: "arrive",
      icon: "flag-checkered",
      mainText: "¡Has llegado a tu destino!",
      subText: route.segments[route.segments.length - 1]?.to.name,
      segmentIndex: route.segments.length - 1,
    })

    return result
  }, [route])

  // Calcular hora estimada de llegada
  useEffect(() => {
    if (navState.startedAt) {
      const arrival = new Date(navState.startedAt.getTime() + route.totalDuration * 60000)
      setNavState((prev) => ({ ...prev, estimatedArrival: arrival }))
    }
  }, [navState.startedAt, route.totalDuration])

  // Navegación en tiempo real con GPS
  useEffect(() => {
    if (navState.isPaused || !navState.isActive || !currentLocation) return

    const checkProximity = () => {
      const currentSegment = route.segments[navState.currentSegmentIndex]
      if (!currentSegment) return

      // Calcular distancia al punto de destino del segmento actual
      if (!currentLocation) return

      const targetLocation = { lat: currentSegment.to.lat, lng: currentSegment.to.lng }
      const distanceToTarget = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        targetLocation.lat,
        targetLocation.lng
      )

      // Si estamos cerca del destino del segmento actual
      if (distanceToTarget < 50) { // 50 metros de proximidad
        setNavState((prev) => {
          // Marcar segmento como completado
          const newCompletedSegments = [...prev.completedSegments, currentSegment.id]
          
          // Avanzar al siguiente segmento si existe
          let newSegmentIndex = prev.currentSegmentIndex
          if (prev.currentSegmentIndex < route.segments.length - 1) {
            newSegmentIndex = prev.currentSegmentIndex + 1
          }

          // Actualizar instrucción actual basada en el nuevo segmento
          let newInstructionIndex = prev.currentInstructionIndex
          const nextInstruction = instructions.findIndex(
            instr => instr.segmentIndex === newSegmentIndex
          )
          if (nextInstruction !== -1) {
            newInstructionIndex = nextInstruction
          }

          return {
            ...prev,
            currentSegmentIndex: newSegmentIndex,
            currentInstructionIndex: newInstructionIndex,
            completedSegments: newCompletedSegments,
            remainingDistance: Math.max(0, prev.remainingDistance - (currentSegment.distance ?? 0)),
          }
        })
      }

      // Actualizar distancia restante en tiempo real
      setNavState((prev) => {
        const totalDistance = calculateRemainingDistance(
          currentLocation,
          route.segments.slice(prev.currentSegmentIndex)
        )
        
        return {
          ...prev,
          remainingDistance: Math.round(totalDistance),
          remainingDuration: Math.round(totalDistance / 50), // 50 m/min ≈ 3 km/h
        }
      })
    }

    const interval = setInterval(checkProximity, 3000) // Verificar cada 3 segundos

    return () => clearInterval(interval)
  }, [
    navState.isPaused, 
    navState.isActive, 
    currentLocation, 
    locationUpdates,
    route.segments,
    navState.currentSegmentIndex,
    instructions
  ])

  // Calcular distancia entre dos coordenadas (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000 // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    
    return R * c // Distancia en metros
  }

  // Calcular distancia restante total
  const calculateRemainingDistance = (currentLocation: Coordenada, remainingSegments: any[]) => {
    if (remainingSegments.length === 0) return 0

    // Calcular distancia al inicio del primer segmento restante
    const firstSegment = remainingSegments[0]
    const fromCoord = firstSegment.from.coordenada || firstSegment.from
    const distanceToFirstPoint = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      fromCoord.lat,
      fromCoord.lng
    )

    // Sumar distancias de los segmentos restantes
    const segmentsDistance = remainingSegments.reduce(
      (sum, segment) => sum + (segment.distance || 0), 0
    )

    return distanceToFirstPoint + segmentsDistance
  }

  // Manejar botón de retroceso en Android
  useEffect(() => {
    const backAction = () => {
      showExitAlert()
      return true
    }

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)

    return () => backHandler.remove()
  }, [])

  const handlePause = useCallback(() => {
    setNavState((prev) => ({ ...prev, isPaused: true }))
    
    // Pausar actualizaciones de ubicación
    if (locationSubscription.current) {
    }
  }, [])

  const handleResume = useCallback(() => {
    setNavState((prev) => ({ ...prev, isPaused: false }))
    
    // Reanudar actualizaciones de ubicación
    // Necesitarías recrear la suscripción aquí
  }, [])

  const handleExit = useCallback(() => {
    // Detener actualizaciones de ubicación
    if (locationSubscription.current) {
      locationSubscription.current.remove()
    }
    
    setNavState((prev) => ({ ...prev, isActive: false }))
    onExit()
  }, [onExit])

  const showExitAlert = useCallback(() => {
    Alert.alert(
      "Salir de navegación",
      "¿Estás seguro que quieres salir del modo navegación?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Salir", 
          style: "destructive", 
          onPress: handleExit 
        }
      ]
    )
  }, [handleExit])

  const handleToggleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized)
  }, [isMinimized])

  const currentInstruction = instructions[navState.currentInstructionIndex]
  const nextInstruction = instructions[navState.currentInstructionIndex + 1]

  const formatArrivalTime = (date: Date | null) => {
    if (!date) return "--:--"
    return date.toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })
  }

  // Si llegamos al destino
  useEffect(() => {
    if (navState.completedSegments.length === route.segments.length) {
      setTimeout(() => {
        Alert.alert(
          "¡Destino alcanzado! 🎉",
          "Has llegado exitosamente a tu destino.",
          [
            { 
              text: "Finalizar", 
              onPress: handleExit,
              style: "default"
            }
          ]
        )
      }, 1000)
    }
  }, [navState.completedSegments.length, route.segments.length, handleExit])

  // Notificaciones de voz (opcional)
  useEffect(() => {
    if (currentInstruction && !navState.isPaused && !isMinimized) {
      // Aquí podrías integrar con expo-speech para anuncios de voz
      // Speech.speak(currentInstruction.mainText, { language: 'es' })
    }
  }, [currentInstruction, navState.isPaused, isMinimized])

  return (
    <View style={styles.container}>
      <NavigationHeader
        currentInstruction={currentInstruction}
        nextInstruction={nextInstruction}
        remainingTime={Math.round(navState.remainingDuration)}
        remainingDistance={Math.round(navState.remainingDistance)}
        estimatedArrival={formatArrivalTime(navState.estimatedArrival)}
        onPause={handlePause}
        onResume={handleResume}
        onClose={showExitAlert}
        isPaused={navState.isPaused}
        isMinimized={isMinimized}
        onToggleMinimize={handleToggleMinimize}
      />

      <NavigationProgress
        segments={route.segments}
        currentSegmentIndex={navState.currentSegmentIndex}
        completedSegments={navState.completedSegments}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: "transparent",
  },
})

export default NavigationMode