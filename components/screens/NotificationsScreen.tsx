import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

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

export function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Text style={styles.title}>Notificaciones</Text>
        <TouchableOpacity>
          <Text style={styles.markAllRead}>Marcar todo como leído</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {NOTIFICATIONS.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </ScrollView>
    </View>
  )
}

function NotificationCard({ notification }: { notification: (typeof NOTIFICATIONS)[0] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return { name: "warning" as const, color: COLORS.warning }
      case "info":
        return { name: "information-circle" as const, color: COLORS.primary }
      case "promo":
        return { name: "gift" as const, color: COLORS.accent }
      default:
        return { name: "notifications" as const, color: COLORS.textSecondary }
    }
  }

  const icon = getIcon(notification.type)

  return (
    <TouchableOpacity style={[styles.notificationCard, !notification.read && styles.unread]}>
      <View style={[styles.notificationIcon, { backgroundColor: icon.color + "20" }]}>
        <Ionicons name={icon.name} size={24} color={icon.color} />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <Text style={styles.notificationTime}>{notification.time}</Text>
      </View>
      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    ...SHADOWS.sm,
  },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: "700", color: COLORS.text },
  markAllRead: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: "500" },
  content: { flex: 1 },
  scrollContent: { padding: SPACING.lg },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  unread: { backgroundColor: COLORS.primary + "08", borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationContent: { flex: 1, marginLeft: SPACING.md },
  notificationTitle: { fontSize: FONT_SIZES.md, fontWeight: "600", color: COLORS.text },
  notificationMessage: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.xs },
  notificationTime: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: SPACING.sm },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginTop: SPACING.xs },
})
