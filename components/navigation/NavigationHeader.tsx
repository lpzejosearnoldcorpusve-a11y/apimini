import type { NavigationInstruction } from "@/types/routing"
import { BlurView } from "expo-blur"
import {
    ChevronDown,
    ChevronUp,
    Pause,
    Play,
    Volume2,
    VolumeX,
    X,
} from "lucide-react-native"
import React, { useState } from "react"
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"

interface NavigationHeaderProps {
  currentInstruction: NavigationInstruction
  nextInstruction?: NavigationInstruction
  remainingTime: number
  remainingDistance: number
  estimatedArrival: string
  onPause: () => void
  onResume: () => void
  onClose: () => void
  isPaused: boolean
  isMinimized: boolean
  onToggleMinimize: () => void
}

export function NavigationHeader({
  currentInstruction,
  nextInstruction,
  remainingTime,
  remainingDistance,
  estimatedArrival,
  onPause,
  onResume,
  onClose,
  isPaused,
  isMinimized,
  onToggleMinimize,
}: NavigationHeaderProps) {
  const [soundEnabled, setSoundEnabled] = useState(true)

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}h ${m}m`
  }

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`
    return `${(meters / 1000).toFixed(1)}km`
  }

  const getInstructionIcon = (type: NavigationInstruction["type"]) => {
    switch (type) {
      case "start":
        return "🚶"
      case "walk":
        return "🚶"
      case "board":
        return "🚌"
      case "ride":
        return "🚍"
      case "transfer":
        return "🔄"
      case "exit":
        return "🚪"
      case "arrive":
        return "📍"
      default:
        return "➡️"
    }
  }

  const getInstructionColor = (type: NavigationInstruction["type"]) => {
    switch (type) {
      case "walk":
        return "#4B5563"
      case "board":
      case "ride":
        return "#0891B2"
      case "transfer":
        return "#F59E0B"
      case "exit":
        return "#7C3AED"
      case "arrive":
        return "#10B981"
      default:
        return "#4B5563"
    }
  }

  // Versión minimizada
  if (isMinimized) {
    return (
      <TouchableOpacity
        onPress={onToggleMinimize}
        style={styles.minimizedContainer}
      >
        <View style={styles.minimizedContent}>
          <View style={styles.minimizedIconContainer}>
            <Text style={styles.minimizedIcon}>
              {getInstructionIcon(currentInstruction.type)}
            </Text>
          </View>
          <View style={styles.minimizedTextContainer}>
            <Text style={styles.minimizedMainText}>
              {currentInstruction.mainText}
            </Text>
            <Text style={styles.minimizedSubText}>
              {formatTime(remainingTime)} restantes
            </Text>
          </View>
          <ChevronDown size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    )
  }

  // Versión completa
  return (
    <View style={styles.container}>
      <BlurView intensity={95} tint="light" style={styles.blurContainer}>
        {/* Main Instruction Card */}
        <View style={[
          styles.mainInstruction,
          { backgroundColor: getInstructionColor(currentInstruction.type) }
        ]}>
          <View style={styles.mainInstructionHeader}>
            <View style={styles.instructionTitleRow}>
              <Text style={styles.instructionIcon}>
                {getInstructionIcon(currentInstruction.type)}
              </Text>
              <View style={styles.instructionTextContainer}>
                <Text style={styles.instructionStatus}>
                  {isPaused ? "Pausado" : "Ahora"}
                </Text>
                <Text style={styles.instructionMainText}>
                  {currentInstruction.mainText}
                </Text>
                {currentInstruction.subText && (
                  <Text style={styles.instructionSubText}>
                    {currentInstruction.subText}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={onToggleMinimize}
              style={styles.minimizeButton}
            >
              <ChevronUp size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>

          {currentInstruction.distance && (
            <View style={styles.distanceContainer}>
              <Text style={styles.distanceValue}>
                {currentInstruction.distance}
              </Text>
              {currentInstruction.duration && (
                <Text style={styles.distanceDuration}>
                  {currentInstruction.duration}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Next Instruction Preview */}
        {nextInstruction && (
          <View style={styles.nextInstructionContainer}>
            <View style={styles.nextInstructionContent}>
              <View style={styles.nextInstructionIcon}>
                <Text style={styles.nextIcon}>
                  {getInstructionIcon(nextInstruction.type)}
                </Text>
              </View>
              <View style={styles.nextInstructionText}>
                <Text style={styles.nextInstructionLabel}>Después</Text>
                <Text style={styles.nextInstructionMainText}>
                  {nextInstruction.mainText}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Stats & Controls */}
        <View style={styles.statsControlsContainer}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatTime(remainingTime)}
              </Text>
              <Text style={styles.statLabel}>Restante</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatDistance(remainingDistance)}
              </Text>
              <Text style={styles.statLabel}>Distancia</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.arrivalValue}>
                {estimatedArrival}
              </Text>
              <Text style={styles.statLabel}>Llegada</Text>
            </View>
          </View>

          <View style={styles.controlsContainer}>
            <TouchableOpacity
              onPress={() => setSoundEnabled(!soundEnabled)}
              style={styles.controlButton}
            >
              {soundEnabled ? (
                <Volume2 size={20} color="#4B5563" />
              ) : (
                <VolumeX size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={isPaused ? onResume : onPause}
              style={[
                styles.controlButton,
                styles.playPauseButton,
                isPaused ? styles.resumeButton : styles.pauseButton
              ]}
            >
              {isPaused ? (
                <Play size={20} color="#10B981" />
              ) : (
                <Pause size={20} color="#D97706" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={onClose}
              style={[styles.controlButton, styles.closeButton]}
            >
              <X size={20} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </View>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    zIndex: 20,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  blurContainer: {
    width: "100%",
  },
  minimizedContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  minimizedContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  minimizedIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#0891B2",
    justifyContent: "center",
    alignItems: "center",
  },
  minimizedIcon: {
    fontSize: 20,
  },
  minimizedTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  minimizedMainText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  minimizedSubText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  mainInstruction: {
    padding: 20,
  },
  mainInstructionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  instructionTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 12,
  },
  instructionIcon: {
    fontSize: 36,
  },
  instructionTextContainer: {
    flex: 1,
  },
  instructionStatus: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  instructionMainText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 2,
  },
  instructionSubText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  minimizeButton: {
    padding: 8,
    borderRadius: 20,
  },
  distanceContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  distanceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  distanceDuration: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  nextInstructionContainer: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  nextInstructionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  nextInstructionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  nextIcon: {
    fontSize: 16,
  },
  nextInstructionText: {
    flex: 1,
  },
  nextInstructionLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nextInstructionMainText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginTop: 2,
  },
  statsControlsContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  arrivalValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0891B2",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#E5E7EB",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },
  controlButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  playPauseButton: {
    backgroundColor: "transparent",
  },
  pauseButton: {
    backgroundColor: "#FEF3C7",
  },
  resumeButton: {
    backgroundColor: "#D1FAE5",
  },
  closeButton: {
    backgroundColor: "#FEE2E2",
  },
})

export default NavigationHeader