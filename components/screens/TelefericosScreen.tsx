import { ErrorState } from "@/components/maps/ErrorState"
import { LoadingMap } from "@/components/maps/LoadingMap"
import { TelefericoCard } from "@/components/telefericos/TelefericoCard"
import { TelefericoHeader } from "@/components/telefericos/TelefericoHeader"
import { TelefericoMap } from "@/components/telefericos/TelefericoMap"
import { Button } from "@/components/ui/Button"
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/theme"
import { useTelefericos } from "@/hooks/useTransport"
import { List, Map, RefreshCw } from "lucide-react-native"
import React, { useState } from "react"
import {
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

type ViewMode = "list" | "map"

export function TelefericosScreen() {
  const { telefericos, loading, error, refetch } = useTelefericos()
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TelefericoHeader 
          totalLines={telefericos.length} 
          operatingLines={telefericos.length} 
        />

        {/* Toggle Vista */}
        <View style={styles.toggleContainer}>
          <Button
            title="Lista"
            onPress={() => setViewMode("list")}
            variant={viewMode === "list" ? "primary" : "outline"}
            size="sm"
            icon={<List size={16} color={viewMode === "list" ? "#ffffff" : "#ef4444"} />}
            style={styles.toggleButton}
          />
          
          <Button
            title="Mapa"
            onPress={() => setViewMode("map")}
            variant={viewMode === "map" ? "primary" : "outline"}
            size="sm"
            icon={<Map size={16} color={viewMode === "map" ? "#ffffff" : "#ef4444"} />}
            style={styles.toggleButton}
          />
        </View>

        {/* Contenido */}
        {loading ? (
          <LoadingMap />
        ) : viewMode === "list" ? (
          <ScrollView
            style={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.error]}
                tintColor={COLORS.error}
              />
            }
          >
            <View style={styles.listHeader}>
              <Text style={styles.resultText}>
                {telefericos.length} líneas disponibles
              </Text>
              <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                <RefreshCw size={16} color={COLORS.gray100} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.cardsContainer}>
              {telefericos.map((teleferico) => (
                <TelefericoCard
                  key={teleferico.id}
                  teleferico={teleferico}
                  selected={selectedId === teleferico.id}
                  onSelect={() => setSelectedId(teleferico.id === selectedId ? null : teleferico.id)}
                />
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.mapContainer}>
            <TelefericoMap 
              telefericos={telefericos} 
              selectedId={selectedId} 
              onSelect={setSelectedId} 
            />

            {/* Leyenda de líneas */}
            <View style={styles.legendContainer}>
              <Text style={styles.legendTitle}>Líneas</Text>
              <View style={styles.legendItems}>
                {telefericos.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setSelectedId(t.id === selectedId ? null : t.id)}
                    style={[
                      styles.legendItem,
                      selectedId === t.id && styles.legendItemSelected
                    ]}
                  >
                    <View 
                      style={[
                        styles.legendDot, 
                        { backgroundColor: t.color }
                      ]} 
                    />
                    <Text style={styles.legendText}>{t.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Card flotante */}
            {selectedId && (
              <View style={styles.floatingCardContainer}>
                {telefericos
                  .filter((t) => t.id === selectedId)
                  .map((teleferico) => (
                    <TelefericoCard
                      key={teleferico.id}
                      teleferico={teleferico}
                      selected={true}
                      onSelect={() => setSelectedId(null)}
                    />
                  ))}
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.gray100,
  },
  toggleContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    gap: SPACING.sm,
  },
  toggleButton: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  resultText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray100,
  },
  refreshButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  cardsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  legendContainer: {
    position: "absolute",
    bottom: 140, // Ajusta según la altura de la card flotante
    left: SPACING.lg,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        backdropFilter: "blur(10px)",
      },
      android: {
        elevation: 8,
        backgroundColor: "rgba(255, 255, 255, 0.98)",
      },
    }),
  },
  legendTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
    color: COLORS.gray100,
    marginBottom: SPACING.sm,
  },
  legendItems: {
    gap: SPACING.xs,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  legendItemSelected: {
    backgroundColor: COLORS.gray100,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray100,
  },
  floatingCardContainer: {
    position: "absolute",
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
})