import { LinearGradient } from "expo-linear-gradient"
import { Cable, CheckCircle2 } from "lucide-react-native"
import React from "react"
import { Platform, StyleSheet, Text, View } from "react-native"

interface TelefericoHeaderProps {
  totalLines: number
  operatingLines: number
}

export function TelefericoHeader({ totalLines, operatingLines }: TelefericoHeaderProps) {
  return (
    <LinearGradient
      colors={["#ef4444", "#f97316"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.headerContent}>
        <View style={styles.titleSection}>
          <View style={styles.iconContainer}>
            <Cable size={26} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.title}>Teleféricos</Text>
            <Text style={styles.subtitle}>Mi Teleférico - La Paz</Text>
          </View>
        </View>

        {/* Estado operativo */}
        <View style={styles.statusContainer}>
          <CheckCircle2 size={20} color="#86efac" />
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>
              {operatingLines} de {totalLines} líneas operando
            </Text>
            <Text style={styles.statusSubtitle}>Actualizado hace 5 min</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 32,
    paddingBottom: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    width: "100%",
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: -0.5,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
})