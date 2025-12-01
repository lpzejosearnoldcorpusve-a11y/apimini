import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from "@/constants/theme"
import { useHaptics } from "@/hooks/useHaptics"
import { LinearGradient } from "expo-linear-gradient"
import type React from "react"
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, type TextStyle, type ViewStyle } from "react-native"

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  style?: ViewStyle
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const { medium } = useHaptics()

  const handlePress = () => {
    if (!disabled && !loading) {
      medium()
      onPress()
    }
  }

  const sizeStyles = {
    sm: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
    md: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
    lg: { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl },
  }

  const textSizes = {
    sm: FONT_SIZES.sm,
    md: FONT_SIZES.md,
    lg: FONT_SIZES.lg,
  }

  if (variant === "primary") {
    return (
      <TouchableOpacity onPress={handlePress} disabled={disabled || loading} activeOpacity={0.8} style={style}>
        <LinearGradient
          colors={disabled ? [COLORS.disabled, COLORS.disabled] : [COLORS.gradientStart, COLORS.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, sizeStyles[size], SHADOWS.md]}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              {icon}
              <Text style={[styles.text, { fontSize: textSizes[size] }]}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  const variantStyles: Record<string, { button: ViewStyle; text: TextStyle }> = {
    secondary: {
      button: { backgroundColor: COLORS.primaryLight },
      text: { color: COLORS.primaryDark },
    },
    outline: {
      button: { backgroundColor: "transparent", borderWidth: 2, borderColor: COLORS.primary },
      text: { color: COLORS.primary },
    },
    ghost: {
      button: { backgroundColor: "transparent" },
      text: { color: COLORS.primary },
    },
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[styles.button, sizeStyles[size], variantStyles[variant].button, disabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, variantStyles[variant].text, { fontSize: textSizes[size] }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  text: {
    color: COLORS.white,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
})
