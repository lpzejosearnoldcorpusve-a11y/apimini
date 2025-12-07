import type { Minibus } from "@/types/transport"
import { ChevronRight, Clock, MapPin, Route } from "lucide-react-native"
import React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface MinibusCardProps {
  minibus: Minibus
  selected: boolean
  onSelect: () => void
}

export function MinibusCard({ minibus, selected, onSelect }: MinibusCardProps) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[
        styles.container,
        selected ? styles.selectedContainer : styles.defaultContainer
      ]}
    >
      {/* Line Number */}
      <View style={[
        styles.lineContainer,
        selected ? styles.selectedLineContainer : styles.defaultLineContainer
      ]}>
        <Text style={[
          styles.lineText,
          selected ? styles.selectedLineText : styles.defaultLineText
        ]}>
          {minibus.linea}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[
          styles.title,
          selected ? styles.selectedTitle : styles.defaultTitle
        ]}>
          {minibus.sindicato}
        </Text>
        
        {/* Route Name */}
        <View style={styles.routeContainer}>
          <Route size={12} color={selected ? "rgba(255,255,255,0.8)" : "#6B7280"} />
          <Text style={[
            styles.routeText,
            selected ? styles.selectedRouteText : styles.defaultRouteText
          ]}>
            {minibus.rutaNombre}
          </Text>
        </View>

        {/* Details */}
        <View style={styles.detailsContainer}>
          {/* Stops */}
          <View style={styles.detailItem}>
            <MapPin size={12} color={selected ? "rgba(255,255,255,0.7)" : "#9CA3AF"} />
            <Text style={[
              styles.detailText,
              selected ? styles.selectedDetailText : styles.defaultDetailText
            ]}>
              {minibus.ruta.length} paradas
            </Text>
          </View>

          {/* Frequency */}
          <View style={styles.detailItem}>
            <Clock size={12} color={selected ? "rgba(255,255,255,0.7)" : "#9CA3AF"} />
            <Text style={[
              styles.detailText,
              selected ? styles.selectedDetailText : styles.defaultDetailText
            ]}>
              5-10 min
            </Text>
          </View>
        </View>
      </View>

      {/* Chevron */}
      <ChevronRight 
        size={20} 
        color={selected ? "rgba(255,255,255,0.7)" : "#D1D5DB"} 
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  defaultContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  selectedContainer: {
    backgroundColor: "linear-gradient(90deg, #06B6D4 0%, #14B8A6 100%)", // React Native no soporta gradients directamente
    shadowColor: "#06B6D4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  lineContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  defaultLineContainer: {
    backgroundColor: "#E0F2FE",
  },
  selectedLineContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  lineText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  defaultLineText: {
    color: "#0E7490",
  },
  selectedLineText: {
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  defaultTitle: {
    color: "#111827",
  },
  selectedTitle: {
    color: "#FFFFFF",
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  routeText: {
    fontSize: 12,
  },
  defaultRouteText: {
    color: "#6B7280",
  },
  selectedRouteText: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 11,
  },
  defaultDetailText: {
    color: "#9CA3AF",
  },
  selectedDetailText: {
    color: "rgba(255, 255, 255, 0.7)",
  },
})


import { LinearGradient } from "expo-linear-gradient"

export function MinibusCardWithGradient({ minibus, selected, onSelect }: MinibusCardProps) {
  if (selected) {
    return (
      <TouchableOpacity onPress={onSelect}>
        <LinearGradient
          colors={["#06B6D4", "#14B8A6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={gradientStyles.gradientContainer}
        >
          <View style={gradientStyles.gradientContent}>
            {/* Line Number */}
            <View style={styles.selectedLineContainer}>
              <Text style={styles.selectedLineText}>
                {minibus.linea}
              </Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.selectedTitle}>
                {minibus.sindicato}
              </Text>
              
              {/* Route Name */}
              <View style={styles.routeContainer}>
                <Route size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.selectedRouteText}>
                  {minibus.rutaNombre}
                </Text>
              </View>

              {/* Details */}
              <View style={styles.detailsContainer}>
                {/* Stops */}
                <View style={styles.detailItem}>
                  <MapPin size={12} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.selectedDetailText}>
                    {minibus.ruta.length} paradas
                  </Text>
                </View>

                {/* Frequency */}
                <View style={styles.detailItem}>
                  <Clock size={12} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.selectedDetailText}>
                    5-10 min
                  </Text>
                </View>
              </View>
            </View>

            {/* Chevron */}
            <ChevronRight size={20} color="rgba(255,255,255,0.7)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      onPress={onSelect}
      style={styles.defaultContainer}
    >
      {/* ... mismo contenido para no seleccionado ... */}
    </TouchableOpacity>
  )
}

const gradientStyles = StyleSheet.create({
  gradientContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#06B6D4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gradientContent: {
    flexDirection: "row",
    alignItems: "center",
  },
})

export default MinibusCard