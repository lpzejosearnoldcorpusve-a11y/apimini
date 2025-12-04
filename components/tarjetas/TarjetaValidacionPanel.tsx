import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import type { Tarjeta } from "@/types/tarjeta"
import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, Text, View } from "react-native"

interface TarjetaValidacionPanelProps {
  tarjeta: Tarjeta
}

export function TarjetaValidacionPanel({ tarjeta }: TarjetaValidacionPanelProps) {
  const isActive = tarjeta.estado === "activa"

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="card" size={24} color={COLORS.primary} />
        <Text style={styles.title}>Validacion de Tarjeta</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.infoGrid}>
        <InfoRow icon="person-outline" label="Nombre" value={tarjeta.nombre} />
        <InfoRow icon="call-outline" label="Celular" value={formatPhone(tarjeta.celular)} />
        <InfoRow
          icon="wallet-outline"
          label="Monto"
          value={`Bs. ${tarjeta.montoBs.toFixed(2)}`}
          valueColor={COLORS.primary}
          valueBold
        />
        <InfoRow
          icon={isActive ? "checkmark-circle" : "close-circle"}
          label="Estado"
          value={isActive ? "Activa" : "Inactiva"}
          valueColor={isActive ? COLORS.success : COLORS.error}
          iconColor={isActive ? COLORS.success : COLORS.error}
        />
      </View>

      {!isActive && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={18} color={COLORS.warning} />
          <Text style={styles.warningText}>Esta tarjeta esta inactiva y no puede ser vinculada</Text>
        </View>
      )}
    </View>
  )
}

function InfoRow({
  icon,
  label,
  value,
  valueColor = COLORS.text,
  iconColor = COLORS.textSecondary,
  valueBold = false,
}: {
  icon: any
  label: string
  value: string
  valueColor?: string
  iconColor?: string
  valueBold?: boolean
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.labelContainer}>
        <Ionicons name={icon} size={18} color={iconColor} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: valueColor }, valueBold && styles.valueBold]}>{value}</Text>
    </View>
  )
}

function formatPhone(phone: string): string {
  // Formato: +591-XXX-XXX-XXX
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length >= 8) {
    return `+591-${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + "30",
    ...SHADOWS.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  infoGrid: {
    gap: SPACING.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  valueBold: {
    fontWeight: "700",
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.warning + "15",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  warningText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
  },
})
