export const theme = {
  colors: {
    bg: "#0B0B0F",
    card: "#15151B",
    cardElevated: "#1C1C24",
    border: "#26262E",
    text: "#F2F2F4",
    textMuted: "#8A8A94",
    textDim: "#5A5A66",
    accent: "#F2C75C",
    accentDark: "#D9A93B",
    quiet: "#E26A6A",
    ok: "#4CB28E",
    info: "#6CA9F0",
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 6, md: 12, lg: 18, xl: 24, full: 999 },
} as const;

export type Theme = typeof theme;
