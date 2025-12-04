"use client"

import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native"

interface Settings {
  notifications: {
    push: boolean
    email: boolean
    promotions: boolean
    tripUpdates: boolean
    routeAlerts: boolean
  }
  accessibility: {
    largeText: boolean
    highContrast: boolean
    reduceMotion: boolean
    screenReader: boolean
  }
  privacy: {
    shareLocation: boolean
    analytics: boolean
    personalizedAds: boolean
  }
  appearance: {
    theme: "light" | "dark" | "system"
    language: string
  }
  transport: {
    preferredType: "all" | "minibus" | "teleferico"
    avoidCrowded: boolean
    accessibleRoutes: boolean
  }
}

interface SettingsModalProps {
  visible: boolean
  onClose: () => void
}

const DEFAULT_SETTINGS: Settings = {
  notifications: {
    push: true,
    email: false,
    promotions: false,
    tripUpdates: true,
    routeAlerts: true,
  },
  accessibility: {
    largeText: false,
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
  },
  privacy: {
    shareLocation: true,
    analytics: true,
    personalizedAds: false,
  },
  appearance: {
    theme: "system",
    language: "es",
  },
  transport: {
    preferredType: "all",
    avoidCrowded: false,
    accessibleRoutes: false,
  },
}

type SectionType = "notifications" | "accessibility" | "privacy" | "appearance" | "transport"

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [activeSection, setActiveSection] = useState<SectionType | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const updateSetting = <T extends keyof Settings>(category: T, key: keyof Settings[T], value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    Alert.alert("Guardado", "Tu configuracion ha sido guardada")
    setHasChanges(false)
  }

  const handleReset = () => {
    Alert.alert("Restablecer", "Estas seguro de restablecer la configuracion por defecto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Restablecer",
        style: "destructive",
        onPress: () => {
          setSettings(DEFAULT_SETTINGS)
          setHasChanges(true)
        },
      },
    ])
  }

  const handleClearCache = () => {
    Alert.alert("Limpiar cache", "Esto eliminara los datos temporales de la aplicacion", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Limpiar",
        onPress: () => {
          Alert.alert("Listo", "Cache limpiado correctamente")
        },
      },
    ])
  }

  const renderSettingSwitch = (
    label: string,
    description: string,
    value: boolean,
    onChange: (val: boolean) => void,
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.border, true: COLORS.primary + "50" }}
        thumbColor={value ? COLORS.primary : COLORS.textLight}
      />
    </View>
  )

  const renderSectionContent = () => {
    switch (activeSection) {
      case "notifications":
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Notificaciones</Text>
            {renderSettingSwitch(
              "Notificaciones push",
              "Recibe alertas en tiempo real",
              settings.notifications.push,
              (val) => updateSetting("notifications", "push", val),
            )}
            {renderSettingSwitch(
              "Correo electronico",
              "Recibe resumen de viajes por email",
              settings.notifications.email,
              (val) => updateSetting("notifications", "email", val),
            )}
            {renderSettingSwitch(
              "Promociones",
              "Ofertas y descuentos especiales",
              settings.notifications.promotions,
              (val) => updateSetting("notifications", "promotions", val),
            )}
            {renderSettingSwitch(
              "Actualizaciones de viaje",
              "Estado de tu viaje en curso",
              settings.notifications.tripUpdates,
              (val) => updateSetting("notifications", "tripUpdates", val),
            )}
            {renderSettingSwitch(
              "Alertas de rutas",
              "Cambios en tus rutas favoritas",
              settings.notifications.routeAlerts,
              (val) => updateSetting("notifications", "routeAlerts", val),
            )}
          </View>
        )

      case "accessibility":
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Accesibilidad</Text>
            {renderSettingSwitch(
              "Texto grande",
              "Aumenta el tamano del texto",
              settings.accessibility.largeText,
              (val) => updateSetting("accessibility", "largeText", val),
            )}
            {renderSettingSwitch(
              "Alto contraste",
              "Mejora la visibilidad de elementos",
              settings.accessibility.highContrast,
              (val) => updateSetting("accessibility", "highContrast", val),
            )}
            {renderSettingSwitch(
              "Reducir movimiento",
              "Minimiza las animaciones",
              settings.accessibility.reduceMotion,
              (val) => updateSetting("accessibility", "reduceMotion", val),
            )}
            {renderSettingSwitch(
              "Lector de pantalla",
              "Optimiza para VoiceOver/TalkBack",
              settings.accessibility.screenReader,
              (val) => updateSetting("accessibility", "screenReader", val),
            )}
          </View>
        )

      case "privacy":
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Privacidad</Text>
            {renderSettingSwitch(
              "Compartir ubicacion",
              "Permite mostrar tu ubicacion en el mapa",
              settings.privacy.shareLocation,
              (val) => updateSetting("privacy", "shareLocation", val),
            )}
            {renderSettingSwitch(
              "Analiticas",
              "Ayuda a mejorar la app con datos anonimos",
              settings.privacy.analytics,
              (val) => updateSetting("privacy", "analytics", val),
            )}
            {renderSettingSwitch(
              "Anuncios personalizados",
              "Muestra anuncios basados en tus preferencias",
              settings.privacy.personalizedAds,
              (val) => updateSetting("privacy", "personalizedAds", val),
            )}

            <TouchableOpacity style={styles.dangerBtn} onPress={handleClearCache}>
              <Ionicons name="trash-outline" size={20} color={COLORS.warning} />
              <Text style={styles.dangerBtnText}>Limpiar cache</Text>
            </TouchableOpacity>
          </View>
        )

      case "appearance":
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Apariencia</Text>

            <Text style={styles.optionLabel}>Tema</Text>
            <View style={styles.optionGroup}>
              {[
                { key: "light", label: "Claro", icon: "sunny" },
                { key: "dark", label: "Oscuro", icon: "moon" },
                { key: "system", label: "Sistema", icon: "phone-portrait" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.optionBtn, settings.appearance.theme === opt.key && styles.optionBtnActive]}
                  onPress={() => updateSetting("appearance", "theme", opt.key)}
                >
                  <Ionicons
                    name={opt.icon as any}
                    size={20}
                    color={settings.appearance.theme === opt.key ? COLORS.white : COLORS.text}
                  />
                  <Text
                    style={[styles.optionBtnText, settings.appearance.theme === opt.key && styles.optionBtnTextActive]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.optionLabel}>Idioma</Text>
            <View style={styles.optionGroup}>
              {[
                { key: "es", label: "Espanol" },
                { key: "en", label: "English" },
                { key: "ay", label: "Aymara" },
                { key: "qu", label: "Quechua" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionBtn,
                    styles.optionBtnSmall,
                    settings.appearance.language === opt.key && styles.optionBtnActive,
                  ]}
                  onPress={() => updateSetting("appearance", "language", opt.key)}
                >
                  <Text
                    style={[
                      styles.optionBtnText,
                      settings.appearance.language === opt.key && styles.optionBtnTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )

      case "transport":
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>Transporte</Text>

            <Text style={styles.optionLabel}>Tipo preferido</Text>
            <View style={styles.optionGroup}>
              {[
                { key: "all", label: "Todos", icon: "apps" },
                { key: "minibus", label: "Minibus", icon: "bus" },
                { key: "teleferico", label: "Teleferico", icon: "swap-vertical" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.optionBtn, settings.transport.preferredType === opt.key && styles.optionBtnActive]}
                  onPress={() => updateSetting("transport", "preferredType", opt.key)}
                >
                  <Ionicons
                    name={opt.icon as any}
                    size={20}
                    color={settings.transport.preferredType === opt.key ? COLORS.white : COLORS.text}
                  />
                  <Text
                    style={[
                      styles.optionBtnText,
                      settings.transport.preferredType === opt.key && styles.optionBtnTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {renderSettingSwitch(
              "Evitar rutas congestionadas",
              "Prioriza rutas con menos trafico",
              settings.transport.avoidCrowded,
              (val) => updateSetting("transport", "avoidCrowded", val),
            )}
            {renderSettingSwitch(
              "Rutas accesibles",
              "Muestra solo rutas con acceso para sillas de ruedas",
              settings.transport.accessibleRoutes,
              (val) => updateSetting("transport", "accessibleRoutes", val),
            )}
          </View>
        )

      default:
        return null
    }
  }

  const sections: { key: SectionType; icon: keyof typeof Ionicons.glyphMap; label: string; desc: string }[] = [
    { key: "notifications", icon: "notifications-outline", label: "Notificaciones", desc: "Push, email y alertas" },
    {
      key: "accessibility",
      icon: "accessibility-outline",
      label: "Accesibilidad",
      desc: "Texto, contraste y movimiento",
    },
    { key: "privacy", icon: "shield-checkmark-outline", label: "Privacidad", desc: "Ubicacion y datos" },
    { key: "appearance", icon: "color-palette-outline", label: "Apariencia", desc: "Tema e idioma" },
    { key: "transport", icon: "bus-outline", label: "Transporte", desc: "Preferencias de viaje" },
  ]

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            {activeSection ? (
              <TouchableOpacity onPress={() => setActiveSection(null)} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
              </TouchableOpacity>
            ) : null}
            <Text style={styles.title}>
              {activeSection ? sections.find((s) => s.key === activeSection)?.label : "Configuracion"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {activeSection ? (
              renderSectionContent()
            ) : (
              <>
                {sections.map((section) => (
                  <TouchableOpacity
                    key={section.key}
                    style={styles.menuItem}
                    onPress={() => setActiveSection(section.key)}
                  >
                    <View style={styles.menuIcon}>
                      <Ionicons name={section.icon} size={22} color={COLORS.primary} />
                    </View>
                    <View style={styles.menuInfo}>
                      <Text style={styles.menuLabel}>{section.label}</Text>
                      <Text style={styles.menuDesc}>{section.desc}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
                  </TouchableOpacity>
                ))}

                <View style={styles.divider} />

                <TouchableOpacity style={styles.menuItem} onPress={handleReset}>
                  <View style={[styles.menuIcon, { backgroundColor: COLORS.warning + "15" }]}>
                    <Ionicons name="refresh-outline" size={22} color={COLORS.warning} />
                  </View>
                  <View style={styles.menuInfo}>
                    <Text style={styles.menuLabel}>Restablecer configuracion</Text>
                    <Text style={styles.menuDesc}>Volver a valores por defecto</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.appInfo}>
                  <Text style={styles.appVersion}>Turuta v1.0.0</Text>
                  <Text style={styles.appBuild}>Build 2025.12.04</Text>
                </View>
              </>
            )}
          </ScrollView>

          {hasChanges && (
            <View style={styles.saveBar}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Guardar cambios</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    color: COLORS.text,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  menuInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  menuLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: "500",
    color: COLORS.text,
  },
  menuDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  appInfo: {
    alignItems: "center",
    marginTop: SPACING.xl,
  },
  appVersion: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  appBuild: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
  sectionContent: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: "500",
    color: COLORS.text,
  },
  settingDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  optionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  optionGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionBtnSmall: {
    paddingHorizontal: SPACING.md,
  },
  optionBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionBtnText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "500",
    color: COLORS.text,
  },
  optionBtnTextActive: {
    color: COLORS.white,
  },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    marginTop: SPACING.xl,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.warning + "15",
  },
  dangerBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.warning,
  },
  saveBar: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.white,
  },
})
