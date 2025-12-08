"use client"

import { LocationSearchModal } from "@/components/routes/LocationSearchModal"
import { ReporteModal } from "@/components/routes/ReporteModal"
import { SavedLocationsList } from "@/components/routes/SavedLocationsList"
import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { useAuth } from "@/context/AuthContext"
import { locationService } from "@/services/locationService"
import { reporteService } from "@/services/reporteService"
import { transportService } from "@/services/transportService"
import type { CreateLocationData, SavedLocation } from "@/types/location"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useRef, useState } from "react"
import { Animated, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const POPULAR_ROUTES = [
  { id: "1", name: "Centro - Zona Sur", duration: "45 min", price: "Bs. 3.50" },
  { id: "2", name: "El Alto - Miraflores", duration: "35 min", price: "Bs. 2.50" },
  { id: "3", name: "Sopocachi - San Miguel", duration: "25 min", price: "Bs. 2.00" },
  { id: "4", name: "Obrajes - Calacoto", duration: "15 min", price: "Bs. 1.50" },
]

export function RoutesScreen() {
  const { user } = useAuth()
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([])
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false)
  const [isReporteModalVisible, setIsReporteModalVisible] = useState(false)
  const [locationTypeToAdd, setLocationTypeToAdd] = useState<"home" | "work" | "other">("home")
  
  // New state for services data
  const [activeMinibuses, setActiveMinibuses] = useState<number>(0)
  const [activeTelefericos, setActiveTelefericos] = useState<number>(0)
  const [recentReports, setRecentReports] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  useEffect(() => {
    loadAllData()
    startEntranceAnimation()
  }, [])

  const startEntranceAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadSavedLocations(),
        loadTransportStats(),
        loadRecentReports()
      ])
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadAllData()
    setRefreshing(false)
  }

  const loadSavedLocations = async () => {
    try {
      const locations = await locationService.getSavedLocations()
      setSavedLocations(locations)
    } catch (error) {
      console.error("Error loading locations:", error)
    }
  }

  const loadTransportStats = async () => {
    try {
      const [minibuses, telefericos] = await Promise.all([
        transportService.getMinibuses(),
        transportService.getTelefericos()
      ])
      setActiveMinibuses(minibuses.length)
      setActiveTelefericos(telefericos.length)
    } catch (error) {
      console.error("Error loading transport stats:", error)
    }
  }

  const loadRecentReports = async () => {
    if (user?.id) {
      try {
        const reports = await reporteService.getMisReportes(user.id)
        setRecentReports(reports.slice(0, 3)) // Show only last 3
      } catch (error) {
        console.error("Error loading reports:", error)
      }
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
          <Animated.View 
            style={[
              styles.headerContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View>
              <Text style={styles.greeting}>Hola, {user?.nombres || "Viajero"}</Text>
              <Text style={styles.title}>¿A dónde vas hoy?</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {user?.nombres?.[0] || "U"}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Quick Actions Grid */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: "#FEF2F2" }]} 
            onPress={() => setIsReporteModalVisible(true)}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#FEE2E2" }]}>
              <Ionicons name="alert-circle" size={24} color={COLORS.error} />
            </View>
            <Text style={[styles.actionTitle, { color: COLORS.error }]}>Reportar</Text>
            <Text style={styles.actionSubtitle}>Incidente</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: "#EFF6FF" }]}
            onPress={() => {}} // Navigate to map
          >
            <View style={[styles.actionIcon, { backgroundColor: "#DBEAFE" }]}>
              <Ionicons name="map" size={24} color={COLORS.primary} />
            </View>
            <Text style={[styles.actionTitle, { color: COLORS.primary }]}>Ver Mapa</Text>
            <Text style={styles.actionSubtitle}>Explorar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: "#F0FDF4" }]}
            onPress={() => {}} // Navigate to wallet
          >
            <View style={[styles.actionIcon, { backgroundColor: "#DCFCE7" }]}>
              <Ionicons name="wallet" size={24} color={COLORS.success} />
            </View>
            <Text style={[styles.actionTitle, { color: COLORS.success }]}>Mi Saldo</Text>
            <Text style={styles.actionSubtitle}>Recargar</Text>
          </TouchableOpacity>
        </View>

        {/* Transport Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado del Transporte</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
            <LinearGradient
              colors={['#0EA5E9', '#0284C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="bus" size={24} color="white" />
              </View>
              <View>
                <Text style={styles.statValue}>{activeMinibuses}</Text>
                <Text style={styles.statLabel}>Líneas Activas</Text>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="git-network" size={24} color="white" />
              </View>
              <View>
                <Text style={styles.statValue}>{activeTelefericos}</Text>
                <Text style={styles.statLabel}>Teleféricos</Text>
              </View>
            </LinearGradient>
          </ScrollView>
        </View>

        <SavedLocationsList
          locations={savedLocations}
          onSelect={handleSelectLocation}
          onDelete={handleDeleteLocation}
          onAddNew={handleAddLocation}
        />

        <PopularRoutes routes={POPULAR_ROUTES} />

        {/* Recent Reports Section */}
        {recentReports.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mis Reportes Recientes</Text>
            {recentReports.map((report, index) => (
              <View key={index} style={styles.reportCard}>
                <View style={styles.reportIcon}>
                  <Ionicons name="time" size={20} color={COLORS.textSecondary} />
                </View>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportType}>{report.tipo || "Incidente"}</Text>
                  <Text style={styles.reportDate}>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: report.estado === 'resuelto' ? '#DCFCE7' : '#FEF3C7' }]}>
                  <Text style={[styles.statusText, { color: report.estado === 'resuelto' ? '#166534' : '#92400E' }]}>
                    {report.estado || "Pendiente"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
        onSuccess={() => {
          console.log("Reporte enviado")
          loadRecentReports() // Reload reports
        }}
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
  header: { paddingBottom: SPACING.xl + 10 },
  headerContent: { 
    paddingHorizontal: SPACING.lg, 
    paddingTop: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  greeting: { fontSize: FONT_SIZES.md, color: "rgba(255,255,255,0.9)", fontWeight: "500" },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: "800", color: COLORS.white, marginTop: 4 },
  profileButton: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.sm,
    ...SHADOWS.lg,
  },
  searchPlaceholder: { color: COLORS.textSecondary, fontSize: FONT_SIZES.md },
  content: { flex: 1, marginTop: -SPACING.md },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl * 2 },
  
  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
  },
  actionCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Stats
  statsScroll: {
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  statCard: {
    width: 140,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },

  section: { marginTop: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.md },
  
  routeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  routeIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#F0F9FF',
    alignItems: "center",
    justifyContent: "center",
  },
  routeInfo: { flex: 1, marginLeft: SPACING.md },
  routeName: { fontSize: FONT_SIZES.md, fontWeight: "600", color: COLORS.text },
  routeMeta: { flexDirection: "row", alignItems: "center", marginTop: SPACING.xs, gap: SPACING.xs },
  routeMetaText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '500' },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.textLight },

  // Reports
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.textSecondary,
    ...SHADOWS.sm,
  },
  reportIcon: {
    marginRight: SPACING.md,
  },
  reportInfo: {
    flex: 1,
  },
  reportType: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  reportDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
})
