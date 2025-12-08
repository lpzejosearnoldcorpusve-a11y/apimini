import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import type { Tarjeta } from "@/types/tarjeta"
import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, Text, View } from "react-native"

interface TarjetasVinculadasSectionProps {
  tarjetas: Tarjeta[]
  loading: boolean
  error: string | null
  onRefresh: () => void
}

export function TarjetasVinculadasSection({
  tarjetas,
  loading,
  error,
  onRefresh,
}: TarjetasVinculadasSectionProps) {
  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Ionicons name="card" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.sectionTitle}>Tarjetas Vinculadas</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando tarjetas...</Text>
        </View>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Ionicons name="card" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.sectionTitle}>Tarjetas Vinculadas</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    )
  }

  if (tarjetas.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Ionicons name="card" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.sectionTitle}>Tarjetas Vinculadas</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="card-outline" size={48} color={COLORS.gray100} />
          <Text style={styles.emptyTitle}>Sin tarjetas vinculadas</Text>
          <Text style={styles.emptyText}>Vincula una tarjeta RFID para comenzar</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons name="card" size={20} color={COLORS.primary} />
        </View>
        <Text style={styles.sectionTitle}>Tarjetas Vinculadas ({tarjetas.length})</Text>
      </View>

      {tarjetas.map((tarjeta) => (
        <View key={tarjeta.id} style={styles.tarjetaCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="card" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{tarjeta.nombre}</Text>
              <Text style={styles.cardCelular}>{tarjeta.celular}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                tarjeta.estado === "activa" ? styles.statusActive : styles.statusInactive,
              ]}
            >
              <Ionicons name={tarjeta.estado === "activa" ? "checkmark-circle" : "close-circle"} size={16} />
              <Text style={styles.statusText}>{tarjeta.estado}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>Saldo</Text>
              <Text style={styles.footerValue}>Bs. {tarjeta.montoBs.toFixed(2)}</Text>
            </View>
            <View style={styles.footerDivider} />
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>UID</Text>
              <Text style={styles.footerValue}>{tarjeta.uid}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.text,
  },
  loadingContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    backgroundColor: COLORS.error + "10",
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  errorText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  emptyContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.xxl,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  tarjetaCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  cardCelular: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusActive: {
    backgroundColor: COLORS.success + "20",
  },
  statusInactive: {
    backgroundColor: COLORS.error + "20",
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
    color: COLORS.text,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  footerItem: {
    flex: 1,
    alignItems: "center",
  },
  footerLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  footerValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.primary,
  },
  footerDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
})
