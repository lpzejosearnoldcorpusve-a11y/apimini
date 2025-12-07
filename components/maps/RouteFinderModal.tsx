"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { searchService } from "@/services/searchService"
import type { NavigationDestination } from "@/types/navigation"
import type { NearbyRoute, SearchSuggestion } from "@/types/search"
import type { Minibus, Teleferico } from "@/types/transport"
import { LinearGradient } from "expo-linear-gradient"
import {
    ArrowRight,
    Bus,
    Cable,
    ChevronRight,
    Clock,
    Footprints,
    MapPin,
    Navigation2,
    Route,
    X,
} from "lucide-react-native"
import React, { useEffect, useState } from "react"
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

interface RouteFinderModalProps {
  visible: boolean
  onClose: () => void
  destination: SearchSuggestion | null
  minibuses: Minibus[]
  telefericos: Teleferico[]
  onNavigateToStop: (destination: NavigationDestination, transportType: 'minibus' | 'teleferico', transportId: string) => void
}

export function RouteFinderModal({
  visible,
  onClose,
  destination,
  minibuses,
  telefericos,
  onNavigateToStop,
}: RouteFinderModalProps) {
  const [nearbyRoutes, setNearbyRoutes] = useState<NearbyRoute[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRoute, setSelectedRoute] = useState<NearbyRoute | null>(null)
  
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current

  // Animación de entrada
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start()
    } else {
      slideAnim.setValue(SCREEN_HEIGHT)
    }
  }, [visible])

  // Buscar rutas cercanas cuando se abre el modal
  useEffect(() => {
    if (visible && destination) {
      setIsLoading(true)
      setSelectedRoute(null)
      
      // Pequeño delay para mostrar animación de carga
      setTimeout(() => {
        const routes = searchService.findNearbyRoutes(
          destination.lat,
          destination.lng,
          minibuses,
          telefericos,
          2 // Radio de 2km
        )
        setNearbyRoutes(routes)
        setIsLoading(false)
      }, 500)
    }
  }, [visible, destination, minibuses, telefericos])

  // Manejar selección de ruta
  const handleSelectRoute = (route: NearbyRoute) => {
    setSelectedRoute(route)
  }

  // Manejar navegación
  const handleNavigate = () => {
    if (selectedRoute) {
      const navDestination: NavigationDestination = {
        name: selectedRoute.nearestStop.name,
        lat: selectedRoute.nearestStop.lat,
        lng: selectedRoute.nearestStop.lng,
        type: selectedRoute.type === 'teleferico' ? 'estacion' : 'parada',
      }
      onNavigateToStop(navDestination, selectedRoute.type, selectedRoute.id)
      onClose()
    }
  }

  // Formatear distancia
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`
    }
    return `${(meters / 1000).toFixed(1)} km`
  }

  if (!destination) return null

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        
        <Animated.View 
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Header con destino */}
          <LinearGradient
            colors={[COLORS.primary, '#14b8a6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.destinationIcon}>
                <MapPin size={28} color="#fff" />
              </View>
              
              <View style={styles.destinationInfo}>
                <Text style={styles.headerLabel}>Quiero ir a</Text>
                <Text style={styles.destinationName} numberOfLines={2}>
                  {destination.name}
                </Text>
                {destination.description && (
                  <Text style={styles.destinationDesc} numberOfLines={1}>
                    {destination.description}
                  </Text>
                )}
              </View>
              
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Contenido */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Buscando rutas cercanas...</Text>
              </View>
            ) : nearbyRoutes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Route size={48} color={COLORS.textLight} />
                <Text style={styles.emptyTitle}>No hay rutas cercanas</Text>
                <Text style={styles.emptyText}>
                  No encontramos transporte público a menos de 2km de tu destino
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>
                  Rutas que te dejan cerca ({nearbyRoutes.length})
                </Text>

                {nearbyRoutes.map((route, index) => (
                  <TouchableOpacity
                    key={route.id}
                    style={[
                      styles.routeCard,
                      selectedRoute?.id === route.id && styles.routeCardSelected,
                      selectedRoute?.id === route.id && { borderColor: route.color }
                    ]}
                    onPress={() => handleSelectRoute(route)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.routeIconContainer, { backgroundColor: `${route.color}15` }]}>
                      {route.type === 'teleferico' ? (
                        <Cable size={24} color={route.color} />
                      ) : (
                        <Bus size={24} color={route.color} />
                      )}
                    </View>

                    <View style={styles.routeInfo}>
                      <Text style={styles.routeName} numberOfLines={1}>
                        {route.name}
                      </Text>
                      <Text style={styles.routeStopName} numberOfLines={1}>
                        Baja en: {route.nearestStop.name}
                      </Text>
                      
                      <View style={styles.routeStats}>
                        <View style={styles.routeStat}>
                          <Footprints size={14} color={COLORS.textSecondary} />
                          <Text style={styles.routeStatText}>
                            {formatDistance(route.distance)}
                          </Text>
                        </View>
                        <View style={styles.routeStat}>
                          <Clock size={14} color={COLORS.textSecondary} />
                          <Text style={styles.routeStatText}>
                            {route.estimatedTime}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={[
                      styles.selectIndicator,
                      selectedRoute?.id === route.id && { backgroundColor: route.color }
                    ]}>
                      {selectedRoute?.id === route.id ? (
                        <ChevronRight size={18} color="#fff" />
                      ) : (
                        <View style={[styles.selectDot, { borderColor: route.color }]} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Resumen de ruta seleccionada */}
                {selectedRoute && (
                  <View style={styles.selectedSummary}>
                    <View style={styles.summaryRow}>
                      <View style={styles.summaryPoint}>
                        <View style={[styles.summaryDot, { backgroundColor: COLORS.primary }]} />
                        <Text style={styles.summaryLabel}>Tu ubicación</Text>
                      </View>
                      
                      <View style={styles.summaryLine} />
                      
                      <View style={styles.summaryPoint}>
                        <View style={[styles.summaryDot, { backgroundColor: selectedRoute.color }]} />
                        <Text style={styles.summaryLabel}>{selectedRoute.nearestStop.name}</Text>
                      </View>
                      
                      <View style={styles.summaryLine} />
                      
                      <View style={styles.summaryPoint}>
                        <View style={[styles.summaryDotFinal]} />
                        <Text style={styles.summaryLabel}>{destination.name}</Text>
                      </View>
                    </View>

                    <View style={styles.summaryInfo}>
                      <View style={styles.summaryInfoItem}>
                        <Footprints size={18} color={COLORS.textSecondary} />
                        <Text style={styles.summaryInfoText}>
                          Camina {selectedRoute.estimatedTime} hasta la parada
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Botón de navegación */}
          {selectedRoute && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.navigateButton}
                onPress={handleNavigate}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[selectedRoute.color, `${selectedRoute.color}dd`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.navigateButtonGradient}
                >
                  <Navigation2 size={22} color="#fff" />
                  <Text style={styles.navigateButtonText}>
                    Cómo llegar a {selectedRoute.nearestStop.name.split(' - ')[0]}
                  </Text>
                  <ArrowRight size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  container: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: SCREEN_HEIGHT * 0.85,
    overflow: 'hidden',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? SPACING.lg : SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  destinationIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  destinationInfo: {
    flex: 1,
  },
  headerLabel: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  destinationName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: '#fff',
  },
  destinationDesc: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    maxWidth: '80%',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  routeCardSelected: {
    borderWidth: 2,
    ...SHADOWS.md,
  },
  routeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  routeStopName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  routeStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeStatText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  selectIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  selectDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  selectedSummary: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    ...SHADOWS.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  summaryPoint: {
    alignItems: 'center',
    flex: 1,
  },
  summaryDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  summaryDotFinal: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    marginBottom: SPACING.xs,
  },
  summaryLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.borderLight,
    maxWidth: 40,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 80,
  },
  summaryInfo: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.md,
  },
  summaryInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  summaryInfoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  footer: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  navigateButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  navigateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    gap: SPACING.sm,
  },
  navigateButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
})
