"use client"

import { LocationSearchModal } from "@/components/routes/LocationSearchModal"
import { ReporteModal } from "@/components/routes/ReporteModal"
import { SavedLocationsList } from "@/components/routes/SavedLocationsList"
import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { locationService } from "@/services/locationService"
import type { CreateLocationData, SavedLocation } from "@/types/location"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useState } from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const POPULAR_ROUTES = [
  { id: "1", name: "Centro - Zona Sur", duration: "45 min", price: "Bs. 3.50" },
  { id: "2", name: "El Alto - Miraflores", duration: "35 min", price: "Bs. 2.50" },
  { id: "3", name: "Sopocachi - San Miguel", duration: "25 min", price: "Bs. 2.00" },
  { id: "4", name: "Obrajes - Calacoto", duration: "15 min", price: "Bs. 1.50" },
]

export function RoutesScreen() {
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([])
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false)
  const [isReporteModalVisible, setIsReporteModalVisible] = useState(false)
  const [locationTypeToAdd, setLocationTypeToAdd] = useState<"home" | "work" | "other">("home")

  useEffect(() => {
    loadSavedLocations()
  }, [])

  const loadSavedLocations = async () => {
    try {
      const locations = await locationService.getSavedLocations()
      setSavedLocations(locations)
    } catch (error) {
      console.error("Error loading locations:", error)
    }
  }

  const handleAddLocation = (type: "home" | "work" | "other") => {
    setLocationTypeToAdd(type)
    setIsLocationModalVisible(true)
  }

  const handleSaveLocation = async (data: CreateLocationData) => {
    try {
      const newLocation = await locationService.saveLocation(data)
      setSavedLocations([...savedLocations, newLocation])
      setIsLocationModalVisible(false)
    } catch (error) {
      console.error("Error saving location:", error)
    }
  }

  const handleDeleteLocation = async (id: string) => {
    try {
      await locationService.deleteLocation(id)
      setSavedLocations(savedLocations.filter((l) => l.id !== id))
    } catch (error) {
      console.error("Error deleting location:", error)
    }
  }

  const handleSelectLocation = (location: SavedLocation) => {
    console.log("Selected location:", location)
    // Aquí puedes navegar al mapa o iniciar una ruta
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.header}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Hola</Text>
            <Text style={styles.title}>A donde vas hoy?</Text>
          </View>
          <TouchableOpacity style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <Text style={styles.searchPlaceholder}>Buscar destino en OpenStreetMap...</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity style={styles.reporteButton} onPress={() => setIsReporteModalVisible(true)}>
          <Ionicons name="alert-circle" size={24} color={COLORS.white} />
          <Text style={styles.reporteButtonText}>Reportar Incidente</Text>
        </TouchableOpacity>

        <SavedLocationsList
          locations={savedLocations}
          onSelect={handleSelectLocation}
          onDelete={handleDeleteLocation}
          onAddNew={handleAddLocation}
        />

        <PopularRoutes routes={POPULAR_ROUTES} />
      </ScrollView>

      <LocationSearchModal
        visible={isLocationModalVisible}
        onClose={() => setIsLocationModalVisible(false)}
        onSelect={handleSaveLocation}
        locationType={locationTypeToAdd}
      />

      <ReporteModal
        visible={isReporteModalVisible}
        onClose={() => setIsReporteModalVisible(false)}
        onSuccess={() => console.log("Reporte enviado")}
      />
    </View>
  )
}

function PopularRoutes({ routes }: { routes: typeof POPULAR_ROUTES }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Rutas Populares</Text>
      {routes.map((route) => (
        <TouchableOpacity key={route.id} style={styles.routeCard}>
          <View style={styles.routeIcon}>
            <Ionicons name="navigate" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.routeInfo}>
            <Text style={styles.routeName}>{route.name}</Text>
            <View style={styles.routeMeta}>
              <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.routeMetaText}>{route.duration}</Text>
              <View style={styles.dot} />
              <Ionicons name="cash-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.routeMetaText}>{route.price}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingBottom: SPACING.xl },
  headerContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  greeting: { fontSize: FONT_SIZES.md, color: "rgba(255,255,255,0.8)" },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: "700", color: COLORS.white, marginTop: SPACING.xs },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  searchPlaceholder: { color: COLORS.textSecondary, fontSize: FONT_SIZES.md },
  content: { flex: 1, marginTop: -SPACING.md },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  reporteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.error,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  reporteButtonText: { fontSize: FONT_SIZES.md, fontWeight: "600", color: COLORS.white },
  section: { marginTop: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: "600", color: COLORS.text, marginBottom: SPACING.md },
  routeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  routeIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  routeInfo: { flex: 1, marginLeft: SPACING.md },
  routeName: { fontSize: FONT_SIZES.md, fontWeight: "500", color: COLORS.text },
  routeMeta: { flexDirection: "row", alignItems: "center", marginTop: SPACING.xs, gap: SPACING.xs },
  routeMetaText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.textLight },
})
