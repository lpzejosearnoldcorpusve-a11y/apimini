import type { Teleferico } from "@/types/transport"
import { Cable, ChevronRight, Clock, MapPin } from "lucide-react-native"
import React, { useState } from "react"
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface TelefericoCardProps {
  teleferico: Teleferico
  selected: boolean
  onSelect: () => void
}

export function TelefericoCard({ teleferico, selected, onSelect }: TelefericoCardProps) {
  const [heightAnim] = useState(new Animated.Value(0))
  
  const estacionesOrdenadas = teleferico.estaciones.sort((a, b) => a.orden - b.orden)
  const primeraEstacion = estacionesOrdenadas[0]?.nombre || "N/A"
  const ultimaEstacion = estacionesOrdenadas[estacionesOrdenadas.length - 1]?.nombre || "N/A"

  // Animación de expansión
  React.useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: selected ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [selected])

  const stationsHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80],
  })

  const stationsOpacity = heightAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  })

  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[
        styles.container,
        selected ? styles.selectedContainer : styles.defaultContainer,
        selected && { borderWidth: 0 }
      ]}
    >
      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Icon */}
        <View style={[
          styles.iconContainer,
          selected ? styles.selectedIconContainer : styles.defaultIconContainer,
          !selected && { backgroundColor: `${teleferico.color}20` }
        ]}>
          <Cable 
            size={24} 
            color={selected ? "#FFFFFF" : teleferico.color} 
          />
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={[
            styles.title,
            selected ? styles.selectedTitle : styles.defaultTitle
          ]}>
            {teleferico.nombre}
          </Text>
          
          {/* Stations count */}
          <View style={styles.detailRow}>
            <MapPin size={12} color={selected ? "rgba(255,255,255,0.8)" : "#6B7280"} />
            <Text style={[
              styles.detailText,
              selected ? styles.selectedDetailText : styles.defaultDetailText
            ]}>
              {teleferico.estaciones.length} estaciones
            </Text>
          </View>

          {/* Schedule */}
          <View style={styles.detailRow}>
            <Clock size={12} color={selected ? "rgba(255,255,255,0.7)" : "#9CA3AF"} />
            <Text style={[
              styles.detailText,
              selected ? styles.selectedDetailText : styles.defaultDetailText
            ]}>
              6:00 - 23:00
            </Text>
          </View>
        </View>

        {/* Chevron */}
        <View style={[
          styles.chevronContainer,
          selected ? styles.selectedChevronContainer : styles.defaultChevronContainer
        ]}>
          <ChevronRight 
            size={18} 
            color={selected ? "#FFFFFF" : "#D1D5DB"} 
          />
        </View>
      </View>

      {/* Stations Preview (animated) */}
      <Animated.View 
        style={[
          styles.stationsContainer,
          {
            height: stationsHeight,
            opacity: stationsOpacity,
          }
        ]}
      >
        <View style={styles.stationsContent}>
          <View style={styles.stationRow}>
            <View style={styles.stationDot} />
            <Text style={styles.stationText}>{primeraEstacion}</Text>
          </View>
          
          <View style={styles.lineConnector} />
          
          <View style={styles.stationRow}>
            <View style={[styles.stationDot, styles.lastStationDot]} />
            <Text style={styles.stationText}>{ultimaEstacion}</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 8,
  },
  defaultContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  selectedContainer: {
    backgroundColor: "#000000", // Base para el gradiente
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  defaultIconContainer: {
    // Background color se aplica dinámicamente
  },
  selectedIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  defaultTitle: {
    color: "#111827",
  },
  selectedTitle: {
    color: "#FFFFFF",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  detailText: {
    fontSize: 11,
  },
  defaultDetailText: {
    color: "#6B7280",
  },
  selectedDetailText: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  defaultChevronContainer: {
    backgroundColor: "#F9FAFB",
  },
  selectedChevronContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  stationsContainer: {
    overflow: "hidden",
  },
  stationsContent: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backdropFilter: "blur(10px)", // No soportado en React Native
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
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  lastStationDot: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderColor: "#FFFFFF",
  },
  lineConnector: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginLeft: 5,
    marginVertical: 2,
  },
  stationText: {
    fontSize: 12,
    color: "#FFFFFF",
    flex: 1,
  },
})

// Versión con LinearGradient y blur (requiere dependencias adicionales)
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"

export function TelefericoCardEnhanced({ teleferico, selected, onSelect }: TelefericoCardProps) {
  const estacionesOrdenadas = teleferico.estaciones.sort((a, b) => a.orden - b.orden)
  const primeraEstacion = estacionesOrdenadas[0]?.nombre || "N/A"
  const ultimaEstacion = estacionesOrdenadas[estacionesOrdenadas.length - 1]?.nombre || "N/A"

  if (selected) {
    return (
      <TouchableOpacity onPress={onSelect}>
        <LinearGradient
          colors={[teleferico.color, `${teleferico.color}DD`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={stylesEnhanced.gradientContainer}
        >
          {/* Main Content */}
          <View style={stylesEnhanced.mainContent}>
            {/* Icon */}
            <View style={stylesEnhanced.selectedIconContainer}>
              <Cable size={24} color="#FFFFFF" />
            </View>

            {/* Info */}
            <View style={stylesEnhanced.infoContainer}>
              <Text style={stylesEnhanced.selectedTitle}>
                {teleferico.nombre}
              </Text>
              
              {/* Stations count */}
              <View style={stylesEnhanced.detailRow}>
                <MapPin size={12} color="rgba(255,255,255,0.8)" />
                <Text style={stylesEnhanced.selectedDetailText}>
                  {teleferico.estaciones.length} estaciones
                </Text>
              </View>

              {/* Schedule */}
              <View style={stylesEnhanced.detailRow}>
                <Clock size={12} color="rgba(255,255,255,0.7)" />
                <Text style={stylesEnhanced.selectedDetailText}>
                  6:00 - 23:00
                </Text>
              </View>
            </View>

            {/* Chevron */}
            <View style={stylesEnhanced.selectedChevronContainer}>
              <ChevronRight size={18} color="#FFFFFF" />
            </View>
          </View>

          {/* Stations Preview */}
          <View style={stylesEnhanced.stationsWrapper}>
            <BlurView intensity={80} tint="light" style={stylesEnhanced.stationsBlur}>
              <View style={stylesEnhanced.stationsContent}>
                <View style={stylesEnhanced.stationRow}>
                  <View style={stylesEnhanced.stationDot} />
                  <Text style={stylesEnhanced.stationText}>{primeraEstacion}</Text>
                </View>
                
                <View style={stylesEnhanced.lineConnector} />
                
                <View style={stylesEnhanced.stationRow}>
                  <View style={[stylesEnhanced.stationDot, stylesEnhanced.lastStationDot]} />
                  <Text style={stylesEnhanced.stationText}>{ultimaEstacion}</Text>
                </View>
              </View>
            </BlurView>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  // Versión no seleccionada
  return (
    <TouchableOpacity
      onPress={onSelect}
      style={stylesEnhanced.defaultContainer}
    >
      {/* ... contenido similar a la versión simple ... */}
    </TouchableOpacity>
  )
}

const stylesEnhanced = StyleSheet.create({
  gradientContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  defaultContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 8,
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  selectedIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  infoContainer: {
    flex: 1,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#FFFFFF",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  selectedDetailText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
  selectedChevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  stationsWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  stationsBlur: {
    borderRadius: 12,
    overflow: "hidden",
  },
  stationsContent: {
    padding: 12,
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
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  lastStationDot: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderColor: "#FFFFFF",
  },
  lineConnector: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginLeft: 5,
    marginVertical: 2,
  },
  stationText: {
    fontSize: 12,
    color: "#FFFFFF",
    flex: 1,
  },
})

export default TelefericoCard