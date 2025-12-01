"use client"

import { SignupSteps } from "@/components/auth/SignupSteps"
import { SignupHeader } from "@/components/layout/SignupHeader"
import { COLORS, FONT_SIZES, SPACING } from "@/constants/theme"
import { useAuth } from "@/context/AuthContext"
import { useHaptics } from "@/hooks/useHaptics"
import { router } from "expo-router"
import { useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const STEP_LABELS = ["Datos Personales", "Información de Contacto", "Seguridad"]

const CITIES = ["La Paz", "El Alto", "Cochabamba", "Santa Cruz", "Oruro", "Potosí", "Sucre", "Tarija", "Beni", "Pando"]

export default function SignupScreen() {
  const { register, isLoading } = useAuth()
  const { success: hapticSuccess, error: hapticError, medium } = useHaptics()
  const [currentStep, setCurrentStep] = useState(0)
  const [apiError, setApiError] = useState("")
  const [showCityPicker, setShowCityPicker] = useState(false)

  const [formData, setFormData] = useState({
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    carnetIdentidad: "",
    ciudad: "",
    complemento: "",
    fechaNacimiento: "",
    celular: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 0) {
      if (!formData.nombres.trim()) newErrors.nombres = "Ingresa tu nombre"
      if (!formData.apellidoPaterno.trim()) newErrors.apellidoPaterno = "Ingresa tu apellido paterno"
      if (!formData.carnetIdentidad.trim()) newErrors.carnetIdentidad = "Ingresa tu CI"
      else if (formData.carnetIdentidad.length < 6) newErrors.carnetIdentidad = "CI inválido"
      if (!formData.fechaNacimiento.trim()) newErrors.fechaNacimiento = "Ingresa tu fecha de nacimiento"
    } else if (step === 1) {
      if (!formData.ciudad.trim()) newErrors.ciudad = "Selecciona tu ciudad"
      if (!formData.celular.trim()) newErrors.celular = "Ingresa tu celular"
      else if (formData.celular.length < 8) newErrors.celular = "Celular inválido"
    } else if (step === 2) {
      if (!formData.password.trim()) newErrors.password = "Ingresa una contraseña"
      else if (formData.password.length < 6) newErrors.password = "Mínimo 6 caracteres"
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      hapticError()
      return
    }
    medium()
    setCurrentStep((prev) => prev + 1)
  }

  const handleBack = () => {
    medium()
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    } else {
      router.back()
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(2)) {
      hapticError()
      return
    }

    setApiError("")
    const { confirmPassword, ...registerData } = formData

    const result = await register(registerData)
    if (result.success) {
      hapticSuccess()
    } else {
      hapticError()
      setApiError(result.error || "Error al registrar")
    }
  }

  return (
    <View style={styles.container}>
      <SignupHeader onBack={() => router.back()} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.formContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SignupSteps
            currentStep={currentStep}
            totalSteps={3}
            labels={STEP_LABELS}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            handleNext={handleNext}
            handleBack={handleBack}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            apiError={apiError}
            setApiError={setApiError}
            showCityPicker={showCityPicker}
            setShowCityPicker={setShowCityPicker}
            CITIES={CITIES}
          />

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Inicia Sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  formContainer: { flex: 1, marginTop: -SPACING.md },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  loginPrompt: { flexDirection: "row", justifyContent: "center", marginTop: SPACING.xl },
  loginPromptText: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  loginLink: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: "600" },
})
