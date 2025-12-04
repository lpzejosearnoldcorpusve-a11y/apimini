"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface Trip {
  id: string
  type: "minibus" | "teleferico"
  line: string
  lineColor?: string
  origin: string
  destination: string
  date: string
  time: string
  duration: string
  cost: number
  status: "completed" | "cancelled"
}

interface TripHistoryModalProps {
  visible: boolean
  onClose: () => void
}

const MOCK_TRIPS: Trip[] = [
  {
    id: "1",
    type: "teleferico",
    line: "Linea Roja",
    lineColor: "#E53935",
    origin: "Estacion Central",
    destination: "16 de Julio",
    date: "03 Dic 2025",
    time: "08:30",
    duration: "15 min",
    cost: 3.0,
    status: "completed",
  },
  {
    id: "2",
    type: "minibus",
    line: "Linea 211",
    origin: "Plaza San Francisco",
    destination: "Cota Cota",
    date: "02 Dic 2025",
    time: "14:15",
    duration: "35 min",
    cost: 2.0,
    status: "completed",
  },
  {
    id: "3",
    type: "teleferico",
    line: "Linea Amarilla",
    lineColor: "#FFC107",
    origin: "Sopocachi",
    destination: "Libertador",
    date: "01 Dic 2025",
    time: "10:00",
    duration: "12 min",
    cost: 3.0,
    status: "completed",
  },
  {
    id: "4",
    type: "minibus",
    line: "Linea 288",
    origin: "Villa Fatima",
    destination: "Zona Sur",
    date: "30 Nov 2025",
    time: "17:45",
    duration: "45 min",
    cost: 2.5,
    status: "cancelled",
  },
  {
    id: "5",
    type: "teleferico",
    line: "Linea Verde",
    lineColor: "#4CAF50",
    origin: "Irpavi",
    destination: "Obrajes",
    date: "29 Nov 2025",
    time: "09:20",
    duration: "10 min",
    cost: 3.0,
    status: "completed",
  },
]

export function TripHistoryModal({ visible, onClose }: TripHistoryModalProps) {
  const [filter, setFilter] = useState<"all" | "minibus" | "teleferico">("all")

  const filteredTrips = filter === "all" ? MOCK_TRIPS : MOCK_TRIPS.filter((t) => t.type === filter)

  const totalSpent = MOCK_TRIPS.filter((t) => t.status === "completed").reduce((sum, t) => sum + t.cost, 0)

  const totalTrips = MOCK_TRIPS.filter((t) => t.status === "completed").length

  const renderTrip = ({ item }: { item: Trip }) => (
    <View style={[styles.tripCard, item.status === "cancelled" && styles.tripCardCancelled]}>
      <View style={styles.tripHeader}>
        <View style={[styles.tripIcon, item.type === "teleferico" && { backgroundColor: item.lineColor + "20" }]}>
          <Ionicons
            name={item.type === "teleferico" ? "swap-vertical" : "bus"}
            size={20}
            color={item.type === "teleferico" ? item.lineColor : COLORS.primary}
          />
        </View>
        <View style={styles.tripInfo}>
          <Text style={styles.tripLine}>{item.line}</Text>
          <Text style={styles.tripDate}>
            {item.date} - {item.time}
          </Text>
        </View>
        <View style={styles.tripCost}>
          <Text style={styles.tripCostAmount}>Bs. {item.cost.toFixed(2)}</Text>
          <View style={[styles.statusBadge, item.status === "cancelled" && styles.statusCancelled]}>
            <Text style={[styles.statusText, item.status === "cancelled" && styles.statusTextCancelled]}>
              {item.status === "completed" ? "Completado" : "Cancelado"}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.tripRoute}>
        <View style={styles.routePoint}>
          <View style={styles.routeDot} />
          <Text style={styles.routeText}>{item.origin}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <View style={[styles.routeDot, styles.routeDotEnd]} />
          <Text style={styles.routeText}>{item.destination}</Text>
        </View>
      </View>
      <View style={styles.tripFooter}>
        <View style={styles.tripDuration}>
          <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>
    </View>
  )

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Historial de Viajes</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalTrips}</Text>
              <Text style={styles.statLabel}>Viajes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>Bs. {totalSpent.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total gastado</Text>
            </View>
          </View>

          {/* Filtros */}
          <View style={styles.filters}>
            {[
              { key: "all", label: "Todos" },
              { key: "minibus", label: "Minibus" },
              { key: "teleferico", label: "Teleferico" },
            ].map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
                onPress={() => setFilter(f.key as any)}
              >
                <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Lista de viajes */}
          <FlatList
            data={filteredTrips}
            keyExtractor={(item) => item.id}
            renderItem={renderTrip}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color={COLORS.textLight} />
                <Text style={styles.emptyText}>No hay viajes en esta categoria</Text>
              </View>
            }
          />
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
  statsRow: {
    flexDirection: "row",
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.primary + "10",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  filters: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  filterBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  tripCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  tripCardCancelled: {
    opacity: 0.6,
  },
  tripHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  tripIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  tripInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  tripLine: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  tripDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  tripCost: {
    alignItems: "flex-end",
  },
  tripCostAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.text,
  },
  statusBadge: {
    backgroundColor: COLORS.success + "20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: 2,
  },
  statusCancelled: {
    backgroundColor: COLORS.error + "20",
  },
  statusText: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: "500",
  },
  statusTextCancelled: {
    color: COLORS.error,
  },
  tripRoute: {
    marginTop: SPACING.md,
    marginLeft: SPACING.xl,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  routeDotEnd: {
    backgroundColor: COLORS.secondary,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.border,
    marginLeft: 4,
  },
  routeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  tripFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: SPACING.sm,
  },
  tripDuration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  durationText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
})
