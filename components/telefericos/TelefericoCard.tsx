"use client"

import { NavigationModal } from "@/components/navigation/NavigationModal"
import { StopSelectionModal } from "@/components/navigation/StopSelectionModal"
import type { NavigationDestination } from "@/types/navigation"
import type { Teleferico } from "@/types/transport"
import { LinearGradient } from "expo-linear-gradient"
import { Cable, ChevronRight, Clock, MapPin, Navigation2 } from "lucide-react-native"
import React, { useState } from "react"
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from "react-native"

// Habilitar animaciones para Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

interface TelefericoCardProps {
  teleferico: Teleferico
  selected: boolean
  onSelect: () => void
}

export function TelefericoCard({ teleferico, selected, onSelect }: TelefericoCardProps) {
  const [showStopSelection, setShowStopSelection] = useState(false)
  const [showNavigation, setShowNavigation] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<NavigationDestination | null>(null)

  const estacionesOrdenadas = teleferico.estaciones.sort((a, b) => a.orden - b.orden)
  const primeraEstacion = estacionesOrdenadas[0]?.nombre || "N/A"
  const ultimaEstacion = estacionesOrdenadas[estacionesOrdenadas.length - 1]?.nombre || "N/A"

  const handlePress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    onSelect()
  }

  const handleNavigate = () => {
    console.log('🚡 TelefericoCard - handleNavigate llamado')
    console.log('📍 Estaciones disponibles:', teleferico.estaciones.length)
    setShowStopSelection(true)
  }

  const handleSelectStop = (destination: NavigationDestination) => {
    console.log('✅ TelefericoCard - handleSelectStop llamado con:', destination)
    setSelectedDestination(destination)
    setShowStopSelection(false)
    // Esperar a que el modal se cierre completamente antes de abrir el siguiente
    setTimeout(() => {
      console.log('🗺️ TelefericoCard - Abriendo NavigationModal con destino:', destination)
      setShowNavigation(true)
    }, 350)
  }

  const Container: React.ElementType = selected ? LinearGradient : View;

  const containerProps = selected && {
    colors: [teleferico.color, `${teleferico.color}dd`] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  };

  return (
    <>
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Container
        {...containerProps}
        style={[
          styles.container,
          selected ? styles.selectedContainer : styles.normalContainer,
          !selected && { borderColor: '#f1f5f9' }
        ]}
      >
        <View style={styles.mainContent}>
          <View style={[
            styles.iconContainer,
            selected ? styles.selectedIconContainer : { backgroundColor: `${teleferico.color}15` }
          ]}>
            <Cable size={24} color={selected ? "#ffffff" : teleferico.color} />
          </View>

          <View style={styles.content}>
            <Text style={[
              styles.title,
              selected ? styles.selectedText : styles.normalText
            ]}>
              {teleferico.nombre}
            </Text>
            
            <View style={styles.infoRow}>
              <MapPin size={12} color={selected ? "rgba(255,255,255,0.8)" : "#6b7280"} />
              <Text style={[
                styles.infoText,
                selected ? styles.selectedSubText : styles.normalSubText
              ]}>
                {teleferico.estaciones.length} estaciones
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Clock size={12} color={selected ? "rgba(255,255,255,0.7)" : "#9ca3af"} />
              <Text style={[
                styles.infoText,
                selected ? styles.selectedSubText : styles.normalSubText
              ]}>
                6:00 - 23:00
              </Text>
            </View>
          </View>

          <View style={[
            styles.chevronContainer,
            selected ? styles.selectedChevronContainer : styles.normalChevronContainer
          ]}>
            <ChevronRight size={18} color={selected ? "#ffffff" : "#d1d5db"} />
          </View>
        </View>

        {/* Estaciones preview - Animado */}
        {selected && (
          <View style={styles.stationsPreview}>
            <View style={styles.stationsContainer}>
              <View style={styles.stationRow}>
                <View style={[styles.stationDot, styles.firstStationDot]} />
                <Text style={styles.stationName}>{primeraEstacion}</Text>
              </View>
              
              <View style={styles.stationLine} />
              
              <View style={styles.stationRow}>
                <View style={[styles.stationDot, styles.lastStationDot]} />
                <Text style={styles.stationName}>{ultimaEstacion}</Text>
              </View>
            </View>

            {/* Botón de navegación */}
            <TouchableOpacity
              style={[styles.navigateButton, { borderColor: "rgba(255,255,255,0.3)" }]}
              onPress={(e) => {
                e.stopPropagation()
                handleNavigate()
              }}
              activeOpacity={0.8}
            >
              <Navigation2 size={16} color="#fff" />
              <Text style={styles.navigateButtonText}>¿Cómo llegar?</Text>
            </TouchableOpacity>
          </View>
        )}
      </Container>
    </TouchableOpacity>

    {/* Modal de selección de estación */}
    <StopSelectionModal
      visible={showStopSelection}
      onClose={() => setShowStopSelection(false)}
      onSelectStop={handleSelectStop}
      estaciones={teleferico.estaciones}
      telefericoName={teleferico.nombre}
      telefericoColor={teleferico.color}
      type="teleferico"
    />

    {/* Modal de navegación */}
    <NavigationModal
      visible={showNavigation}
      destination={selectedDestination}
      onClose={() => setShowNavigation(false)}
      transportColor={teleferico.color}
      transportName={teleferico.nombre}
    />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: 6,
  },
  selectedContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  normalContainer: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  selectedText: {
    color: "#ffffff",
  },
  normalText: {
    color: "#1f2937",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  infoText: {
    fontSize: 12,
  },
  selectedSubText: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  normalSubText: {
    color: "#6b7280",
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedChevronContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  normalChevronContainer: {
    backgroundColor: "#f9fafb",
  },
  stationsPreview: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  stationsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    ...Platform.select({
      ios: {
        backdropFilter: "blur(10px)",
      },
      android: {
        elevation: 2,
      },
    }),
  },
  stationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  firstStationDot: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  lastStationDot: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  stationLine: {
    width: 2,
    height: 16,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginLeft: 5,
    marginVertical: 2,
  },
  stationName: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "500",
  },
  navigateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 12,
    borderWidth: 1,
  },
  navigateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
})