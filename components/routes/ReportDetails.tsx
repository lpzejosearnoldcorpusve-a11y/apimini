"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/theme"
import type { Reporte } from "@/types/reporte"
import { Ionicons } from "@expo/vector-icons"
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { EvidenceViewer } from "./EvidenceViewer"

interface ReportDetailsProps {
  reporte: Reporte
  onClose: () => void
}

export function ReportDetails({ reporte, onClose }: ReportDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pendiente": return COLORS.warning
      case "en_revision": return COLORS.primary
      case "verificado": return COLORS.success
      case "rechazado": return COLORS.error
      case "resuelto": return COLORS.success
      default: return COLORS.textLight
    }
  }

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "baja": return COLORS.textLight
      case "media": return COLORS.warning
      case "alta": return COLORS.error
      case "urgente": return COLORS.error
      default: return COLORS.textLight
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Detalles del Reporte</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información General</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>ID:</Text>
            <Text style={styles.value}>{reporte.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Estado:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(reporte.estado) }]}>
              <Text style={styles.statusText}>{reporte.estado.replace("_", " ").toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Prioridad:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getPrioridadColor(reporte.prioridad) }]}>
              <Text style={styles.statusText}>{reporte.prioridad.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Tipo:</Text>
            <Text style={styles.value}>{reporte.tipoReporte.replace("_", " ").toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehículo</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Placa:</Text>
            <Text style={styles.value}>{reporte.placa}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Línea:</Text>
            <Text style={styles.value}>{reporte.linea}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fechas</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Suceso:</Text>
            <Text style={styles.value}>{formatDate(reporte.horaSuceso)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Reporte:</Text>
            <Text style={styles.value}>{formatDate(reporte.horaReporte)}</Text>
          </View>

          {reporte.fechaRevision && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Revisión:</Text>
              <Text style={styles.value}>{formatDate(reporte.fechaRevision)}</Text>
            </View>
          )}
        </View>

        {reporte.latitud && reporte.longitud && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación</Text>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Coordenadas:</Text>
              <Text style={styles.value}>
                {reporte.latitud.toFixed(6)}, {reporte.longitud.toFixed(6)}
              </Text>
            </View>

            {reporte.direccion && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Dirección:</Text>
                <Text style={styles.value}>{reporte.direccion}</Text>
              </View>
            )}
          </View>
        )}

        {reporte.mensaje && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{reporte.mensaje}</Text>
          </View>
        )}

        {(reporte.evidenciaImagenes.length > 0 ||
          reporte.evidenciaVideos.length > 0 ||
          reporte.evidenciaAudios.length > 0) && (
          <View style={styles.section}>
            <EvidenceViewer
              images={reporte.evidenciaImagenes}
              videos={reporte.evidenciaVideos}
              audios={reporte.evidenciaAudios}
            />
          </View>
        )}

        {reporte.notasRevision && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas de Revisión</Text>
            <Text style={styles.description}>{reporte.notasRevision}</Text>
            {reporte.revisadoPor && (
              <Text style={styles.reviewer}>Revisado por: {reporte.revisadoPor}</Text>
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
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
  section: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  value: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: "600",
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  reviewer: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
    fontStyle: "italic",
  },
  bottomSpacer: { height: SPACING.xl },
})