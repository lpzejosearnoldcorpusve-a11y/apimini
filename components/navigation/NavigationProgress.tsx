import type { RouteSegment } from "@/types/routing"
import { Bus, Cable, Check, Circle, Footprints } from "lucide-react-native"
import React from "react"
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native"

interface NavigationProgressProps {
  segments: RouteSegment[]
  currentSegmentIndex: number
  completedSegments: string[]
}

export function NavigationProgress({ 
  segments, 
  currentSegmentIndex, 
  completedSegments 
}: NavigationProgressProps) {
  const getSegmentIcon = (type: RouteSegment["type"], isCompleted: boolean, isCurrent: boolean) => {
    const iconColor = isCompleted ? "#10B981" : isCurrent ? "#0891B2" : "#9CA3AF"
    const size = isCurrent ? 18 : 14

    switch (type) {
      case "walk":
        return <Footprints size={size} color={iconColor} />
      case "minibus":
        return <Bus size={size} color={iconColor} />
      case "teleferico":
        return <Cable size={size} color={iconColor} />
      default:
        return <Circle size={size} color={iconColor} />
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.progressCard}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {segments.map((segment, index) => {
            const isCompleted = completedSegments.includes(segment.id)
            const isCurrent = index === currentSegmentIndex

            return (
              <View key={segment.id} style={styles.segmentWrapper}>
                {/* Segment Node */}
                <View style={[
                  styles.segmentContainer,
                  isCurrent && styles.currentSegmentScale
                ]}>
                  <View style={[
                    styles.segmentCircle,
                    isCompleted && styles.completedCircle,
                    isCurrent && styles.currentCircle,
                    !isCompleted && !isCurrent && styles.upcomingCircle
                  ]}>
                    {isCompleted ? (
                      <Check size={18} color="#10B981" />
                    ) : (
                      getSegmentIcon(segment.type, isCompleted, isCurrent)
                    )}
                  </View>
                  <Text 
                    style={[
                      styles.segmentLabel,
                      isCurrent ? styles.currentSegmentLabel : styles.upcomingSegmentLabel
                    ]}
                    numberOfLines={1}
                  >
                    {segment.line || segment.type}
                  </Text>
                </View>

                {/* Connector Line */}
                {index < segments.length - 1 && (
                  <View style={[
                    styles.connectorLine,
                    isCompleted ? styles.completedConnector : styles.upcomingConnector
                  ]} />
                )}
              </View>
            )
          })}
        </ScrollView>
      </View>
    </View>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 120,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  progressCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 4,
  },
  segmentWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  segmentContainer: {
    alignItems: "center",
    width: 60,
  },
  currentSegmentScale: {
    transform: [{ scale: 1.1 }],
  },
  segmentCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  completedCircle: {
    backgroundColor: "#D1FAE5",
  },
  currentCircle: {
    backgroundColor: "#E0F2FE",
    borderWidth: 2,
    borderColor: "#0891B2",
    shadowColor: "#0891B2",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  upcomingCircle: {
    backgroundColor: "#F3F4F6",
  },
  segmentLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
    maxWidth: 60,
  },
  currentSegmentLabel: {
    color: "#0E7490",
  },
  upcomingSegmentLabel: {
    color: "#6B7280",
  },
  connectorLine: {
    width: 32,
    height: 2,
    borderRadius: 1,
    marginHorizontal: 4,
  },
  completedConnector: {
    backgroundColor: "#10B981",
  },
  upcomingConnector: {
    backgroundColor: "#E5E7EB",
  },
})

export default NavigationProgress