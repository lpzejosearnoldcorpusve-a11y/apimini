import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const POPULAR_ROUTES = [
  { id: "1", name: "Centro - Zona Sur", duration: "45 min", price: "Bs. 3.50" },
  { id: "2", name: "El Alto - Miraflores", duration: "35 min", price: "Bs. 2.50" },
  { id: "3", name: "Sopocachi - San Miguel", duration: "25 min", price: "Bs. 2.00" },
  { id: "4", name: "Obrajes - Calacoto", duration: "15 min", price: "Bs. 1.50" },
]

export function RoutesScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.header}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>¡Hola!</Text>
            <Text style={styles.title}>¿A dónde vas hoy?</Text>
          </View>
          <TouchableOpacity style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <Text style={styles.searchPlaceholder}>Buscar destino...</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <QuickActions />
        <PopularRoutes routes={POPULAR_ROUTES} />
      </ScrollView>
    </View>
  )
}

function QuickActions() {
  return (
    <View style={styles.quickActions}>
      <TouchableOpacity style={styles.actionCard}>
        <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + "20" }]}>
          <Ionicons name="location" size={24} color={COLORS.primary} />
        </View>
        <Text style={styles.actionText}>Mi ubicación</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionCard}>
        <View style={[styles.actionIcon, { backgroundColor: COLORS.secondary + "20" }]}>
          <Ionicons name="home" size={24} color={COLORS.secondary} />
        </View>
        <Text style={styles.actionText}>Casa</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionCard}>
        <View style={[styles.actionIcon, { backgroundColor: COLORS.accent + "20" }]}>
          <Ionicons name="briefcase" size={24} color={COLORS.accent} />
        </View>
        <Text style={styles.actionText}>Trabajo</Text>
      </TouchableOpacity>
    </View>
  )
}

function PopularRoutes({ routes }: { routes: typeof POPULAR_ROUTES }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Rutas Populares</Text>
      {routes.map((route) => (
        <TouchableOpacity key={route.id} style={styles.routeCard}>
          <View style={styles.routeIcon}>
            <Ionicons name="navigate" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.routeInfo}>
            <Text style={styles.routeName}>{route.name}</Text>
            <View style={styles.routeMeta}>
              <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.routeMetaText}>{route.duration}</Text>
              <View style={styles.dot} />
              <Ionicons name="cash-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.routeMetaText}>{route.price}</Text>
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
  header: { paddingBottom: SPACING.xl },
  headerContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  greeting: { fontSize: FONT_SIZES.md, color: "rgba(255,255,255,0.8)" },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: "700", color: COLORS.white, marginTop: SPACING.xs },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  searchPlaceholder: { color: COLORS.textSecondary, fontSize: FONT_SIZES.md },
  content: { flex: 1, marginTop: -SPACING.md },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  quickActions: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.lg },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    ...SHADOWS.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  actionText: { fontSize: FONT_SIZES.xs, color: COLORS.text, fontWeight: "500" },
  section: { marginTop: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: "600", color: COLORS.text, marginBottom: SPACING.md },
  routeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  routeIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  routeInfo: { flex: 1, marginLeft: SPACING.md },
  routeName: { fontSize: FONT_SIZES.md, fontWeight: "500", color: COLORS.text },
  routeMeta: { flexDirection: "row", alignItems: "center", marginTop: SPACING.xs, gap: SPACING.xs },
  routeMetaText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.textLight },
})
