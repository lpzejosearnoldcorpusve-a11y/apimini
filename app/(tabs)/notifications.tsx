import { NotificationsScreen } from "@/components/screens/NotificationsScreen"
import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { StyleSheet } from "react-native"

const NOTIFICATIONS = [
  {
    id: "1",
    title: "Línea Verde en mantenimiento",
    message: "Servicio suspendido de 6:00 a 8:00 AM mañana",
    time: "Hace 2 horas",
    type: "warning",
    read: false,
  },
  {
    id: "2",
    title: "Nueva ruta disponible",
    message: "PumaKatari ahora conecta Irpavi con el Centro",
    time: "Hace 1 día",
    type: "info",
    read: false,
  },
  {
    id: "3",
    title: "Promoción especial",
    message: "20% de descuento en viajes con tarjeta prepago",
    time: "Hace 3 días",
    type: "promo",
    read: true,
  },
]

export default function Notifications() {
  return <NotificationsScreen />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    ...SHADOWS.sm,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "700",
    color: COLORS.text,
  },
  markAllRead: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  unread: {
    backgroundColor: COLORS.primary + "08",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  notificationTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  notificationMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  notificationTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: SPACING.xs,
  },
})
