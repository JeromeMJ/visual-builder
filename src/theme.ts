
import type { CSSProperties } from "react";
import type { ButtonStyleName, CardStyleName, ChartSkin, WidgetStyleOverride } from "./widgetLibrary";

export type PreviewMode = "desktop" | "tablet" | "mobile";

export type ThemeState = {
  accent: string;
  success: string;
  warning: string;
  danger: string;
  background: string;
  background2: string;
  background3: string;
  backgroundMode: "solid" | "gradient" | "radial" | "mesh" | "image";
  backgroundImageUrl: string;
  gradientAngle: number;
  textColor: string;
  mutedTextColor: string;
  panelColor: string;
  cardColor: string;
  cardBorderColor: string;
  glowColor: string;
  noiseColor: string;
  cardOpacity: number;
  panelOpacity: number;
  borderOpacity: number;
  glassBlur: number;
  glassSaturation: number;
  glassContrast: number;
  glassBrightness: number;
  backgroundGlow: number;
  glowIntensity: number;
  glowBlur: number;
  innerGlow: number;
  borderShine: number;
  vignette: number;
  showGrid: boolean;
  showDots: boolean;
  showNoise: boolean;
  noiseOpacity: number;
  animateBackground: boolean;
  backgroundBlur: number;
  blobOpacity: number;
  blobSize: number;
  cardStyle: CardStyleName;
  buttonStyleMode: ButtonStyleName;
  badgeStyle: "soft" | "glass" | "pill" | "outline";
  chartSkin: ChartSkin;
  radius: number;
  gapDesktop: number;
  gapTablet: number;
  gapMobile: number;
  paddingDesktop: number;
  paddingTablet: number;
  paddingMobile: number;
  columnsDesktop: number;
  columnsTablet: number;
  columnsMobile: number;
  fontScale: number;
  letterSpacing: number;
  lineHeight: number;
  shadowDepth: number;
  hoverLift: number;
  hoverScale: number;
  motionSpeed: number;
  springStiffness: number;
  springDamping: number;
  entranceStagger: number;
  reduceMotion: boolean;
  showAccessibilityHints: boolean;
  focusRing: number;
  touchTargets: boolean;
  sidebarMode: "wide" | "compact" | "hidden";
};

export type ThemePreset = {
  name: string;
  patch: Partial<ThemeState>;
};

export const DEFAULT_THEME: ThemeState = {
  accent: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  background: "#09090f",
  background2: "#1b1235",
  background3: "#2d1f55",
  backgroundMode: "mesh",
  backgroundImageUrl: "",
  gradientAngle: 135,
  textColor: "#f8fafc",
  mutedTextColor: "#cbd5e1",
  panelColor: "#ffffff",
  cardColor: "#ffffff",
  cardBorderColor: "#c4b5fd",
  glowColor: "#a78bfa",
  noiseColor: "#ffffff",
  cardOpacity: 16,
  panelOpacity: 18,
  borderOpacity: 28,
  glassBlur: 24,
  glassSaturation: 155,
  glassContrast: 112,
  glassBrightness: 104,
  backgroundGlow: 42,
  glowIntensity: 34,
  glowBlur: 46,
  innerGlow: 18,
  borderShine: 26,
  vignette: 22,
  showGrid: true,
  showDots: false,
  showNoise: true,
  noiseOpacity: 10,
  animateBackground: true,
  backgroundBlur: 0,
  blobOpacity: 34,
  blobSize: 42,
  cardStyle: "glass",
  buttonStyleMode: "glass",
  badgeStyle: "glass",
  chartSkin: "bars",
  radius: 24,
  gapDesktop: 16,
  gapTablet: 14,
  gapMobile: 12,
  paddingDesktop: 20,
  paddingTablet: 18,
  paddingMobile: 16,
  columnsDesktop: 3,
  columnsTablet: 2,
  columnsMobile: 1,
  fontScale: 100,
  letterSpacing: 0,
  lineHeight: 1.5,
  shadowDepth: 36,
  hoverLift: 8,
  hoverScale: 1.01,
  motionSpeed: 1,
  springStiffness: 320,
  springDamping: 28,
  entranceStagger: 0.05,
  reduceMotion: false,
  showAccessibilityHints: true,
  focusRing: 2,
  touchTargets: true,
  sidebarMode: "wide",
};

export const DEFAULT_THEME_PRESETS: ThemePreset[] = [
  {
    name: "Violet Night",
    patch: {
      accent: "#8b5cf6",
      background: "#09090f",
      background2: "#1b1235",
      background3: "#2d1f55",
      textColor: "#f8fafc",
      mutedTextColor: "#cbd5e1",
      cardBorderColor: "#c4b5fd",
      glowColor: "#a78bfa",
      backgroundMode: "mesh",
      cardStyle: "glass",
      buttonStyleMode: "glass",
    },
  },
  {
    name: "Emerald Glass",
    patch: {
      accent: "#10b981",
      background: "#021510",
      background2: "#0d2e26",
      background3: "#15463b",
      textColor: "#ecfdf5",
      mutedTextColor: "#a7f3d0",
      cardBorderColor: "#6ee7b7",
      glowColor: "#34d399",
      backgroundMode: "gradient",
      cardStyle: "glass",
      buttonStyleMode: "glass",
    },
  },
  {
    name: "Ocean Blue",
    patch: {
      accent: "#38bdf8",
      background: "#04111d",
      background2: "#102d4c",
      background3: "#164c7b",
      textColor: "#eff6ff",
      mutedTextColor: "#bfdbfe",
      cardBorderColor: "#7dd3fc",
      glowColor: "#38bdf8",
      backgroundMode: "radial",
      cardStyle: "floating",
      buttonStyleMode: "soft",
    },
  },
  {
    name: "Sunset Neon",
    patch: {
      accent: "#f97316",
      background: "#120805",
      background2: "#401307",
      background3: "#7c2d12",
      textColor: "#fff7ed",
      mutedTextColor: "#fdba74",
      cardBorderColor: "#fdba74",
      glowColor: "#fb7185",
      backgroundMode: "mesh",
      cardStyle: "neon",
      buttonStyleMode: "neon",
    },
  },
  {
    name: "Clean Light",
    patch: {
      accent: "#2563eb",
      background: "#f5f7fb",
      background2: "#dbeafe",
      background3: "#bfdbfe",
      textColor: "#0f172a",
      mutedTextColor: "#475569",
      panelColor: "#ffffff",
      cardColor: "#ffffff",
      cardBorderColor: "#93c5fd",
      glowColor: "#60a5fa",
      cardOpacity: 90,
      panelOpacity: 94,
      borderOpacity: 34,
      shadowDepth: 18,
      backgroundMode: "gradient",
      cardStyle: "clean",
      buttonStyleMode: "soft",
      showGrid: false,
      showNoise: false,
    },
  },
];

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function normalizeHex(hex: string, fallback = "#8b5cf6") {
  const candidate = hex.trim().replace(/^#/, "");
  const normalized =
    candidate.length === 3
      ? candidate
          .split("")
          .map((part) => `${part}${part}`)
          .join("")
      : candidate;

  return /^[0-9a-fA-F]{6}$/.test(normalized) ? `#${normalized.toLowerCase()}` : fallback;
}

export function hexToRgb(hex: string) {
  const safe = normalizeHex(hex);
  const value = Number.parseInt(safe.slice(1), 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number) {
  const parts = [r, g, b].map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0"));
  return `#${parts.join("")}`;
}

export function hexToHsl(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;
  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  if (delta !== 0) {
    switch (max) {
      case red:
        hue = ((green - blue) / delta) % 6;
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      default:
        hue = (red - green) / delta + 4;
    }
  }

  return {
    h: Math.round((hue * 60 + 360) % 360),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

export function hslToHex(h: number, s: number, l: number) {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue < 60) {
    red = c;
    green = x;
  } else if (hue < 120) {
    red = x;
    green = c;
  } else if (hue < 180) {
    green = c;
    blue = x;
  } else if (hue < 240) {
    green = x;
    blue = c;
  } else if (hue < 300) {
    red = x;
    blue = c;
  } else {
    red = c;
    blue = x;
  }

  return rgbToHex((red + m) * 255, (green + m) * 255, (blue + m) * 255);
}

export function toRgba(hex: string, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

export function lighten(hex: string, amount = 10) {
  const hsl = hexToHsl(hex);
  return hslToHex(hsl.h, hsl.s, clamp(hsl.l + amount, 0, 100));
}

export function darken(hex: string, amount = 10) {
  const hsl = hexToHsl(hex);
  return hslToHex(hsl.h, hsl.s, clamp(hsl.l - amount, 0, 100));
}

export function shiftHue(hex: string, amount = 18) {
  const hsl = hexToHsl(hex);
  return hslToHex(hsl.h + amount, hsl.s, hsl.l);
}

export function contrastRatio(foreground: string, background: string) {
  const luminance = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const normalized = [r, g, b].map((value) => {
      const channel = value / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * normalized[0] + 0.7152 * normalized[1] + 0.0722 * normalized[2];
  };

  const l1 = luminance(foreground);
  const l2 = luminance(background);
  const light = Math.max(l1, l2);
  const dark = Math.min(l1, l2);

  return (light + 0.05) / (dark + 0.05);
}

export function generatePaletteFromBase(baseColor: string): Partial<ThemeState> {
  const base = normalizeHex(baseColor);
  const hsl = hexToHsl(base);
  const isLight = hsl.l > 60;
  const accent = base;
  const background = isLight ? darken(shiftHue(base, -8), 72) : darken(shiftHue(base, -6), 30);
  const background2 = isLight ? darken(shiftHue(base, 22), 58) : darken(shiftHue(base, 18), 18);
  const background3 = isLight ? darken(shiftHue(base, 40), 48) : darken(shiftHue(base, 42), 10);
  const textColor = isLight ? "#f8fafc" : "#f8fafc";
  const mutedTextColor = lighten(shiftHue(base, -8), 24);
  const glowColor = lighten(shiftHue(base, 10), 12);
  const cardBorderColor = lighten(base, isLight ? 8 : 18);

  return {
    accent,
    background,
    background2,
    background3,
    textColor,
    mutedTextColor,
    glowColor,
    cardBorderColor,
    success: shiftHue(base, 80),
    warning: shiftHue(base, -55),
    danger: shiftHue(base, -110),
  };
}

export function randomAccent() {
  return hslToHex(Math.floor(Math.random() * 360), 78, 62);
}

export function randomThemePatch(): Partial<ThemeState> {
  const accent = randomAccent();
  const palette = generatePaletteFromBase(accent);
  return {
    ...palette,
    backgroundMode: ["gradient", "mesh", "radial"][Math.floor(Math.random() * 3)] as ThemeState["backgroundMode"],
    cardStyle: ["glass", "floating", "neon", "glossy"][Math.floor(Math.random() * 4)] as CardStyleName,
    buttonStyleMode: ["soft", "glass", "neon", "outline"][Math.floor(Math.random() * 4)] as ButtonStyleName,
    glowIntensity: clamp(22 + Math.floor(Math.random() * 46), 0, 100),
    backgroundGlow: clamp(26 + Math.floor(Math.random() * 44), 0, 100),
    glassBlur: clamp(12 + Math.floor(Math.random() * 20), 0, 60),
    showGrid: Math.random() > 0.4,
    showNoise: Math.random() > 0.25,
    showDots: Math.random() > 0.7,
  };
}

export function getPreviewMetrics(theme: ThemeState, previewMode: PreviewMode) {
  const widths: Record<PreviewMode, number> = {
    desktop: 1180,
    tablet: 860,
    mobile: 430,
  };

  return {
    width: widths[previewMode],
    columns:
      previewMode === "desktop"
        ? theme.columnsDesktop
        : previewMode === "tablet"
          ? theme.columnsTablet
          : theme.columnsMobile,
    gap:
      previewMode === "desktop"
        ? theme.gapDesktop
        : previewMode === "tablet"
          ? theme.gapTablet
          : theme.gapMobile,
    padding:
      previewMode === "desktop"
        ? theme.paddingDesktop
        : previewMode === "tablet"
          ? theme.paddingTablet
          : theme.paddingMobile,
  };
}

export function pageStyle(theme: ThemeState): CSSProperties {
  let baseLayer = theme.background;

  if (theme.backgroundMode === "gradient") {
    baseLayer = `linear-gradient(${theme.gradientAngle}deg, ${theme.background} 0%, ${theme.background2} 55%, ${theme.background3} 100%)`;
  } else if (theme.backgroundMode === "radial") {
    baseLayer = [
      `radial-gradient(circle at 22% 18%, ${theme.background3} 0%, transparent 30%)`,
      `radial-gradient(circle at 78% 12%, ${theme.background2} 0%, transparent 22%)`,
      `radial-gradient(circle at 50% 110%, ${theme.background} 0%, ${theme.background2} 60%, ${theme.background3} 100%)`,
    ].join(", ");
  } else if (theme.backgroundMode === "mesh") {
    baseLayer = [
      `radial-gradient(circle at 14% 16%, ${toRgba(theme.accent, 0.24)} 0%, transparent 26%)`,
      `radial-gradient(circle at 84% 18%, ${toRgba(theme.glowColor, 0.22)} 0%, transparent 24%)`,
      `radial-gradient(circle at 62% 82%, ${toRgba(theme.background3, 0.7)} 0%, transparent 30%)`,
      `linear-gradient(${theme.gradientAngle}deg, ${theme.background} 0%, ${theme.background2} 58%, ${theme.background3} 100%)`,
    ].join(", ");
  } else if (theme.backgroundMode === "image" && theme.backgroundImageUrl.trim()) {
    baseLayer = [
      `linear-gradient(${theme.gradientAngle}deg, ${toRgba(theme.background, 0.9)}, ${toRgba(theme.background2, 0.68)})`,
      `url(${theme.backgroundImageUrl.trim()}) center / cover no-repeat`,
    ].join(", ");
  }

  return {
    background: baseLayer,
    color: theme.textColor,
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
  };
}

export function gridOverlayStyle(theme: ThemeState): CSSProperties {
  return {
    backgroundImage: `linear-gradient(${toRgba(theme.textColor, 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${toRgba(theme.textColor, 0.05)} 1px, transparent 1px)`,
    backgroundSize: "30px 30px",
    opacity: 1,
    maskImage: "radial-gradient(circle at center, black 44%, transparent 100%)",
  };
}

export function dotsOverlayStyle(theme: ThemeState): CSSProperties {
  return {
    backgroundImage: `radial-gradient(${toRgba(theme.textColor, 0.18)} 0.7px, transparent 0.7px)`,
    backgroundSize: "22px 22px",
    opacity: 0.8,
  };
}

export function noiseOverlayStyle(theme: ThemeState): CSSProperties {
  return {
    backgroundImage: `radial-gradient(${toRgba(theme.noiseColor, theme.noiseOpacity / 100)} 0.6px, transparent 0.6px)`,
    backgroundSize: "5px 5px",
    mixBlendMode: "soft-light",
    opacity: 0.8,
  };
}

export function vignetteOverlayStyle(theme: ThemeState): CSSProperties {
  return {
    background: `radial-gradient(circle at center, transparent 40%, ${toRgba("#000000", clamp(theme.vignette / 100, 0, 1))} 100%)`,
  };
}

type SurfaceResolved = {
  accent: string;
  glowColor: string;
  radius: number;
  cardStyle: CardStyleName;
  shadowDepth: number;
  cardOpacity: number;
  glowIntensity: number;
  chartSkin: ChartSkin;
  buttonStyleMode: ButtonStyleName;
};

export function resolveSurface(theme: ThemeState, overrides?: WidgetStyleOverride): SurfaceResolved {
  return {
    accent: normalizeHex(overrides?.accent ?? theme.accent),
    glowColor: normalizeHex(overrides?.glowColor ?? theme.glowColor),
    radius: overrides?.radius ?? theme.radius,
    cardStyle: overrides?.cardStyle ?? theme.cardStyle,
    shadowDepth: clamp(theme.shadowDepth + (overrides?.shadowBoost ?? 0), 0, 100),
    cardOpacity: clamp(theme.cardOpacity + (overrides?.opacityBoost ?? 0), 0, 100),
    glowIntensity: clamp(theme.glowIntensity + (overrides?.glowBoost ?? 0), 0, 100),
    chartSkin: overrides?.chartSkin ?? theme.chartSkin,
    buttonStyleMode: overrides?.buttonStyleMode ?? theme.buttonStyleMode,
  };
}

export function surfaceStyle(theme: ThemeState, selected = false, overrides?: WidgetStyleOverride): CSSProperties {
  const resolved = resolveSurface(theme, overrides);
  const glass = resolved.cardStyle === "glass" || resolved.cardStyle === "glossy" || resolved.cardStyle === "neon";
  const opacity =
    resolved.cardStyle === "clean" || resolved.cardStyle === "matte"
      ? Math.max(resolved.cardOpacity, 78) / 100
      : resolved.cardOpacity / 100;

  const borderColor =
    resolved.cardStyle === "neon"
      ? toRgba(resolved.glowColor, 0.45)
      : selected
        ? toRgba(resolved.accent, 0.82)
        : toRgba(theme.cardBorderColor, theme.borderOpacity / 100);

  const shadowBase = clamp(resolved.shadowDepth / 100, 0, 1);
  const glowBase = clamp(resolved.glowIntensity / 100, 0, 1);

  const glowMultiplier =
    resolved.cardStyle === "neon"
      ? 0.75
      : resolved.cardStyle === "floating"
        ? 0.36
        : resolved.cardStyle === "matte"
          ? 0.08
          : resolved.cardStyle === "glossy"
            ? 0.28
            : 0.22;

  const shadowColor = resolved.cardStyle === "clean" ? "#0f172a" : "#000000";
  const shineAlpha =
    resolved.cardStyle === "glossy"
      ? theme.borderShine / 100
      : resolved.cardStyle === "neon"
        ? theme.borderShine / 160
        : theme.borderShine / 240;

  return {
    background:
      resolved.cardStyle === "bordered"
        ? `linear-gradient(180deg, ${toRgba(theme.cardColor, opacity * 0.92)}, ${toRgba(theme.cardColor, opacity * 0.82)})`
        : toRgba(theme.cardColor, opacity),
    border: `1px solid ${borderColor}`,
    borderRadius: resolved.radius,
    boxShadow: [
      `0 18px 60px ${toRgba(shadowColor, shadowBase * 0.22)}`,
      `0 0 ${theme.glowBlur}px ${toRgba(resolved.glowColor, glowBase * glowMultiplier * (selected ? 1.3 : 1))}`,
      theme.innerGlow > 0
        ? `inset 0 0 ${theme.glowBlur / 1.8}px ${toRgba(resolved.glowColor, (theme.innerGlow / 100) * 0.18)}`
        : "inset 0 0 0 transparent",
      selected ? `0 0 0 ${Math.max(theme.focusRing, 1)}px ${toRgba(resolved.accent, 0.34)}` : "inset 0 0 0 transparent",
    ].join(", "),
    backdropFilter: glass
      ? `blur(${theme.glassBlur}px) saturate(${theme.glassSaturation}%) contrast(${theme.glassContrast}%) brightness(${theme.glassBrightness}%)`
      : "none",
    WebkitBackdropFilter: glass
      ? `blur(${theme.glassBlur}px) saturate(${theme.glassSaturation}%) contrast(${theme.glassContrast}%) brightness(${theme.glassBrightness}%)`
      : "none",
    overflow: "hidden",
    position: "relative",
    isolation: "isolate",
    outline: "none",
    backgroundImage:
      shineAlpha > 0
        ? `linear-gradient(180deg, ${toRgba("#ffffff", shineAlpha)} 0%, transparent 18%), linear-gradient(180deg, ${toRgba(theme.cardColor, opacity)}, ${toRgba(theme.cardColor, opacity)})`
        : undefined,
  };
}

export function panelStyle(theme: ThemeState): CSSProperties {
  return {
    ...surfaceStyle(theme, false, {
      opacityBoost: Math.max(theme.panelOpacity - theme.cardOpacity, 0),
      shadowBoost: -4,
    }),
    borderRadius: theme.radius + 4,
  };
}

export function miniPanelStyle(theme: ThemeState, overrides?: WidgetStyleOverride): CSSProperties {
  return {
    ...surfaceStyle(theme, false, {
      ...overrides,
      opacityBoost: (overrides?.opacityBoost ?? 0) + 8,
      shadowBoost: (overrides?.shadowBoost ?? 0) - 10,
    }),
    borderRadius: Math.max(theme.radius - 8, 14),
  };
}

export function buttonStyle(theme: ThemeState, active = false, mode?: ButtonStyleName): CSSProperties {
  const variant = mode ?? theme.buttonStyleMode;
  const background =
    variant === "neon"
      ? active
        ? toRgba(theme.accent, 0.22)
        : toRgba(theme.accent, 0.12)
      : variant === "outline"
        ? "transparent"
        : variant === "pill"
          ? toRgba(theme.cardColor, active ? 0.2 : 0.12)
          : toRgba(theme.cardColor, active ? 0.18 : 0.1);

  const border =
    variant === "outline"
      ? toRgba(theme.cardBorderColor, active ? 0.8 : 0.28)
      : active
        ? toRgba(theme.accent, 0.72)
        : toRgba(theme.cardBorderColor, 0.2);

  const glow =
    variant === "neon"
      ? `0 0 24px ${toRgba(theme.glowColor, active ? 0.28 : 0.16)}`
      : active
        ? `0 0 18px ${toRgba(theme.glowColor, 0.16)}`
        : "none";

  return {
    background,
    color: theme.textColor,
    border: `1px solid ${border}`,
    borderRadius: variant === "pill" ? 999 : Math.max(theme.radius - 6, 14),
    boxShadow: glow,
    minHeight: theme.touchTargets ? 42 : 36,
  };
}

export function inputShellStyle(theme: ThemeState): CSSProperties {
  return {
    background: toRgba(theme.cardColor, 0.12),
    color: theme.textColor,
    border: `1px solid ${toRgba(theme.cardBorderColor, 0.18)}`,
    borderRadius: Math.max(theme.radius - 8, 12),
  };
}

export function chipStyle(theme: ThemeState, active = false): CSSProperties {
  return {
    ...buttonStyle(theme, active, theme.badgeStyle === "pill" ? "pill" : theme.badgeStyle === "outline" ? "outline" : "glass"),
    padding: "0.45rem 0.7rem",
    minHeight: "auto",
  };
}
