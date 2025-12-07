import { CartoMap } from "@/components/maps/CartoMap"
import { DestinationSheet } from "@/components/maps/DestinationSheet"
import { MapControls } from "@/components/maps/MapControls"
import { SearchBar } from "@/components/maps/SearchBar"
import { NavigationMode } from "@/components/navigation/NavigationMode"
import { RoutePreviewSheet } from "@/components/navigation/RoutePreviewSheet"
import { useLocation } from "@/hooks/useLocation"
import { useMinibuses, useTelefericos } from "@/hooks/useTransport"
import { routingService } from "@/services/routingService"
import type { Coordenada, RouteOption, SearchResult } from "@/types/routing"
import { LinearGradient } from 'expo-linear-gradient'
import { Clock, MapPin, Navigation, Star } from 'lucide-react-native'
import React, { useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Uber-like "Where to?" component
function WhereToPanel({ onSearchPress }: { onSearchPress: () => void }) {
  return (
    <View style={whereToStyles.container}>
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']}
        style={whereToStyles.gradient}
      >
        <Text style={whereToStyles.title}>¿A dónde vas?</Text>

        {/* Search Button */}
        <TouchableOpacity
          style={whereToStyles.searchButton}
          onPress={onSearchPress}
          activeOpacity={0.8}
        >
          <View style={whereToStyles.searchContent}>
            <View style={whereToStyles.searchIcon}>
              <MapPin size={20} color="#6B7280" />
            </View>
            <Text style={whereToStyles.searchPlaceholder}>
              Buscar destino...
            </Text>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={whereToStyles.quickActions}>
          <TouchableOpacity
            style={whereToStyles.quickAction}
            onPress={() => console.log("Schedule ride")}
          >
            <View style={[whereToStyles.quickIcon, { backgroundColor: '#DBEAFE' }]}>
              <Clock size={20} color="#0891B2" />
            </View>
            <Text style={whereToStyles.quickText}>Programar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={whereToStyles.quickAction}
            onPress={() => console.log("Saved places")}
          >
            <View style={[whereToStyles.quickIcon, { backgroundColor: '#FEF3C7' }]}>
              <Star size={20} color="#F59E0B" />
            </View>
            <Text style={whereToStyles.quickText}>Guardados</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={whereToStyles.quickAction}
            onPress={() => console.log("Round trip")}
          >
            <View style={[whereToStyles.quickIcon, { backgroundColor: '#D1FAE5' }]}>
              <Navigation size={20} color="#10B981" />
            </View>
            <Text style={whereToStyles.quickText}>Ida y vuelta</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  )
}

const whereToStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : StatusBar.currentHeight || 60, // Moved down from 60/40
    left: 16,
    right: 16,
    zIndex: 10,
  },
  gradient: {
    borderRadius: 16,
    padding: 16, // Reduced from 20
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 20, // Reduced from 24
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12, // Reduced from 16
  },
  searchButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12, // Reduced from 16
    marginBottom: 16, // Reduced from 20
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchPlaceholder: {
    fontSize: 14, // Reduced from 16
    color: '#9CA3AF',
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    paddingVertical: 6, // Reduced from 8
    paddingHorizontal: 10, // Reduced from 12
    borderRadius: 8,
  },
  quickIcon: {
    width: 40, // Reduced from 48
    height: 40, // Reduced from 48
    borderRadius: 20, // Reduced from 24
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2, // Reduced from 4
  },
  quickText: {
    fontSize: 11, // Reduced from 12
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
})

type ViewState = "exploring" | "searching" | "destination" | "routing" | "navigating"

export function MapsScreen() {
  // Data hooks
  const { minibuses, loading: loadingMinibuses } = useMinibuses()
  const { telefericos, loading: loadingTelefericos } = useTelefericos()
  const { location: userLocation, loading: locating, getCurrentLocation } = useLocation()

  // UI State
  const [viewState, setViewState] = useState<ViewState>("exploring")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<SearchResult | null>(null)
  const [origin, setOrigin] = useState<{ coord: Coordenada; name: string } | null>(null)
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([])
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null)
  const [calculatingRoutes, setCalculatingRoutes] = useState(false)

  const loading = loadingMinibuses || loadingTelefericos

  // Debounced search with rate limiting
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timeout = setTimeout(async () => {
      setSearching(true)
      try {
        // Search transport stations first (local data, no API calls)
        const transportResults = routingService.searchTransportStations(searchQuery, minibuses, telefericos)

        // Only search places if we have transport results or query is specific
        let placeResults: SearchResult[] = []
        if (transportResults.length > 0 || searchQuery.length > 3) {
          placeResults = await routingService.searchPlaces(searchQuery)
        }

        setSearchResults([...transportResults, ...placeResults])
      } catch (error) {
        console.error("Error searching:", error)
        Alert.alert("Error", "No se pudo realizar la búsqueda")
      } finally {
        setSearching(false)
      }
    }, 500) // Increased debounce time to reduce API calls

    return () => clearTimeout(timeout)
  }, [searchQuery, minibuses, telefericos])

  // Handlers
  const handleResultSelect = useCallback((result: SearchResult) => {
    setSelectedDestination(result)
    setSearchQuery(result.name)
    setSearchResults([])
    setViewState("destination")
  }, [])

  const handleGetDirections = useCallback(async () => {
    if (!selectedDestination) return

    setCalculatingRoutes(true)
    setViewState("routing")

    try {
      let originCoord = userLocation
      let originName = "Tu ubicación"

      if (!originCoord) {
        originCoord = await getCurrentLocation()
      }

      if (!originCoord) {
        originCoord = { lat: -16.4955, lng: -68.1336 }
        originName = "Plaza Murillo"
      }

      setOrigin({ coord: originCoord, name: originName })

      const routes = routingService.planRoute(
        {
          origin: originCoord,
          destination: { lat: selectedDestination.lat, lng: selectedDestination.lng },
          originName,
          destinationName: selectedDestination.name,
        },
        minibuses,
        telefericos,
      )

      setRouteOptions(routes)
      if (routes.length > 0) {
        setSelectedRoute(routes[0])
      } else {
        // No routes found - show message and allow retry
        Alert.alert(
          "No se encontraron rutas",
          "No pudimos encontrar una ruta adecuada entre tu ubicación y el destino. Intenta con otro punto cercano o verifica tu ubicación.",
          [
            { text: "Buscar otro destino", style: "default" },
            {
              text: "Reintentar",
              style: "default",
              onPress: () => {
                setViewState("destination") // Stay in destination mode to allow retry
              }
            }
          ]
        )
      }
    } catch (error) {
      console.error("Error calculating routes:", error)
      Alert.alert("Error", "No se pudieron calcular las rutas")
    } finally {
      setCalculatingRoutes(false)
    }
  }, [selectedDestination, userLocation, getCurrentLocation, minibuses, telefericos])

  const handleCloseDestination = useCallback(() => {
    setSelectedDestination(null)
    setSearchQuery("")
    setViewState("exploring")
  }, [])

  const handleCloseRouting = useCallback(() => {
    setSelectedRoute(null)
    setRouteOptions([])
    setViewState("destination")
  }, [])

  const handleStartNavigation = useCallback(() => {
    if (selectedRoute) {
      setViewState("navigating")
    }
  }, [selectedRoute])

  const handleExitNavigation = useCallback(() => {
    // Reset all navigation state and go back to exploring mode
    setViewState("exploring")
    setSelectedRoute(null)
    setRouteOptions([])
    setOrigin(null)
    setSelectedDestination(null)
    setSearchQuery("")
    setSearchResults([])
  }, [])

  // Map data
  const mapMarkers = useMemo(() => {
    const markers: any[] = []

    if ((viewState === "routing" || viewState === "navigating") && origin && selectedDestination) {
      markers.push({
        id: "origin",
        position: origin.coord,
        label: origin.name,
        icon: "origin",
      })
      markers.push({
        id: "destination",
        position: { lat: selectedDestination.lat, lng: selectedDestination.lng },
        label: selectedDestination.name,
        icon: "destination",
      })
    } else if (selectedDestination) {
      markers.push({
        id: "destination",
        position: { lat: selectedDestination.lat, lng: selectedDestination.lng },
        label: selectedDestination.name,
        icon: "destination",
      })
    }

    return markers
  }, [viewState, origin, selectedDestination])

  const routeSegments = useMemo(() => {
    if ((viewState !== "routing" && viewState !== "navigating") || !selectedRoute) return []
    return selectedRoute.segments
  }, [viewState, selectedRoute])

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0891B2" />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={viewState === "navigating" ? "light-content" : "dark-content"} 
        backgroundColor={viewState === "navigating" ? "#0891B2" : "#FFFFFF"}
      />
      
      {/* Map */}
      <View style={styles.mapContainer}>
        <CartoMap
          markers={mapMarkers}
          routeSegments={routeSegments}
          showUserLocation={true}
          userLocation={userLocation}
          theme="voyager"
        />

        {/* Where To Panel (exploring mode) */}
        {viewState === "exploring" && (
          <WhereToPanel onSearchPress={() => setViewState("searching")} />
        )}

        {/* Search Bar (searching mode) */}
        {viewState === "searching" && (
          <View style={styles.searchBarContainer}>
            <SearchBar
              placeholder="Buscar estación, ruta o lugar..."
              value={searchQuery}
              onChange={setSearchQuery}
              results={searchResults}
              isLoading={searching}
              onResultSelect={handleResultSelect}
              onBack={() => setViewState("exploring")}
              onClear={() => {
                setSearchQuery("")
                setSelectedDestination(null)
                setViewState("exploring")
              }}
              autoFocus={true}
            />
          </View>
        )}

        {/* Map Controls (hidden during navigation and searching) */}
        {viewState !== "navigating" && viewState !== "searching" && (
          <MapControls 
            onZoomIn={() => console.log("Zoom in")} 
            onZoomOut={() => console.log("Zoom out")} 
            onLocate={getCurrentLocation} 
            locating={locating} 
          />
        )}

        {/* Destination Sheet */}
        {viewState === "destination" && selectedDestination && (
          <DestinationSheet
            destination={selectedDestination}
            onClose={handleCloseDestination}
            onGetDirections={handleGetDirections}
          />
        )}

        {/* Route Preview Sheet */}
        {viewState === "routing" && selectedDestination && (
          <RoutePreviewSheet
            origin={origin?.name || "Tu ubicación"}
            destination={selectedDestination?.name || "Destino"}
            routes={routeOptions}
            selectedRoute={selectedRoute}
            onSelectRoute={setSelectedRoute}
            onStartNavigation={handleStartNavigation}
            onClose={handleCloseRouting}
            isLoading={calculatingRoutes}
          />
        )}

        {/* Navigation Mode */}
        {viewState === "navigating" && selectedRoute && (
          <NavigationMode route={selectedRoute} onExit={handleExitNavigation} />
        )}
      </View>
    </SafeAreaView>
  )
}

// Need to add useCallback import
import { useCallback } from "react"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  searchBarContainer: {
    position: "absolute",
    top: Platform.OS === 'ios' ? 16 : StatusBar.currentHeight || 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
})

// Need to add Platform import

// Component for LoadingMap (if needed)
export function LoadingMap() {
  return (
    <View style={loadingStyles.container}>
      <ActivityIndicator size="large" color="#0891B2" />
      <Text style={loadingStyles.text}>Cargando mapa...</Text>
    </View>
  )
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
})

// Import Text if needed

export default MapsScreen