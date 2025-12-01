"use client"

import { COLORS } from "@/constants/theme"
import { useAuth } from "@/context/AuthContext"
import { Redirect } from "expo-router"
import { ActivityIndicator, StyleSheet, View } from "react-native"

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/maps" />
  }

  return <Redirect href="/(auth)/login" />
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
})
