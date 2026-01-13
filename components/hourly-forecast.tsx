import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";

type HourlyData = {
  time: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  temperature: number;
  isNow?: boolean;
};

const HOURLY_DATA: HourlyData[] = [
  { time: "Now", icon: "grain", temperature: 28, isNow: true },
  { time: "1 PM", icon: "flash-on", temperature: 28 },
  { time: "2 PM", icon: "flash-on", temperature: 27 },
  { time: "3 PM", icon: "grain", temperature: 27 },
  { time: "4 PM", icon: "cloud", temperature: 26 },
  { time: "5 PM", icon: "cloud", temperature: 26 },
  { time: "6 PM", icon: "cloud", temperature: 25 },
  { time: "7 PM", icon: "cloud", temperature: 25 },
  { time: "8 PM", icon: "cloud", temperature: 24 },
];

export default function HourlyForecast() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {HOURLY_DATA.map((hour, index) => (
        <View
          key={index}
          style={[
            styles.card,
            hour.isNow && styles.cardActive,
          ]}
        >
          <Text
            style={[
              styles.timeText,
              hour.isNow && styles.timeTextActive,
            ]}
          >
            {hour.time}
          </Text>
          <MaterialIcons
            name={hour.icon}
            size={32}
            color={hour.isNow ? "#ffffff" : colors.text}
          />
          <Text
            style={[
              styles.temperatureText,
              hour.isNow && styles.temperatureTextActive,
            ]}
          >
            {hour.temperature}°
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    scrollContent: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 8,
    },
    card: {
      width: 80,
      height: 120,
      backgroundColor: theme.surface,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      gap: 8,
    },
    cardActive: {
      backgroundColor: "#137fec",
    },
    timeText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
    },
    timeTextActive: {
      color: "#ffffff",
    },
    temperatureText: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
    },
    temperatureTextActive: {
      color: "#ffffff",
    },
  });
