"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/theme"
import type { User } from "@/types/auth"
import { LinearGradient } from "expo-linear-gradient"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

interface ProfileHeaderProps {
  user: User | null
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const initials = user ? `${user.nombres.charAt(0)}${user.apellidoPaterno.charAt(0)}` : "U"

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.header}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.content}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={styles.userName}>
            {user?.nombres || "Usuario"} {user?.apellidoPaterno || ""}
          </Text>

          <Text style={styles.userCI}>CI: {user?.carnetIdentidad || "---"}</Text>

          {user?.ciudad && (
            <View style={styles.locationBadge}>
              <Text style={styles.locationText}>{user.ciudad}</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: SPACING.xxl + SPACING.lg,
  },
  content: {
    alignItems: "center",
    paddingTop: SPACING.lg,
  },
  avatar: {
    width: 90,
    height: 90,
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
  locationBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.sm,
  },
  locationText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: "500",
  },
})
