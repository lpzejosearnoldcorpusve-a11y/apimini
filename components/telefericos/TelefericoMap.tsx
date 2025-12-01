"use client"

import { MapView } from "@/components/maps/MapView"
import type { Teleferico } from "@/types/transport"
import React from "react"
import { StyleSheet, View } from "react-native"

interface TelefericoMapProps {
  telefericos: Teleferico[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function TelefericoMap({ telefericos, selectedId, onSelect }: TelefericoMapProps) {
  const stations = telefericos.map((t) => ({
    lineId: t.id,
    stations: t.estaciones,
    color: t.color,
    lineName: t.nombre,
  }))

  // Si quieres también mostrar las rutas como líneas (opcional)
  const routes = telefericos.map((t) => {
    const coordinates = t.estaciones.map(e => ({ lat: e.lat, lng: e.lng }))
    return {
      id: t.id,
      coordinates,
      color: t.color,
      name: t.nombre,
      type: 'cable' as const,
    }
  })

  return (
    <View style={styles.container}>
      <MapView 
        stations={stations}
        routes={routes} 
        selectedRouteId={selectedId} 
        onRouteSelect={onSelect} 
        zoom={12}
        height={400}
        showControls={true}
        trackUserLocation={true}
      />
    </View>
  )
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

// Si tu tipo Teleferico no tiene tarifa y frecuencia, puedes usar esto:
interface TelefericoMapPropsSimple {
  telefericos: Teleferico[]
  selectedId: string | null
  onSelect: (id: string) => void
  height?: number
  showControls?: boolean
}

export function TelefericoMapSimple({ 
  telefericos, 
  selectedId, 
  onSelect, 
  height = 400,
  showControls = true 
}: TelefericoMapPropsSimple) {
  const stations = telefericos.map((t) => ({
    lineId: t.id,
    stations: t.estaciones,
    color: t.color,
    lineName: t.nombre,
  }))

  return (
    <View style={[styles.container, { height }]}>
      <MapView 
        stations={stations}
        selectedRouteId={selectedId} 
        onRouteSelect={onSelect} 
        zoom={12}
        height={height}
        showControls={showControls}
        trackUserLocation={true}
      />
    </View>
  )
}