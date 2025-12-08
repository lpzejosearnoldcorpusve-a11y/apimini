"use client"

import { NFCScannerModal } from "@/components/tarjetas/NFCScannerModal"
import { TarjetasVinculadasSection } from "@/components/tarjetas/TarjetasVinculadasSection"
import { VincularTarjetaModal } from "@/components/tarjetas/VincularTarjetaModal"
import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { useAuth } from "@/context/AuthContext"
import { useMisTarjetas } from "@/hooks/useMisTarjetas"
import { useNFC } from "@/hooks/useNFC"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const RATES = [
  { type: "Minibus", price: "Bs. 2.00 - 3.50", icon: "bus" as const, color: COLORS.primary },
  { type: "PumaKatari", price: "Bs. 2.00", icon: "bus" as const, color: COLORS.secondary },
  { type: "Teleferico", price: "Bs. 3.00", icon: "git-network" as const, color: "#FF6B6B" },
  { type: "Teleferico (Integrado)", price: "Bs. 5.00", icon: "git-network" as const, color: "#9B59B6" },
]

export function RatesScreen() {
  const { user } = useAuth()
  const [showVincularModal, setShowVincularModal] = useState(false)
  const [showNFCModal, setShowNFCModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const { isSupported, isScanning, lastScannedCard, error: nfcError, startScan, clearLastCard } = useNFC()
  const { tarjetas, loading, error, refetch } = useMisTarjetas()

  const handleVincularSuccess = () => {
    // Refrescar las tarjetas vinculadas después de vincular una nueva
    refetch()
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  return (
    <View style={styles.container}>
      {/* Header con gradiente */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <SafeAreaView edges={["top"]}>
          <Text style={styles.title}>Tarifas</Text>
          <Text style={styles.subtitle}>Precios y gestion de tarjetas</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            title="Actualizando tarjetas..."
            titleColor={COLORS.textSecondary}
          />
        }
      >
        {/* Seccion de Tarjetas Vinculadas */}
        <TarjetasVinculadasSection
          tarjetas={tarjetas}
          loading={loading}
          error={error}
          onRefresh={refetch}
        />

        {/* Seccion de Acciones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Ionicons name="card" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>Tarjetas RFID</Text>
          </View>

          {/* Card de Vincular Tarjeta */}
          <TouchableOpacity style={styles.actionCard} onPress={() => setShowVincularModal(true)}>
            <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + "15" }]}>
              <Ionicons name="link" size={28} color={COLORS.primary} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Vincular Tarjeta</Text>
              <Text style={styles.actionDescription}>Busca y vincula tu tarjeta RFID por numero de celular</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.gray100} />
          </TouchableOpacity>

          {/* Card de NFC Scanner */}
          <TouchableOpacity style={styles.actionCard} onPress={() => setShowNFCModal(true)}>
            <View style={[styles.actionIcon, { backgroundColor: COLORS.secondary + "15" }]}>
              <Ionicons name="wifi" size={28} color={COLORS.secondary} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Lector NFC</Text>
              <Text style={styles.actionDescription}>Acerca tu tarjeta al telefono para ver su informacion</Text>
            </View>
            <View style={styles.nfcBadge}>
              <Text style={styles.nfcBadgeText}>NFC</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={COLORS.primary} />
          <Text style={styles.infoText}>Los precios pueden variar segun la distancia y el tipo de servicio</Text>
        </View>

        {/* Lista de Tarifas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: COLORS.secondary + "15" }]}>
              <Ionicons name="pricetag" size={20} color={COLORS.secondary} />
            </View>
            <Text style={styles.sectionTitle}>Tarifas estandar</Text>
          </View>

          {RATES.map((rate, index) => (
            <View key={index} style={styles.rateCard}>
              <View style={[styles.rateIcon, { backgroundColor: rate.color + "15" }]}>
                <Ionicons name={rate.icon} size={24} color={rate.color} />
              </View>
              <View style={styles.rateInfo}>
                <Text style={styles.rateType}>{rate.type}</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={[styles.ratePrice, { color: rate.color }]}>{rate.price}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Notas */}
        <View style={styles.noteCard}>
          <View style={styles.noteHeader}>
            <Ionicons name="document-text" size={20} color={COLORS.text} />
            <Text style={styles.noteTitle}>Notas importantes</Text>
          </View>
          <View style={styles.noteList}>
            <NoteItem icon="school" text="Estudiantes y tercera edad tienen descuentos especiales" />
            <NoteItem icon="moon" text="Las tarifas nocturnas pueden tener un recargo adicional" />
            <NoteItem icon="card" text="Se acepta pago en efectivo y tarjeta prepago RFID" />
            <NoteItem icon="phone-portrait" text="Dispositivos con NFC pueden consultar saldo de tarjetas" />
          </View>
        </View>
      </ScrollView>

      {/* Modales */}
      <VincularTarjetaModal
        visible={showVincularModal}
        onClose={() => setShowVincularModal(false)}
        usuarioAppId={user?.id || ""}
        onSuccess={handleVincularSuccess}
      />

      <NFCScannerModal
        visible={showNFCModal}
        onClose={() => setShowNFCModal(false)}
        isScanning={isScanning}
        isSupported={isSupported}
        scannedCard={lastScannedCard}
        error={nfcError}
        onStartScan={startScan}
        onClearCard={clearLastCard}
      />
    </View>
  )
}

function NoteItem({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.noteItem}>
      <Ionicons name={icon} size={16} color={COLORS.textSecondary} />
      <Text style={styles.noteText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "700",
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white + "CC",
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: COLORS.text,
  },
  // Action Cards
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  actionInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  actionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  actionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  nfcBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  nfcBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.white,
  },
  // Info Card
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "10",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primaryDark,
    lineHeight: 20,
  },
  // Rate Cards
  rateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  rateIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
  },
  rateInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  rateType: {
    fontSize: FONT_SIZES.md,
    fontWeight: "500",
    color: COLORS.text,
  },
  priceContainer: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  ratePrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
  },
  // Notes
  noteCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  noteTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.text,
  },
  noteList: {
    gap: SPACING.sm,
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
  },
  noteText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
})
