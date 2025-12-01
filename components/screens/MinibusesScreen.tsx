import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const MINIBUS_LINES = [
  { id: "1", number: "201", route: "Centro - Zona Sur", color: "#E53935" },
  { id: "2", number: "130", route: "Sopocachi - Miraflores", color: "#1E88E5" },
  { id: "3", number: "288", route: "El Alto - Obrajes", color: "#43A047" },
  { id: "4", number: "312", route: "Villa Fátima - Calacoto", color: "#FB8C00" },
]

export function MinibusesScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Text style={styles.title}>Minibuses</Text>
        <Text style={styles.subtitle}>Encuentra tu línea de transporte</Text>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SearchBar placeholder="Buscar línea o ruta..." />
        <FilterChips />
        <LinesList lines={MINIBUS_LINES} />
      </ScrollView>
    </View>
  )
}

function SearchBar({ placeholder }: { placeholder: string }) {
  return (
    <TouchableOpacity style={styles.searchBar}>
      <Ionicons name="search" size={20} color={COLORS.textSecondary} />
      <Text style={styles.searchPlaceholder}>{placeholder}</Text>
    </TouchableOpacity>
  )
}

function FilterChips() {
  return (
    <View style={styles.filters}>
      <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
        <Text style={styles.filterChipTextActive}>Todos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.filterChip}>
        <Text style={styles.filterChipText}>Minibuses</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.filterChip}>
        <Text style={styles.filterChipText}>PumaKatari</Text>
      </TouchableOpacity>
    </View>
  )
}

function LinesList({ lines }: { lines: typeof MINIBUS_LINES }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Líneas frecuentes</Text>
      {lines.map((line) => (
        <TouchableOpacity key={line.id} style={styles.lineCard}>
          <View style={[styles.lineNumber, { backgroundColor: line.color }]}>
            <Text style={styles.lineNumberText}>{line.number}</Text>
          </View>
          <View style={styles.lineInfo}>
            <Text style={styles.lineRoute}>{line.route}</Text>
            <View style={styles.lineMeta}>
              <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.lineMetaText}>Cada 5-10 min</Text>
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  searchPlaceholder: { color: COLORS.textSecondary, fontSize: FONT_SIZES.md },
  filters: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.lg },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  filterChipTextActive: { fontSize: FONT_SIZES.sm, color: COLORS.white, fontWeight: "500" },
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
  lineNumber: { width: 50, height: 50, borderRadius: BORDER_RADIUS.md, alignItems: "center", justifyContent: "center" },
  lineNumberText: { fontSize: FONT_SIZES.lg, fontWeight: "700", color: COLORS.white },
  lineInfo: { flex: 1, marginLeft: SPACING.md },
  lineRoute: { fontSize: FONT_SIZES.md, fontWeight: "500", color: COLORS.text },
  lineMeta: { flexDirection: "row", alignItems: "center", marginTop: SPACING.xs, gap: SPACING.xs },
  lineMetaText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
})
