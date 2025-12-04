"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import type { Tarjeta } from "@/types/tarjeta"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef } from "react"
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { TarjetaValidacionPanel } from "./TarjetaValidacionPanel"

interface NFCScannerModalProps {
  visible: boolean
  onClose: () => void
  isScanning: boolean
  isSupported: boolean
  scannedCard: Tarjeta | null
  error: string | null
  onStartScan: () => void
  onClearCard: () => void
}

export function NFCScannerModal({
  visible,
  onClose,
  isScanning,
  isSupported,
  scannedCard,
  error,
  onStartScan,
  onClearCard,
}: NFCScannerModalProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isScanning) {
      // Animacion de pulso
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start()

      // Animacion de rotacion
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ).start()
    } else {
      pulseAnim.setValue(1)
      rotateAnim.setValue(0)
    }
  }, [isScanning])

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="wifi" size={24} color={COLORS.primary} />
              <Text style={styles.title}>Lector NFC</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {!isSupported ? (
              // NFC no soportado
              <View style={styles.notSupported}>
                <View style={styles.errorIcon}>
                  <Ionicons name="phone-portrait-outline" size={48} color={COLORS.error} />
                  <View style={styles.errorBadge}>
                    <Ionicons name="close" size={16} color={COLORS.white} />
                  </View>
                </View>
                <Text style={styles.notSupportedTitle}>NFC no disponible</Text>
                <Text style={styles.notSupportedText}>
                  Tu dispositivo no soporta NFC o esta desactivado. Activa NFC en los ajustes de tu telefono.
                </Text>
              </View>
            ) : scannedCard ? (
              // Tarjeta escaneada
              <View style={styles.scannedContainer}>
                <View style={styles.successBadge}>
                  <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
                </View>
                <Text style={styles.scannedTitle}>Tarjeta detectada</Text>
                <TarjetaValidacionPanel tarjeta={scannedCard} />
                <TouchableOpacity
                  style={styles.scanAgainButton}
                  onPress={() => {
                    onClearCard()
                    onStartScan()
                  }}
                >
                  <Ionicons name="refresh" size={20} color={COLORS.primary} />
                  <Text style={styles.scanAgainText}>Escanear otra tarjeta</Text>
                </TouchableOpacity>
              </View>
            ) : isScanning ? (
              // Escaneando
              <View style={styles.scanningContainer}>
                <Animated.View style={[styles.scannerRing, { transform: [{ scale: pulseAnim }] }]}>
                  <Animated.View style={[styles.scannerInner, { transform: [{ rotate: spin }] }]}>
                    <Ionicons name="wifi" size={64} color={COLORS.primary} />
                  </Animated.View>
                </Animated.View>
                <Text style={styles.scanningTitle}>Buscando tarjeta...</Text>
                <Text style={styles.scanningText}>Acerca tu tarjeta RFID a la parte trasera del telefono</Text>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Listo para escanear
              <View style={styles.readyContainer}>
                <View style={styles.nfcIcon}>
                  <Ionicons name="wifi" size={64} color={COLORS.primary} />
                </View>
                <Text style={styles.readyTitle}>Listo para escanear</Text>
                <Text style={styles.readyText}>
                  Presiona el boton para iniciar el escaneo NFC y acerca tu tarjeta RFID
                </Text>

                {error && (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <TouchableOpacity style={styles.startButton} onPress={onStartScan}>
                  <Ionicons name="scan" size={24} color={COLORS.white} />
                  <Text style={styles.startButtonText}>Iniciar escaneo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Tips */}
          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>Consejos:</Text>
            <Text style={styles.tipText}>• Mantén la tarjeta quieta durante el escaneo</Text>
            <Text style={styles.tipText}>• El NFC generalmente está cerca de la cámara</Text>
            <Text style={styles.tipText}>• Retira fundas gruesas del teléfono</Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  modal: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    width: "100%",
    maxWidth: 400,
    maxHeight: "90%",
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.text,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    padding: SPACING.lg,
  },
  // Not supported
  notSupported: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  errorIcon: {
    position: "relative",
    marginBottom: SPACING.lg,
  },
  errorBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
  },
  notSupportedTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  notSupportedText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  // Scanning
  scanningContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  scannerRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  scannerInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  scanningTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  scanningText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  cancelButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  cancelText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    fontWeight: "500",
  },
  // Ready
  readyContainer: {
    alignItems: "center",
    paddingVertical: SPACING.lg,
  },
  nfcIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  readyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  readyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.error + "15",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    width: "100%",
  },
  errorText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.sm,
  },
  startButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.white,
  },
  // Scanned
  scannedContainer: {
    alignItems: "center",
  },
  successBadge: {
    marginBottom: SPACING.md,
  },
  scannedTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.success,
    marginBottom: SPACING.lg,
  },
  scanAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
  },
  scanAgainText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: "500",
  },
  // Tips
  tips: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  tipsTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  tipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
})
