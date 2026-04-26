export const theme = {
  colors: {
    bg: "#0B0C10",
    card: "#14151C",
    cardElevated: "#1C1E26",
    border: "#272A35",
    text: "#F8F8F8",
    textMuted: "#8B8E98",
    textDim: "#5C5F69",
    accent: "#E0FF4F",
    accentDark: "#C8E639",
    quiet: "#FF4A60",
    ok: "#00E5FF",
    info: "#9D4EDD",
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 6, md: 12, lg: 18, xl: 24, full: 999 },
} as const;

export type Theme = typeof theme;
