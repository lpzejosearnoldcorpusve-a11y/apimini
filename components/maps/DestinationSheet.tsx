import type { SearchResult } from "@/types/routing"
import { ChevronRight, Clock, Navigation, X } from "lucide-react-native"
import React from "react"
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native"

interface DestinationSheetProps {
  destination: SearchResult | null
  onClose: () => void
  onGetDirections: () => void
}

export function DestinationSheet({ 
  destination, 
  onClose, 
  onGetDirections 
}: DestinationSheetProps) {
  if (!destination) return null

  return (
    <View style={styles.container}>
      {/* Handle */}
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{destination.name}</Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {destination.displayName}
            </Text>
            {destination.lineInfo && (
              <View style={[
                styles.lineInfoBadge,
                destination.transportType === "teleferico" 
                  ? styles.telefericoBadge 
                  : styles.busBadge
              ]}>
                <Text style={styles.lineInfoText}>
                  {destination.lineInfo}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity 
            onPress={onClose} 
            style={styles.closeButton}
          >
            <X size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Quick Info */}
        <View style={styles.quickInfo}>
          <View style={styles.infoItem}>
            <Clock size={16} color="#0891B2" />
            <Text style={styles.infoText}>Abierto ahora</Text>
          </View>
        </View>

        {/* Como llegar button */}
        <TouchableOpacity
          onPress={onGetDirections}
          style={styles.directionsButton}
        >
          <Navigation size={20} color="#FFFFFF" />
          <Text style={styles.directionsButtonText}>Como llegar</Text>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 20,
  },
  lineInfoBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  telefericoBadge: {
    backgroundColor: "#F3E8FF",
  },
  busBadge: {
    backgroundColor: "#CFFAFE",
  },
  lineInfoText: {
    fontSize: 12,
    fontWeight: "600",
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
  },
  quickInfo: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#4B5563",
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#0891B2",
    height: 56,
    borderRadius: 16,
    shadowColor: "#0891B2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  directionsButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default DestinationSheet