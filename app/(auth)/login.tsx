"use client"

import { LoginForm } from "@/components/auth/LoginForm"
import { AuthHeader } from "@/components/layout/AuthHeader"
import { COLORS, SPACING } from "@/constants/theme"
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native"

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <AuthHeader title="Turuta" subtitle="Tu transporte en La Paz" />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.formContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <LoginForm />
          <Text style={styles.footer}>Gobierno Autónomo Municipal de La Paz</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  formContainer: { flex: 1, marginTop: -SPACING.xl },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  footer: { textAlign: "center", marginTop: SPACING.xl, color: COLORS.textSecondary, fontSize: 12 },
})
