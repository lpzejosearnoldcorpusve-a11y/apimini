import { Layers, Minus, Navigation, Plus } from "lucide-react-native"
import React from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"

interface MapControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onLocate: () => void
  onToggleLayers?: () => void
  locating?: boolean
}

export function MapControls({ 
  onZoomIn, 
  onZoomOut, 
  onLocate, 
  onToggleLayers, 
  locating 
}: MapControlsProps) {
  return (
    <View style={styles.container}>
      {/* Locate Button */}
      <TouchableOpacity
        onPress={onLocate}
        disabled={locating}
        style={[
          styles.button,
          styles.locateButton,
          locating && styles.locatingButton
        ]}
      >
        <Navigation 
          size={20} 
          color="#0891B2"
          style={locating && styles.spinningIcon}
        />
      </TouchableOpacity>

      {/* Zoom Controls */}
      <View style={styles.zoomContainer}>
        <TouchableOpacity
          onPress={onZoomIn}
          style={[styles.button, styles.zoomButton, styles.zoomTopButton]}
        >
          <Plus size={20} color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onZoomOut}
          style={[styles.button, styles.zoomButton]}
        >
          <Minus size={20} color="#4B5563" />
        </TouchableOpacity>
      </View>

      {/* Layers Toggle */}
      {onToggleLayers && (
        <TouchableOpacity
          onPress={onToggleLayers}
          style={[styles.button, styles.layersButton]}
        >
          <Layers size={20} color="#4B5563" />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    top: 96, // Ajustado para dejar espacio para la barra de estado y header
    flexDirection: "column",
    gap: 8,
  },
  button: {
    width: 48,
    height: 48,
    backgroundColor: "white",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  locateButton: {
    backgroundColor: "white",
  },
  locatingButton: {
    opacity: 0.8,
  },
  zoomContainer: {
    backgroundColor: "white",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  zoomButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  zoomTopButton: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  layersButton: {
    backgroundColor: "white",
  },
  spinningIcon: {
    transform: [{ rotate: "360deg" }],
  },
})

export default MapControls