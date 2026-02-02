import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { LanguageProvider } from "@/hooks/use-language";
import { useColorScheme } from "react-native";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <LanguageProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="onboarding"
            options={{ headerShown: false, presentation: "card" }}
          />
          <Stack.Screen
            name="set-location"
            options={{ headerShown: false, presentation: "card" }}
          />
          <Stack.Screen
            name="personalization"
            options={{ headerShown: false, presentation: "card" }}
          />
          <Stack.Screen
            name="change-name"
            options={{ headerShown: false, presentation: "card" }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="farming-suggestions"
            options={{ headerShown: false, presentation: "card" }}
          />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </LanguageProvider>
  );
}
