import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export function MapsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map" size={64} color={COLORS.primaryLight} />
        <Text style={styles.mapPlaceholderText}>Mapa de La Paz</Text>
      </View>

      <SafeAreaView edges={["top"]} style={styles.overlay}>
        <TouchableOpacity style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <Text style={styles.searchPlaceholder}>Buscar ubicación...</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <TransportBottomSheet />
    </View>
  )
}

function TransportBottomSheet() {
  return (
    <View style={styles.bottomSheet}>
      <View style={styles.handle} />
      <Text style={styles.sheetTitle}>Transporte cercano</Text>
      <View style={styles.transportOptions}>
        <TouchableOpacity style={styles.transportCard}>
          <Ionicons name="bus" size={24} color={COLORS.primary} />
          <Text style={styles.transportLabel}>Minibus</Text>
          <Text style={styles.transportCount}>12 cerca</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.transportCard}>
          <Ionicons name="git-network" size={24} color={COLORS.secondary} />
          <Text style={styles.transportLabel}>Teleférico</Text>
          <Text style={styles.transportCount}>2 estaciones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.transportCard}>
          <Ionicons name="car" size={24} color={COLORS.accent} />
          <Text style={styles.transportLabel}>PumaKatari</Text>
          <Text style={styles.transportCount}>5 cerca</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.primaryLight + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  mapPlaceholderText: { marginTop: SPACING.md, fontSize: FONT_SIZES.lg, color: COLORS.primary, fontWeight: "500" },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  searchPlaceholder: { color: COLORS.textSecondary, fontSize: FONT_SIZES.md },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    ...SHADOWS.lg,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: SPACING.md,
  },
  sheetTitle: { fontSize: FONT_SIZES.lg, fontWeight: "600", color: COLORS.text, marginBottom: SPACING.md },
  transportOptions: { flexDirection: "row", gap: SPACING.md },
  transportCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
  },
  transportLabel: { fontSize: FONT_SIZES.sm, fontWeight: "500", color: COLORS.text, marginTop: SPACING.xs },
  transportCount: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: SPACING.xs },
})
