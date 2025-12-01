import { LoadingMap } from '@/components/maps/LoadingMap';
import { MapLegend } from '@/components/maps/MapLegend';
import { MapView } from '@/components/maps/MapView';
import { TransportCard } from '@/components/maps/TransportCard';
import { Button } from '@/components/ui/Button';
import { useMinibuses, useTelefericos } from '@/hooks/useTransport';
import { LinearGradient } from 'expo-linear-gradient';
import { Bus, Cable, ChevronDown, ChevronUp, Layers, Navigation, Search, Train } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type ViewMode = 'all' | 'minibuses' | 'telefericos';

export function MapsScreen() {
  const { minibuses, loading: loadingMinibuses } = useMinibuses();
  const { telefericos, loading: loadingTelefericos } = useTelefericos();
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [panelExpanded, setPanelExpanded] = useState(true);
  const panelAnimation = useRef(new Animated.Value(0)).current;

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

  // Filtrado basado en búsqueda
  const filteredMinibuses = minibuses.filter(m =>
    m.linea.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.sindicato.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTelefericos = telefericos.filter(t =>
    t.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            />

            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Search size={20} color="#9ca3af" />
                <TextInput
                  placeholder="Buscar ubicación, ruta o estación..."
                  placeholderTextColor="#9ca3af"
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* Botón de ubicación */}
            <TouchableOpacity style={styles.locationButton}>
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

          {/* Lista de transporte filtrada */}
          {searchQuery ? (
            <ScrollView style={styles.transportList} showsVerticalScrollIndicator={false}>
              {showMinibuses && filteredMinibuses.map((minibus) => (
                <TransportCard
                  key={`minibus-${minibus.id}`}
                  type="minibus"
                  title={`Línea ${minibus.linea}`}
                  subtitle={minibus.sindicato}
                  color="#0891b2"
                  info={`10-15 min`}
                  selected={selectedId === minibus.id}
                  onClick={() => setSelectedId(minibus.id)}
                />
              ))}
              
              {showTelefericos && filteredTelefericos.map((teleferico) => (
                <TransportCard
                  key={`teleferico-${teleferico.id}`}
                  type="teleferico"
                  title={teleferico.nombre}
                  subtitle={`${teleferico.estaciones.length} estaciones`}
                  color={teleferico.color}
                  info={`${teleferico.estaciones.length} estaciones`}
                  selected={selectedId === teleferico.id}
                  onClick={() => setSelectedId(teleferico.id)}
                />
              ))}
            </ScrollView>
          ) : null}
        </LinearGradient>
      </Animated.View>
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
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#111827',
  },
  locationButton: {
    position: 'absolute',
    top: 110,
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
  transportList: {
    maxHeight: 200,
    marginTop: 8,
  },
});