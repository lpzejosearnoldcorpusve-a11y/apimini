import type { SearchResult } from "@/types/routing"
import { ArrowLeft, Bus, Cable, MapPin, Search, X } from "lucide-react-native"
import React, { useEffect, useRef, useState } from "react"
import {
    ActivityIndicator,
    Keyboard,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native"

interface SearchBarProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  results: SearchResult[]
  isLoading?: boolean
  onResultSelect: (result: SearchResult) => void
  onClear: () => void
  onBack?: () => void
  autoFocus?: boolean
}

export function SearchBar({
  placeholder = "Buscar ubicación...",
  value,
  onChange,
  results,
  isLoading,
  onResultSelect,
  onClear,
  onBack,
  autoFocus = false,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<TextInput>(null)

  // Cerrar teclado y resultados al tocar fuera
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        if (Platform.OS === 'android') {
          setIsFocused(false)
        }
      }
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  const getIcon = (result: SearchResult) => {
    switch (result.transportType) {
      case "minibus":
        return <Bus size={16} color="#0891B2" />
      case "teleferico":
        return <Cable size={16} color="#7C3AED" />
      default:
        return <MapPin size={16} color="#6B7280" />
    }
  }

  const showResults = isFocused && value.length > 1 && (results.length > 0 || isLoading)

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Input */}
        <View style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused
        ]}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <ArrowLeft size={20} color="#0891B2" />
            </TouchableOpacity>
          )}
          <Search 
            size={20} 
            color={isFocused ? "#0891B2" : "#9CA3AF"} 
          />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={value}
            onChangeText={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              // Retrasamos el blur para permitir que se seleccione un resultado
              setTimeout(() => setIsFocused(false), 200)
            }}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            autoFocus={autoFocus}
            returnKeyType="search"
          />
          {isLoading ? (
            <ActivityIndicator size="small" color="#0891B2" />
          ) : value ? (
            <TouchableOpacity
              onPress={() => {
                onClear()
                inputRef.current?.focus()
              }}
              style={styles.clearButton}
            >
              <X size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Resultados */}
        {showResults && (
          <View style={styles.resultsContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#0891B2" />
                <Text style={styles.loadingText}>Buscando...</Text>
              </View>
            ) : (
              <ScrollView 
                style={styles.resultsScroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {results.map((result) => (
                  <TouchableOpacity
                    key={result.id}
                    onPress={() => {
                      onResultSelect(result)
                      setIsFocused(false)
                      Keyboard.dismiss()
                    }}
                    style={styles.resultItem}
                  >
                    <View style={styles.resultIcon}>
                      {getIcon(result)}
                    </View>
                    <View style={styles.resultContent}>
                      <Text 
                        style={styles.resultName}
                        numberOfLines={1}
                      >
                        {result.name}
                      </Text>
                      <Text 
                        style={styles.resultDisplayName}
                        numberOfLines={1}
                      >
                        {result.displayName}
                      </Text>
                      {result.lineInfo && (
                        <View style={[
                          styles.lineBadge,
                          result.transportType === "teleferico" 
                            ? styles.telefericoBadge 
                            : styles.busBadge
                        ]}>
                          <Text style={styles.lineText}>
                            {result.lineInfo}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    marginRight: 12,
  },
  inputContainerFocused: {
    borderColor: "#0891B2",
    shadowColor: "#0891B2",
    shadowOpacity: 0.2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    marginHorizontal: 12,
    padding: 0,
    ...Platform.select({
      ios: {
        paddingVertical: 4,
      },
      android: {
        paddingVertical: 0,
        textAlignVertical: "center",
      },
    }),
  },
  clearButton: {
    padding: 4,
    borderRadius: 12,
  },
  resultsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 8,
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 320,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  resultsScroll: {
    flex: 1,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  resultIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
    minWidth: 0,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  resultDisplayName: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  lineBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  telefericoBadge: {
    backgroundColor: "#F3E8FF",
  },
  busBadge: {
    backgroundColor: "#E0F2FE",
  },
  lineText: {
    fontSize: 11,
    fontWeight: "500",
  },
})

// Para manejar el Text
import { Text } from "react-native"

export default SearchBar