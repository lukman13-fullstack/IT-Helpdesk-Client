import { ThemeColor } from "@/store/ui/types";

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.0 formula
 */
function getLuminance(color: string): number {
  // Remove # if present
  const hex = color.replace("#", "");

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determine if we should use white or dark text on a given background
 * Returns white (#ffffff) for dark backgrounds, dark (#2d1b4e) for light backgrounds
 */
export function getContrastingTextColor(backgroundColor: string): string {
  const whiteContrast = getContrastRatio(backgroundColor, "#ffffff");
  const darkContrast = getContrastRatio(backgroundColor, "#2d1b4e");

  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  // We'll use white if it has better contrast
  return whiteContrast > darkContrast ? "#ffffff" : "#2d1b4e";
}

/**
 * Generate a lighter version of a color (for muted variant)
 */
function lightenColor(color: string, percent: number): string {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const lighter = (value: number) => {
    return Math.min(255, Math.floor(value + (255 - value) * percent));
  };

  const newR = lighter(r).toString(16).padStart(2, "0");
  const newG = lighter(g).toString(16).padStart(2, "0");
  const newB = lighter(b).toString(16).padStart(2, "0");

  return `#${newR}${newG}${newB}`;
}

/**
 * Generate a darker version of a color (for secondary variant)
 */
function darkenColor(color: string, percent: number): string {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const darker = (value: number) => {
    return Math.max(0, Math.floor(value * (1 - percent)));
  };

  const newR = darker(r).toString(16).padStart(2, "0");
  const newG = darker(g).toString(16).padStart(2, "0");
  const newB = darker(b).toString(16).padStart(2, "0");

  return `#${newR}${newG}${newB}`;
}

export const THEME_PRESETS: ThemeColor[] = [
  {
    name: "Pink Paradise",
    primary: "#ff6b9d",
    primaryForeground: "#ffffff",
    secondary: "#ffc93c",
    secondaryForeground: "#2d1b4e",
    accent: "#a8e6cf",
    accentForeground: "#2d1b4e",
    background: "#fff5f7",
    foreground: "#2d1b4e",
    card: "#ffffff",
    cardForeground: "#2d1b4e",
    popover: "#ffffff",
    popoverForeground: "#2d1b4e",
    muted: "#ffe5ec",
    mutedForeground: "#8b7ba8",
    destructive: "#ff6b9d",
    destructiveForeground: "#ffffff",
    border: "#ff6b9d26",
    input: "transparent",
    ring: "#ff6b9d",
  },
  {
    name: "Ocean Blue",
    primary: "#0077be",
    primaryForeground: "#ffffff",
    secondary: "#00a8e8",
    secondaryForeground: "#ffffff",
    accent: "#00c9ff",
    accentForeground: "#003366",
    background: "#f0f8ff",
    foreground: "#003366",
    card: "#ffffff",
    cardForeground: "#003366",
    popover: "#ffffff",
    popoverForeground: "#003366",
    muted: "#e0f2ff",
    mutedForeground: "#5c8a8a",
    destructive: "#ff4d4f",
    destructiveForeground: "#ffffff",
    border: "#0077be26",
    input: "transparent",
    ring: "#0077be",
  },
  {
    name: "Forest Green",
    primary: "#2d6a4f",
    primaryForeground: "#ffffff",
    secondary: "#52b788",
    secondaryForeground: "#1a2e1a",
    accent: "#95d5b2",
    accentForeground: "#1a2e1a",
    background: "#f1faee",
    foreground: "#1a2e1a",
    card: "#ffffff",
    cardForeground: "#1a2e1a",
    popover: "#ffffff",
    popoverForeground: "#1a2e1a",
    muted: "#d8f3dc",
    mutedForeground: "#6b8f71",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#2d6a4f26",
    input: "transparent",
    ring: "#2d6a4f",
  },
  {
    name: "Sunset Orange",
    primary: "#f77f00",
    primaryForeground: "#ffffff",
    secondary: "#fcbf49",
    secondaryForeground: "#2d1b4e",
    accent: "#eae2b7",
    accentForeground: "#2d1b4e",
    background: "#fffbf0",
    foreground: "#4a3b2a",
    card: "#ffffff",
    cardForeground: "#4a3b2a",
    popover: "#ffffff",
    popoverForeground: "#4a3b2a",
    muted: "#fff3cd",
    mutedForeground: "#8a7b6a",
    destructive: "#d62828",
    destructiveForeground: "#ffffff",
    border: "#f77f0026",
    input: "transparent",
    ring: "#f77f00",
  },
  {
    name: "Purple Dream",
    primary: "#7209b7",
    primaryForeground: "#ffffff",
    secondary: "#b185db",
    secondaryForeground: "#ffffff",
    accent: "#d8b9f0",
    accentForeground: "#2d1b4e",
    background: "#f8f4fc",
    foreground: "#2d1b4e",
    card: "#ffffff",
    cardForeground: "#2d1b4e",
    popover: "#ffffff",
    popoverForeground: "#2d1b4e",
    muted: "#ede0f5",
    mutedForeground: "#8b7ba8",
    destructive: "#f72585",
    destructiveForeground: "#ffffff",
    border: "#7209b726",
    input: "transparent",
    ring: "#7209b7",
  },
  {
    name: "Ruby Red",
    primary: "#c1121f",
    primaryForeground: "#ffffff",
    secondary: "#e63946",
    secondaryForeground: "#ffffff",
    accent: "#f5cac3",
    accentForeground: "#2d1b4e",
    background: "#fff5f5",
    foreground: "#2d1b4e",
    card: "#ffffff",
    cardForeground: "#2d1b4e",
    popover: "#ffffff",
    popoverForeground: "#2d1b4e",
    muted: "#ffe5e5",
    mutedForeground: "#8b7ba8",
    destructive: "#c1121f",
    destructiveForeground: "#ffffff",
    border: "#c1121f26",
    input: "transparent",
    ring: "#c1121f",
  },
  {
    name: "Teal Breeze",
    primary: "#14b8a6",
    primaryForeground: "#ffffff",
    secondary: "#2dd4bf",
    secondaryForeground: "#ffffff",
    accent: "#99f6e4",
    accentForeground: "#0f3d39",
    background: "#f0fdfa",
    foreground: "#0f3d39",
    card: "#ffffff",
    cardForeground: "#0f3d39",
    popover: "#ffffff",
    popoverForeground: "#0f3d39",
    muted: "#ccfbf1",
    mutedForeground: "#4a7a76",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#14b8a626",
    input: "transparent",
    ring: "#14b8a6",
  },
  {
    name: "Golden Touch",
    primary: "#d4af37",
    primaryForeground: "#2d1b4e",
    secondary: "#f4d03f",
    secondaryForeground: "#2d1b4e",
    accent: "#fef3c7",
    accentForeground: "#2d1b4e",
    background: "#fffbeb",
    foreground: "#2d1b4e",
    card: "#ffffff",
    cardForeground: "#2d1b4e",
    popover: "#ffffff",
    popoverForeground: "#2d1b4e",
    muted: "#fef3c7",
    mutedForeground: "#8b7ba8",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#d4af3726",
    input: "transparent",
    ring: "#d4af37",
  },
];

/**
 * Create a custom theme from a primary color
 */
export function createCustomTheme(
  name: string,
  primaryColor: string
): ThemeColor {
  const primaryForeground = getContrastingTextColor(primaryColor);
  const secondary = lightenColor(primaryColor, 0.2);
  const secondaryForeground = getContrastingTextColor(secondary);
  const accent = lightenColor(primaryColor, 0.4);
  const accentForeground = getContrastingTextColor(accent);
  const background = lightenColor(primaryColor, 0.95);
  const foreground = getContrastingTextColor(background);
  const muted = lightenColor(primaryColor, 0.8);
  const mutedForeground = darkenColor(foreground, 0.4);
  const card = "#ffffff";
  const cardForeground = foreground;
  const popover = "#ffffff";
  const popoverForeground = foreground;
  const destructive = "#ef4444";
  const destructiveForeground = "#ffffff";
  const border = `${primaryColor}26`;
  const input = "transparent";
  const ring = primaryColor;

  return {
    name,
    primary: primaryColor,
    primaryForeground,
    secondary,
    secondaryForeground,
    accent,
    accentForeground,
    background,
    foreground,
    card,
    cardForeground,
    popover,
    popoverForeground,
    muted,
    mutedForeground,
    destructive,
    destructiveForeground,
    border,
    input,
    ring,
  };
}

/**
 * Apply theme to CSS variables
 */
export function applyThemeToDocument(theme: ThemeColor | null) {
  if (!theme) return;

  const root = document.documentElement;

  // Set CSS variables
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--primary-foreground", theme.primaryForeground);
  root.style.setProperty("--secondary", theme.secondary);
  root.style.setProperty("--secondary-foreground", theme.secondaryForeground);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-foreground", theme.accentForeground);
  root.style.setProperty("--background", theme.background);
  root.style.setProperty("--foreground", theme.foreground);
  root.style.setProperty("--card", theme.card);
  root.style.setProperty("--card-foreground", theme.cardForeground);
  root.style.setProperty("--popover", theme.popover);
  root.style.setProperty("--popover-foreground", theme.popoverForeground);
  root.style.setProperty("--muted", theme.muted);
  root.style.setProperty("--muted-foreground", theme.mutedForeground);
  root.style.setProperty("--destructive", theme.destructive);
  root.style.setProperty(
    "--destructive-foreground",
    theme.destructiveForeground
  );
  root.style.setProperty("--border", theme.border);
  root.style.setProperty("--input", theme.input);
  root.style.setProperty("--ring", theme.ring);

  // Also update related colors
  root.style.setProperty("--sidebar-primary", theme.primary);
  root.style.setProperty(
    "--sidebar-primary-foreground",
    theme.primaryForeground
  );
  root.style.setProperty("--sidebar-accent", theme.muted);
  root.style.setProperty("--sidebar-foreground", theme.foreground);
  root.style.setProperty("--sidebar-border", theme.border);
  root.style.setProperty("--sidebar-ring", theme.ring);
}
