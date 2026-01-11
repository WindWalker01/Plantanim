import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "react-native";

export function useAppTheme() {
  const theme = useColorScheme() ?? "light";

  return {
    colors: Colors[theme],
    isDark: theme === "dark",
    fonts: Fonts,
    // You can also include your Fonts here
  };
}
