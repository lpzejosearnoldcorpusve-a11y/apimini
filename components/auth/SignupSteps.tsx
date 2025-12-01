"use client"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { StepIndicator } from "@/components/ui/StepIndicator"
import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import React, { Dispatch, SetStateAction } from "react"

import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

// NOTE: `labels` and `CITIES` are provided via props from the parent screen.

interface SignupFormData {
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  carnetIdentidad: string
  ciudad: string
  complemento: string
  fechaNacimiento: string
  celular: string
  password: string
  confirmPassword: string
}

interface SignupStepsProps {
  currentStep: number
  totalSteps: number
  labels: string[]
  formData: SignupFormData
  setFormData: Dispatch<SetStateAction<SignupFormData>>
  errors: Record<string, string>
  setErrors: Dispatch<SetStateAction<Record<string, string>>>
  handleNext: () => void
  handleBack: () => void
  handleSubmit: () => void
  isLoading: boolean
  apiError: string
  setApiError: Dispatch<SetStateAction<string>>
  showCityPicker: boolean
  setShowCityPicker: Dispatch<SetStateAction<boolean>>
  CITIES: string[]
}

export function SignupSteps({
  currentStep,
  totalSteps,
  labels,
  formData,
  setFormData,
  errors,
  setErrors,
  handleNext,
  handleBack,
  handleSubmit,
  isLoading,
  apiError,
  setApiError,
  showCityPicker,
  setShowCityPicker,
  CITIES,
}: SignupStepsProps) {
  const updateField = (field: keyof SignupFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <View style={styles.card}>
      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} labels={labels} />

      {apiError ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color={COLORS.error} />
          <Text style={styles.errorBannerText}>{apiError}</Text>
        </View>
      ) : null}

      {currentStep === 0 && <StepPersonalData formData={formData} errors={errors} updateField={updateField} />}

      {currentStep === 1 && (
        <StepContactInfo
          formData={formData}
          errors={errors}
          updateField={updateField}
          showCityPicker={showCityPicker}
          setShowCityPicker={setShowCityPicker}
          onCitySelect={(city) => {
            updateField("ciudad", city)
            setShowCityPicker(false)
          }}
          CITIES={CITIES}
        />
      )}

      {currentStep === 2 && <StepSecurity formData={formData} errors={errors} updateField={updateField} />}

      <View style={styles.buttonRow}>
        {currentStep > 0 && (
          <Button title="Atrás" onPress={handleBack} variant="outline" style={styles.backStepButton} />
        )}
        <Button
          title={currentStep === 2 ? "Crear Cuenta" : "Siguiente"}
          onPress={currentStep === 2 ? handleSubmit : handleNext}
          loading={isLoading}
          style={currentStep > 0 ? styles.nextButton : styles.fullButton}
        />
      </View>
    </View>
  )
}

// Sub-components for each step
function StepPersonalData({
  formData,
  errors,
  updateField,
}: {
  formData: SignupFormData
  errors: Record<string, string>
  updateField: (field: keyof SignupFormData, value: string) => void
}) {
  return (
    <>
      <Input
        label="Nombres"
        placeholder="Ej: Carlos Alberto"
        icon="person-outline"
        value={formData.nombres}
        onChangeText={(text) => updateField("nombres", text)}
        error={errors.nombres}
        autoCapitalize="words"
      />
      <Input
        label="Apellido Paterno"
        placeholder="Ej: Gutiérrez"
        icon="person-outline"
        value={formData.apellidoPaterno}
        onChangeText={(text) => updateField("apellidoPaterno", text)}
        error={errors.apellidoPaterno}
        autoCapitalize="words"
      />
      <Input
        label="Apellido Materno"
        placeholder="Ej: Rojas"
        icon="person-outline"
        value={formData.apellidoMaterno}
        onChangeText={(text) => updateField("apellidoMaterno", text)}
        autoCapitalize="words"
      />
      <Input
        label="Carnet de Identidad"
        placeholder="Ej: 9876543"
        icon="card-outline"
        value={formData.carnetIdentidad}
        onChangeText={(text) => updateField("carnetIdentidad", text)}
        error={errors.carnetIdentidad}
        keyboardType="number-pad"
      />
      <Input
        label="Fecha de Nacimiento"
        placeholder="YYYY-MM-DD"
        icon="calendar-outline"
        value={formData.fechaNacimiento}
        onChangeText={(text) => updateField("fechaNacimiento", text)}
        error={errors.fechaNacimiento}
      />
    </>
  )
}
function StepContactInfo({
  formData,
  errors,
  updateField,
  showCityPicker,
  setShowCityPicker,
  onCitySelect,
  CITIES,
}: {
  formData: SignupFormData
  errors: Record<string, string>
  updateField: (field: keyof SignupFormData, value: string) => void
  showCityPicker: boolean
  setShowCityPicker: (show: boolean) => void
  onCitySelect: (city: string) => void
  CITIES: string[]
}) {
  return (
    <>
      <Text style={styles.fieldLabel}>Ciudad</Text>
      <TouchableOpacity
        style={[styles.cityPicker, errors.ciudad && styles.cityPickerError]}
        onPress={() => setShowCityPicker(!showCityPicker)}
      >
        <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />
        <Text style={[styles.cityText, !formData.ciudad && styles.placeholder]}>
          {formData.ciudad || "Selecciona tu ciudad"}
        </Text>
        <Ionicons name={showCityPicker ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
      {errors.ciudad && <Text style={styles.errorText}>{errors.ciudad}</Text>}

      {showCityPicker && (
        <View style={styles.cityList}>
          {CITIES.map((city) => (
            <TouchableOpacity
              key={city}
              style={[styles.cityItem, formData.ciudad === city && styles.cityItemSelected]}
              onPress={() => onCitySelect(city)}
            >
              <Text style={[styles.cityItemText, formData.ciudad === city && styles.cityItemTextSelected]}>{city}</Text>
              {formData.ciudad === city && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Input
        label="Complemento / Zona"
        placeholder="Ej: Z/Central (opcional)"
        icon="home-outline"
        value={formData.complemento}
        onChangeText={(text) => updateField("complemento", text)}
      />
      <Input
        label="Número de Celular"
        placeholder="Ej: 77754321"
        icon="call-outline"
        value={formData.celular}
        onChangeText={(text) => updateField("celular", text)}
        error={errors.celular}
        keyboardType="phone-pad"
      />
    </>
  )
}

function StepSecurity({
  formData,
  errors,
  updateField,
}: {
  formData: SignupFormData
  errors: Record<string, string>
  updateField: (field: keyof SignupFormData, value: string) => void
}) {
  return (
    <>
      <View style={styles.securityInfo}>
        <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
        <Text style={styles.securityText}>Tu información está protegida con encriptación de extremo a extremo</Text>
      </View>
      <Input
        label="Contraseña"
        placeholder="Mínimo 6 caracteres"
        icon="lock-closed-outline"
        value={formData.password}
        onChangeText={(text) => updateField("password", text)}
        error={errors.password}
        secureTextEntry
      />
      <Input
        label="Confirmar Contraseña"
        placeholder="Repite tu contraseña"
        icon="lock-closed-outline"
        value={formData.confirmPassword}
        onChangeText={(text) => updateField("confirmPassword", text)}
        error={errors.confirmPassword}
        secureTextEntry
      />
      <View style={styles.passwordRequirements}>
        <Text style={styles.requirementTitle}>Tu contraseña debe tener:</Text>
        <View style={styles.requirement}>
          <Ionicons
            name={formData.password.length >= 6 ? "checkmark-circle" : "ellipse-outline"}
            size={16}
            color={formData.password.length >= 6 ? COLORS.success : COLORS.textLight}
          />
          <Text style={styles.requirementText}>Al menos 6 caracteres</Text>
        </View>
        <View style={styles.requirement}>
          <Ionicons
            name={
              formData.password === formData.confirmPassword && formData.password
                ? "checkmark-circle"
                : "ellipse-outline"
            }
            size={16}
            color={
              formData.password === formData.confirmPassword && formData.password ? COLORS.success : COLORS.textLight
            }
          />
          <Text style={styles.requirementText}>Las contraseñas coinciden</Text>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.lg,
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
  fieldLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  cityPicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  cityPickerError: {
    borderColor: COLORS.error,
  },
  cityText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  placeholder: {
    color: COLORS.textLight,
  },
  cityList: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    maxHeight: 200,
  },
  cityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cityItemSelected: {
    backgroundColor: COLORS.primaryLight + "20",
  },
  cityItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  cityItemTextSelected: {
    color: COLORS.primary,
    fontWeight: "500",
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight + "20",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  securityText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primaryDark,
  },
  passwordRequirements: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  requirementTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  requirementText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  buttonRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  backStepButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  fullButton: {
    flex: 1,
  },
})
