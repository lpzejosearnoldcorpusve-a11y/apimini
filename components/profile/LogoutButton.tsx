"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native"

interface LogoutButtonProps {
  onLogout: () => void
}

export function LogoutButton({ onLogout }: LogoutButtonProps) {
  const handlePress = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: onLogout },
    ])
  }

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.7}>
      <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
      <Text style={styles.text}>Cerrar sesión</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.error + "10",
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  text: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.error,
  },
})
