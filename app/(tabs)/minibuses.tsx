import { MinibusesScreen } from "@/components/screens/MinibusesScreen"
import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { StyleSheet } from "react-native"

export default function Minibuses() {
  return <MinibusesScreen />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "700",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
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
  searchPlaceholder: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
  },
  filters: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: "500",
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  lineCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  lineNumber: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  lineNumberText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.white,
  },
  lineInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  lineRoute: {
    fontSize: FONT_SIZES.md,
    fontWeight: "500",
    color: COLORS.text,
  },
  lineMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  lineMetaText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
})
