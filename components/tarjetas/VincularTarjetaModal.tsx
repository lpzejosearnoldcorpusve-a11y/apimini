"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { tarjetaService } from "@/services/tarjetaService"
import type { Tarjeta } from "@/types/tarjeta"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { TarjetaCard } from "./TarjetaCard"
import { TarjetaValidacionPanel } from "./TarjetaValidacionPanel"

interface VincularTarjetaModalProps {
  visible: boolean
  onClose: () => void
  usuarioAppId: string
  onSuccess: () => void
}

type Step = "search" | "validate" | "confirm"

export function VincularTarjetaModal({ visible, onClose, usuarioAppId, onSuccess }: VincularTarjetaModalProps) {
  const [step, setStep] = useState<Step>("search")
  const [search, setSearch] = useState("")
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([])
  const [selectedTarjeta, setSelectedTarjeta] = useState<Tarjeta | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar tarjetas cuando cambia el search
  useEffect(() => {
    if (search.length >= 3) {
      searchTarjetas()
    } else {
      setTarjetas([])
    }
  }, [search])

  const searchTarjetas = async () => {
    setIsSearching(true)
    setError(null)
    const result = await tarjetaService.searchByCelular(search)
    setIsSearching(false)

    if (result.success && result.data) {
      setTarjetas(result.data)
    } else {
      setError(result.error || "Error al buscar")
    }
  }

  const handleSelectTarjeta = (tarjeta: Tarjeta) => {
    setSelectedTarjeta(tarjeta)
    setStep("validate")
  }

  const handleVincular = async () => {
    if (!selectedTarjeta) return

    setIsLoading(true)
    setError(null)

    const result = await tarjetaService.vincularTarjeta({
      usuarioAppId,
      tarjetaId: selectedTarjeta.id,
    })

    setIsLoading(false)

    if (result.success) {
      setStep("confirm")
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 2000)
    } else {
      setError(result.message)
    }
  }

  const handleClose = () => {
    setStep("search")
    setSearch("")
    setTarjetas([])
    setSelectedTarjeta(null)
    setError(null)
    onClose()
  }

  const handleBack = () => {
    if (step === "validate") {
      setStep("search")
      setSelectedTarjeta(null)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            {step === "validate" && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
              </TouchableOpacity>
            )}
            <View style={styles.headerTitles}>
              <Text style={styles.title}>
                {step === "search" && "Vincular Tarjeta"}
                {step === "validate" && "Validar Tarjeta"}
                {step === "confirm" && "Vinculacion Exitosa"}
              </Text>
              <Text style={styles.subtitle}>
                {step === "search" && "Busca tu tarjeta por numero de celular"}
                {step === "validate" && "Verifica que los datos sean correctos"}
                {step === "confirm" && "Tu tarjeta ha sido vinculada"}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <StepDot active={step === "search"} completed={step !== "search"} label="1" />
            <View style={[styles.stepLine, step !== "search" && styles.stepLineActive]} />
            <StepDot active={step === "validate"} completed={step === "confirm"} label="2" />
            <View style={[styles.stepLine, step === "confirm" && styles.stepLineActive]} />
            <StepDot active={step === "confirm"} completed={false} label="3" />
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {step === "search" && (
              <View style={styles.searchContainer}>
                {/* Search Input */}
                <View style={styles.searchInputContainer}>
                  <Ionicons name="search" size={20} color={COLORS.textSecondary} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Ingresa numero de celular..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={search}
                    onChangeText={setSearch}
                    keyboardType="phone-pad"
                  />
                  {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch("")}>
                      <Ionicons name="close-circle" size={20} color={COLORS.gray100} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Info */}
                {search.length < 3 && (
                  <View style={styles.hintCard}>
                    <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                    <Text style={styles.hintText}>Ingresa al menos 3 digitos del celular registrado en tu tarjeta</Text>
                  </View>
                )}

                {/* Loading */}
                {isSearching && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Buscando tarjetas...</Text>
                  </View>
                )}

                {/* Error */}
                {error && (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {/* Results */}
                {tarjetas.length > 0 && (
                  <View style={styles.resultsContainer}>
                    <Text style={styles.resultsTitle}>
                      {tarjetas.length} tarjeta{tarjetas.length > 1 ? "s" : ""} encontrada
                      {tarjetas.length > 1 ? "s" : ""}
                    </Text>
                    {tarjetas.map((tarjeta) => (
                      <TarjetaCard key={tarjeta.id} tarjeta={tarjeta} onPress={() => handleSelectTarjeta(tarjeta)} />
                    ))}
                  </View>
                )}

                {/* No results */}
                {search.length >= 3 && !isSearching && tarjetas.length === 0 && !error && (
                  <View style={styles.noResults}>
                    <Ionicons name="search" size={48} color={COLORS.gray100} />
                    <Text style={styles.noResultsTitle}>Sin resultados</Text>
                    <Text style={styles.noResultsText}>No encontramos tarjetas disponibles con ese numero</Text>
                  </View>
                )}
              </View>
            )}

            {step === "validate" && selectedTarjeta && (
              <View style={styles.validateContainer}>
                <TarjetaValidacionPanel tarjeta={selectedTarjeta} />

                {error && (
                  <View style={[styles.errorBanner, { marginTop: SPACING.lg }]}>
                    <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.vincularButton, isLoading && styles.buttonDisabled]}
                  onPress={handleVincular}
                  disabled={isLoading || selectedTarjeta.estado !== "activa"}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <>
                      <Ionicons name="link" size={20} color={COLORS.white} />
                      <Text style={styles.vincularButtonText}>Vincular Tarjeta</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {step === "confirm" && (
              <View style={styles.confirmContainer}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
                </View>
                <Text style={styles.successTitle}>Vinculacion Exitosa</Text>
                <Text style={styles.successText}>Tu tarjeta ha sido vinculada correctamente a tu cuenta Turuta</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

function StepDot({ active, completed, label }: { active: boolean; completed: boolean; label: string }) {
  return (
    <View style={[styles.stepDot, active && styles.stepDotActive, completed && styles.stepDotCompleted]}>
      {completed ? (
        <Ionicons name="checkmark" size={14} color={COLORS.white} />
      ) : (
        <Text style={[styles.stepLabel, (active || completed) && styles.stepLabelActive]}>{label}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: "90%",
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: SPACING.sm,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.success,
  },
  stepLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  stepLabelActive: {
    color: COLORS.white,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xs,
  },
  stepLineActive: {
    backgroundColor: COLORS.success,
  },
  content: {
    padding: SPACING.lg,
  },
  // Search
  searchContainer: {
    paddingBottom: SPACING.xl,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  hintCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "10",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  hintText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primaryDark,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error + "15",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  errorText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  resultsContainer: {
    marginTop: SPACING.lg,
  },
  resultsTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  noResults: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  noResultsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  noResultsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  // Validate
  validateContainer: {
    paddingBottom: SPACING.xl,
  },
  vincularButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.xl,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  vincularButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.white,
  },
  // Confirm
  confirmContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  successIcon: {
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  successText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
})
