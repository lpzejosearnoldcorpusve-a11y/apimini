import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import type { RouteOption, RouteSegment } from "@/types/routing"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface CombinedRouteCardProps {
  route: RouteOption
  isSelected: boolean
  onPress: () => void
}

/**
 * Componente para mostrar una ruta combinada (minibus + teleférico)
 * Muestra de forma visual la ruta completa
 */
export function CombinedRouteCard({ route, isSelected, onPress }: CombinedRouteCardProps) {
  const isCombined = (route.segments || []).some((s) => s.type === "minibus") &&
                     (route.segments || []).some((s) => s.type === "teleferico")

  const getSegmentIcon = (type: RouteSegment["type"]) => {
    switch (type) {
      case "walk":
        return { icon: "walk", label: "Caminar", color: COLORS.textSecondary }
      case "minibus":
        return { icon: "bus", label: "Minibus", color: "#0891B2" }
      case "teleferico":
        return { icon: "git-network", label: "Teleférico", color: "#7C3AED" }
      case "pumakatari":
        return { icon: "bus", label: "PumaKatari", color: "#10B981" }
      default:
        return { icon: "help", label: "Transporte", color: COLORS.primary }
    }
  }

  const segments = route.segments || []
  const transportSegments = segments.filter((s) => s.type !== "walk")

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        isCombined && styles.cardCombined,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Badge de ruta combinada */}
      {isCombined && (
        <LinearGradient
          colors={["#0891B2", "#7C3AED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.combinedBadge}
        >
          <Ionicons name="shuffle" size={12} color={COLORS.white} />
          <Text style={styles.combinedBadgeText}>Ruta Combinada</Text>
        </LinearGradient>
      )}

      {/* Información principal */}
      <View style={styles.header}>
        <View style={styles.timeAndCost}>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={16} color={COLORS.primary} />
            <Text style={styles.infoLabel}>
              {route.totalDuration < 60
                ? `${route.totalDuration} min`
                : `${Math.floor(route.totalDuration / 60)}h ${route.totalDuration % 60}m`}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoItem}>
            <Ionicons name="wallet" size={16} color={COLORS.success} />
            <Text style={[styles.infoLabel, { color: COLORS.success }]}>
              Bs. {route.totalCost.toFixed(2)}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoItem}>
            <Ionicons name="swap-vertical" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoLabel}>{route.transfers} transf.</Text>
          </View>
        </View>

        {isSelected && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
          </View>
        )}
      </View>

      {/* Segmentos de transporte */}
      <View style={styles.segmentsContainer}>
        {transportSegments.map((segment, index) => {
          const segmentInfo = getSegmentIcon(segment.type)
          return (
            <View key={segment.id}>
              {/* Transporte */}
              <View style={styles.segmentRow}>
                <View
                  style={[
                    styles.segmentIcon,
                    { backgroundColor: segmentInfo.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={segmentInfo.icon as any}
                    size={14}
                    color={segmentInfo.color}
                  />
                </View>

                <View style={styles.segmentInfo}>
                  <Text style={styles.segmentLabel}>{segmentInfo.label}</Text>
                  {segment.line && (
                    <Text style={styles.segmentLine}>{segment.line}</Text>
                  )}
                </View>

                <Text style={styles.segmentDuration}>{segment.duration} min</Text>
              </View>

              {/* Flecha de conexión */}
              {index < transportSegments.length - 1 && (
                <View style={styles.connectionLine}>
                  <View style={[styles.dotConnector, { backgroundColor: COLORS.border }]} />
                </View>
              )}
            </View>
          )
        })}
      </View>

      {/* Rating de recomendación */}
      {route.recommended && (
        <View style={styles.recommendedBadge}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.recommendedText}>Recomendada</Text>
        </View>
      )}

      {/* Distancia total */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {(route.totalDistance / 1000).toFixed(1)} km
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: "transparent",
    ...SHADOWS.sm,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "05",
  },
  cardCombined: {
    borderColor: "#7C3AED",
  },
  combinedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
    gap: 4,
  },
  combinedBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
    color: COLORS.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  timeAndCost: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flex: 1,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.text,
  },
  separator: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.border,
  },
  checkmark: {
    marginLeft: SPACING.sm,
  },
  segmentsContainer: {
    marginVertical: SPACING.md,
  },
  segmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  segmentIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  segmentInfo: {
    flex: 1,
  },
  segmentLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.text,
  },
  segmentLine: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  segmentDuration: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  connectionLine: {
    alignItems: "center",
    paddingVertical: SPACING.xs,
  },
  dotConnector: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  recommendedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F59E0B20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
    marginBottom: SPACING.sm,
  },
  recommendedText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
    color: "#F59E0B",
  },
  footer: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
})
