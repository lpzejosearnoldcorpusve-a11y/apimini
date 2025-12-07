"use client"

import { Ionicons } from "@expo/vector-icons"
import React, { Dispatch, SetStateAction, useState } from "react"
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"
import DateTimePickerModal from "react-native-modal-datetime-picker"

// Componentes UI (asumiendo que ya los tienes configurados)
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { StepIndicator } from "@/components/ui/StepIndicator"

// TU TEMA PERSONALIZADO
import {
  BORDER_RADIUS,
  COLORS,
  FONT_SIZES,
  SHADOWS,
  SPACING
} from "@/constants/theme"

// --- TIPOS DE DATOS ---
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

// --- COMPONENTE PRINCIPAL ---
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
      {/* Logo */}
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      
      {/* Indicador de Pasos */}
      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} labels={labels} />

      {/* Banner de Error Global */}
      {apiError ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color={COLORS.error} />
          <Text style={styles.errorBannerText}>{apiError}</Text>
        </View>
      ) : null}

      {/* CONTENIDO DE LOS PASOS */}
      <View style={styles.stepContent}>
        {currentStep === 0 && (
          <StepPersonalData 
            formData={formData} 
            errors={errors} 
            updateField={updateField} 
          />
        )}

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

        {currentStep === 2 && (
          <StepSecurity 
            formData={formData} 
            errors={errors} 
            updateField={updateField} 
          />
        )}
      </View>

      {/* BOTONES DE NAVEGACIÓN */}
      <View style={styles.buttonRow}>
        {currentStep > 0 && (
          <Button 
            title="Atrás" 
            onPress={handleBack} 
            variant="outline" 
            style={styles.backStepButton} 
          />
        )}
        <Button
          title={currentStep === 2 ? "Crear Cuenta" : "Siguiente"}
          onPress={currentStep === 2 ? handleSubmit : handleNext}
          loading={isLoading}
          style={StyleSheet.flatten([
            currentStep > 0 ? styles.nextButton : styles.fullButton,
            // Aplicamos sombra primaria al botón de acción principal
            styles.primaryButtonShadow
          ])}
        />
      </View>
    </View>
  )
}

// --- SUB-COMPONENTES (PASOS) ---

function StepPersonalData({
  formData,
  errors,
  updateField,
}: {
  formData: SignupFormData
  errors: Record<string, string>
  updateField: (field: keyof SignupFormData, value: string) => void
}) {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Formateador para mostrar la fecha bonita (Ej: 15 de oct., 1995)
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    // Ajustamos la zona horaria añadiendo los minutos de diferencia si es necesario, 
    // o simplemente tratamos la fecha como UTC para visualización.
    // Hack rápido para visualización correcta del día:
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const offsetDate = new Date(date.getTime() + userTimezoneOffset);
    
    return offsetDate.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleConfirm = (date: Date) => {
    // Guardamos en formato ISO estándar YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    updateField("fechaNacimiento", formattedDate);
    setDatePickerVisibility(false);
  };

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
      <View style={styles.rowInputs}>
        <View style={{ flex: 1 }}>
          <Input
            label="Ap. Paterno"
            placeholder="Ej: Gutiérrez"
            icon="person-outline"
            value={formData.apellidoPaterno}
            onChangeText={(text) => updateField("apellidoPaterno", text)}
            error={errors.apellidoPaterno}
            autoCapitalize="words"
          />
        </View>
        <View style={{ width: SPACING.md }} />
        <View style={{ flex: 1 }}>
          <Input
            label="Ap. Materno"
            placeholder="Ej: Rojas"
            value={formData.apellidoMaterno}
            onChangeText={(text) => updateField("apellidoMaterno", text)}
            autoCapitalize="words"
          />
        </View>
      </View>

      <Input
        label="Carnet de Identidad"
        placeholder="Ej: 9876543"
        icon="card-outline"
        value={formData.carnetIdentidad}
        onChangeText={(text) => updateField("carnetIdentidad", text)}
        error={errors.carnetIdentidad}
        keyboardType="number-pad"
      />

      {/* --- SELECTOR DE FECHA PROFESIONAL (CALENDARIO) --- */}
      <View style={styles.inputContainer}>
        <Text style={styles.fieldLabel}>Fecha de Nacimiento</Text>
        <TouchableOpacity
          onPress={() => setDatePickerVisibility(true)}
          style={[
            styles.datePickerButton,
            errors.fechaNacimiento && styles.inputErrorBorder
          ]}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="calendar-outline" 
            size={20} 
            color={formData.fechaNacimiento ? COLORS.primary : COLORS.textSecondary} 
          />
          <Text style={[
            styles.dateText, 
            !formData.fechaNacimiento && styles.placeholderText
          ]}>
            {formData.fechaNacimiento 
              ? formatDateDisplay(formData.fechaNacimiento) 
              : "Seleccionar fecha"}
          </Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.textLight} />
        </TouchableOpacity>
        {errors.fechaNacimiento && (
          <Text style={styles.errorText}>{errors.fechaNacimiento}</Text>
        )}
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisibility(false)}
        maximumDate={new Date()} // No fechas futuras
        minimumDate={new Date(1940, 0, 1)}
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
        // headerTextIOS is not supported, so it has been removed
        // Estilo oscuro en iOS si el sistema lo usa, o forzar light
        isDarkModeEnabled={false} 
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
      <View style={{ zIndex: 100 }}>
        <Text style={styles.fieldLabel}>Ciudad de Residencia</Text>
        <TouchableOpacity
          style={[styles.cityPicker, errors.ciudad && styles.inputErrorBorder]}
          onPress={() => setShowCityPicker(!showCityPicker)}
          activeOpacity={0.8}
        >
          <Ionicons name="location-outline" size={20} color={formData.ciudad ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[styles.cityText, !formData.ciudad && styles.placeholderText]}>
            {formData.ciudad || "Selecciona tu ciudad"}
          </Text>
          <Ionicons 
            name={showCityPicker ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={COLORS.textSecondary} 
          />
        </TouchableOpacity>
        
        {errors.ciudad && <Text style={styles.errorText}>{errors.ciudad}</Text>}

        {showCityPicker && (
          <View style={styles.cityListContainer}>
            {CITIES.map((city, index) => (
              <TouchableOpacity
                key={city}
                style={[
                  styles.cityItem,
                  formData.ciudad === city && styles.cityItemSelected,
                  index === CITIES.length - 1 && { borderBottomWidth: 0 }
                ]}
                onPress={() => onCitySelect(city)}
              >
                <Text style={[
                  styles.cityItemText, 
                  formData.ciudad === city && styles.cityItemTextSelected
                ]}>
                  {city}
                </Text>
                {formData.ciudad === city && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <Input
        label="Zona / Dirección"
        placeholder="Ej: Sopocachi, Calle 5"
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
  const hasMinLength = formData.password.length >= 6;
  const passwordsMatch = formData.password === formData.confirmPassword && formData.password.length > 0;

  return (
    <>
      <View style={styles.securityInfo}>
        <Ionicons name="shield-checkmark" size={24} color={COLORS.primaryDark} />
        <Text style={styles.securityText}>
          Tus datos están encriptados y seguros.
        </Text>
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
        <Text style={styles.requirementTitle}>Requisitos de seguridad:</Text>
        
        <View style={styles.requirementItem}>
          <Ionicons
            name={hasMinLength ? "checkmark-circle" : "radio-button-off"}
            size={18}
            color={hasMinLength ? COLORS.success : COLORS.textLight}
          />
          <Text style={[
            styles.requirementText, 
            hasMinLength && { color: COLORS.text, fontWeight: '500' }
          ]}>
            Mínimo 6 caracteres
          </Text>
        </View>

        <View style={styles.requirementItem}>
          <Ionicons
            name={passwordsMatch ? "checkmark-circle" : "radio-button-off"}
            size={18}
            color={passwordsMatch ? COLORS.success : COLORS.textLight}
          />
          <Text style={[
            styles.requirementText,
            passwordsMatch && { color: COLORS.text, fontWeight: '500' }
          ]}>
            Las contraseñas coinciden
          </Text>
        </View>
      </View>
    </>
  )
}

// --- ESTILOS CON TU THEME.TS ---
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    // Usamos tu sombra 'xl' para darle efecto flotante profesional
    ...SHADOWS.xl, 
    marginHorizontal: SPACING.sm,
  },
  logo: {
    width: 70,
    height: 70,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
    resizeMode: 'contain',
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2", // Rojo muy suave
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    gap: SPACING.sm,
  },
  errorBannerText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    flex: 1,
    fontWeight: "500",
  },
  stepContent: {
    gap: SPACING.md, // Espacio vertical entre inputs
    marginBottom: SPACING.xl,
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fieldLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  inputContainer: {
    marginBottom: SPACING.sm,
  },
  // --- ESTILOS DATE PICKER (SIMULANDO INPUT) ---
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background, // F5F9FA
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 52, // Altura estándar para inputs táctiles
  },
  dateText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  placeholderText: {
    color: COLORS.textLight,
  },
  inputErrorBorder: {
    borderColor: COLORS.error,
    backgroundColor: "#FFF5F5",
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  
  // --- ESTILOS CITY PICKER ---
  cityPicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 52,
    gap: SPACING.sm,
  },
  cityText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  cityListContainer: {
    position: 'absolute',
    top: 80, // Justo debajo del input
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    zIndex: 999,
    // Usamos tu sombra 'modal' o 'lg' para que destaque sobre lo demás
    ...SHADOWS.lg, 
    maxHeight: 250,
  },
  cityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  cityItemSelected: {
    backgroundColor: COLORS.primaryLight + "15", // Opacidad baja del primario
  },
  cityItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  cityItemTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: "600",
  },

  // --- ESTILOS SEGURIDAD ---
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight + "20",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primaryLight + "40",
  },
  securityText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primaryDark,
    fontWeight: "500",
  },
  passwordRequirements: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs,
  },
  requirementTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  requirementText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },

  // --- BOTONES ---
  buttonRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.sm,
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
  primaryButtonShadow: {
    // Aplicamos tu sombra personalizada de color Primary
    ...SHADOWS.primary,
  }
})