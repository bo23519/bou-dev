/**
 * ZZZ-inspired color palette
 * Centralized color constants for consistent theming
 */
export const colors = {
  // Background colors
  darkGrey: "#181818",
  darkGreyLight: "#1a1a1a",
  darkGreyLighter: "#1c1c1c",
  
  // Text colors
  textPrimary: "#EFF0EF",
  textSecondary: "#787878",
  textMuted: "#767678",
  textDark: "#222122",
  textWhiteGrey: "#E8E8E8",
  
  // Accent colors
  neonGreen: "#D8FA00",
  neonGreenHover: "#C8E600",
  miyabiBlue: "#22C6CE",
  billyRed: "#D74441",
  
  // Border colors
  borderGrey: "#767678",
  borderGreyHover: "#9ca3af",
} as const;

/**
 * CSS variable names for use in Tailwind config or inline styles
 */
export const colorVars = {
  darkGrey: "var(--zzz-dark-grey)",
  textPrimary: "var(--zzz-text-primary)",
  neonGreen: "var(--zzz-neon-green)",
} as const;
