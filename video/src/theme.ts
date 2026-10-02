/**
 * Design tokens for the showcase video, ported from docs/assets/css/style.css
 * ("Glass Workbench") and Copy/Support/DesignTokens.swift.
 */
export type Theme = {
  name: "dark" | "light";
  bg: string;
  bg2: string;
  surface: string;
  surface2: string;
  line: string;
  line2: string;
  text: string;
  dim: string;
  mute: string;
  accent: string;
  accent2: string;
  accentDim: string;
  glow: string;
  shelfBg: string;
  shelfBorder: string;
  cardShadow: string;
  shelfShadow: string;
};

export const dark: Theme = {
  name: "dark",
  bg: "#0B0C0F",
  bg2: "#101217",
  surface: "#15171D",
  surface2: "#1C1F27",
  line: "#262A33",
  line2: "#333A46",
  text: "#ECEDF1",
  dim: "#A2A8B4",
  mute: "#6B7280",
  accent: "#4C9DFF",
  accent2: "#6FB0FF",
  accentDim: "#2E6FD6",
  glow: "rgba(76, 157, 255, 0.30)",
  shelfBg: "rgba(24, 27, 34, 0.80)",
  shelfBorder: "#333A46",
  cardShadow: "0 10px 30px -14px rgba(0,0,0,0.65)",
  shelfShadow: "0 24px 60px -20px rgba(0,0,0,0.7)",
};

export const light: Theme = {
  name: "light",
  bg: "#F3F4F6",
  bg2: "#E9EBEF",
  surface: "#FFFFFF",
  surface2: "#F3F4F7",
  line: "#E2E5EA",
  line2: "#CFD4DC",
  text: "#111318",
  dim: "#5B6270",
  mute: "#8A919E",
  accent: "#4C9DFF",
  accent2: "#2E7CE6",
  accentDim: "#2E6FD6",
  glow: "rgba(76, 157, 255, 0.28)",
  shelfBg: "rgba(246, 247, 249, 0.86)",
  shelfBorder: "#D4D9E1",
  cardShadow: "0 10px 30px -16px rgba(20,30,50,0.35)",
  shelfShadow: "0 24px 60px -24px rgba(20,30,50,0.45)",
};

export const fonts = {
  sans: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
  display: '"Sora", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
};

/** Syntax highlight colors used on code cards (same as the site + app). */
export const syntax = {
  key: "#c58fff",
  str: "#7ee0a1",
  com: "#6B7280",
  num: "#57c8d4",
  type: "#6fb0ff",
};

/** Card geometry, true to the app (Tokens.cardWidth / cardHeight / cardGap / cardRadius). */
export const card = {
  width: 184,
  height: 244,
  gap: 12,
  radius: 10,
};

/** Source app icon colors (gradient pairs). */
export const apps: Record<string, { label: string; from: string; to: string }> = {
  xcode: { label: "Xcode", from: "#2b7be0", to: "#155ab0" },
  safari: { label: "Safari", from: "#3a92ff", to: "#1f6fd6" },
  finder: { label: "Finder", from: "#38b0ff", to: "#1e73c8" },
  figma: { label: "Figma", from: "#a259ff", to: "#f24e1e" },
  vscode: { label: "VS Code", from: "#3b9cff", to: "#1f6fd6" },
  notes: { label: "Notes", from: "#ffd54a", to: "#f2b50c" },
  slack: { label: "Slack", from: "#e01e5a", to: "#611f69" },
  terminal: { label: "Terminal", from: "#3a3f4a", to: "#1b1e25" },
  mail: { label: "Mail", from: "#5aa9ff", to: "#2d7be6" },
  whatsapp: { label: "WhatsApp", from: "#5ad36b", to: "#25a244" },
  system: { label: "System", from: "#4b5563", to: "#2b303a" },
};

export const pinboards = [
  { id: "history", name: "History", tint: null as string | null, emoji: null as string | null },
  { id: "work", name: "Work", tint: "#007AFF", emoji: null as string | null },
  { id: "design", name: "Design", tint: "#FF375F", emoji: "🎨" },
  { id: "snippets", name: "Snippets", tint: "#34C759", emoji: null as string | null },
];
