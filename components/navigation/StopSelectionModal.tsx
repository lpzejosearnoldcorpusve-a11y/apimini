"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import type { NavigationDestination } from "@/types/navigation"
import type { Coordenada, Estacion } from "@/types/transport"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import {
    ArrowRight,
    ChevronRight,
    CircleDot,
    Flag,
    MapPin,
    Navigation2,
    X,
} from "lucide-react-native"
import React, { useState } from "react"
import {
    Dimensions,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

type StopType = 'inicio' | 'fin'

interface MinibusStop {
  index: number
  coordenada: Coordenada
  name: string
}

interface StopSelectionModalProps {
  visible: boolean
  onClose: () => void
  onSelectStop: (destination: NavigationDestination) => void
  
  // Para minibuses
  minibusStops?: MinibusStop[]
  minibusName?: string
  
  // Para teleféricos
  estaciones?: Estacion[]
  telefericoName?: string
  telefericoColor?: string
  
  type: 'minibus' | 'teleferico'
}

export function StopSelectionModal({
  visible,
  onClose,
  onSelectStop,
  minibusStops,
  minibusName,
  estaciones,
  telefericoName,
  telefericoColor = COLORS.primary,
  type,
}: StopSelectionModalProps) {
  const [selectedType, setSelectedType] = useState<StopType>('inicio')

  const themeColor = type === 'teleferico' ? telefericoColor : COLORS.primary
  const transportName = type === 'teleferico' ? telefericoName : minibusName

  const handleSelectStop = (stop: { name: string; lat: number; lng: number }) => {
    const destination: NavigationDestination = {
      name: stop.name,
      lat: stop.lat,
      lng: stop.lng,
      type: type === 'teleferico' ? 'estacion' : 'parada',
    }
    onSelectStop(destination)
  }

  // Obtener paradas de inicio y fin
  const getStartAndEndStops = () => {
    if (type === 'teleferico' && estaciones) {
      const sorted = [...estaciones].sort((a, b) => a.orden - b.orden)
      return {
        inicio: sorted[0],
        fin: sorted[sorted.length - 1],
      }
    } else if (type === 'minibus' && minibusStops) {
      return {
        inicio: minibusStops[0],
        fin: minibusStops[minibusStops.length - 1],
      }
    }
    return { inicio: null, fin: null }
  }

  const { inicio, fin } = getStartAndEndStops()

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={30} tint="dark" style={styles.blurOverlay} />
        
        <View style={styles.modalContainer}>
          {/* Header */}
          <LinearGradient
            colors={[themeColor, `${themeColor}dd`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <Navigation2 size={28} color="#fff" />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>¿Cómo llegar?</Text>
                <Text style={styles.headerSubtitle}>{transportName}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Tabs de selección */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedType === 'inicio' && styles.tabActive
                ]}
                onPress={() => setSelectedType('inicio')}
              >
                <CircleDot 
                  size={18} 
                  color={selectedType === 'inicio' ? themeColor : 'rgba(255,255,255,0.7)'} 
                />
                <Text style={[
                  styles.tabText,
                  selectedType === 'inicio' && styles.tabTextActive
                ]}>
                  Parada Inicial
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedType === 'fin' && styles.tabActive
                ]}
                onPress={() => setSelectedType('fin')}
              >
                <Flag 
                  size={18} 
                  color={selectedType === 'fin' ? themeColor : 'rgba(255,255,255,0.7)'} 
                />
                <Text style={[
                  styles.tabText,
                  selectedType === 'fin' && styles.tabTextActive
                ]}>
                  Parada Final
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Contenido */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Acceso rápido */}
            <View style={styles.quickAccessSection}>
              <Text style={styles.sectionTitle}>Acceso rápido</Text>
              
              <View style={styles.quickAccessCards}>
                {/* Card de inicio */}
                {inicio && (
                  <TouchableOpacity
                    style={[
                      styles.quickAccessCard,
                      selectedType === 'inicio' && styles.quickAccessCardActive,
                      { borderColor: selectedType === 'inicio' ? themeColor : COLORS.border }
                    ]}
                    onPress={() => {
                      if (type === 'teleferico') {
                        handleSelectStop({
                          name: (inicio as Estacion).nombre,
                          lat: (inicio as Estacion).lat,
                          lng: (inicio as Estacion).lng,
                        })
                      } else {
                        handleSelectStop({
                          name: (inicio as MinibusStop).name,
                          lat: (inicio as MinibusStop).coordenada.lat,
                          lng: (inicio as MinibusStop).coordenada.lng,
                        })
                      }
                    }}
                  >
                    <View style={[styles.quickAccessIcon, { backgroundColor: `${themeColor}15` }]}>
                      <CircleDot size={24} color={themeColor} />
                    </View>
                    <View style={styles.quickAccessInfo}>
                      <Text style={styles.quickAccessLabel}>Inicio de ruta</Text>
                      <Text style={styles.quickAccessName} numberOfLines={1}>
                        {type === 'teleferico' 
                          ? (inicio as Estacion).nombre 
                          : (inicio as MinibusStop).name}
                      </Text>
                    </View>
                    <View style={[styles.goButton, { backgroundColor: themeColor }]}>
                      <ArrowRight size={18} color="#fff" />
                    </View>
                  </TouchableOpacity>
                )}

                {/* Card de fin */}
                {fin && (
                  <TouchableOpacity
                    style={[
                      styles.quickAccessCard,
                      selectedType === 'fin' && styles.quickAccessCardActive,
                      { borderColor: selectedType === 'fin' ? themeColor : COLORS.border }
                    ]}
                    onPress={() => {
                      if (type === 'teleferico') {
                        handleSelectStop({
                          name: (fin as Estacion).nombre,
                          lat: (fin as Estacion).lat,
                          lng: (fin as Estacion).lng,
                        })
                      } else {
                        handleSelectStop({
                          name: (fin as MinibusStop).name,
                          lat: (fin as MinibusStop).coordenada.lat,
                          lng: (fin as MinibusStop).coordenada.lng,
                        })
                      }
                    }}
                  >
                    <View style={[styles.quickAccessIcon, { backgroundColor: `${themeColor}15` }]}>
                      <Flag size={24} color={themeColor} />
                    </View>
                    <View style={styles.quickAccessInfo}>
                      <Text style={styles.quickAccessLabel}>Final de ruta</Text>
                      <Text style={styles.quickAccessName} numberOfLines={1}>
                        {type === 'teleferico' 
                          ? (fin as Estacion).nombre 
                          : (fin as MinibusStop).name}
                      </Text>
                    </View>
                    <View style={[styles.goButton, { backgroundColor: themeColor }]}>
                      <ArrowRight size={18} color="#fff" />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Lista completa de paradas/estaciones */}
            <View style={styles.allStopsSection}>
              <Text style={styles.sectionTitle}>
                {type === 'teleferico' ? 'Todas las estaciones' : 'Todas las paradas'}
              </Text>

              <View style={styles.stopsTimeline}>
                {type === 'teleferico' && estaciones ? (
                  [...estaciones]
                    .sort((a, b) => a.orden - b.orden)
                    .map((estacion, index) => (
                      <TouchableOpacity
                        key={estacion.id}
                        style={styles.stopItem}
                        onPress={() => handleSelectStop({
                          name: estacion.nombre,
                          lat: estacion.lat,
                          lng: estacion.lng,
                        })}
                      >
                        <View style={styles.stopTimeline}>
                          <View 
                            style={[
                              styles.stopDot,
                              index === 0 && styles.stopDotFirst,
                              index === estaciones.length - 1 && styles.stopDotLast,
                              { 
                                borderColor: themeColor,
                                backgroundColor: index === 0 || index === estaciones.length - 1 
                                  ? themeColor 
                                  : '#fff' 
                              }
                            ]}
                          />
                          {index < estaciones.length - 1 && (
                            <View style={[styles.stopLine, { backgroundColor: `${themeColor}40` }]} />
                          )}
                        </View>
                        <View style={styles.stopContent}>
                          <Text style={styles.stopName}>{estacion.nombre}</Text>
                          <Text style={styles.stopSubtext}>
                            Estación {index + 1} de {estaciones.length}
                          </Text>
                        </View>
                        <ChevronRight size={20} color={COLORS.textLight} />
                      </TouchableOpacity>
                    ))
                ) : minibusStops ? (
                  minibusStops.map((stop, index) => (
                    <TouchableOpacity
                      key={stop.index}
                      style={styles.stopItem}
                      onPress={() => handleSelectStop({
                        name: stop.name,
                        lat: stop.coordenada.lat,
                        lng: stop.coordenada.lng,
                      })}
                    >
                      <View style={styles.stopTimeline}>
                        <View 
                          style={[
                            styles.stopDot,
                            index === 0 && styles.stopDotFirst,
                            index === minibusStops.length - 1 && styles.stopDotLast,
                            { 
                              borderColor: themeColor,
                              backgroundColor: index === 0 || index === minibusStops.length - 1 
                                ? themeColor 
                                : '#fff' 
                            }
                          ]}
                        />
                        {index < minibusStops.length - 1 && (
                          <View style={[styles.stopLine, { backgroundColor: `${themeColor}40` }]} />
                        )}
                      </View>
                      <View style={styles.stopContent}>
                        <Text style={styles.stopName}>{stop.name}</Text>
                        <Text style={styles.stopSubtext}>
                          Parada {index + 1} de {minibusStops.length}
                        </Text>
                      </View>
                      <ChevronRight size={20} color={COLORS.textLight} />
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <MapPin size={48} color={COLORS.textLight} />
                    <Text style={styles.emptyText}>No hay paradas disponibles</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: "90%",
    overflow: "hidden",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? SPACING.lg : SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  tabActive: {
    backgroundColor: "#fff",
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  tabTextActive: {
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  quickAccessSection: {
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  quickAccessCards: {
    gap: SPACING.sm,
  },
  quickAccessCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
    ...SHADOWS.sm,
  },
  quickAccessCardActive: {
    ...SHADOWS.md,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  quickAccessInfo: {
    flex: 1,
  },
  quickAccessLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  quickAccessName: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 2,
  },
  goButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  allStopsSection: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  stopsTimeline: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  stopItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    paddingRight: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  stopTimeline: {
    width: 48,
    alignItems: "center",
  },
  stopDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    zIndex: 1,
  },
  stopDotFirst: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 4,
  },
  stopDotLast: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 4,
  },
  stopLine: {
    position: "absolute",
    top: 16,
    width: 3,
    height: 48,
  },
  stopContent: {
    flex: 1,
  },
  stopName: {
    fontSize: FONT_SIZES.md,
    fontWeight: "500",
    color: COLORS.text,
  },
  stopSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
})
