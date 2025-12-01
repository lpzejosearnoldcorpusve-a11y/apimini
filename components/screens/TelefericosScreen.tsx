import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const TELEFERICO_LINES = [
  { id: "1", name: "Línea Roja", stations: 4, status: "Operando", color: "#E53935" },
  { id: "2", name: "Línea Amarilla", stations: 3, status: "Operando", color: "#FDD835" },
  { id: "3", name: "Línea Verde", stations: 5, status: "Operando", color: "#43A047" },
  { id: "4", name: "Línea Azul", stations: 4, status: "Operando", color: "#1E88E5" },
  { id: "5", name: "Línea Naranja", stations: 3, status: "Operando", color: "#FB8C00" },
  { id: "6", name: "Línea Blanca", stations: 5, status: "Operando", color: "#78909C" },
]

export function TelefericosScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Text style={styles.title}>Teleféricos</Text>
        <Text style={styles.subtitle}>Mi Teleférico - La Paz</Text>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <StatusBanner />
        <TelefericoLines lines={TELEFERICO_LINES} />
      </ScrollView>
    </View>
  )
}

function StatusBanner() {
  return (
    <View style={styles.statusBanner}>
      <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
      <Text style={styles.statusText}>Todas las líneas operando normalmente</Text>
    </View>
  )
}

function TelefericoLines({ lines }: { lines: typeof TELEFERICO_LINES }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Líneas disponibles</Text>
      {lines.map((line) => (
        <TouchableOpacity key={line.id} style={styles.lineCard}>
          <View style={[styles.lineIndicator, { backgroundColor: line.color }]} />
          <View style={styles.lineInfo}>
            <Text style={styles.lineName}>{line.name}</Text>
            <View style={styles.lineMeta}>
              <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.lineMetaText}>{line.stations} estaciones</Text>
              <View style={styles.dot} />
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusBadgeText}>{line.status}</Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, ...SHADOWS.sm },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: "700", color: COLORS.text },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.xs },
  content: { flex: 1 },
  scrollContent: { padding: SPACING.lg },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.success + "15",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  statusText: { fontSize: FONT_SIZES.sm, color: COLORS.success, fontWeight: "500" },
  section: { marginTop: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: "600", color: COLORS.text, marginBottom: SPACING.md },
  lineCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  lineIndicator: { width: 8, height: 50, borderRadius: 4 },
  lineInfo: { flex: 1, marginLeft: SPACING.md },
  lineName: { fontSize: FONT_SIZES.md, fontWeight: "600", color: COLORS.text },
  lineMeta: { flexDirection: "row", alignItems: "center", marginTop: SPACING.xs, gap: SPACING.xs },
  lineMetaText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.textLight },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  statusBadgeText: { fontSize: FONT_SIZES.xs, color: COLORS.success, fontWeight: "500" },
})
