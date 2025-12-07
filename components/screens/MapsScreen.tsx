import { LoadingMap } from '@/components/maps/LoadingMap';
import { MapLegend } from '@/components/maps/MapLegend';
import { MapView } from '@/components/maps/MapView';
import { RouteFinderModal } from '@/components/maps/RouteFinderModal';
import { SearchAutocomplete } from '@/components/maps/SearchAutocomplete';
import { NavigationModal } from '@/components/navigation/NavigationModal';
import { Button } from '@/components/ui/Button';
import { COLORS } from '@/constants/theme';
import { useMinibuses, useTelefericos } from '@/hooks/useTransport';
import { searchService } from '@/services/searchService';
import type { NavigationDestination } from '@/types/navigation';
import type { SearchSuggestion } from '@/types/search';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Bus, Cable, ChevronDown, ChevronUp, Crosshair, Layers, MapPin, Navigation, Train } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type ViewMode = 'all' | 'minibuses' | 'telefericos';

export function MapsScreen() {
  const { minibuses, loading: loadingMinibuses } = useMinibuses();
  const { telefericos, loading: loadingTelefericos } = useTelefericos();
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelExpanded, setPanelExpanded] = useState(true);
  const panelAnimation = useRef(new Animated.Value(0)).current;
  
  // Estados para búsqueda y navegación
  const [isSelectingOnMap, setIsSelectingOnMap] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<SearchSuggestion | null>(null);
  const [showRouteFinder, setShowRouteFinder] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [navigationDestination, setNavigationDestination] = useState<NavigationDestination | null>(null);
  const [navigationColor, setNavigationColor] = useState(COLORS.primary);
  const [navigationTransportName, setNavigationTransportName] = useState('');

  const loading = loadingMinibuses || loadingTelefericos;

  // Función para togglear el panel con animación
  const togglePanel = () => {
    const toValue = panelExpanded ? 1 : 0;
    setPanelExpanded(!panelExpanded);
    
    Animated.spring(panelAnimation, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  };

  // Calcular la altura del panel basado en el contenido
  const panelHeight = Dimensions.get('window').height * 0.45;

  // Preparar rutas de minibuses
  const minibusRoutes = minibuses.map((m) => ({
    id: m.id,
    coordinates: m.ruta,
    color: '#0891b2',
    name: `Línea ${m.linea} - ${m.sindicato}`,
    type: 'minibus' as const,
  }));

  // Preparar líneas de teleférico
  const telefericoStations = telefericos.map((t) => ({
    lineId: t.id,
    stations: t.estaciones,
    color: t.color,
    lineName: t.nombre,
  }));

  const showMinibuses = viewMode === 'all' || viewMode === 'minibuses';
  const showTelefericos = viewMode === 'all' || viewMode === 'telefericos';

  // Items para la leyenda
  const legendItems = [
    ...(showMinibuses ? [{
      color: '#0891b2',
      label: 'Rutas Minibus',
      type: 'line' as const,
    }] : []),
    ...(showTelefericos ? telefericos.slice(0, 3).map(t => ({
      color: t.color,
      label: t.nombre,
      type: 'dashed' as const,
    })) : []),
  ];

  // Manejar selección desde autocompletado
  const handleSelectSuggestion = useCallback((suggestion: SearchSuggestion) => {
    console.log('🔍 Sugerencia seleccionada:', suggestion);
    setSelectedDestination(suggestion);
    
    // Si es una parada o estación directa, navegar inmediatamente
    if (suggestion.type === 'stop' || suggestion.type === 'station') {
      const dest: NavigationDestination = {
        name: suggestion.name,
        lat: suggestion.lat,
        lng: suggestion.lng,
        type: suggestion.type === 'station' ? 'estacion' : 'parada',
      };
      
      // Encontrar el color del transporte
      if (suggestion.transportType === 'teleferico' && suggestion.transportId) {
        const teleferico = telefericos.find(t => t.id === suggestion.transportId);
        setNavigationColor(teleferico?.color || COLORS.primary);
        setNavigationTransportName(teleferico?.nombre || '');
      } else {
        setNavigationColor(COLORS.primary);
        if (suggestion.transportId) {
          const minibus = minibuses.find(m => m.id === suggestion.transportId);
          setNavigationTransportName(minibus ? `Línea ${minibus.linea}` : '');
        }
      }
      
      setNavigationDestination(dest);
      setShowNavigation(true);
    } else {
      // Si es una zona o calle, mostrar rutas cercanas
      setShowRouteFinder(true);
    }
  }, [telefericos, minibuses]);

  // Manejar selección de punto en mapa
  const handleSelectPoint = useCallback(async (lat: number, lng: number, action: string) => {
    if (action === 'current_location') {
      // Obtener ubicación actual
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación');
          return;
        }
        
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        const address = await searchService.reverseGeocode(
          location.coords.latitude,
          location.coords.longitude
        );
        
        setSelectedDestination({
          id: 'current-location',
          name: 'Mi ubicación actual',
          description: address,
          type: 'custom',
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
        setShowRouteFinder(true);
      } catch (error) {
        console.error('Error obteniendo ubicación:', error);
        Alert.alert('Error', 'No se pudo obtener tu ubicación');
      }
    } else if (action === 'select_on_map') {
      // Activar modo de selección en mapa
      setIsSelectingOnMap(true);
      setPanelExpanded(false);
      panelAnimation.setValue(1);
      Alert.alert(
        'Selecciona un punto',
        'Mantén presionado en el mapa para seleccionar un destino',
        [{ text: 'Entendido' }]
      );
    }
  }, [panelAnimation]);

  // Manejar selección de punto desde el mapa
  const handleMapLongPress = useCallback(async (lat: number, lng: number) => {
    if (!isSelectingOnMap) return;
    
    setIsSelectingOnMap(false);
    
    const address = await searchService.reverseGeocode(lat, lng);
    
    setSelectedDestination({
      id: `map-point-${Date.now()}`,
      name: address,
      description: 'Punto seleccionado en el mapa',
      type: 'custom',
      lat,
      lng,
    });
    setShowRouteFinder(true);
  }, [isSelectingOnMap]);

  // Manejar navegación desde RouteFinderModal
  const handleNavigateToStop = useCallback((
    destination: NavigationDestination,
    transportType: 'minibus' | 'teleferico',
    transportId: string
  ) => {
    if (transportType === 'teleferico') {
      const teleferico = telefericos.find(t => t.id === transportId);
      setNavigationColor(teleferico?.color || COLORS.primary);
      setNavigationTransportName(teleferico?.nombre || '');
    } else {
      const minibus = minibuses.find(m => m.id === transportId);
      setNavigationColor(COLORS.primary);
      setNavigationTransportName(minibus ? `Línea ${minibus.linea}` : '');
    }
    
    setNavigationDestination(destination);
    setShowNavigation(true);
  }, [telefericos, minibuses]);

  // Ir a ubicación actual
  const goToCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación');
        return;
      }
      // El componente MapView manejará el centrado
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Mapa */}
      <View style={styles.mapContainer}>
        {loading ? (
          <LoadingMap />
        ) : (
          <>
            <MapView
              routes={showMinibuses ? minibusRoutes : []}
              stations={showTelefericos ? telefericoStations : []}
              selectedRouteId={selectedId}
              onRouteSelect={setSelectedId}
              height={panelExpanded ? Dimensions.get('window').height * 0.65 : Dimensions.get('window').height * 0.9}
              showControls={true}
              trackUserLocation={true}
              onLongPress={isSelectingOnMap ? handleMapLongPress : undefined}
            />

            {/* Barra de búsqueda con autocompletado */}
            <View style={styles.searchContainer}>
              <SearchAutocomplete
                minibuses={minibuses}
                telefericos={telefericos}
                onSelectSuggestion={handleSelectSuggestion}
                onSelectPoint={handleSelectPoint}
                placeholder="¿A dónde quieres ir?"
              />
            </View>

            {/* Indicador de modo selección */}
            {isSelectingOnMap && (
              <View style={styles.selectModeIndicator}>
                <Crosshair size={20} color="#fff" />
                <Text style={styles.selectModeText}>Mantén presionado para seleccionar</Text>
                <TouchableOpacity 
                  onPress={() => setIsSelectingOnMap(false)}
                  style={styles.cancelSelectButton}
                >
                  <Text style={styles.cancelSelectText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Botón de ubicación */}
            <TouchableOpacity 
              style={[styles.locationButton, isSelectingOnMap && styles.locationButtonHidden]}
              onPress={goToCurrentLocation}
            >
              <Navigation size={20} color="#0891b2" />
            </TouchableOpacity>

            {/* Leyenda */}
            {!loading && legendItems.length > 0 && (
              <MapLegend items={legendItems} title="Leyenda" />
            )}
          </>
        )}
      </View>

      {/* Panel inferior animado */}
      <Animated.View
        style={[
          styles.bottomPanel,
          {
            transform: [{
              translateY: panelAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, panelHeight - 60], // Mantener visible solo el botón de toggle
              }),
            }],
          },
        ]}
      >
        {/* Botón de toggle */}
        <TouchableOpacity style={styles.toggleButton} onPress={togglePanel}>
          {panelExpanded ? (
            <ChevronDown size={24} color="#6b7280" />
          ) : (
            <ChevronUp size={24} color="#6b7280" />
          )}
        </TouchableOpacity>

        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.panelContent}
        >
          {/* Handle */}
          <View style={styles.handle} />
          
          <Text style={styles.panelTitle}>Tipo de transporte</Text>
          
          {/* Filtros */}
          <View style={styles.filtersContainer}>
            <Button
              title="Todos"
              onPress={() => setViewMode('all')}
              variant={viewMode === 'all' ? 'primary' : 'outline'}
              size="sm"
              icon={<Layers size={16} color={viewMode === 'all' ? '#fff' : '#0891b2'} />}
              style={styles.filterButton}
            />
            <Button
              title="Minibus"
              onPress={() => setViewMode('minibuses')}
              variant={viewMode === 'minibuses' ? 'primary' : 'outline'}
              size="sm"
              icon={<Bus size={16} color={viewMode === 'minibuses' ? '#fff' : '#0891b2'} />}
              style={styles.filterButton}
            />
            <Button
              title="Teleférico"
              onPress={() => setViewMode('telefericos')}
              variant={viewMode === 'telefericos' ? 'primary' : 'outline'}
              size="sm"
              icon={<Cable size={16} color={viewMode === 'telefericos' ? '#fff' : '#0891b2'} />}
              style={styles.filterButton}
            />
          </View>

          {/* Stats de transporte */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: '#f0f9ff' }]}>
              <Bus size={24} color="#0891b2" />
              <Text style={styles.statNumber}>{minibuses.length}</Text>
              <Text style={styles.statLabel}>Líneas</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#fef2f2' }]}>
              <Cable size={24} color="#ef4444" />
              <Text style={styles.statNumber}>{telefericos.length}</Text>
              <Text style={styles.statLabel}>Teleféricos</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
              <Train size={24} color="#10b981" />
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>PumaKatari</Text>
            </View>
          </View>

          {/* Accesos rápidos */}
          <View style={styles.quickAccessContainer}>
            <Text style={styles.quickAccessTitle}>Acceso rápido</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.quickAccessScroll}
            >
              <TouchableOpacity 
                style={styles.quickAccessItem}
                onPress={() => handleSelectPoint(0, 0, 'current_location')}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: '#dcfce7' }]}>
                  <MapPin size={18} color="#16a34a" />
                </View>
                <Text style={styles.quickAccessText}>Cerca de mí</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickAccessItem}
                onPress={() => handleSelectPoint(0, 0, 'select_on_map')}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: '#fef3c7' }]}>
                  <Crosshair size={18} color="#d97706" />
                </View>
                <Text style={styles.quickAccessText}>En el mapa</Text>
              </TouchableOpacity>

              {telefericos.slice(0, 3).map(t => (
                <TouchableOpacity 
                  key={t.id}
                  style={styles.quickAccessItem}
                  onPress={() => {
                    const suggestion: SearchSuggestion = {
                      id: `teleferico-${t.id}`,
                      name: t.nombre,
                      description: `${t.estaciones.length} estaciones`,
                      type: 'station',
                      lat: t.estaciones[0]?.lat || 0,
                      lng: t.estaciones[0]?.lng || 0,
                      color: t.color,
                      transportId: t.id,
                      transportType: 'teleferico',
                    };
                    setSelectedDestination(suggestion);
                    setShowRouteFinder(true);
                  }}
                >
                  <View style={[styles.quickAccessIcon, { backgroundColor: `${t.color}20` }]}>
                    <Cable size={18} color={t.color} />
                  </View>
                  <Text style={styles.quickAccessText} numberOfLines={1}>
                    {t.nombre.replace('Línea ', '')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Modal de búsqueda de rutas */}
      <RouteFinderModal
        visible={showRouteFinder}
        onClose={() => {
          setShowRouteFinder(false);
          setSelectedDestination(null);
        }}
        destination={selectedDestination}
        minibuses={minibuses}
        telefericos={telefericos}
        onNavigateToStop={handleNavigateToStop}
      />

      {/* Modal de navegación */}
      <NavigationModal
        visible={showNavigation}
        destination={navigationDestination}
        onClose={() => {
          setShowNavigation(false);
          setNavigationDestination(null);
        }}
        transportColor={navigationColor}
        transportName={navigationTransportName}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  locationButton: {
    position: 'absolute',
    top: 120,
    right: 16,
    width: 48,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  locationButtonHidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
  selectModeIndicator: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 70,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0891b2',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#0891b2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  selectModeText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelSelectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  cancelSelectText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  toggleButton: {
    position: 'absolute',
    top: -30,
    alignSelf: 'center',
    width: 60,
    height: 30,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    zIndex: 1000,
  },
  panelContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  quickAccessContainer: {
    marginTop: 4,
  },
  quickAccessTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  quickAccessScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  quickAccessItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  quickAccessIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickAccessText: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
});