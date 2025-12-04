import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import type { Tarjeta } from "@/types/tarjeta"
import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface TarjetaCardProps {
  tarjeta: Tarjeta
  isSelected?: boolean
  onPress?: () => void
  showBalance?: boolean
  compact?: boolean
}

export function TarjetaCard({
  tarjeta,
  isSelected = false,
  onPress,
  showBalance = true,
  compact = false,
}: TarjetaCardProps) {
  const isActive = tarjeta.estado === "activa"

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        !isActive && styles.cardInactive,
        compact && styles.cardCompact,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Chip visual */}
      <View style={styles.chipContainer}>
        <View style={[styles.chip, !isActive && styles.chipInactive]}>
          <View style={styles.chipLines}>
            <View style={styles.chipLine} />
            <View style={styles.chipLine} />
            <View style={styles.chipLine} />
          </View>
        </View>
        {isSelected && (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={14} color={COLORS.white} />
          </View>
        )}
      </View>

      {/* Info de la tarjeta */}
      <View style={styles.info}>
        <Text style={[styles.name, !isActive && styles.textInactive]} numberOfLines={1}>
          {tarjeta.nombre}
        </Text>
        <Text style={[styles.celular, !isActive && styles.textInactive]}>
          <Ionicons name="call-outline" size={12} color={isActive ? COLORS.textSecondary : COLORS.gray100} />{" "}
          {tarjeta.celular}
        </Text>
      </View>

      {/* Balance y estado */}
      <View style={styles.rightSection}>
        {showBalance && (
          <Text style={[styles.balance, !isActive && styles.textInactive]}>Bs. {tarjeta.montoBs.toFixed(2)}</Text>
        )}
        <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusInactive]}>
          <View style={[styles.statusDot, isActive ? styles.dotActive : styles.dotInactive]} />
          <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextInactive]}>
            {isActive ? "Activa" : "Inactiva"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
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
    backgroundColor: COLORS.primary + "08",
  },
  cardInactive: {
    backgroundColor: COLORS.gray100 + "20",
  },
  cardCompact: {
    padding: SPACING.sm,
  },
  chipContainer: {
    position: "relative",
    marginRight: SPACING.md,
  },
  chip: {
    width: 40,
    height: 32,
    backgroundColor: COLORS.secondary,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  chipInactive: {
    backgroundColor: COLORS.gray100,
  },
  chipLines: {
    width: "60%",
    gap: 2,
  },
  chipLine: {
    height: 2,
    backgroundColor: COLORS.secondaryDark + "40",
    borderRadius: 1,
  },
  checkBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  celular: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  textInactive: {
    color: COLORS.gray100,
  },
  rightSection: {
    alignItems: "flex-end",
    gap: SPACING.xs,
  },
  balance: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.primary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  statusActive: {
    backgroundColor: COLORS.success + "15",
  },
  statusInactive: {
    backgroundColor: COLORS.gray100 + "20",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: COLORS.success,
  },
  dotInactive: {
    backgroundColor: COLORS.gray100,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "500",
  },
  statusTextActive: {
    color: COLORS.success,
  },
  statusTextInactive: {
    color: COLORS.gray100,
  },
})
