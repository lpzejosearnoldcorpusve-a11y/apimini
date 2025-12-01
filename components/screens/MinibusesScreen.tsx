import { ErrorState } from "@/components/maps/ErrorState"
import { LoadingMap } from "@/components/maps/LoadingMap"
import { MinibusCard } from "@/components/minibuses/MinibusCard"
import { MinibusHeader } from "@/components/minibuses/MinibusHeader"
import { MinibusMap } from "@/components/minibuses/MinibusMap"
import { Button } from "@/components/ui/Button"
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/theme"
import { useMinibuses } from "@/hooks/useTransport"
import { List, Map, RefreshCw } from "lucide-react-native"
import React, { useMemo, useState } from "react"
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

export function MinibusesScreen() {
  const { minibuses, loading, error, refetch } = useMinibuses()
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  // Filtrar minibuses por búsqueda
  const filteredMinibuses = useMemo(() => {
    if (!searchQuery) return minibuses
    const query = searchQuery.toLowerCase()
    return minibuses.filter(
      (m) =>
        m.linea.toLowerCase().includes(query) ||
        m.sindicato.toLowerCase().includes(query) ||
        m.rutaNombre.toLowerCase().includes(query),
    )
  }, [minibuses, searchQuery])

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
        <MinibusHeader 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
          totalLines={minibuses.length} 
        />

        {/* Toggle Vista */}
        <View style={styles.toggleContainer}>
          <Button
            title="Lista"
            onPress={() => setViewMode("list")}
            variant={viewMode === "list" ? "primary" : "outline"}
            size="sm"
            icon={<List size={16} />}
            style={styles.toggleButton}
          />
          
          <Button
            title="Mapa"
            onPress={() => setViewMode("map")}
            variant={viewMode === "map" ? "primary" : "outline"}
            size="sm"
            icon={<Map size={16} />}
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
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          >
            <View style={styles.listHeader}>
              <Text style={styles.resultText}>
                {filteredMinibuses.length} resultado{filteredMinibuses.length !== 1 ? "s" : ""}
              </Text>
              <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                <RefreshCw size={16} color={COLORS.gray100} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.cardsContainer}>
              {filteredMinibuses.map((minibus) => (
                <MinibusCard
                  key={minibus.id}
                  minibus={minibus}
                  selected={selectedId === minibus.id}
                  onSelect={() => setSelectedId(minibus.id === selectedId ? null : minibus.id)}
                />
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.mapContainer}>
            <MinibusMap 
              minibuses={filteredMinibuses} 
              selectedId={selectedId} 
              onSelect={setSelectedId} 
            />

            {/* Lista flotante de rutas seleccionadas */}
            {selectedId && (
              <View style={styles.floatingCardContainer}>
                {filteredMinibuses
                  .filter((m) => m.id === selectedId)
                  .map((minibus) => (
                    <MinibusCard
                      key={minibus.id}
                      minibus={minibus}
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