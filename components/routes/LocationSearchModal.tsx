"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { locationService } from "@/services/locationService"
import type { CreateLocationData, SearchResult } from "@/types/location"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native"

interface LocationSearchModalProps {
  visible: boolean
  onClose: () => void
  onSelect: (data: CreateLocationData) => void
  locationType: "home" | "work" | "other"
}

export function LocationSearchModal({ visible, onClose, onSelect, locationType }: LocationSearchModalProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [customName, setCustomName] = useState("")
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  
  const searchTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (query.length > 2) {
      // Cancelar búsqueda anterior
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      
      // Nueva búsqueda con debounce
      searchTimeoutRef.current = setTimeout(() => {
        searchLocation()
      }, 500)
    } else {
      setResults([])
      setSearchError(null)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])

  const searchLocation = async () => {
    if (query.length < 3) return
    
    setIsSearching(true)
    setSearchError(null)
    
    try {
      const data = await locationService.searchLocation(query)
      setResults(data)
      
      if (data.length === 0 && query.length > 2) {
        setSearchError("No se encontraron resultados para esta búsqueda")
      }
    } catch (error: any) {
      console.error("Search error:", error)
      setSearchError(error.message || "Error al buscar ubicaciones")
      setResults([])
      
      // Mostrar alerta solo si es un error crítico
      if (error.message.includes("conexión") || error.message.includes("timeout")) {
        Alert.alert(
          "Error de conexión",
          "No se pudo conectar al servicio de búsqueda. Verifica tu conexión a internet.",
          [{ text: "OK" }]
        )
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectResult = (result: SearchResult) => {
    setSelectedResult(result)
    setCustomName(getDefaultName())
  }

  const getDefaultName = () => {
    switch (locationType) {
      case "home":
        return "Casa"
      case "work":
        return "Trabajo"
      case "other":
        return "Ubicación personalizada"
    }
  }

  const getTitle = () => {
    switch (locationType) {
      case "home":
        return "📍 Agregar Casa"
      case "work":
        return "💼 Agregar Trabajo"
      case "other":
        return "📌 Agregar Lugar"
    }
  }

  const handleConfirm = () => {
    if (!selectedResult) return

    const locationData: CreateLocationData = {
      type: locationType,
      name: customName.trim() || getDefaultName(),
      address: selectedResult.display_name,
      latitude: Number.parseFloat(selectedResult.lat),
      longitude: Number.parseFloat(selectedResult.lon),
    }

    onSelect(locationData)
    handleClose()
  }

  const handleClose = () => {
    setQuery("")
    setResults([])
    setSelectedResult(null)
    setCustomName("")
    setSearchError(null)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    onClose()
  }

  const renderResultItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity 
      style={styles.resultItem} 
      onPress={() => handleSelectResult(item)}
      activeOpacity={0.7}
    >
      <View style={styles.resultIcon}>
        <Ionicons name="location-outline" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName} numberOfLines={2}>
          {formatAddress(item.display_name)}
        </Text>
        <Text style={styles.resultType}>
          {item.type === "city" ? "Ciudad" : 
           item.type === "suburb" ? "Barrio" : 
           item.type === "road" ? "Calle" : "Lugar"}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  )

  const formatAddress = (address: string) => {
    // Simplificar dirección para mostrar mejor
    const parts = address.split(", ")
    if (parts.length > 3) {
      return `${parts[0]}, ${parts[1]}, ${parts[parts.length - 1]}`
    }
    return address
  }

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={handleClose} 
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.title}>{getTitle()}</Text>
            <View style={{ width: 40 }} />
          </View>

          {!selectedResult ? (
            <>
              {/* Barra de búsqueda */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar dirección, barrio o lugar en La Paz..."
                  placeholderTextColor={COLORS.textLight}
                  value={query}
                  onChangeText={setQuery}
                  autoFocus
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="search"
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={() => setQuery("")}>
                    <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Estado de búsqueda */}
              {isSearching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Buscando...</Text>
                </View>
              ) : searchError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="warning-outline" size={48} color={COLORS.error} />
                  <Text style={styles.errorText}>{searchError}</Text>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={searchLocation}
                  >
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                  </TouchableOpacity>
                </View>
              ) : results.length > 0 ? (
                <FlatList
                  data={results}
                  keyExtractor={(item) => item.place_id.toString()}
                  renderItem={renderResultItem}
                  contentContainerStyle={styles.resultsList}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                />
              ) : query.length > 2 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="map-outline" size={48} color={COLORS.textLight} />
                  <Text style={styles.emptyText}>No se encontraron resultados</Text>
                  <Text style={styles.emptySubtext}>Intenta con otro nombre o dirección</Text>
                </View>
              ) : (
                <View style={styles.initialContainer}>
                  <Ionicons name="compass-outline" size={64} color={COLORS.textLight} />
                  <Text style={styles.initialText}>Busca una dirección en La Paz</Text>
                  <Text style={styles.initialSubtext}>Ej: Miraflores, Sopocachi, Av. 16 de Julio</Text>
                </View>
              )}
            </>
          ) : (
            /* Pantalla de confirmación */
            <View style={styles.confirmContainer}>
              <View style={styles.selectedLocation}>
                <View style={styles.locationIconContainer}>
                  <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
                </View>
                <Text style={styles.selectedAddress} numberOfLines={3}>
                  {selectedResult.display_name}
                </Text>
              </View>

              <View style={styles.nameInputContainer}>
                <Text style={styles.label}>Nombre personalizado</Text>
                <TextInput
                  style={styles.nameInput}
                  placeholder={getDefaultName()}
                  placeholderTextColor={COLORS.textLight}
                  value={customName}
                  onChangeText={setCustomName}
                  maxLength={50}
                />
                <Text style={styles.helperText}>
                  Ej: {locationType === "home" ? "Mi Casa" : 
                       locationType === "work" ? "Oficina Central" : 
                       "Cafetería Favorita"}
                </Text>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.confirmButton, !customName.trim() && styles.confirmButtonDisabled]}
                  onPress={handleConfirm}
                  disabled={!customName.trim()}
                >
                  <Text style={styles.confirmButtonText}>✅ Guardar Ubicación</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={() => setSelectedResult(null)}
                >
                  <Text style={styles.backButtonText}>↩️ Buscar otra dirección</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  closeButton: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    paddingVertical: SPACING.md,
    marginLeft: SPACING.sm,
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  errorText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    textAlign: "center",
  },
  retryButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  resultsList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.xs,
  },
  resultIcon: {
    marginRight: SPACING.md,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: FONT_SIZES.md,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 2,
  },
  resultType: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  emptySubtext: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  initialContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  initialText: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.text,
  },
  initialSubtext: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingHorizontal: SPACING.xl,
  },
  confirmContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  selectedLocation: {
    alignItems: "center",
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  locationIconContainer: {
    marginBottom: SPACING.md,
  },
  selectedAddress: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 24,
  },
  nameInputContainer: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  nameInput: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.xs,
  },
  helperText: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  buttonContainer: {
    marginTop: "auto",
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.textLight,
    opacity: 0.7,
  },
  confirmButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.white,
  },
  backButton: {
    padding: SPACING.md,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: "600",
  },
})