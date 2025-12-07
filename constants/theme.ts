// @/constants/theme.ts
export const COLORS = {
  primary: "#00A99D", // Turquesa principal
  primaryDark: "#008B82", // Turquesa oscuro
  primaryLight: "#4DC4BB", // Turquesa claro

  secondary: "#00BFFF", // Celeste
  secondaryDark: "#0099CC", // Celeste oscuro
  secondaryLight: "#66D4FF", // Celeste claro

  // Acentos
  accent: "#FF6B35", // Naranja para CTAs
  success: "#28A745",
  warning: "#FFC107",
  error: "#DC3545",
  gray100: "#e9ecef",
  black: "#1A1A2E",
  // Neutros
  white: "#FFFFFF",
  background: "#F5F9FA",
  surface: "#FFFFFF",
  text: "#1A1A2E",
  textSecondary: "#6B7280",
  textLight: "#9CA3AF",
  border: "#E5E7EB",
  disabled: "#D1D5DB",

  // Para bordes sutiles
  borderLight: "#F3F4F6",

  // Gradientes
  gradientStart: "#00A99D",
  gradientEnd: "#00BFFF",
}

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  hero: 40,
}

export const BORDER_RADIUS = {
  xs: 6,      // 🔥 Nuevo: muy pequeño
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
}

export const SHADOWS = {
  // 🔥 Agregado xs (extra small) - sombra muy sutil
  xs: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // 🔥 Nuevo: extra large
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  
  // 🔥 Nuevo: sombras con colores
  primary: {
    shadowColor: "#00A99D", // Tu color primario
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  accent: {
    shadowColor: "#FF6B35", // Tu color de acento
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // 🔥 Nuevo: para modales/dialogs
  modal: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
}

// 🔥 OPCIONAL: Sistema de transiciones/animation
export const TRANSITIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
}

// 🔥 OPCIONAL: Z-index system
export const Z_INDEX = {
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
}

// 🔥 OPCIONAL: Gradientes predefinidos
export const GRADIENTS = {
  primary: ["#00A99D", "#00BFFF"],
  secondary: ["#00BFFF", "#66D4FF"],
  accent: ["#FF6B35", "#FF8B5C"],
  subtle: ["#FFFFFF", "#F5F9FA"],
}

// 🔥 OPCIONAL: Typography system
export const TYPOGRAPHY = {
  regular: {
    fontFamily: "System",
    fontWeight: "400" as const,
  },
  medium: {
    fontFamily: "System",
    fontWeight: "500" as const,
  },
  semibold: {
    fontFamily: "System",
    fontWeight: "600" as const,
  },
  bold: {
    fontFamily: "System",
    fontWeight: "700" as const,
  },
}

// 🔥 OPCIONAL: Breakpoints (para responsive)
export const BREAKPOINTS = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
}

// 🔥 OPCIONAL: Opacidades útiles
export const OPACITIES = {
  disabled: 0.5,
  hover: 0.8,
  pressed: 0.6,
  overlay: 0.4,
}