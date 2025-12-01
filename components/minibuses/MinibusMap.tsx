"use client"

import { MapView } from "@/components/maps/MapView"
import type { Minibus } from "@/types/transport"
import React from "react"
import { StyleSheet, View } from "react-native"

interface MinibusMapProps {
  minibuses: Minibus[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function MinibusMap({ minibuses, selectedId, onSelect }: MinibusMapProps) {
  const routes = minibuses.map((m) => ({
    id: m.id,
    coordinates: m.ruta,
    color: getMinibusColor(m.linea),
    name: `Línea ${m.linea} - ${m.sindicato}`,
    type: 'bus' as const, 
    fare: undefined,
    frequency: undefined,
  }))

  return (
    <View style={styles.container}>
      <MapView 
        routes={routes} 
        selectedRouteId={selectedId} 
        onRouteSelect={onSelect} 
        zoom={13}
        height={400} 
        showControls={true}
        trackUserLocation={true}
      />
    </View>
  )
}
function getMinibusColor(linea: string): string {
  const colors = [
    "#0891b2", 
    "#059669", 
    "#7c3aed", 
    "#ea580c", 
    "#dc2626", // red
    "#2563eb", // blue
    "#db2777", // pink
    "#ca8a04", // yellow
    "#16a34a", // green
    "#4f46e5", // indigo
  ]
  
  const lineNumber = parseInt(linea.replace(/\D/g, '')) || 0
  const index = lineNumber % colors.length
  return colors[index]
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
})