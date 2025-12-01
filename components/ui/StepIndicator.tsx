import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/theme"
import React from "react"
import { StyleSheet, Text, View } from "react-native"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  labels?: string[]
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <View
              style={[styles.step, index < currentStep && styles.completed, index === currentStep && styles.active]}
            >
              <Text style={[styles.stepNumber, (index < currentStep || index === currentStep) && styles.activeText]}>
                {index < currentStep ? "✓" : index + 1}
              </Text>
            </View>
            {index < totalSteps - 1 && (
              <View style={[styles.connector, index < currentStep && styles.connectorCompleted]} />
            )}
          </React.Fragment>
        ))}
      </View>
      {labels && labels[currentStep] && <Text style={styles.label}>{labels[currentStep]}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  step: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  completed: {
    backgroundColor: COLORS.primary,
  },
  active: {
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
  },
  stepNumber: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  activeText: {
    color: COLORS.white,
  },
  connector: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.border,
  },
  connectorCompleted: {
    backgroundColor: COLORS.primary,
  },
  label: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
})
