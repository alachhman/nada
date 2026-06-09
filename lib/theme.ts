export const tokens = {
  colors: {
    bg: "#F7F4EE",
    surface: "#FFFFFF",
    surfaceAlt: "#FFFDF8",
    ink: "#2C2A26",
    muted: "#8A8475",
    hairline: "#ECE6D8",
    accent: "#1F1D1A",
    accentFg: "#FFFFFF",
    positive: "#5A7D5A",
    peach: "#F6C9A8",
    butter: "#F4E0A3",
    sage: "#CFE0C4",
    lilac: "#DCD2EC",
    magicBg: "#0D0F12",
    magicGlow: "#34D399",
  },
  radius: { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 },
  shadow: {
    card: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
    lifted: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 6 },
  },
} as const;

export type Tokens = typeof tokens;
