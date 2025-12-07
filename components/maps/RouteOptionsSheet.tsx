import type { RouteOption, RouteSegment } from "@/types/routing"
import {
    ArrowRight,
    Bus,
    Cable,
    Check,
    ChevronDown,
    ChevronUp,
    Clock,
    Footprints,
    Navigation,
    Route,
    Wallet,
    X,
} from "lucide-react-native"
import React, { useState } from "react"
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"

interface RouteOptionsSheetProps {
  origin: string
  destination: string
  routes: RouteOption[]
  selectedRoute: RouteOption | null
  onSelectRoute: (route: RouteOption) => void
  onStartNavigation: () => void
  onClose: () => void
  isLoading?: boolean
}

const SegmentIcon = ({ type }: { type: RouteSegment["type"] }) => {
  const iconProps = { size: 16 }
  
  switch (type) {
    case "walk":
      return <Footprints {...iconProps} color="#4B5563" />
    case "minibus":
      return <Bus {...iconProps} color="#0891B2" />
    case "teleferico":
      return <Cable {...iconProps} color="#7C3AED" />
    case "pumakatari":
      return <Bus {...iconProps} color="#10B981" />
  }
}

export function RouteOptionsSheet({
  origin,
  destination,
  routes,
  selectedRoute,
  onSelectRoute,
  onStartNavigation,
  onClose,
  isLoading,
}: RouteOptionsSheetProps) {
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null)

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

  const getSegmentColor = (type: RouteSegment["type"]) => {
    switch (type) {
      case "walk": return "#F3F4F6"
      case "minibus": return "#E0F2FE"
      case "teleferico": return "#F3E8FF"
      case "pumakatari": return "#D1FAE5"
    }
  }

  const getSegmentTextColor = (type: RouteSegment["type"]) => {
    switch (type) {
      case "walk": return "#374151"
      case "minibus": return "#0E7490"
      case "teleferico": return "#6D28D9"
      case "pumakatari": return "#047857"
    }
  }

  return (
    <View style={styles.container}>
      {/* Handle */}
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Opciones de ruta</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Origin - Destination */}
        <View style={styles.locationContainer}>
          <View style={styles.locationIndicator}>
            <View style={[styles.indicatorDot, { backgroundColor: "#10B981" }]} />
            <View style={styles.indicatorLine} />
            <View style={[styles.indicatorDot, { backgroundColor: "#F59E0B" }]} />
          </View>
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationText} numberOfLines={1}>{origin}</Text>
            <Text style={styles.locationDivider}>hacia</Text>
            <Text style={styles.locationText} numberOfLines={1}>{destination}</Text>
          </View>
        </View>
      </View>

      {/* Routes List */}
      <ScrollView style={styles.routesList}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0891B2" />
            <Text style={styles.loadingText}>Calculando mejores rutas...</Text>
          </View>
        ) : routes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Route size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No encontramos rutas disponibles</Text>
            <Text style={styles.emptySubtitle}>Intenta con otra ubicación</Text>
          </View>
        ) : (
          <View style={styles.routesContainer}>
            {routes.map((route, index) => {
              const isSelected = selectedRoute?.id === route.id
              const isExpanded = expandedRoute === route.id

              return (
                <View
                  key={route.id}
                  style={[
                    styles.routeCard,
                    isSelected && styles.selectedRouteCard
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
                            <Text style={styles.recommendedText}>Recomendada</Text>
                          </View>
                        )}
                        <Text style={styles.routeIndex}>Opción {index + 1}</Text>
                      </View>
                      {isSelected && <Check size={20} color="#0891B2" />}
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                      <View style={styles.statItem}>
                        <Clock size={16} color="#0891B2" />
                        <Text style={styles.statValue}>{formatDuration(route.totalDuration)}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Wallet size={16} color="#10B981" />
                        <Text style={styles.statValue}>Bs. {route.totalCost}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Route size={16} color="#9CA3AF" />
                        <Text style={styles.statValue}>{formatDistance(route.totalDistance)}</Text>
                      </View>
                    </View>

                    {/* Segments Preview */}
                    <View style={styles.segmentsContainer}>
                      {route.segments.map((segment, i) => (
                        <View key={segment.id} style={styles.segmentWrapper}>
                          <View style={[
                            styles.segmentBadge,
                            { backgroundColor: getSegmentColor(segment.type) }
                          ]}>
                            <SegmentIcon type={segment.type} />
                            <Text style={[
                              styles.segmentText,
                              { color: getSegmentTextColor(segment.type) }
                            ]}>
                              {segment.line || `${segment.duration}min`}
                            </Text>
                          </View>
                          {i < route.segments.length - 1 && (
                            <ArrowRight size={12} color="#D1D5DB" style={styles.arrowIcon} />
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
                  {isExpanded && (
                    <View style={styles.expandedDetails}>
                      <View style={styles.segmentsDetails}>
                        {route.segments.map((segment, i) => (
                          <View key={segment.id} style={styles.segmentDetail}>
                            {/* Timeline */}
                            <View style={styles.timeline}>
                              <View style={[
                                styles.timelineDot,
                                { backgroundColor: getSegmentTextColor(segment.type) }
                              ]}>
                                <SegmentIcon type={segment.type} />
                              </View>
                              {i < route.segments.length - 1 && (
                                <View style={styles.timelineLine} />
                              )}
                            </View>

                            {/* Content */}
                            <View style={styles.segmentContent}>
                              <Text style={styles.segmentInstructions}>
                                {segment.instructions}
                              </Text>
                              <View style={styles.segmentMeta}>
                                <Text style={styles.segmentMetaText}>{segment.duration} min</Text>
                                {segment.distance && (
                                  <Text style={styles.segmentMetaText}>
                                    {formatDistance(segment.distance)}
                                  </Text>
                                )}
                                {segment.cost ? (
                                  <Text style={styles.segmentCost}>
                                    Bs. {segment.cost}
                                  </Text>
                                ) : null}
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>

      {/* Action Button */}
      {selectedRoute && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            onPress={onStartNavigation}
            style={styles.navigationButton}
          >
            <Navigation size={20} color="#FFFFFF" />
            <Text style={styles.navigationButtonText}>Iniciar navegación</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    maxHeight: "75%",
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
  },
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
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  locationIndicator: {
    alignItems: "center",
    marginTop: 4,
  },
  indicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  indicatorLine: {
    width: 1,
    height: 16,
    backgroundColor: "#D1D5DB",
    marginVertical: 2,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  locationDivider: {
    fontSize: 12,
    color: "#9CA3AF",
    marginVertical: 2,
  },
  routesList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  routesContainer: {
    gap: 12,
  },
  routeCard: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  selectedRouteCard: {
    borderColor: "#0891B2",
    backgroundColor: "#F0F9FF",
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
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#065F46",
  },
  routeIndex: {
    fontSize: 12,
    color: "#6B7280",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  segmentsContainer: {
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
    paddingVertical: 4,
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 11,
    fontWeight: "500",
  },
  arrowIcon: {
    marginHorizontal: 4,
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
    color: "#0891B2",
    fontWeight: "500",
  },
  expandedDetails: {
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  segmentsDetails: {
    gap: 16,
  },
  segmentDetail: {
    flexDirection: "row",
    gap: 12,
  },
  timeline: {
    alignItems: "center",
    width: 32,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineLine: {
    width: 1,
    height: 24,
    backgroundColor: "#D1D5DB",
    marginTop: 4,
  },
  segmentContent: {
    flex: 1,
    paddingBottom: 16,
  },
  segmentInstructions: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  segmentMeta: {
    flexDirection: "row",
    gap: 12,
  },
  segmentMetaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  segmentCost: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
  },
  actionContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "white",
  },
  navigationButton: {
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
  navigationButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default RouteOptionsSheet