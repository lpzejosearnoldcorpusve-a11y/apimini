"use client"
import { ProfileScreen } from "@/components/screens/ProfileScreen"
import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { StyleSheet } from "react-native"

const MENU_ITEMS = [
  { icon: "person-outline" as const, title: "Editar perfil", subtitle: "Actualiza tu información" },
  { icon: "card-outline" as const, title: "Métodos de pago", subtitle: "Tarjetas y saldo" },
  { icon: "time-outline" as const, title: "Historial de viajes", subtitle: "Tus viajes recientes" },
  { icon: "heart-outline" as const, title: "Rutas favoritas", subtitle: "Acceso rápido" },
  { icon: "settings-outline" as const, title: "Configuración", subtitle: "Notificaciones y más" },
  { icon: "help-circle-outline" as const, title: "Ayuda", subtitle: "Centro de soporte" },
]

export default function Profile() {
  return <ProfileScreen />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingBottom: SPACING.xxl,
  },
  headerContent: {
    alignItems: "center",
    paddingTop: SPACING.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "700",
    color: COLORS.white,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "600",
    color: COLORS.white,
    marginTop: SPACING.md,
  },
  userCI: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.8)",
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    marginTop: -SPACING.lg,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  statsRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    ...SHADOWS.md,
  },
  statNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  menuSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginTop: SPACING.xl,
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  menuContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  menuTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "500",
    color: COLORS.text,
  },
  menuSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.error + "10",
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.error,
  },
  version: {
    textAlign: "center",
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: SPACING.lg,
  },
})
