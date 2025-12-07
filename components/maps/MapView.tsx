import { Coordenada, Estacion } from '@/types/transport';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Bus, ChevronRight, MapPin, Navigation, X, Zap } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Importaciones para react-native-maps
import MapViewBase, {
    Circle,
    Marker,
    Polyline,
    PROVIDER_DEFAULT,
    PROVIDER_GOOGLE,
    Region,
    UrlTile
} from 'react-native-maps';

// Centro de La Paz, Bolivia
const LA_PAZ_CENTER = { lat: -16.5, lng: -68.15 };

export interface RouteType {
  id: string;
  coordinates: Coordenada[];
  color: string;
  name: string;
  type: 'bus' | 'minibus' | 'cable';
  fare?: number;
  frequency?: string;
}

interface MapViewProps {
  routes?: RouteType[];
  markers?: Array<{
    id: string;
    position: Coordenada;
    label: string;
    color?: string;
    icon?: string;
  }>;
  stations?: Array<{
    lineId: string;
    stations: Estacion[];
    color: string;
    lineName: string;
  }>;
  selectedRouteId?: string | null;
  onRouteSelect?: (id: string) => void;
  onLongPress?: (lat: number, lng: number) => void;
  zoom?: number;
  height?: number;
  showControls?: boolean;
  trackUserLocation?: boolean; // habilita ubicación en tiempo real
}

export function MapViewComponent({
  routes = [],
  markers = [],
  stations = [],
  selectedRouteId,
  onRouteSelect,
  onLongPress,
  zoom = 13,
  height = Dimensions.get('window').height * 0.7,
  showControls = true,
  trackUserLocation = true,
}: MapViewProps) {
  const mapRef = useRef<MapViewBase>(null);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: LA_PAZ_CENTER.lat,
    longitude: LA_PAZ_CENTER.lng,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [userLocation, setUserLocation] = useState<Coordenada | null>(null);
  const locationWatchRef = useRef<Location.LocationSubscription | null>(null);

  // Obtener y vigilar ubicación en tiempo real
  useEffect(() => {
    if (!trackUserLocation) return;
    let cancelled = false;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permiso de ubicación denegado');
          return;
        }
        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        if (!cancelled) {
          setUserLocation({ lat: current.coords.latitude, lng: current.coords.longitude });
        }
        locationWatchRef.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
          (loc) => {
            if (!cancelled) {
              setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
            }
          }
        );
      } catch (e) {
        console.warn('Error obteniendo ubicación', e);
      }
    })();
    return () => {
      cancelled = true;
      locationWatchRef.current?.remove();
    };
  }, [trackUserLocation]);

  // Ajustar vista cuando se selecciona una ruta
  useEffect(() => {
    if (selectedRouteId && isMapReady) {
      const selectedRoute = routes.find(r => r.id === selectedRouteId);
      if (selectedRoute && selectedRoute.coordinates.length > 0) {
        const coords = selectedRoute.coordinates;

        // Calcular límites
        const minLat = Math.min(...coords.map(c => c.lat));
        const maxLat = Math.max(...coords.map(c => c.lat));
        const minLng = Math.min(...coords.map(c => c.lng));
        const maxLng = Math.max(...coords.map(c => c.lng));

        mapRef.current?.animateToRegion({
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: (maxLat - minLat) * 1.5,
          longitudeDelta: (maxLng - minLng) * 1.5,
        }, 1000);
      }
    }
  }, [selectedRouteId, isMapReady]);

  // Resetear a vista inicial
  const resetToInitialView = () => {
    mapRef.current?.animateToRegion({
      latitude: LA_PAZ_CENTER.lat,
      longitude: LA_PAZ_CENTER.lng,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }, 1000);
  };

  // Navegar a ubicación actual (real si disponible)
  const goToCurrentLocation = () => {
    if (userLocation) {
      mapRef.current?.animateToRegion({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    } else {
      // Si aún no disponible, intentar obtener una vez
      (async () => {
        try {
          const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setUserLocation({ lat: current.coords.latitude, lng: current.coords.longitude });
          mapRef.current?.animateToRegion({
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        } catch (e) {
          console.warn('No se pudo obtener ubicación actual', e);
        }
      })();
    }
  };

  // Renderizar icono personalizado
  const renderCustomIcon = (type: string, color: string) => {
    switch (type) {
      case 'bus':
        return <Bus size={20} color="#fff" />;
      case 'cable':
        return <Zap size={18} color="#fff" />;
      default:
        return <MapPin size={18} color="#fff" />;
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      {/* Indicador de carga */}
      {!isMapReady && !mapError && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Cargando mapa...</Text>
        </View>
      )}

      {/* Mensaje de error */}
      {mapError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudo cargar el mapa</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setMapError(false);
              setIsMapReady(false);
            }}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Mapa */}
      <MapViewBase
        ref={mapRef}
        provider={Platform.OS === 'ios' ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
        mapType={Platform.OS === 'android' ? 'none' : 'standard'}
        style={[styles.map, (!isMapReady || mapError) && styles.hiddenMap]}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        onMapReady={() => {
          console.log('✅ Mapa cargado correctamente');
          setIsMapReady(true);
          setMapError(false);
        }}
        onLongPress={(e) => {
          if (onLongPress) {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            onLongPress(latitude, longitude);
          }
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        showsPointsOfInterest={false}
      >
        {/* Tiles de CartoCDN - Solo para Android cuando Google Maps falla */}
        {Platform.OS === 'android' && (
          <UrlTile
            urlTemplate="https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
            maximumZ={18}
            minimumZ={1}
            flipY={false}
            tileSize={256}
            zIndex={-1}
          />
        )}

        {/* Líneas de minibuses */}
        {routes.map((route) => (
          <React.Fragment key={route.id}>
            {/* Efecto de sombra para línea */}
            <Polyline
              coordinates={route.coordinates.map(c => ({ latitude: c.lat, longitude: c.lng }))}
              strokeColor="#00000030"
              strokeWidth={route.type === 'cable' ? 10 : 8}
              zIndex={1}
            />

            {/* Línea principal */}
            <Polyline
              coordinates={route.coordinates.map(c => ({ latitude: c.lat, longitude: c.lng }))}
              strokeColor={route.color}
              strokeWidth={route.type === 'cable' ? 8 : (selectedRouteId === route.id ? 6 : 4)}
              zIndex={2}
              lineDashPattern={route.type === 'cable' ? [10, 15] : undefined}
              lineCap="round"
              lineJoin="round"
            />

            {/* Efecto de brillo para líneas seleccionadas */}
            {selectedRouteId === route.id && (
              <Polyline
                coordinates={route.coordinates.map(c => ({ latitude: c.lat, longitude: c.lng }))}
                strokeColor="#ffffff"
                strokeWidth={route.type === 'cable' ? 10 : 8}
                zIndex={1}
                lineCap="round"
                lineJoin="round"
              />
            )}

            {/* Marcadores de inicio y fin */}
            {route.coordinates.length > 0 && (
              <>
                {/* Marcador de inicio */}
                <Marker
                  coordinate={{ latitude: route.coordinates[0].lat, longitude: route.coordinates[0].lng }}
                  onPress={() => onRouteSelect?.(route.id)}
                >
                  <View style={[styles.routeMarker, { backgroundColor: route.color }]}>
                    <LinearGradient
                      colors={[route.color, `${route.color}CC`]}
                      style={styles.markerGradient}
                    >
                      <Text style={styles.markerText}>INICIO</Text>
                    </LinearGradient>
                  </View>
                </Marker>

                {/* Marcador de fin */}
                <Marker
                  coordinate={{
                    latitude: route.coordinates[route.coordinates.length - 1].lat,
                    longitude: route.coordinates[route.coordinates.length - 1].lng
                  }}
                  onPress={() => onRouteSelect?.(route.id)}
                >
                  <View style={[styles.routeMarker, { backgroundColor: route.color }]}>
                    <LinearGradient
                      colors={[`${route.color}CC`, route.color]}
                      style={styles.markerGradient}
                    >
                      <Text style={styles.markerText}>FIN</Text>
                    </LinearGradient>
                  </View>
                </Marker>
              </>
            )}
          </React.Fragment>
        ))}

        {/* Estaciones de teleférico */}
        {stations.map((line) => (
          <React.Fragment key={line.lineId}>
            {/* Línea de teleférico */}
            <Polyline
              coordinates={line.stations.map(s => ({ latitude: s.lat, longitude: s.lng }))}
              strokeColor={line.color}
              strokeWidth={6}
              lineDashPattern={[15, 10]}
              lineCap="round"
              zIndex={3}
            />

            {/* Efecto de gradiente */}
            <Polyline
              coordinates={line.stations.map(s => ({ latitude: s.lat, longitude: s.lng }))}
              strokeColor="#ffffff"
              strokeWidth={2}
              zIndex={4}
              lineCap="round"
            />

            {/* Estaciones */}
            {line.stations.map((station, index) => (
              <Marker
                key={station.id}
                coordinate={{ latitude: station.lat, longitude: station.lng }}
                onPress={() => {
                  setSelectedMarker({
                    ...station,
                    lineColor: line.color,
                    lineName: line.lineName,
                  });
                }}
              >
                <LinearGradient
                  colors={index === 0 || index === line.stations.length - 1
                    ? [line.color, '#ffffff']
                    : ['#ffffff', line.color]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.stationMarker,
                    index === 0 || index === line.stations.length - 1
                      ? styles.terminalStation
                      : styles.intermediateStation,
                  ]}
                >
                  {index === 0 || index === line.stations.length - 1 ? (
                    <Text style={styles.terminalText}>
                      {index === 0 ? 'A' : 'B'}
                    </Text>
                  ) : (
                    <View style={[styles.intermediateDot, { backgroundColor: line.color }]} />
                  )}
                </LinearGradient>
              </Marker>
            ))}
          </React.Fragment>
        ))}

        {/* Marcadores personalizados */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.position.lat, longitude: marker.position.lng }}
            onPress={() => setSelectedMarker(marker)}
          >
            <View style={[styles.customMarker, { borderColor: marker.color || '#0891b2' }]}>
              <LinearGradient
                colors={[marker.color || '#0891b2', '#06b6d4']}
                style={styles.customMarkerGradient}
              >
                {renderCustomIcon(marker.icon || 'pin', marker.color || '#0891b2')}
              </LinearGradient>

              {/* Efecto de pulso */}
              <View style={[styles.pulseEffect, { borderColor: marker.color || '#0891b2' }]} />
            </View>
          </Marker>
        ))}

        {/* Ubicación del usuario */}
        {trackUserLocation && userLocation && (
          <>
            <Marker
              coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }}
              title="Tu ubicación"
            >
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffffff' }} />
              </View>
            </Marker>
            <Circle
              center={{ latitude: userLocation.lat, longitude: userLocation.lng }}
              radius={50}
              fillColor="rgba(37,99,235,0.15)"
              strokeColor="rgba(37,99,235,0.6)"
              strokeWidth={2}
            />
          </>
        )}

        {/* Efecto de círculo en centro del mapa */}
        <Circle
          center={{ latitude: LA_PAZ_CENTER.lat, longitude: LA_PAZ_CENTER.lng }}
          radius={100}
          fillColor="#3b82f620"
          strokeColor="#3b82f6"
          strokeWidth={1}
          zIndex={0}
        />
      </MapViewBase>

      {/* Controles de mapa */}
      {showControls && isMapReady && !mapError && (
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.locationButton]}
            onPress={goToCurrentLocation}
          >
            <Navigation size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, styles.resetButton]}
            onPress={resetToInitialView}
          >
            <Text style={styles.controlText}>LP</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, styles.zoomInButton]}
            onPress={() => mapRef.current?.animateToRegion({
              ...region,
              latitudeDelta: region.latitudeDelta / 2,
              longitudeDelta: region.longitudeDelta / 2,
            })}
          >
            <Text style={styles.controlText}>+</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, styles.zoomOutButton]}
            onPress={() => mapRef.current?.animateToRegion({
              ...region,
              latitudeDelta: region.latitudeDelta * 2,
              longitudeDelta: region.longitudeDelta * 2,
            })}
          >
            <Text style={styles.controlText}>-</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal de información del marcador */}
      <Modal
        visible={!!selectedMarker}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMarker(null)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedMarker?.nombre || selectedMarker?.label}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedMarker(null)}
              >
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            {selectedMarker?.lineName && (
              <View style={[styles.lineBadge, { backgroundColor: selectedMarker.lineColor }]}>
                <Text style={styles.lineBadgeText}>{selectedMarker.lineName}</Text>
              </View>
            )}
            
            {selectedMarker?.descripcion && (
              <Text style={styles.modalDescription}>
                {selectedMarker.descripcion}
              </Text>
            )}
            
            <TouchableOpacity style={styles.directionsButton}>
              <Navigation size={18} color="#fff" />
              <Text style={styles.directionsButtonText}>Cómo llegar</Text>
              <ChevronRight size={18} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
}

// Provide a named alias `MapView` for backward compatibility with imports.
export const MapView = MapViewComponent;

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  hiddenMap: {
    opacity: 0,
  },
  controlsContainer: {
    position: 'absolute',
    right: 16,
    top: 16,
    gap: 8,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  locationButton: {
    backgroundColor: '#3b82f6',
  },
  resetButton: {
    backgroundColor: '#0891b2',
  },
  zoomInButton: {
    backgroundColor: '#10b981',
  },
  zoomOutButton: {
    backgroundColor: '#f59e0b',
  },
  controlText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  routeMarker: {
    width: 56,
    height: 28,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  markerGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stationMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  terminalStation: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  intermediateStation: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  terminalText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  intermediateDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  customMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  customMarkerGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 32,
    borderWidth: 1,
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 34,
    minHeight: 220,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  lineBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 20,
  },
  directionsButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    zIndex: 100,
    borderRadius: 16,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    zIndex: 100,
    borderRadius: 16,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});