import { Platform } from "react-native";

/**
 * Project Plantanim Theme Colors
 */

const primaryLight = "#137fec";
const primaryDark = "#137fec";

export type Theme = {
  background: string;
  surface: string;
  text: string;
  textSubtle: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  riskBg: string;
  riskText: string;
  riskBar: string;
};

export type Fonts = {
  sans: string;
  serif: string;
  rounded: string;
  mono: string;
};

export type ColorThemes = {
  light: Theme;
  dark: Theme;
};

export const Colors: ColorThemes = {
  light: {
    background: "#f6f7f8",
    surface: "#ffffff",
    text: "#0d141b",
    textSubtle: "#4c739a",
    tint: primaryLight,
    icon: "#4c739a",
    tabIconDefault: "#4c739a",
    tabIconSelected: primaryLight,
    riskBg: "#fffbeb",
    riskText: "#b45309",
    riskBar: "#f59e0b",
  },
  dark: {
    background: "#101922",
    surface: "#1c2630",
    text: "#ffffff",
    textSubtle: "#94a3b8",
    tint: primaryDark,
    icon: "#94a3b8",
    tabIconDefault: "#94a3b8",
    tabIconSelected: primaryDark,
    riskBg: "#2a1f05",
    riskText: "#fde68a",
    riskBar: "#f59e0b",
  },
};

// export const Colors = {
//   light: {
//     // Core
//     background: "#f6f7f8",
//     surface: "#ffffff",
//     text: "#0d141b",
//     textSubtle: "#4c739a",

//     // Brand
//     tint: primaryLight,

//     // Icons / UI
//     icon: "#4c739a",
//     tabIconDefault: "#4c739a",
//     tabIconSelected: primaryLight,

//     // Status / Risk
//     riskBg: "#fffbeb",
//     riskText: "#b45309",
//     riskBar: "#f59e0b",
//   },

//   dark: {
//     // Core
//     background: "#101922",
//     surface: "#1c2630",
//     text: "#ffffff",
//     textSubtle: "#94a3b8",

//     // Brand
//     tint: primaryDark,

//     // Icons / UI
//     icon: "#94a3b8",
//     tabIconDefault: "#94a3b8",
//     tabIconSelected: primaryDark,

//     // Status / Risk
//     riskBg: "#2a1f05", // dark-adapted amber background
//     riskText: "#fde68a",
//     riskBar: "#f59e0b",
//   },
// };

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
