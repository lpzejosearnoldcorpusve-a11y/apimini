"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface FavoriteRoute {
  id: string
  type: "minibus" | "teleferico"
  name: string
  line: string
  lineColor?: string
  origin: string
  destination: string
  frequency: string
  lastUsed: string
}

interface FavoriteRoutesModalProps {
  visible: boolean
  onClose: () => void
}

const MOCK_FAVORITES: FavoriteRoute[] = [
  {
    id: "1",
    type: "teleferico",
    name: "Casa - Trabajo",
    line: "Linea Roja",
    lineColor: "#E53935",
    origin: "Estacion Central",
    destination: "16 de Julio",
    frequency: "12 viajes/mes",
    lastUsed: "Hoy",
  },
  {
    id: "2",
    type: "minibus",
    name: "Universidad",
    line: "Linea 211",
    origin: "Plaza San Francisco",
    destination: "Cota Cota",
    frequency: "8 viajes/mes",
    lastUsed: "Ayer",
  },
  {
    id: "3",
    type: "teleferico",
    name: "Gimnasio",
    line: "Linea Verde",
    lineColor: "#4CAF50",
    origin: "Sopocachi",
    destination: "Irpavi",
    frequency: "4 viajes/mes",
    lastUsed: "Hace 3 dias",
  },
]

export function FavoriteRoutesModal({ visible, onClose }: FavoriteRoutesModalProps) {
  const [favorites, setFavorites] = useState<FavoriteRoute[]>(MOCK_FAVORITES)

  const handleDelete = (id: string) => {
    Alert.alert("Eliminar favorito", "Estas seguro de eliminar esta ruta favorita?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          setFavorites((prev) => prev.filter((f) => f.id !== id))
        },
      },
    ])
  }

  const handleStartTrip = (route: FavoriteRoute) => {
    Alert.alert(
      "Iniciar viaje",
      `Quieres iniciar el viaje "${route.name}"?\n\n${route.origin} -> ${route.destination}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Iniciar",
          onPress: () => {
            Alert.alert("En camino", "Buscando la mejor ruta...")
          },
        },
      ],
    )
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Rutas Favoritas</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {favorites.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="heart-outline" size={48} color={COLORS.textLight} />
                </View>
                <Text style={styles.emptyTitle}>Sin rutas favoritas</Text>
                <Text style={styles.emptyText}>Agrega rutas favoritas desde el mapa para acceder rapidamente</Text>
              </View>
            ) : (
              favorites.map((route) => (
                <View key={route.id} style={styles.routeCard}>
                  <View style={styles.routeHeader}>
                    <View
                      style={[
                        styles.routeIcon,
                        route.type === "teleferico" && { backgroundColor: route.lineColor + "20" },
                      ]}
                    >
                      <Ionicons
                        name={route.type === "teleferico" ? "swap-vertical" : "bus"}
                        size={24}
                        color={route.type === "teleferico" ? route.lineColor : COLORS.primary}
                      />
                    </View>
                    <View style={styles.routeInfo}>
                      <Text style={styles.routeName}>{route.name}</Text>
                      <Text style={styles.routeLine}>{route.line}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(route.id)} style={styles.deleteBtn}>
                      <Ionicons name="heart" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.routePath}>
                    <View style={styles.pathPoint}>
                      <View style={styles.pathDot} />
                      <Text style={styles.pathText}>{route.origin}</Text>
                    </View>
                    <View style={styles.pathLine}>
                      <Ionicons name="arrow-down" size={16} color={COLORS.textLight} />
                    </View>
                    <View style={styles.pathPoint}>
                      <View style={[styles.pathDot, styles.pathDotEnd]} />
                      <Text style={styles.pathText}>{route.destination}</Text>
                    </View>
                  </View>

                  <View style={styles.routeFooter}>
                    <View style={styles.routeStats}>
                      <View style={styles.statItem}>
                        <Ionicons name="repeat-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.statText}>{route.frequency}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.statText}>{route.lastUsed}</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.startBtn} onPress={() => handleStartTrip(route)}>
                      <Ionicons name="navigate" size={18} color={COLORS.white} />
                      <Text style={styles.startBtnText}>Ir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {/* Tip */}
            <View style={styles.tipCard}>
              <Ionicons name="bulb-outline" size={24} color={COLORS.warning} />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Consejo</Text>
                <Text style={styles.tipText}>Manten presionada una ruta en el mapa para agregarla a favoritos</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: "90%",
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.text,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  content: {
    padding: SPACING.lg,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    maxWidth: 250,
  },
  routeCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  routeIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  routeInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  routeName: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  routeLine: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  deleteBtn: {
    padding: SPACING.xs,
  },
  routePath: {
    marginTop: SPACING.md,
    marginLeft: SPACING.xl,
    paddingLeft: SPACING.md,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.border,
  },
  pathPoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  pathDot: {
    width: 10,
    height: 10,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    marginLeft: -6,
  },
  pathDotEnd: {
    backgroundColor: COLORS.secondary,
  },
  pathLine: {
    marginLeft: -3,
    paddingVertical: SPACING.xs,
  },
  pathText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  routeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  routeStats: {
    gap: SPACING.xs,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  startBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.white,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    backgroundColor: COLORS.warning + "15",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  tipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
})
