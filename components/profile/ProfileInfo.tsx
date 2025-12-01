"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import type { User } from "@/types/auth"
import { Ionicons } from "@expo/vector-icons"
import { StyleSheet, Text, View } from "react-native"

interface ProfileInfoProps {
  user: User | null
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  if (!user) return null

  // Formatear fecha de nacimiento
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-BO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const infoItems = [
    {
      icon: "person-outline" as const,
      label: "Nombre completo",
      value: `${user.nombres} ${user.apellidoPaterno} ${user.apellidoMaterno}`,
    },
    {
      icon: "card-outline" as const,
      label: "Carnet de Identidad",
      value: `${user.carnetIdentidad}${user.complemento ? ` ${user.complemento}` : ""}`,
    },
    {
      icon: "call-outline" as const,
      label: "Celular",
      value: user.celular,
    },
    {
      icon: "location-outline" as const,
      label: "Ciudad",
      value: user.ciudad,
    },
    {
      icon: "calendar-outline" as const,
      label: "Fecha de nacimiento",
      value: formatDate(user.fechaNacimiento),
    },
    {
      icon: "time-outline" as const,
      label: "Estado de cuenta",
      value: user.estado === "activo" ? "Activo" : "Inactivo",
    },
  ]

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Información personal</Text>

      {infoItems.map((item, index) => (
        <View key={index} style={styles.infoItem}>
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon} size={20} color={COLORS.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{item.label}</Text>
            <Text style={styles.infoValue}>{item.value}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    ...SHADOWS.sm,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: "500",
    marginTop: 2,
  },
})
