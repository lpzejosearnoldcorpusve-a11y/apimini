"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { EditProfileModal } from "./EditProfileModal"
import { FavoriteRoutesModal } from "./FavoriteRoutesModal"
import { HelpModal } from "./HelpModal"
import { PaymentMethodsModal } from "./PaymentMethodsModal"
import { SettingsModal } from "./SettingsModal"
import { TripHistoryModal } from "./TripHistoryModal"

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle: string
  action: string
}

const MENU_ITEMS: MenuItem[] = [
  { icon: "create-outline", title: "Editar perfil", subtitle: "Celular y contrasena", action: "edit" },
  { icon: "card-outline", title: "Metodos de pago", subtitle: "Tarjetas y saldo", action: "payment" },
  { icon: "time-outline", title: "Historial de viajes", subtitle: "Tus viajes recientes", action: "history" },
  { icon: "heart-outline", title: "Rutas favoritas", subtitle: "Acceso rapido", action: "favorites" },
  { icon: "settings-outline", title: "Configuracion", subtitle: "Notificaciones y mas", action: "settings" },
  { icon: "help-circle-outline", title: "Ayuda", subtitle: "Centro de soporte", action: "help" },
]

export function ProfileMenu() {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showFavoritesModal, setShowFavoritesModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)

  const handleMenuPress = (action: string) => {
    switch (action) {
      case "edit":
        setShowEditModal(true)
        break
      case "payment":
        setShowPaymentModal(true)
        break
      case "history":
        setShowHistoryModal(true)
        break
      case "favorites":
        setShowFavoritesModal(true)
        break
      case "settings":
        setShowSettingsModal(true)
        break
      case "help":
        setShowHelpModal(true)
        break
    }
  }

  return (
    <>
      <View style={styles.container}>
        {MENU_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, index === MENU_ITEMS.length - 1 && styles.lastItem]}
            onPress={() => handleMenuPress(item.action)}
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

      <EditProfileModal visible={showEditModal} onClose={() => setShowEditModal(false)} onSuccess={() => {}} />
      <PaymentMethodsModal visible={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
      <TripHistoryModal visible={showHistoryModal} onClose={() => setShowHistoryModal(false)} />
      <FavoriteRoutesModal visible={showFavoritesModal} onClose={() => setShowFavoritesModal(false)} />
      <SettingsModal visible={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      <HelpModal visible={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </>
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
