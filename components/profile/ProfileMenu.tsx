"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle: string
  onPress?: () => void
}

const MENU_ITEMS: MenuItem[] = [
  { icon: "create-outline", title: "Editar perfil", subtitle: "Actualiza tu información" },
  { icon: "card-outline", title: "Métodos de pago", subtitle: "Tarjetas y saldo" },
  { icon: "time-outline", title: "Historial de viajes", subtitle: "Tus viajes recientes" },
  { icon: "heart-outline", title: "Rutas favoritas", subtitle: "Acceso rápido" },
  { icon: "settings-outline", title: "Configuración", subtitle: "Notificaciones y más" },
  { icon: "help-circle-outline", title: "Ayuda", subtitle: "Centro de soporte" },
]

export function ProfileMenu() {
  return (
    <View style={styles.container}>
      {MENU_ITEMS.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.menuItem, index === MENU_ITEMS.length - 1 && styles.lastItem]}
          onPress={item.onPress}
          activeOpacity={0.7}
        >
          <View style={styles.menuIcon}>
            <Ionicons name={item.icon} size={22} color={COLORS.primary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginTop: SPACING.lg,
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastItem: {
    borderBottomWidth: 0,
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
})
