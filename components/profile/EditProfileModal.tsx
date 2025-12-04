"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { useAuth } from "@/context/AuthContext"
import { userService } from "@/services/userService"
import type { UpdateUserData } from "@/types/auth"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"

interface EditProfileModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

type EditMode = "menu" | "phone" | "password"

export function EditProfileModal({ visible, onClose, onSuccess }: EditProfileModalProps) {
  const { user, refreshUser } = useAuth()
  const [mode, setMode] = useState<EditMode>("menu")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Phone state
  const [newPhone, setNewPhone] = useState(user?.celular || "")

  // Password state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const resetState = () => {
    setMode("menu")
    setError("")
    setSuccess("")
    setNewPhone(user?.celular || "")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const getCurrentUserData = (): UpdateUserData => ({
    nombres: user?.nombres || "",
    apellidoPaterno: user?.apellidoPaterno || "",
    apellidoMaterno: user?.apellidoMaterno || "",
    carnetIdentidad: user?.carnetIdentidad || "",
    ciudad: user?.ciudad || "",
    complemento: user?.complemento || null,
    fechaNacimiento: user?.fechaNacimiento || "",
    celular: user?.celular || "",
    estado: user?.estado || "activo",
  })

  const handleUpdatePhone = async () => {
    if (!newPhone.trim()) {
      setError("Ingresa un número de celular")
      return
    }

    if (newPhone.length < 8) {
      setError("El celular debe tener al menos 8 dígitos")
      return
    }

    if (!user?.id) return

    setLoading(true)
    setError("")

    const result = await userService.updatePhone(user.id, newPhone, getCurrentUserData())

    if (result.success) {
      setSuccess("Celular actualizado correctamente")
      await refreshUser()
      setTimeout(() => {
        handleClose()
        onSuccess()
      }, 1500)
    } else {
      setError(result.error || "Error al actualizar")
    }

    setLoading(false)
  }

  const handleUpdatePassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Completa todos los campos")
      return
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (!user?.id) return

    setLoading(true)
    setError("")

    const result = await userService.updatePassword(user.id, newPassword, getCurrentUserData())

    if (result.success) {
      setSuccess("Contraseña actualizada correctamente")
      await refreshUser()
      setTimeout(() => {
        handleClose()
        onSuccess()
      }, 1500)
    } else {
      setError(result.error || "Error al actualizar")
    }

    setLoading(false)
  }

  const renderMenu = () => (
    <View style={styles.menuContainer}>
      <Text style={styles.title}>Editar Perfil</Text>
      <Text style={styles.subtitle}>Selecciona qué deseas actualizar</Text>

      <TouchableOpacity style={styles.menuOption} onPress={() => setMode("phone")} activeOpacity={0.7}>
        <View style={styles.menuIconContainer}>
          <Ionicons name="call-outline" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuOptionTitle}>Cambiar celular</Text>
          <Text style={styles.menuOptionSubtitle}>Actual: {user?.celular}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuOption} onPress={() => setMode("password")} activeOpacity={0.7}>
        <View style={styles.menuIconContainer}>
          <Ionicons name="lock-closed-outline" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuOptionTitle}>Cambiar contraseña</Text>
          <Text style={styles.menuOptionSubtitle}>Actualiza tu clave de acceso</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={COLORS.secondary} />
        <Text style={styles.infoText}>
          Los demás datos personales no pueden ser modificados. Contacta a soporte si necesitas hacer cambios.
        </Text>
      </View>
    </View>
  )

  const renderPhoneForm = () => (
    <View style={styles.formContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => setMode("menu")}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </TouchableOpacity>

      <Text style={styles.title}>Cambiar Celular</Text>
      <Text style={styles.subtitle}>Ingresa tu nuevo número de celular</Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputIcon}>
          <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Nuevo celular"
          placeholderTextColor={COLORS.textLight}
          value={newPhone}
          onChangeText={setNewPhone}
          keyboardType="phone-pad"
          maxLength={10}
        />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {success ? (
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.successText}>{success}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleUpdatePhone}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <Ionicons name="checkmark" size={20} color={COLORS.white} />
            <Text style={styles.submitButtonText}>Guardar cambios</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  )

  const renderPasswordForm = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backButton} onPress={() => setMode("menu")}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </TouchableOpacity>

      <Text style={styles.title}>Cambiar Contraseña</Text>
      <Text style={styles.subtitle}>Crea una nueva contraseña segura</Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputIcon}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Nueva contraseña"
          placeholderTextColor={COLORS.textLight}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showNewPassword}
        />
        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowNewPassword(!showNewPassword)}>
          <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputIcon}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          placeholderTextColor={COLORS.textLight}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons
            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordRequirements}>
        <Text style={styles.requirementsTitle}>Requisitos de contraseña:</Text>
        <View style={styles.requirement}>
          <Ionicons
            name={newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"}
            size={16}
            color={newPassword.length >= 6 ? COLORS.success : COLORS.textLight}
          />
          <Text style={[styles.requirementText, newPassword.length >= 6 && styles.requirementMet]}>
            Al menos 6 caracteres
          </Text>
        </View>
        <View style={styles.requirement}>
          <Ionicons
            name={newPassword === confirmPassword && newPassword.length > 0 ? "checkmark-circle" : "ellipse-outline"}
            size={16}
            color={newPassword === confirmPassword && newPassword.length > 0 ? COLORS.success : COLORS.textLight}
          />
          <Text
            style={[
              styles.requirementText,
              newPassword === confirmPassword && newPassword.length > 0 && styles.requirementMet,
            ]}
          >
            Las contraseñas coinciden
          </Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {success ? (
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.successText}>{success}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleUpdatePassword}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <Ionicons name="checkmark" size={20} color={COLORS.white} />
            <Text style={styles.submitButtonText}>Actualizar contraseña</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  )

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>

          {mode === "menu" && renderMenu()}
          {mode === "phone" && renderPhoneForm()}
          {mode === "password" && renderPasswordForm()}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    minHeight: "50%",
    maxHeight: "85%",
  },
  closeButton: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
    padding: SPACING.xs,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  menuContainer: {
    paddingTop: SPACING.md,
  },
  formContainer: {
    paddingTop: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  menuOptionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  menuOptionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: SPACING.md,
    backgroundColor: COLORS.secondary + "10",
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  inputIcon: {
    paddingHorizontal: SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  eyeButton: {
    paddingHorizontal: SPACING.md,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  successText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    marginTop: SPACING.md,
    ...SHADOWS.md,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.white,
  },
  passwordRequirements: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  requirementsTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
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
    color: COLORS.textLight,
  },
  requirementMet: {
    color: COLORS.success,
  },
})
