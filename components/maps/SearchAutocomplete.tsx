"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { searchService } from "@/services/searchService"
import type { SearchSuggestion } from "@/types/search"
import type { Minibus, Teleferico } from "@/types/transport"
import { LinearGradient } from "expo-linear-gradient"
import {
    Building,
    Bus,
    Clock,
    MapPin,
    Search,
    Star,
    Train,
    X,
} from "lucide-react-native"
import React, { useCallback, useEffect, useRef, useState } from "react"
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

interface SearchAutocompleteProps {
  minibuses: Minibus[]
  telefericos: Teleferico[]
  onSelectSuggestion: (suggestion: SearchSuggestion) => void
  onSelectPoint?: (lat: number, lng: number, name: string) => void
  placeholder?: string
}

const ICON_MAP = {
  'map-pin': MapPin,
  'bus': Bus,
  'train': Train,
  'building': Building,
  'home': MapPin,
  'star': Star,
}

const RECENT_SEARCHES_KEY = 'recent_searches'

export function SearchAutocomplete({
  minibuses,
  telefericos,
  onSelectSuggestion,
  onSelectPoint,
  placeholder = "Buscar ubicación, ruta o estación...",
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([])
  
  const inputRef = useRef<TextInput>(null)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(-20)).current

  // Animación para mostrar/ocultar sugerencias
  useEffect(() => {
    if (isFocused && (suggestions.length > 0 || query.length === 0)) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isFocused, suggestions.length, query.length])

  // Debounce para búsqueda
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    if (searchQuery.trim().length < 2) {
      setSuggestions([])
      return
    }

    searchTimeout.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const results = await searchService.searchWithAutocomplete(
          searchQuery,
          minibuses,
          telefericos
        )
        setSuggestions(results)
      } catch (error) {
        console.error("Error en búsqueda:", error)
        setSuggestions([])
      }
      setIsLoading(false)
    }, 300)
  }, [minibuses, telefericos])

  // Actualizar búsqueda cuando cambia el query
  useEffect(() => {
    handleSearch(query)
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [query, handleSearch])

  // Manejar selección de sugerencia
  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    // Guardar en recientes
    const updated = [suggestion, ...recentSearches.filter(s => s.id !== suggestion.id)].slice(0, 5)
    setRecentSearches(updated)
    
    setQuery(suggestion.name)
    setSuggestions([])
    setIsFocused(false)
    Keyboard.dismiss()
    onSelectSuggestion(suggestion)
  }

  // Limpiar búsqueda
  const handleClear = () => {
    setQuery("")
    setSuggestions([])
    inputRef.current?.focus()
  }

  // Renderizar icono según tipo
  const renderIcon = (suggestion: SearchSuggestion) => {
    const IconComponent = ICON_MAP[suggestion.icon || 'map-pin']
    const color = suggestion.color || COLORS.textSecondary
    
    return (
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <IconComponent size={20} color={color} />
      </View>
    )
  }

  // Renderizar sugerencia
  const renderSuggestion = ({ item, index }: { item: SearchSuggestion, index: number }) => (
    <TouchableOpacity
      style={[
        styles.suggestionItem,
        index === 0 && styles.suggestionItemFirst,
      ]}
      onPress={() => handleSelectSuggestion(item)}
      activeOpacity={0.7}
    >
      {renderIcon(item)}
      
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.suggestionDescription} numberOfLines={1}>
          {item.description}
        </Text>
      </View>

      {item.type === 'stop' || item.type === 'station' ? (
        <View style={[styles.typeBadge, { backgroundColor: item.color || COLORS.primary }]}>
          <Text style={styles.typeBadgeText}>
            {item.type === 'stop' ? 'Parada' : 'Estación'}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  )

  // Renderizar búsquedas recientes
  const renderRecentSearches = () => {
    if (query.length > 0 || recentSearches.length === 0) return null

    return (
      <View style={styles.recentSection}>
        <View style={styles.recentHeader}>
          <Clock size={16} color={COLORS.textSecondary} />
          <Text style={styles.recentTitle}>Recientes</Text>
        </View>
        {recentSearches.map((item, index) => (
          <TouchableOpacity
            key={`recent-${item.id}-${index}`}
            style={styles.recentItem}
            onPress={() => handleSelectSuggestion(item)}
          >
            {renderIcon(item)}
            <Text style={styles.recentName} numberOfLines={1}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  // Renderizar sugerencias rápidas
  const renderQuickSuggestions = () => {
    if (query.length > 0) return null

    const quickItems = [
      { label: 'Mi ubicación', icon: 'map-pin', type: 'action' },
      { label: 'Punto en mapa', icon: 'map-pin', type: 'action' },
    ]

    return (
      <View style={styles.quickSection}>
        <Text style={styles.quickTitle}>Acceso rápido</Text>
        <View style={styles.quickButtons}>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => {
              setIsFocused(false)
              Keyboard.dismiss()
              // Esto se manejará en MapsScreen
              onSelectPoint?.(0, 0, 'current_location')
            }}
          >
            <LinearGradient
              colors={[COLORS.primary, '#14b8a6']}
              style={styles.quickButtonGradient}
            >
              <MapPin size={18} color="#fff" />
              <Text style={styles.quickButtonText}>Mi ubicación</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => {
              setIsFocused(false)
              Keyboard.dismiss()
              onSelectPoint?.(0, 0, 'select_on_map')
            }}
          >
            <View style={styles.quickButtonOutline}>
              <MapPin size={18} color={COLORS.primary} />
              <Text style={styles.quickButtonOutlineText}>Seleccionar en mapa</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const showDropdown = isFocused && (suggestions.length > 0 || query.length === 0)

  return (
    <View style={styles.container}>
      {/* Input de búsqueda */}
      <View style={[
        styles.searchBar,
        isFocused && styles.searchBarFocused
      ]}>
        <Search size={20} color={isFocused ? COLORS.primary : "#9ca3af"} />
        
        <TextInput
          ref={inputRef}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay para permitir selección
            setTimeout(() => setIsFocused(false), 200)
          }}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />

        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : query.length > 0 ? (
          <TouchableOpacity onPress={handleClear}>
            <X size={20} color="#9ca3af" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Dropdown de sugerencias */}
      {showDropdown && (
        <Animated.View
          style={[
            styles.dropdown,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Pressable 
            style={styles.dropdownOverlay} 
            onPress={() => {
              setIsFocused(false)
              Keyboard.dismiss()
            }}
          />
          
          <View style={styles.dropdownContent}>
            {renderQuickSuggestions()}
            {renderRecentSearches()}
            
            {suggestions.length > 0 && (
              <FlatList
                data={suggestions}
                renderItem={renderSuggestion}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={styles.suggestionsList}
                contentContainerStyle={styles.suggestionsContent}
                ListHeaderComponent={
                  query.length > 0 ? (
                    <Text style={styles.resultsTitle}>
                      {suggestions.length} resultados
                    </Text>
                  ) : null
                }
              />
            )}

            {query.length >= 2 && suggestions.length === 0 && !isLoading && (
              <View style={styles.noResults}>
                <Search size={32} color={COLORS.textLight} />
                <Text style={styles.noResultsText}>
                  No encontramos resultados para "{query}"
                </Text>
                <Text style={styles.noResultsHint}>
                  Intenta con otra búsqueda o selecciona un punto en el mapa
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchBarFocused: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#111827',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 8,
    zIndex: 1001,
  },
  dropdownOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  dropdownContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    maxHeight: 400,
    ...SHADOWS.lg,
    overflow: 'hidden',
  },
  quickSection: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  quickTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickButton: {
    flex: 1,
  },
  quickButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  quickButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#fff',
  },
  quickButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    gap: SPACING.xs,
  },
  quickButtonOutlineText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  recentSection: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  recentTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  recentName: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  suggestionsList: {
    maxHeight: 250,
  },
  suggestionsContent: {
    padding: SPACING.sm,
  },
  resultsTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    marginBottom: 4,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#f9fafb',
  },
  suggestionItemFirst: {
    marginTop: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  suggestionDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: SPACING.sm,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  noResults: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  noResultsText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  noResultsHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
})

export { SearchAutocomplete as MapSearchAutocomplete }

