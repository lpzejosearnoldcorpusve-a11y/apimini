"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import type { User } from "@/types/auth"
import { StyleSheet, Text, View } from "react-native"

interface ProfileStatsProps {
  user: User | null
}

export function ProfileStats({ user }: ProfileStatsProps) {
  // Calcular días desde el registro
  const memberSince = user?.createdAt
    ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const stats = [
    { label: "Viajes", value: "24" },
    { label: "Gastado", value: "Bs. 72" },
    { label: "Días", value: memberSince.toString() },
  ]

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.statCard}>
          <Text style={styles.statNumber}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
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
})
