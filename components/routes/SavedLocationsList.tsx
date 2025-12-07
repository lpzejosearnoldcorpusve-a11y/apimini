import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import type { SavedLocation } from "@/types/location"
import { Ionicons } from "@expo/vector-icons"
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface SavedLocationsListProps {
  locations: SavedLocation[]
  onSelect: (location: SavedLocation) => void
  onDelete: (id: string) => void
  onAddNew: (type: "home" | "work" | "other") => void
}

export function SavedLocationsList({ locations, onSelect, onDelete, onAddNew }: SavedLocationsListProps) {
  const getLocationIcon = (type: SavedLocation["type"]) => {
    switch (type) {
      case "home":
        return "home"
      case "work":
        return "briefcase"
      case "other":
        return "location"
    }
  }

  const getLocationColor = (type: SavedLocation["type"]) => {
    switch (type) {
      case "home":
        return COLORS.secondary
      case "work":
        return COLORS.accent
      case "other":
        return COLORS.primary
    }
  }

  const homeLocation = locations.find((l) => l.type === "home")
  const workLocation = locations.find((l) => l.type === "work")
  const otherLocations = locations.filter((l) => l.type === "other")

  const handleDelete = (location: SavedLocation) => {
    Alert.alert("Eliminar ubicación", `¿Eliminar "${location.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => onDelete(location.id) },
    ])
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ubicaciones Guardadas</Text>

      {/* Casa */}
      {homeLocation ? (
        <TouchableOpacity style={styles.locationCard} onPress={() => onSelect(homeLocation)}>
          <View style={[styles.iconContainer, { backgroundColor: COLORS.secondary + "20" }]}>
            <Ionicons name="home" size={24} color={COLORS.secondary} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>{homeLocation.name}</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>
              {homeLocation.address}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(homeLocation)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.addLocationCard} onPress={() => onAddNew("home")}>
          <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
          <Text style={styles.addLocationText}>Agregar Casa</Text>
        </TouchableOpacity>
      )}

      {/* Trabajo */}
      {workLocation ? (
        <TouchableOpacity style={styles.locationCard} onPress={() => onSelect(workLocation)}>
          <View style={[styles.iconContainer, { backgroundColor: COLORS.accent + "20" }]}>
            <Ionicons name="briefcase" size={24} color={COLORS.accent} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>{workLocation.name}</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>
              {workLocation.address}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(workLocation)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.addLocationCard} onPress={() => onAddNew("work")}>
          <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
          <Text style={styles.addLocationText}>Agregar Trabajo</Text>
        </TouchableOpacity>
      )}

      {/* Otros lugares */}
      {otherLocations.map((location) => (
        <TouchableOpacity key={location.id} style={styles.locationCard} onPress={() => onSelect(location)}>
          <View style={[styles.iconContainer, { backgroundColor: COLORS.primary + "20" }]}>
            <Ionicons name="location" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>{location.name}</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>
              {location.address}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(location)} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.addLocationCard} onPress={() => onAddNew("other")}>
        <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
        <Text style={styles.addLocationText}>Agregar Otro Lugar</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginTop: SPACING.xl },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
  },
  locationInfo: { flex: 1, marginLeft: SPACING.md },
  locationName: { fontSize: FONT_SIZES.md, fontWeight: "600", color: COLORS.text },
  locationAddress: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  deleteButton: { padding: SPACING.sm },
  addLocationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  addLocationText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: "500",
    marginLeft: SPACING.sm,
  },
})
