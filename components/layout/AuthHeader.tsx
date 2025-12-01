import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/theme"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

interface AuthHeaderProps {
  title: string
  subtitle: string
  showLogo?: boolean
}

export function AuthHeader({ title, subtitle, showLogo = true }: AuthHeaderProps) {
  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.header}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.headerContent}>
          {showLogo && (
            <View style={styles.logoContainer}>
              <Ionicons name="bus" size={48} color={COLORS.white} />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: SPACING.xxl,
  },
  headerContent: {
    alignItems: "center",
    paddingTop: SPACING.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.hero,
    fontWeight: "700",
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: "rgba(255,255,255,0.9)",
    marginTop: SPACING.xs,
  },
})
