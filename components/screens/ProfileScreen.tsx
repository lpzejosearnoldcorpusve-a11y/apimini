"use client"

import { LogoutButton } from "@/components/profile/LogoutButton"
import { ProfileHeader } from "@/components/profile/ProfileHeader"
import { ProfileInfo } from "@/components/profile/ProfileInfo"
import { ProfileMenu } from "@/components/profile/ProfileMenu"
import { ProfileStats } from "@/components/profile/ProfileStats"
import { COLORS, FONT_SIZES, SPACING } from "@/constants/theme"
import { useAuth } from "@/context/AuthContext"
import { ScrollView, StyleSheet, Text, View } from "react-native"

export function ProfileScreen() {
  const { user, logout } = useAuth()

  return (
    <View style={styles.container}>
      <ProfileHeader user={user} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ProfileStats user={user} />
        <ProfileInfo user={user} />
        <ProfileMenu />
        <LogoutButton onLogout={logout} />
        <Text style={styles.version}>Turuta v1.0.0</Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    marginTop: -SPACING.xl,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  version: {
    textAlign: "center",
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: SPACING.lg,
  },
})
