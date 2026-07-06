import type { ThemeName } from "../store/useStore";

/**
 * Each theme provides shade values (50-700) that will override
 * Tailwind's default `indigo` color palette at runtime by setting
 * the corresponding CSS variables on <html>. Since the entire app
 * uses `indigo-*` utility classes for accents, changing these
 * variables re-themes the whole UI instantly.
 */
export interface ThemeShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
}

export interface ThemeConfig {
  label: string;
  preview: string;
  shades: ThemeShades;
  /** Subtle tinted background for the main app surface. */
  appBg: string;
  /** Subtle gradient used behind the header for extra depth. */
  headerBg: string;
  /** Sidebar background gradient (rich, dark on the accent hue). */
  sidebarBg: string;
  /** Sidebar active-item background. */
  sidebarActiveBg: string;
  /** Sidebar active-item text color. */
  sidebarActiveText: string;
  /** Sidebar inactive text color. */
  sidebarText: string;
  /** Sidebar icon color for inactive items. */
  sidebarIconColor: string;
  /** Sidebar border / divider color. */
  sidebarBorder: string;
}

export const themes: Record<ThemeName, ThemeConfig> = {
  indigo: {
    label: "Indigo",
    preview: "#4f46e5",
    appBg: "#f0f1ff",
    headerBg: "linear-gradient(180deg, #eef2ff 0%, #ffffff 100%)",
    sidebarBg: "linear-gradient(160deg, #312e81 0%, #3730a3 50%, #4338ca 100%)",
    sidebarActiveBg: "rgba(255,255,255,0.15)",
    sidebarActiveText: "#ffffff",
    sidebarText: "rgba(199,210,254,0.85)",
    sidebarIconColor: "rgba(165,180,252,0.9)",
    sidebarBorder: "rgba(99,102,241,0.25)",
    shades: {
      50: "#eef2ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#6366f1",
      600: "#4f46e5",
      700: "#4338ca",
    },
  },
  violet: {
    label: "Violet",
    preview: "#7c3aed",
    appBg: "#f5f0ff",
    headerBg: "linear-gradient(180deg, #f5f3ff 0%, #ffffff 100%)",
    sidebarBg: "linear-gradient(160deg, #2e1065 0%, #4c1d95 50%, #5b21b6 100%)",
    sidebarActiveBg: "rgba(255,255,255,0.15)",
    sidebarActiveText: "#ffffff",
    sidebarText: "rgba(221,214,254,0.85)",
    sidebarIconColor: "rgba(196,181,253,0.9)",
    sidebarBorder: "rgba(139,92,246,0.25)",
    shades: {
      50: "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
    },
  },
  emerald: {
    label: "Émeraude",
    preview: "#059669",
    appBg: "#edfaf4",
    headerBg: "linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%)",
    sidebarBg: "linear-gradient(160deg, #064e3b 0%, #065f46 50%, #047857 100%)",
    sidebarActiveBg: "rgba(255,255,255,0.15)",
    sidebarActiveText: "#ffffff",
    sidebarText: "rgba(167,243,208,0.85)",
    sidebarIconColor: "rgba(110,231,183,0.9)",
    sidebarBorder: "rgba(16,185,129,0.25)",
    shades: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
    },
  },
  sky: {
    label: "Ciel",
    preview: "#0284c7",
    appBg: "#eaf7fd",
    headerBg: "linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)",
    sidebarBg: "linear-gradient(160deg, #082f49 0%, #0c4a6e 50%, #075985 100%)",
    sidebarActiveBg: "rgba(255,255,255,0.15)",
    sidebarActiveText: "#ffffff",
    sidebarText: "rgba(186,230,253,0.85)",
    sidebarIconColor: "rgba(125,211,252,0.9)",
    sidebarBorder: "rgba(14,165,233,0.25)",
    shades: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
    },
  },
  rose: {
    label: "Rose",
    preview: "#e11d48",
    appBg: "#fff0f3",
    headerBg: "linear-gradient(180deg, #fff1f2 0%, #ffffff 100%)",
    sidebarBg: "linear-gradient(160deg, #4c0519 0%, #881337 50%, #9f1239 100%)",
    sidebarActiveBg: "rgba(255,255,255,0.15)",
    sidebarActiveText: "#ffffff",
    sidebarText: "rgba(253,164,175,0.85)",
    sidebarIconColor: "rgba(251,113,133,0.9)",
    sidebarBorder: "rgba(244,63,94,0.25)",
    shades: {
      50: "#fff1f2",
      100: "#ffe4e6",
      200: "#fecdd3",
      300: "#fda4af",
      400: "#fb7185",
      500: "#f43f5e",
      600: "#e11d48",
      700: "#be123c",
    },
  },
  amber: {
    label: "Ambre",
    preview: "#d97706",
    appBg: "#fef9ec",
    headerBg: "linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)",
    sidebarBg: "linear-gradient(160deg, #451a03 0%, #78350f 50%, #92400e 100%)",
    sidebarActiveBg: "rgba(255,255,255,0.15)",
    sidebarActiveText: "#ffffff",
    sidebarText: "rgba(252,211,77,0.85)",
    sidebarIconColor: "rgba(251,191,36,0.9)",
    sidebarBorder: "rgba(245,158,11,0.25)",
    shades: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
    },
  },
};

export function applyTheme(name: ThemeName) {
  const theme = themes[name];
  const root = document.documentElement;

  // Override Tailwind's `indigo` palette used everywhere for accents.
  (Object.keys(theme.shades) as unknown as Array<keyof ThemeShades>).forEach((shade) => {
    root.style.setProperty(`--color-indigo-${shade}`, theme.shades[shade]);
  });

  // App shell surfaces.
  root.style.setProperty("--app-bg", theme.appBg);
  root.style.setProperty("--app-header-bg", theme.headerBg);
  document.body.style.backgroundColor = theme.appBg;

  // Sidebar.
  root.style.setProperty("--sidebar-bg", theme.sidebarBg);
  root.style.setProperty("--sidebar-active-bg", theme.sidebarActiveBg);
  root.style.setProperty("--sidebar-active-text", theme.sidebarActiveText);
  root.style.setProperty("--sidebar-text", theme.sidebarText);
  root.style.setProperty("--sidebar-icon", theme.sidebarIconColor);
  root.style.setProperty("--sidebar-border", theme.sidebarBorder);
}
