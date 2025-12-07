import type { RouteOption, RouteSegment } from "@/types/routing"
import { LinearGradient } from "expo-linear-gradient"
import {
    ArrowRight,
    Bus,
    Cable,
    Check,
    ChevronDown,
    ChevronUp,
    Clock,
    Footprints,
    MapPin,
    Navigation,
    Play,
    RouteIcon,
    Wallet,
    X,
} from "lucide-react-native"
import React, { useEffect, useRef, useState } from "react"
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

interface RoutePreviewSheetProps {
  origin: string
  destination: string
  routes: RouteOption[]
  selectedRoute: RouteOption | null
  onSelectRoute: (route: RouteOption) => void
  onStartNavigation: () => void
  onClose: () => void
  isLoading?: boolean
}

type SheetHeight = "collapsed" | "half" | "full"

const SegmentIcon = ({ type, size = 16 }: { type: RouteSegment["type"]; size?: number }) => {
  const iconColor = {
    walk: "#6B7280",
    minibus: "#0891B2",
    teleferico: "#7C3AED",
    pumakatari: "#10B981",
  }[type]

  switch (type) {
    case "walk":
      return <Footprints size={size} color={iconColor} />
    case "minibus":
      return <Bus size={size} color={iconColor} />
    case "teleferico":
      return <Cable size={size} color={iconColor} />
    case "pumakatari":
      return <Bus size={size} color={iconColor} />
  }
}

export function RoutePreviewSheet({
  origin,
  destination,
  routes,
  selectedRoute,
  onSelectRoute,
  onStartNavigation,
  onClose,
  isLoading,
}: RoutePreviewSheetProps) {
  const [sheetHeight, setSheetHeight] = useState<SheetHeight>("half")
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null)
  const translateY = useRef(new Animated.Value(0)).current
  const { height: screenHeight } = Dimensions.get("window")

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}min`
  }

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`
    return `${(meters / 1000).toFixed(1)}km`
  }

  const getSheetHeight = () => {
    switch (sheetHeight) {
      case "collapsed":
        return 180
      case "half":
        return screenHeight * 0.55
      case "full":
        return screenHeight * 0.85
    }
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
    },
    onPanResponderMove: Animated.event(
      [null, { dy: translateY }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (_, gestureState) => {
      translateY.flattenOffset()
      
      const { dy } = gestureState
      const threshold = 50

      if (Math.abs(dy) < threshold) {
        cycleHeight()
        return
      }

      if (dy < -threshold) {
        // Swipe up
        if (sheetHeight === "collapsed") setSheetHeight("half")
        else if (sheetHeight === "half") setSheetHeight("full")
      } else if (dy > threshold) {
        // Swipe down
        if (sheetHeight === "full") setSheetHeight("half")
        else if (sheetHeight === "half") setSheetHeight("collapsed")
      }
    },
  })

  const cycleHeight = () => {
    if (sheetHeight === "collapsed") setSheetHeight("half")
    else if (sheetHeight === "half") setSheetHeight("full")
    else setSheetHeight("half")
  }

  // Animate sheet height changes
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: -getSheetHeight(),
      useNativeDriver: false,
      friction: 15,
      tension: 70,
    }).start()
  }, [sheetHeight])

  const renderCollapsedView = () => {
    if (!selectedRoute) return null

    return (
      <View style={styles.collapsedContent}>
        <View style={styles.collapsedHeader}>
          <View>
            <View style={styles.collapsedStats}>
              <Clock size={16} color="#0891B2" />
              <Text style={styles.collapsedDuration}>
                {formatDuration(selectedRoute.totalDuration)}
              </Text>
              <Text style={styles.separator}>|</Text>
              <Text style={styles.collapsedCost}>
                Bs. {selectedRoute.totalCost}
              </Text>
            </View>
            <Text style={styles.collapsedRoute}>
              {origin} → {destination}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={onStartNavigation}
          style={styles.navigationButton}
        >
          <Play size={18} color="#FFFFFF" />
          <Text style={styles.navigationButtonText}>Iniciar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderRouteCard = (route: RouteOption, index: number) => {
    const isSelected = selectedRoute?.id === route.id
    const isExpanded = expandedRoute === route.id

    return (
      <View
        key={route.id}
        style={[
          styles.routeCard,
          isSelected && styles.selectedRouteCard,
        ]}
      >
        {/* Route Summary */}
        <TouchableOpacity 
          onPress={() => onSelectRoute(route)}
          style={styles.routeSummary}
        >
          <View style={styles.routeHeader}>
            <View style={styles.routeBadges}>
              {route.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Mejor opción</Text>
                </View>
              )}
              <Text style={styles.routeIndex}>Opción {index + 1}</Text>
            </View>
            {isSelected && (
              <View style={styles.checkBadge}>
                <Check size={14} color="#FFFFFF" />
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Clock size={14} color="#0891B2" />
              </View>
              <Text style={styles.statValue}>
                {formatDuration(route.totalDuration)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, styles.walletIconContainer]}>
                <Wallet size={14} color="#10B981" />
              </View>
              <Text style={styles.statCost}>Bs. {route.totalCost}</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, styles.routeIconContainer]}>
                <RouteIcon size={14} color="#6B7280" />
              </View>
              <Text style={styles.statDistance}>
                {formatDistance(route.totalDistance)}
              </Text>
            </View>
          </View>

          {/* Segments Preview */}
          <View style={styles.segmentsPreview}>
            {route.segments.map((segment, i) => (
              <View key={segment.id} style={styles.segmentWrapper}>
                <View style={[
                  styles.segmentBadge,
                  getSegmentBadgeStyle(segment.type)
                ]}>
                  <SegmentIcon type={segment.type} size={14} />
                  <Text style={[
                    styles.segmentBadgeText,
                    getSegmentBadgeTextStyle(segment.type)
                  ]}>
                    {segment.line || (segment.duration ? `${segment.duration}min` : 'Caminar')}
                  </Text>
                </View>
                {i < route.segments.length - 1 && (
                  <ArrowRight size={12} color="#D1D5DB" />
                )}
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {/* Expand/Collapse */}
        <TouchableOpacity
          onPress={() => setExpandedRoute(isExpanded ? null : route.id)}
          style={styles.expandButton}
        >
          <Text style={styles.expandText}>
            {isExpanded ? "Ocultar detalles" : "Ver detalles"}
          </Text>
          {isExpanded ? (
            <ChevronUp size={16} color="#0891B2" />
          ) : (
            <ChevronDown size={16} color="#0891B2" />
          )}
        </TouchableOpacity>

        {/* Expanded Details */}
        {isExpanded && renderExpandedDetails(route)}
      </View>
    )
  }

  const renderExpandedDetails = (route: RouteOption) => {
    return (
      <View style={styles.expandedDetails}>
        <View style={styles.segmentsDetails}>
          {route.segments.map((segment, i) => (
            <View key={segment.id} style={styles.segmentDetail}>
              {/* Timeline */}
              <View style={styles.timelineContainer}>
                <View style={[
                  styles.timelineDot,
                  getSegmentTimelineStyle(segment.type)
                ]}>
                  <SegmentIcon type={segment.type} size={18} />
                </View>
                {i < route.segments.length - 1 && (
                  <View style={[
                    styles.timelineLine,
                    getSegmentTimelineLineStyle(segment.type)
                  ]} />
                )}
              </View>

              {/* Content */}
              <View style={styles.segmentContent}>
                <Text style={styles.segmentInstructions}>
                  {segment.instructions || 'Instrucción no disponible'}
                </Text>
                <View style={styles.segmentMeta}>
                  <View style={styles.segmentMetaItem}>
                    <Clock size={12} color="#6B7280" />
                    <Text style={styles.segmentMetaText}>
                      {segment.duration || 0} min
                    </Text>
                  </View>
                  
                  {segment.distance && (
                    <View style={styles.segmentMetaItem}>
                      <RouteIcon size={12} color="#6B7280" />
                      <Text style={styles.segmentMetaText}>
                        {formatDistance(segment.distance)}
                      </Text>
                    </View>
                  )}
                  
                  {segment.cost && (
                    <View style={styles.segmentMetaItem}>
                      <Wallet size={12} color="#10B981" />
                      <Text style={styles.segmentCostText}>
                        Bs. {segment.cost}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}

          {/* Arrival */}
          <View style={styles.segmentDetail}>
            <View style={styles.timelineContainer}>
              <View style={styles.arrivalDot}>
                <MapPin size={18} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.segmentContent}>
              <Text style={styles.arrivalText}>Llegada a destino</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: getSheetHeight(),
          transform: [{ translateY }],
        }
      ]}
    >
      {/* Drag Handle */}
      <View 
        {...panResponder.panHandlers}
        style={styles.dragHandleContainer}
      >
        <TouchableOpacity onPress={cycleHeight} style={styles.dragHandle}>
          <View style={styles.dragBar} />
        </TouchableOpacity>
      </View>

      {/* Collapsed View */}
      {sheetHeight === "collapsed" ? (
        renderCollapsedView()
      ) : (
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.title}>Opciones de ruta</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Origin - Destination Card */}
            <View style={styles.locationCard}>
              <View style={styles.locationIndicator}>
                <View style={styles.originDot} />
                <View style={styles.locationLine} />
                <View style={styles.destinationDot} />
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationText} numberOfLines={1}>
                  {origin}
                </Text>
                <Text style={styles.locationDivider}>hacia</Text>
                <Text style={styles.locationText} numberOfLines={1}>
                  {destination}
                </Text>
              </View>
            </View>
          </View>

          {/* Routes List */}
          <ScrollView 
            style={styles.routesList}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingSpinner}>
                  <View style={styles.spinnerBase} />
                  <ActivityIndicator size="large" color="#0891B2" />
                </View>
                <Text style={styles.loadingText}>Calculando mejores rutas...</Text>
                <Text style={styles.loadingSubtext}>Analizando minibuses y teleféricos</Text>
              </View>
            ) : routes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <LinearGradient
                  colors={['#F8FAFC', '#F1F5F9']}
                  style={styles.emptyGradient}
                >
                  <View style={styles.emptyIconContainer}>
                    <RouteIcon size={48} color="#64748B" />
                  </View>
                  <Text style={styles.emptyTitle}>No encontramos rutas directas</Text>
                  <Text style={styles.emptySubtitle}>
                    Prueba con ubicaciones más cercanas o verifica tu conexión
                  </Text>
                  <View style={styles.emptySuggestions}>
                    <Text style={styles.suggestionTitle}>Sugerencias:</Text>
                    <View style={styles.suggestionItem}>
                      <Text style={styles.suggestionBullet}>•</Text>
                      <Text style={styles.suggestionText}>Busca paradas de minibus cercanas</Text>
                    </View>
                    <View style={styles.suggestionItem}>
                      <Text style={styles.suggestionBullet}>•</Text>
                      <Text style={styles.suggestionText}>Considera usar teleféricos para distancias largas</Text>
                    </View>
                    <View style={styles.suggestionItem}>
                      <Text style={styles.suggestionBullet}>•</Text>
                      <Text style={styles.suggestionText}>Verifica que las direcciones sean correctas</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            ) : (
              <View style={styles.routesContainer}>
                {routes.map(renderRouteCard)}
              </View>
            )}
          </ScrollView>

          {/* Action Button */}
          {selectedRoute && (
            <View style={styles.actionContainer}>
              <TouchableOpacity
                onPress={onStartNavigation}
                style={styles.startNavigationButton}
              >
                <Navigation size={22} color="#FFFFFF" />
                <Text style={styles.startNavigationText}>Iniciar navegación</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      )}
    </Animated.View>
  )
}

// Helper functions for styles
const getSegmentBadgeStyle = (type: RouteSegment["type"]) => {
  switch (type) {
    case "walk": return styles.walkBadge
    case "minibus": return styles.minibusBadge
    case "teleferico": return styles.telefericoBadge
    case "pumakatari": return styles.pumakatariBadge
    default: return {}
  }
}

const getSegmentBadgeTextStyle = (type: RouteSegment["type"]) => {
  switch (type) {
    case "walk": return styles.walkBadgeText
    case "minibus": return styles.minibusBadgeText
    case "teleferico": return styles.telefericoBadgeText
    case "pumakatari": return styles.pumakatariBadgeText
    default: return {}
  }
}

const getSegmentTimelineStyle = (type: RouteSegment["type"]) => {
  switch (type) {
    case "walk": return styles.walkTimeline
    case "minibus": return styles.minibusTimeline
    case "teleferico": return styles.telefericoTimeline
    case "pumakatari": return styles.pumakatariTimeline
    default: return {}
  }
}

const getSegmentTimelineLineStyle = (type: RouteSegment["type"]) => {
  switch (type) {
    case "walk": return styles.walkTimelineLine
    case "minibus": return styles.minibusTimelineLine
    case "teleferico": return styles.telefericoTimelineLine
    default: return {}
  }
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    overflow: "hidden",
  },
  dragHandleContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  dragHandle: {
    width: "100%",
    alignItems: "center",
  },
  dragBar: {
    width: 48,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
  },
  safeArea: {
    flex: 1,
  },
  // Collapsed View Styles
  collapsedContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  collapsedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  collapsedStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  collapsedDuration: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  separator: {
    color: "#D1D5DB",
  },
  collapsedCost: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
  },
  collapsedRoute: {
    fontSize: 14,
    color: "#6B7280",
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
  },
  navigationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0891B2",
    height: 48,
    borderRadius: 12,
    shadowColor: "#0891B2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  navigationButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Header Styles
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  locationIndicator: {
    alignItems: "center",
    marginTop: 4,
  },
  originDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#A7F3D0",
  },
  destinationDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#F59E0B",
    borderWidth: 2,
    borderColor: "#FDE68A",
  },
  locationLine: {
    width: 1,
    height: 20,
    backgroundColor: "#60A5FA",
    marginVertical: 2,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  locationDivider: {
    fontSize: 12,
    color: "#9CA3AF",
    marginVertical: 2,
  },
  // Loading Styles
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  loadingSpinner: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  spinnerBase: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: "#E0F2FE",
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },
  loadingSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyGradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginHorizontal: 16,
    gap: 16,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  emptySuggestions: {
    alignItems: "flex-start",
    width: "100%",
    gap: 8,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 4,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    width: "100%",
  },
  suggestionBullet: {
    fontSize: 14,
    color: "#0891B2",
    fontWeight: "600",
    marginTop: -2,
  },
  suggestionText: {
    fontSize: 13,
    color: "#64748B",
    flex: 1,
    lineHeight: 18,
  },
  // Routes List
  routesList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  routesContainer: {
    gap: 12,
  },
  // Route Card
  routeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  selectedRouteCard: {
    borderColor: "#0891B2",
    backgroundColor: "#F0F9FF",
    shadowColor: "#0891B2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  routeSummary: {
    padding: 16,
  },
  routeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  routeBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recommendedBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  routeIndex: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0891B2",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
  },
  walletIconContainer: {
    backgroundColor: "#D1FAE5",
  },
  routeIconContainer: {
    backgroundColor: "#F3F4F6",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  statCost: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  statDistance: {
    fontSize: 13,
    color: "#6B7280",
  },
  segmentsPreview: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  segmentWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  segmentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  walkBadge: {
    backgroundColor: "#F3F4F6",
  },
  minibusBadge: {
    backgroundColor: "#E0F2FE",
  },
  telefericoBadge: {
    backgroundColor: "#F3E8FF",
  },
  pumakatariBadge: {
    backgroundColor: "#D1FAE5",
  },
  segmentBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  walkBadgeText: {
    color: "#374151",
  },
  minibusBadgeText: {
    color: "#0E7490",
  },
  telefericoBadgeText: {
    color: "#6D28D9",
  },
  pumakatariBadgeText: {
    color: "#047857",
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  expandText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0891B2",
  },
  // Expanded Details
  expandedDetails: {
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  segmentsDetails: {
    padding: 16,
  },
  segmentDetail: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  timelineContainer: {
    alignItems: "center",
    width: 40,
  },
  timelineDot: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  walkTimeline: {
    backgroundColor: "#E5E7EB",
  },
  minibusTimeline: {
    backgroundColor: "#0891B2",
  },
  telefericoTimeline: {
    backgroundColor: "#7C3AED",
  },
  pumakatariTimeline: {
    backgroundColor: "#10B981",
  },
  timelineLine: {
    width: 1,
    height: 64,
    marginVertical: 2,
  },
  walkTimelineLine: {
    backgroundColor: "#D1D5DB",
  },
  minibusTimelineLine: {
    backgroundColor: "#67E8F9",
  },
  telefericoTimelineLine: {
    backgroundColor: "#C4B5FD",
  },
  segmentContent: {
    flex: 1,
    paddingBottom: 16,
  },
  segmentInstructions: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  segmentMeta: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  segmentMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  segmentMetaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  segmentCostText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
  },
  arrivalDot: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  arrivalText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#065F46",
    paddingTop: 8,
  },
  // Action Button
  actionContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  startNavigationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0891B2",
    height: 56,
    borderRadius: 16,
    shadowColor: "#0891B2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startNavigationText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default RoutePreviewSheet