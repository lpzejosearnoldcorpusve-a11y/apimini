"use client"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/theme"
import { useAuth } from "@/context/AuthContext"
import { useForm } from "@/hooks/useForm"
import { useHaptics } from "@/hooks/useHaptics"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"

export function LoginForm() {
  const { login, isLoading } = useAuth()
  const { error: hapticError, success: hapticSuccess } = useHaptics()
  const [apiError, setApiError] = useState("")

  const { values, errors, setValue, validate } = useForm(
    { carnetIdentidad: "", password: "" },
    {
      carnetIdentidad: { required: true, minLength: 6 },
      password: { required: true, minLength: 6 },
    },
  )

  const handleLogin = async () => {
    setApiError("")
    if (!validate()) {
      hapticError()
      return
    }

    const result = await login(values.carnetIdentidad, values.password)
    if (result.success) {
      hapticSuccess()
    } else {
      hapticError()
      setApiError(result.error || "Error al iniciar sesión")
    }
  }

  return (
    <View style={styles.card}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <Text style={styles.welcomeText}>Bienvenido de vuelta</Text>
      <Text style={styles.instructionText}>Ingresa tus credenciales para continuar</Text>

      {apiError ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color={COLORS.error} />
          <Text style={styles.errorBannerText}>{apiError}</Text>
        </View>
      ) : null}

      <Input
        label="Carnet de Identidad"
        placeholder="Ingresa tu CI"
        icon="card-outline"
        value={values.carnetIdentidad}
        onChangeText={(text) => setValue("carnetIdentidad", text)}
        error={errors.carnetIdentidad}
        keyboardType="number-pad"
        autoCapitalize="none"
      />

      <Input
        label="Contraseña"
        placeholder="Ingresa tu contraseña"
        icon="lock-closed-outline"
        value={values.password}
        onChangeText={(text) => setValue("password", text)}
        error={errors.password}
        secureTextEntry
      />

      <TouchableOpacity style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <Button title="Iniciar Sesión" onPress={handleLogin} loading={isLoading} size="lg" style={styles.loginButton} />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>o</Text>
        <View style={styles.dividerLine} />
      </View>

      <Button title="Crear una cuenta" onPress={() => router.push("/(auth)/signup")} variant="outline" size="lg" />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logo: {
    width: 96,
    height: 96,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
    resizeMode: 'contain',
  },
  welcomeText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  instructionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  errorBannerText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: "500",
  },
  loginButton: {
    marginBottom: SPACING.lg,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
  },
})
