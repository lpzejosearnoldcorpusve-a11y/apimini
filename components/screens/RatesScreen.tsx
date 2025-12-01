import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const RATES = [
  { type: "Minibus", price: "Bs. 2.00 - 3.50", icon: "bus" as const },
  { type: "PumaKatari", price: "Bs. 2.00", icon: "bus" as const },
  { type: "Teleférico", price: "Bs. 3.00", icon: "git-network" as const },
  { type: "Teleférico (Integrado)", price: "Bs. 5.00", icon: "git-network" as const },
]

export function RatesScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Text style={styles.title}>Tarifas</Text>
        <Text style={styles.subtitle}>Precios actualizados del transporte</Text>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <InfoCard />
        <RatesList rates={RATES} />
        <NotesCard />
      </ScrollView>
    </View>
  )
}

function InfoCard() {
  return (
    <View style={styles.infoCard}>
      <Ionicons name="information-circle" size={24} color={COLORS.primary} />
      <Text style={styles.infoText}>Los precios pueden variar según la distancia y el tipo de servicio</Text>
    </View>
  )
}

function RatesList({ rates }: { rates: typeof RATES }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tarifas estándar</Text>
      {rates.map((rate, index) => (
        <View key={index} style={styles.rateCard}>
          <View style={styles.rateIcon}>
            <Ionicons name={rate.icon} size={24} color={COLORS.primary} />
          </View>
          <View style={styles.rateInfo}>
            <Text style={styles.rateType}>{rate.type}</Text>
          </View>
          <Text style={styles.ratePrice}>{rate.price}</Text>
        </View>
      ))}
    </View>
  )
}

function NotesCard() {
  return (
    <View style={styles.noteCard}>
      <Text style={styles.noteTitle}>Notas importantes</Text>
      <Text style={styles.noteText}>
        • Estudiantes y tercera edad tienen descuentos especiales{"\n"}• Las tarifas nocturnas pueden tener un recargo
        adicional{"\n"}• Se acepta pago en efectivo y tarjeta prepago
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, ...SHADOWS.sm },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: "700", color: COLORS.text },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.xs },
  content: { flex: 1 },
  scrollContent: { padding: SPACING.lg },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "15",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  infoText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.primaryDark },
  section: { marginTop: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: "600", color: COLORS.text, marginBottom: SPACING.md },
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
    backgroundColor: COLORS.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  rateInfo: { flex: 1, marginLeft: SPACING.md },
  rateType: { fontSize: FONT_SIZES.md, fontWeight: "500", color: COLORS.text },
  ratePrice: { fontSize: FONT_SIZES.lg, fontWeight: "700", color: COLORS.primary },
  noteCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    ...SHADOWS.sm,
  },
  noteTitle: { fontSize: FONT_SIZES.md, fontWeight: "600", color: COLORS.text, marginBottom: SPACING.sm },
  noteText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 22 },
})
