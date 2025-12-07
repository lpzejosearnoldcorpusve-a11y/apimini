"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/theme"
import { useAuth } from "@/context/AuthContext"
import { reporteService } from "@/services/reporteService"
import type { PrioridadReporte, TipoReporte } from "@/types/reporte"
import { Ionicons } from "@expo/vector-icons"
import * as Location from "expo-location"
import { useState } from "react"
import {
    ActivityIndicator,
    Alert,
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
import { EvidenceInput } from "./EvidenceInput"

interface ReporteModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

const TIPOS_REPORTE = [
  { value: "trameaje" as TipoReporte, label: "Trameaje", icon: "navigate-circle-outline" },
  { value: "exceso_velocidad" as TipoReporte, label: "Exceso de velocidad", icon: "speedometer-outline" },
  { value: "parada_no_autorizada" as TipoReporte, label: "Parada no autorizada", icon: "hand-left-outline" },
  { value: "otro" as TipoReporte, label: "Otro", icon: "alert-circle-outline" },
]

const PRIORIDADES = [
  { value: "baja" as PrioridadReporte, label: "Baja", color: COLORS.textLight },
  { value: "media" as PrioridadReporte, label: "Media", color: COLORS.warning },
  { value: "alta" as PrioridadReporte, label: "Alta", color: COLORS.error },
]

export function ReporteModal({ visible, onClose, onSuccess }: ReporteModalProps) {
  const { user } = useAuth()
  const [placa, setPlaca] = useState("")
  const [linea, setLinea] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>("trameaje")
  const [prioridad, setPrioridad] = useState<PrioridadReporte>("media")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [latitud, setLatitud] = useState<number | null>(null)
  const [longitud, setLongitud] = useState<number | null>(null)
  const [direccion, setDireccion] = useState("")
  const [evidenciaImagenes, setEvidenciaImagenes] = useState<string[]>([])
  const [evidenciaVideos, setEvidenciaVideos] = useState<string[]>([])
  const [evidenciaAudios, setEvidenciaAudios] = useState<string[]>([])
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const getCurrentLocation = async () => {
    setIsGettingLocation(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Se necesita permiso de ubicación para obtener la posición actual.")
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setLatitud(location.coords.latitude)
      setLongitud(location.coords.longitude)

      // Reverse geocode to get address
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })
      if (address.length > 0) {
        const addr = address[0]
        setDireccion(`${addr.street || ""} ${addr.streetNumber || ""}, ${addr.city || ""}`.trim())
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo obtener la ubicación actual.")
    } finally {
      setIsGettingLocation(false)
    }
  }

  const handleSubmit = async () => {
    if (!placa.trim() || !linea.trim()) {
      Alert.alert("Error", "Por favor completa los campos requeridos (Placa y Línea)")
      return
    }

    setIsSubmitting(true)
    try {
      const reporteData = {
        placa: placa.trim(),
        linea: linea.trim(),
        horaSuceso: new Date().toISOString(),
        usuarioAppId: user?.id,
        latitud: latitud || undefined,
        longitud: longitud || undefined,
        direccion: direccion.trim() || undefined,
        evidenciaImagenes: evidenciaImagenes.length > 0 ? evidenciaImagenes : undefined,
        evidenciaVideos: evidenciaVideos.length > 0 ? evidenciaVideos : undefined,
        evidenciaAudios: evidenciaAudios.length > 0 ? evidenciaAudios : undefined,
        mensaje: mensaje.trim() || undefined,
        tipoReporte,
        prioridad,
      }
      
      console.log("Enviando reporte:", reporteData)
      const result = await reporteService.createReporte(reporteData)
      console.log("Reporte creado:", result)

      Alert.alert("Éxito", "Tu reporte ha sido enviado correctamente. Gracias por contribuir a mejorar el servicio.", [
        { text: "OK", onPress: () => handleClose() },
      ])
      onSuccess()
    } catch (error: any) {
      console.error("Error al crear reporte:", error)
      Alert.alert("Error", error.message || "No se pudo enviar el reporte")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setPlaca("")
    setLinea("")
    setMensaje("")
    setTipoReporte("trameaje")
    setPrioridad("media")
    setLatitud(null)
    setLongitud(null)
    setDireccion("")
    setEvidenciaImagenes([])
    setEvidenciaVideos([])
    setEvidenciaAudios([])
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Reportar Incidente</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Tu reporte ayuda a mejorar el servicio de transporte público en La Paz. Toda la información es
              confidencial.
            </Text>
          </View>

          {/* Tipo de Reporte */}
          <Text style={styles.label}>Tipo de reporte *</Text>
          <View style={styles.tiposGrid}>
            {TIPOS_REPORTE.map((tipo) => (
              <TouchableOpacity
                key={tipo.value}
                style={[styles.tipoCard, tipoReporte === tipo.value && styles.tipoCardActive]}
                onPress={() => setTipoReporte(tipo.value)}
              >
                <Ionicons
                  name={tipo.icon as any}
                  size={24}
                  color={tipoReporte === tipo.value ? COLORS.white : COLORS.primary}
                />
                <Text style={[styles.tipoLabel, tipoReporte === tipo.value && styles.tipoLabelActive]}>
                  {tipo.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Placa */}
          <Text style={styles.label}>Placa del vehículo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 1234ABCD"
            value={placa}
            onChangeText={setPlaca}
            autoCapitalize="characters"
          />

          {/* Línea */}
          <Text style={styles.label}>Línea de transporte *</Text>
          <TextInput style={styles.input} placeholder="Ej: Línea 80" value={linea} onChangeText={setLinea} />

          {/* Prioridad */}
          <Text style={styles.label}>Prioridad</Text>
          <View style={styles.prioridadContainer}>
            {PRIORIDADES.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[styles.prioridadChip, prioridad === p.value && { backgroundColor: p.color }]}
                onPress={() => setPrioridad(p.value)}
              >
                <Text style={[styles.prioridadText, prioridad === p.value && styles.prioridadTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Mensaje */}
          <Text style={styles.label}>Descripción del incidente (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe lo que ocurrió..."
            value={mensaje}
            onChangeText={setMensaje}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Ubicación */}
          <Text style={styles.label}>Ubicación (opcional)</Text>
          <TouchableOpacity
            style={[styles.locationButton, isGettingLocation && styles.locationButtonDisabled]}
            onPress={getCurrentLocation}
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name="location" size={20} color={COLORS.primary} />
                <Text style={styles.locationButtonText}>
                  {latitud && longitud ? "Ubicación obtenida" : "Obtener ubicación actual"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {latitud && longitud && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>Lat: {latitud.toFixed(6)}, Lng: {longitud.toFixed(6)}</Text>
              {direccion && <Text style={styles.locationText}>{direccion}</Text>}
            </View>
          )}

          {/* Evidencias */}
          <EvidenceInput
            images={evidenciaImagenes}
            videos={evidenciaVideos}
            audios={evidenciaAudios}
            onImagesChange={setEvidenciaImagenes}
            onVideosChange={setEvidenciaVideos}
            onAudiosChange={setEvidenciaAudios}
          />

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="send" size={20} color={COLORS.white} />
                <Text style={styles.submitButtonText}>Enviar Reporte</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: { padding: SPACING.xs },
  title: { fontSize: FONT_SIZES.lg, fontWeight: "600", color: COLORS.text },
  content: { flex: 1, padding: SPACING.lg },
  infoBox: {
    flexDirection: "row",
    backgroundColor: COLORS.primary + "15",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  infoText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  tiposGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, marginBottom: SPACING.md },
  tipoCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  tipoCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tipoLabel: { fontSize: FONT_SIZES.xs, color: COLORS.text, marginTop: SPACING.xs, textAlign: "center" },
  tipoLabelActive: { color: COLORS.white, fontWeight: "600" },
  input: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    fontSize: FONT_SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: { minHeight: 100 },
  prioridadContainer: { flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.md },
  prioridadChip: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  prioridadText: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: "500" },
  prioridadTextActive: { color: COLORS.white, fontWeight: "600" },
  submitButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { fontSize: FONT_SIZES.md, fontWeight: "600", color: COLORS.white },
  bottomSpacer: { height: SPACING.xl },
  locationButton: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  locationButtonDisabled: { opacity: 0.6 },
  locationButtonText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: "500" },
  locationInfo: {
    backgroundColor: COLORS.primary + "15",
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs,
  },
  locationText: { fontSize: FONT_SIZES.xs, color: COLORS.text, lineHeight: 16 },
})
