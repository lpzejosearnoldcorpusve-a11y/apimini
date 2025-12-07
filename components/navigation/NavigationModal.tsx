"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import type { NavigationDestination } from "@/types/navigation"
import { LinearGradient } from "expo-linear-gradient"
import * as Location from "expo-location"
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Clock,
    Footprints,
    MapPin,
    Navigation,
    RotateCcw,
    Volume2,
    VolumeX,
    X,
} from "lucide-react-native"
import React, { useCallback, useEffect, useRef, useState } from "react"
import {
    Animated,
    Dimensions,
    Modal,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

interface NavigationModalProps {
  visible: boolean
  destination: NavigationDestination | null
  onClose: () => void
  transportColor?: string
  transportName?: string
}

interface RouteStep {
  instruction: string
  distance: number
  distanceText: string
  maneuver: string
  coordinates: { lat: number; lng: number }
}

interface RouteInfo {
  distance: string
  duration: string
  steps: RouteStep[]
  polyline: { latitude: number; longitude: number }[]
}

// Simular pasos de navegación basados en la distancia
function generateNavigationSteps(
  userLat: number,
  userLng: number,
  destLat: number,
  destLng: number
): RouteInfo {
  const R = 6371 // Radio de la tierra en km
  const dLat = ((destLat - userLat) * Math.PI) / 180
  const dLng = ((destLng - userLng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userLat * Math.PI) / 180) *
      Math.cos((destLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distanceKm = R * c
  const distanceM = distanceKm * 1000

  // Calcular tiempo estimado caminando (5 km/h promedio)
  const walkingSpeedKmH = 5
  const durationMinutes = Math.round((distanceKm / walkingSpeedKmH) * 60)

  // Generar puntos intermedios para la ruta
  const numPoints = Math.max(5, Math.min(20, Math.round(distanceM / 50)))
  const polyline: { latitude: number; longitude: number }[] = []
  
  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints
    // Añadir algo de variación para que parezca una ruta real
    const variation = i > 0 && i < numPoints ? (Math.random() - 0.5) * 0.0005 : 0
    polyline.push({
      latitude: userLat + (destLat - userLat) * fraction + variation,
      longitude: userLng + (destLng - userLng) * fraction + variation,
    })
  }

  // Generar pasos de navegación
  const steps: RouteStep[] = []
  const directions = ["norte", "sur", "este", "oeste", "noreste", "noroeste", "sureste", "suroeste"]
  
  // Determinar dirección general
  const bearing = Math.atan2(destLng - userLng, destLat - userLat) * 180 / Math.PI
  let generalDirection = "norte"
  if (bearing >= -22.5 && bearing < 22.5) generalDirection = "norte"
  else if (bearing >= 22.5 && bearing < 67.5) generalDirection = "noreste"
  else if (bearing >= 67.5 && bearing < 112.5) generalDirection = "este"
  else if (bearing >= 112.5 && bearing < 157.5) generalDirection = "sureste"
  else if (bearing >= 157.5 || bearing < -157.5) generalDirection = "sur"
  else if (bearing >= -157.5 && bearing < -112.5) generalDirection = "suroeste"
  else if (bearing >= -112.5 && bearing < -67.5) generalDirection = "oeste"
  else if (bearing >= -67.5 && bearing < -22.5) generalDirection = "noroeste"

  // Paso inicial
  steps.push({
    instruction: `Dirígete hacia el ${generalDirection}`,
    distance: Math.round(distanceM * 0.3),
    distanceText: `${Math.round(distanceM * 0.3)} m`,
    maneuver: "depart",
    coordinates: { lat: userLat, lng: userLng },
  })

  if (distanceM > 200) {
    const midPoint = polyline[Math.floor(numPoints * 0.4)]
    steps.push({
      instruction: `Continúa recto por ${Math.round(distanceM * 0.4)} metros`,
      distance: Math.round(distanceM * 0.4),
      distanceText: `${Math.round(distanceM * 0.4)} m`,
      maneuver: "straight",
      coordinates: { lat: midPoint.latitude, lng: midPoint.longitude },
    })
  }

  if (distanceM > 400) {
    const turnPoint = polyline[Math.floor(numPoints * 0.7)]
    const turnDirection = Math.random() > 0.5 ? "izquierda" : "derecha"
    steps.push({
      instruction: `Gira a la ${turnDirection}`,
      distance: Math.round(distanceM * 0.2),
      distanceText: `${Math.round(distanceM * 0.2)} m`,
      maneuver: turnDirection === "izquierda" ? "turn-left" : "turn-right",
      coordinates: { lat: turnPoint.latitude, lng: turnPoint.longitude },
    })
  }

  // Paso final
  steps.push({
    instruction: "Has llegado a tu destino",
    distance: 0,
    distanceText: "0 m",
    maneuver: "arrive",
    coordinates: { lat: destLat, lng: destLng },
  })

  return {
    distance: distanceKm < 1 ? `${Math.round(distanceM)} m` : `${distanceKm.toFixed(1)} km`,
    duration: durationMinutes < 60 
      ? `${durationMinutes} min` 
      : `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}min`,
    steps,
    polyline,
  }
}

function getManeuverIcon(maneuver: string, size: number = 32, color: string = "#fff") {
  switch (maneuver) {
    case "turn-left":
      return <ArrowLeft size={size} color={color} />
    case "turn-right":
      return <ArrowRight size={size} color={color} />
    case "arrive":
      return <MapPin size={size} color={color} />
    case "depart":
      return <Navigation size={size} color={color} />
    default:
      return <ArrowUp size={size} color={color} />
  }
}

export function NavigationModal({
  visible,
  destination,
  onClose,
  transportColor = COLORS.primary,
  transportName = "Parada",
}: NavigationModalProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const mapRef = useRef<MapView>(null)
  const pulseAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current

  console.log('🗺️ NavigationModal - visible:', visible, 'destination:', destination?.name || null)

  // Animación de entrada
  useEffect(() => {
    if (visible && destination) {
      console.log('🚀 NavigationModal abierto con destino:', destination)
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start()
    } else {
      slideAnim.setValue(SCREEN_HEIGHT)
    }
  }, [visible, destination])

  // Animación de pulso para el marcador del usuario
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [])

  // Obtener ubicación del usuario
  useEffect(() => {
    if (!visible || !destination) {
      return
    }

    console.log('📍 Iniciando obtención de ubicación para destino:', destination.name)

    const getLocation = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        console.log('📍 Permiso de ubicación:', status)
        
        if (status !== "granted") {
          console.log("❌ Permiso de ubicación denegado")
          setError("Necesitamos acceso a tu ubicación para navegar")
          setLoading(false)
          return
        }

        console.log('📍 Obteniendo ubicación actual...')
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })

        const userLoc = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        }
        console.log('✅ Ubicación obtenida:', userLoc)
        setUserLocation(userLoc)

        // Generar ruta
        console.log('🛣️ Generando ruta hacia:', destination)
        const route = generateNavigationSteps(
          userLoc.lat,
          userLoc.lng,
          destination.lat,
          destination.lng
        )
        console.log('✅ Ruta generada:', route)
        setRouteInfo(route)
        setCurrentStepIndex(0)
      } catch (err) {
        console.error("❌ Error obteniendo ubicación:", err)
        setError("Error al obtener tu ubicación. Intenta nuevamente.")
      }
      setLoading(false)
    }

    getLocation()
  }, [visible, destination])

  // Centrar mapa cuando hay ubicación y destino
  useEffect(() => {
    if (userLocation && destination && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: userLocation.lat, longitude: userLocation.lng },
          { latitude: destination.lat, longitude: destination.lng },
        ],
        {
          edgePadding: { top: 150, right: 50, bottom: 200, left: 50 },
          animated: true,
        }
      )
    }
  }, [userLocation, destination])

  const startNavigation = useCallback(() => {
    setIsNavigating(true)
    setCurrentStepIndex(0)
  }, [])

  const nextStep = useCallback(() => {
    if (routeInfo && currentStepIndex < routeInfo.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }, [routeInfo, currentStepIndex])

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }, [currentStepIndex])

  const recenterMap = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      })
    }
  }, [userLocation])

  const currentStep = routeInfo?.steps[currentStepIndex]

  if (!destination) return null

  return (
    <Modal
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <Animated.View 
        style={[
          styles.container,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Mapa de fondo */}
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: destination.lat,
            longitude: destination.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsCompass={false}
          showsMyLocationButton={false}
          customMapStyle={darkMapStyle}
        >
          {/* Ruta */}
          {routeInfo && (
            <Polyline
              coordinates={routeInfo.polyline}
              strokeColor={transportColor}
              strokeWidth={6}
              lineDashPattern={[0]}
              lineJoin="round"
              lineCap="round"
            />
          )}

          {/* Marcador de usuario */}
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.lat,
                longitude: userLocation.lng,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View style={styles.userMarkerOuter}>
                  <View style={[styles.userMarkerInner, { backgroundColor: transportColor }]}>
                    <Navigation size={16} color="#fff" style={{ transform: [{ rotate: "45deg" }] }} />
                  </View>
                </View>
              </Animated.View>
            </Marker>
          )}

          {/* Marcador de destino */}
          <Marker
            coordinate={{
              latitude: destination.lat,
              longitude: destination.lng,
            }}
            anchor={{ x: 0.5, y: 1 }}
          >
            <View style={styles.destinationMarker}>
              <LinearGradient
                colors={[transportColor, `${transportColor}cc`]}
                style={styles.destinationMarkerGradient}
              >
                <MapPin size={24} color="#fff" />
              </LinearGradient>
              <View style={[styles.destinationMarkerTail, { borderTopColor: transportColor }]} />
            </View>
          </Marker>
        </MapView>

        {/* Header con controles */}
        <View style={styles.header}>
          <View style={styles.headerBlur}>
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerSubtitle}>Navegando hacia</Text>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {destination.name}
                </Text>
              </View>

              <TouchableOpacity 
                onPress={() => setIsMuted(!isMuted)} 
                style={styles.muteButton}
              >
                {isMuted ? (
                  <VolumeX size={24} color="#fff" />
                ) : (
                  <Volume2 size={24} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Panel de navegación estilo Android Auto */}
        <View style={styles.navigationPanel}>
          <View style={styles.navigationBlur}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Animated.View 
                  style={[
                    styles.loadingPulse,
                    { 
                      backgroundColor: transportColor,
                      transform: [{ scale: pulseAnim }],
                      opacity: pulseAnim.interpolate({
                        inputRange: [1, 1.3],
                        outputRange: [0.8, 0.3],
                      })
                    }
                  ]}
                />
                <Text style={styles.loadingText}>Calculando ruta...</Text>
              </View>
            ) : error ? (
              // Vista de error
              <View style={styles.errorContainer}>
                <AlertCircle size={48} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: transportColor }]}
                  onPress={onClose}
                >
                  <Text style={styles.retryButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            ) : !isNavigating ? (
              // Vista previa de ruta
              <View style={styles.previewContainer}>
                <View style={styles.routeSummary}>
                  <View style={styles.routeInfoItem}>
                    <Footprints size={24} color={transportColor} />
                    <Text style={styles.routeInfoValue}>{routeInfo?.distance}</Text>
                    <Text style={styles.routeInfoLabel}>distancia</Text>
                  </View>
                  
                  <View style={styles.routeDivider} />
                  
                  <View style={styles.routeInfoItem}>
                    <Clock size={24} color={transportColor} />
                    <Text style={styles.routeInfoValue}>{routeInfo?.duration}</Text>
                    <Text style={styles.routeInfoLabel}>caminando</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.startButton}
                  onPress={startNavigation}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[transportColor, `${transportColor}dd`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.startButtonGradient}
                  >
                    <Navigation size={24} color="#fff" />
                    <Text style={styles.startButtonText}>Iniciar navegación</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              // Vista de navegación activa
              <View style={styles.activeNavigationContainer}>
                {/* Indicador de paso actual */}
                <View style={styles.currentStepContainer}>
                  <LinearGradient
                    colors={[transportColor, `${transportColor}cc`]}
                    style={styles.maneuverIconContainer}
                  >
                    {currentStep && getManeuverIcon(currentStep.maneuver, 40, "#fff")}
                  </LinearGradient>
                  
                  <View style={styles.stepInfo}>
                    <Text style={styles.stepInstruction}>
                      {currentStep?.instruction}
                    </Text>
                    <Text style={styles.stepDistance}>
                      {currentStep?.distanceText}
                    </Text>
                  </View>
                </View>

                {/* Progreso de pasos */}
                <View style={styles.stepsProgress}>
                  {routeInfo?.steps.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.stepDot,
                        {
                          backgroundColor: 
                            index < currentStepIndex 
                              ? transportColor 
                              : index === currentStepIndex 
                                ? "#fff" 
                                : "rgba(255,255,255,0.3)",
                        }
                      ]}
                    />
                  ))}
                </View>

                {/* Controles de navegación */}
                <View style={styles.navigationControls}>
                  <TouchableOpacity
                    style={[
                      styles.navControlButton,
                      currentStepIndex === 0 && styles.navControlButtonDisabled
                    ]}
                    onPress={prevStep}
                    disabled={currentStepIndex === 0}
                  >
                    <ArrowLeft size={20} color={currentStepIndex === 0 ? "#666" : "#fff"} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.recenterButton}
                    onPress={recenterMap}
                  >
                    <RotateCcw size={20} color="#fff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.navControlButton,
                      routeInfo && currentStepIndex === routeInfo.steps.length - 1 && styles.navControlButtonDisabled
                    ]}
                    onPress={nextStep}
                    disabled={routeInfo ? currentStepIndex === routeInfo.steps.length - 1 : true}
                  >
                    <ArrowRight size={20} color={routeInfo && currentStepIndex === routeInfo.steps.length - 1 ? "#666" : "#fff"} />
                  </TouchableOpacity>
                </View>

                {/* Info de llegada */}
                <View style={styles.arrivalInfo}>
                  <Text style={styles.arrivalLabel}>Llegarás en aproximadamente</Text>
                  <Text style={styles.arrivalTime}>{routeInfo?.duration}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Botón flotante recentrar */}
        {isNavigating && (
          <TouchableOpacity
            style={[styles.floatingRecenter, { backgroundColor: transportColor }]}
            onPress={recenterMap}
          >
            <Navigation size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </Animated.View>
    </Modal>
  )
}

// Estilo de mapa oscuro para navegación
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
]

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerBlur: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: SPACING.md,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: "#fff",
  },
  muteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  navigationPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  navigationBlur: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    overflow: "hidden",
    paddingBottom: Platform.OS === "ios" ? 34 : SPACING.lg,
    backgroundColor: "rgba(20,20,30,0.95)",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxl,
  },
  loadingPulse: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: "rgba(255,255,255,0.7)",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  retryButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: "#fff",
  },
  previewContainer: {
    padding: SPACING.lg,
  },
  routeSummary: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  routeInfoItem: {
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  routeInfoValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "700",
    color: "#fff",
    marginTop: SPACING.sm,
  },
  routeInfoLabel: {
    fontSize: FONT_SIZES.xs,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  routeDivider: {
    width: 1,
    height: 60,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  startButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  startButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md + 4,
    gap: SPACING.sm,
  },
  startButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: "#fff",
  },
  activeNavigationContainer: {
    padding: SPACING.lg,
  },
  currentStepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  maneuverIconContainer: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  stepInfo: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: "#fff",
    marginBottom: SPACING.xs,
  },
  stepDistance: {
    fontSize: FONT_SIZES.lg,
    color: "rgba(255,255,255,0.6)",
  },
  stepsProgress: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  navigationControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  navControlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  navControlButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  recenterButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  arrivalInfo: {
    alignItems: "center",
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  arrivalLabel: {
    fontSize: FONT_SIZES.xs,
    color: "rgba(255,255,255,0.5)",
  },
  arrivalTime: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: "#fff",
    marginTop: SPACING.xs,
  },
  userMarkerOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  userMarkerInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.lg,
  },
  destinationMarker: {
    alignItems: "center",
  },
  destinationMarkerGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.lg,
  },
  destinationMarkerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -4,
  },
  floatingRecenter: {
    position: "absolute",
    right: SPACING.lg,
    bottom: 280,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.lg,
  },
})
