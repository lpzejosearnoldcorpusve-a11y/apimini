import type { RouteSegment } from "@/types/routing"
import type { Coordenada } from "@/types/transport"
import * as Location from "expo-location"
import React, { useEffect, useRef, useState } from "react"
import { StyleSheet, View } from "react-native"
import MapView, { LatLng, Marker, Polyline, Region, UrlTile } from "react-native-maps"

// Centro de La Paz, Bolivia
const LA_PAZ_CENTER = { lat: -16.5, lng: -68.15 }

// URLs de tiles de CartoCDN
const TILE_URLS = {
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  voyager: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
}

// Subdominios para load balancing
const SUBDOMAINS = ['a', 'b', 'c', 'd']

interface MarkerConfig {
  id: string
  position: Coordenada
  label: string
  color?: string
  icon?: "origin" | "destination" | "station" | "stop" | "user"
}

interface RouteConfig {
  id: string
  coordinates: Coordenada[]
  color: string
  name: string
  dashed?: boolean
  weight?: number
}

interface CartoMapProps {
  routes?: RouteConfig[]
  markers?: MarkerConfig[]
  routeSegments?: RouteSegment[]
  selectedRouteId?: string | null
  onMarkerClick?: (id: string) => void
  onMapPress?: (coord: Coordenada) => void
  zoom?: number
  center?: Coordenada
  theme?: "light" | "dark" | "voyager"
  showUserLocation?: boolean
  userLocation?: Coordenada | null
  maxZoom?: number
  minZoom?: number
}

export function CartoMap({
  routes = [],
  markers = [],
  routeSegments = [],
  selectedRouteId,
  onMarkerClick,
  onMapPress,
  zoom = 13,
  center = LA_PAZ_CENTER,
  theme = "voyager",
  showUserLocation = false,
  userLocation,
  maxZoom = 19,
  minZoom = 0,
}: CartoMapProps) {
  const mapRef = useRef<MapView>(null)
  const [userRegion, setUserRegion] = useState<Region | null>(null)
  const [locationPermission, setLocationPermission] = useState(false)
  const [currentSubdomain, setCurrentSubdomain] = useState(0)

  // Rotar subdominios para load balancing
  const getTileUrl = () => {
    const baseUrl = TILE_URLS[theme]
    const subdomain = SUBDOMAINS[currentSubdomain]
    return baseUrl.replace('{s}', subdomain)
  }

  // Rotar subdominios periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSubdomain((prev) => (prev + 1) % SUBDOMAINS.length)
    }, 10000) // Cambia cada 10 segundos
    
    return () => clearInterval(interval)
  }, [])

  // Solicitar permisos de ubicación
  useEffect(() => {
    if (showUserLocation) {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status === "granted") {
          setLocationPermission(true)
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          })
          setUserRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          })
        }
      })()
    }
  }, [showUserLocation])

  // Configurar región inicial
  useEffect(() => {
    if (center && mapRef.current) {
      const region = {
        latitude: center.lat,
        longitude: center.lng,
        latitudeDelta: calculateDelta(zoom),
        longitudeDelta: calculateDelta(zoom),
      }
      mapRef.current.animateToRegion(region, 1000)
    }
  }, [center, zoom])

  // Calcular delta basado en zoom level
  const calculateDelta = (zoomLevel: number) => {
    return 180 / Math.pow(2, zoomLevel)
  }

  // Ajustar vista para mostrar todos los elementos
  useEffect(() => {
    if (routes.length > 0 || markers.length > 0 || routeSegments.length > 0) {
      const allCoords: LatLng[] = []

      routes.forEach((route) => {
        route.coordinates.forEach((coord) => {
          allCoords.push({ latitude: coord.lat, longitude: coord.lng })
        })
      })

      routeSegments.forEach((segment) => {
        segment.coordinates.forEach((coord) => {
          allCoords.push({ latitude: coord.lat, longitude: coord.lng })
        })
      })

      markers.forEach((marker) => {
        allCoords.push({ latitude: marker.position.lat, longitude: marker.position.lng })
      })

      if (userLocation) {
        allCoords.push({ latitude: userLocation.lat, longitude: userLocation.lng })
      }

      if (allCoords.length > 0 && mapRef.current) {
        mapRef.current.fitToCoordinates(allCoords, {
          edgePadding: { 
            top: 60, 
            right: 60, 
            bottom: 60, 
            left: 60 
          },
          animated: true,
        })
      }
    }
  }, [routes, markers, routeSegments, userLocation])

  // Obtener icono para marcador
  const getMarkerIcon = (type?: string, color?: string) => {
    const iconConfig: Record<string, { emoji: string; color: string; size: number }> = {
      origin: { emoji: "🟢", color: "#10b981", size: 40 },
      destination: { emoji: "🔴", color: "#ef4444", size: 40 },
      station: { emoji: "🚉", color: color || "#0891b2", size: 35 },
      stop: { emoji: "🚏", color: color || "#6b7280", size: 30 },
      user: { emoji: "📍", color: "#3b82f6", size: 30 },
      default: { emoji: "📍", color: color || "#0891b2", size: 35 },
    }
    
    return iconConfig[type || "default"] || iconConfig.default
  }

  // Renderizar marcador personalizado
  const renderMarker = (marker: MarkerConfig) => {
    const icon = getMarkerIcon(marker.icon, marker.color)
    
    return (
      <Marker
        key={marker.id}
        coordinate={{
          latitude: marker.position.lat,
          longitude: marker.position.lng,
        }}
        title={marker.label}
        description={marker.label}
        onPress={() => onMarkerClick?.(marker.id)}
        tracksViewChanges={false}
      >
        <View style={[
          styles.markerContainer, 
          { 
            backgroundColor: icon.color,
            width: icon.size,
            height: icon.size,
            borderRadius: icon.size / 2,
          }
        ]}>
          <Text style={[
            styles.markerEmoji,
            { fontSize: icon.size * 0.5 }
          ]}>
            {icon.emoji}
          </Text>
        </View>
      </Marker>
    )
  }

  // Renderizar marcador de ubicación del usuario
  const renderUserLocation = () => {
    if (showUserLocation && userLocation) {
      const icon = getMarkerIcon("user", "#3b82f6")
      
      return (
        <Marker
          coordinate={{
            latitude: userLocation.lat,
            longitude: userLocation.lng,
          }}
          title="Tu ubicación"
          tracksViewChanges={false}
        >
          <View style={[
            styles.userMarkerContainer, 
            { 
              backgroundColor: icon.color,
              width: icon.size,
              height: icon.size,
              borderRadius: icon.size / 2,
            }
          ]}>
            <Text style={[
              styles.userMarkerEmoji,
              { fontSize: icon.size * 0.5 }
            ]}>
              {icon.emoji}
            </Text>
          </View>
        </Marker>
      )
    }
    return null
  }

  // Renderizar overlay de atribución
  const renderAttribution = () => (
    <View style={styles.attributionContainer}>
      <Text style={styles.attributionText}>
        © CARTO
      </Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: LA_PAZ_CENTER.lat,
          longitude: LA_PAZ_CENTER.lng,
          latitudeDelta: calculateDelta(zoom),
          longitudeDelta: calculateDelta(zoom),
        }}
        showsUserLocation={showUserLocation && locationPermission}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        onPress={(event) => {
          onMapPress?.({
            lat: event.nativeEvent.coordinate.latitude,
            lng: event.nativeEvent.coordinate.longitude,
          })
        }}
        // Deshabilitar el mapa base de Google Maps
        provider={undefined}
      >
        {/* Tile layer de CartoCDN */}
        <UrlTile
          urlTemplate={getTileUrl()}
          maximumZ={maxZoom}
          minimumZ={minZoom}
          tileSize={256}
          shouldReplaceMapContent={true}
          zIndex={-1}
        />

        {/* Renderizar rutas normales */}
        {routes.map((route) => {
          const isSelected = selectedRouteId === route.id
          return (
            <Polyline
              key={route.id}
              coordinates={route.coordinates.map((c) => ({
                latitude: c.lat,
                longitude: c.lng,
              }))}
              strokeColor={route.color}
              strokeWidth={route.weight || (isSelected ? 6 : 4)}
              lineDashPattern={route.dashed ? [10, 10] : undefined}
              lineCap="round"
              lineJoin="round"
              zIndex={1}
            />
          )
        })}

        {/* Renderizar segmentos de ruta planificada */}
        {routeSegments.map((segment, index) => {
          const color = segment.color || (segment.type === "walk" ? "#6b7280" : "#0891b2")
          const dashed = segment.type === "walk"
          
          return (
            <Polyline
              key={`segment-${index}`}
              coordinates={segment.coordinates.map((c) => ({
                latitude: c.lat,
                longitude: c.lng,
              }))}
              strokeColor={color}
              strokeWidth={segment.type === "walk" ? 4 : 6}
              lineDashPattern={dashed ? [8, 8] : undefined}
              lineCap="round"
              lineJoin="round"
              zIndex={2}
            />
          )
        })}

        {/* Renderizar marcadores */}
        {markers.map(renderMarker)}
        
        {/* Renderizar ubicación del usuario */}
        {renderUserLocation()}
      </MapView>

      {/* Overlay de atribución */}
      {renderAttribution()}

      {/* Botón para centrar en ubicación actual */}
      {showUserLocation && locationPermission && (
        <TouchableOpacity
          style={styles.centerButton}
          onPress={() => {
            if (userRegion && mapRef.current) {
              mapRef.current.animateToRegion(userRegion, 1000)
            }
          }}
        >
          <Text style={styles.centerButtonText}>📍</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

// Necesitamos importar Text y TouchableOpacity
import { Text, TouchableOpacity } from "react-native"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  markerContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerEmoji: {
    textAlign: "center",
  },
  userMarkerContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  userMarkerEmoji: {
    textAlign: "center",
  },
  centerButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "white",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  centerButtonText: {
    fontSize: 24,
  },
  attributionContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  attributionText: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
})

export default CartoMap