import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";

type ForecastDay = {
  day: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  precipitation: number | null;
  high: number;
  low: number;
};

const FORECAST_DATA: ForecastDay[] = [
  {
    day: "Today",
    icon: "cloud",
    iconColor: "#3b82f6",
    precipitation: 90,
    high: 28,
    low: 24,
  },
  {
    day: "Tue",
    icon: "flash-on",
    iconColor: "#4b5563",
    precipitation: 100,
    high: 26,
    low: 23,
  },
  {
    day: "Wed",
    icon: "water-drop",
    iconColor: "#1e40af",
    precipitation: 40,
    high: 29,
    low: 25,
  },
  {
    day: "Thu",
    icon: "wb-cloudy",
    iconColor: "#fbbf24",
    precipitation: null,
    high: 31,
    low: 26,
  },
  {
    day: "Fri",
    icon: "wb-sunny",
    iconColor: "#fbbf24",
    precipitation: null,
    high: 33,
    low: 27,
  },
  {
    day: "Sat",
    icon: "wb-sunny",
    iconColor: "#fbbf24",
    precipitation: null,
    high: 34,
    low: 27,
  },
  {
    day: "Sun",
    icon: "wb-sunny",
    iconColor: "#fbbf24",
    precipitation: null,
    high: 32,
    low: 26,
  },
];

export default function SevenDayOutlook() {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const getPrecipitationColor = (precipitation: number | null): string => {
    if (precipitation === null) return "transparent";
    if (precipitation >= 80) return "#e74c3c"; // Red for high
    return "#3b82f6"; // Blue for moderate
  };

  const getPrecipitationBg = (precipitation: number | null): string => {
    if (precipitation === null) return "transparent";
    if (precipitation >= 80) {
      return isDark ? "#7f1d1d" : "#fee2e2"; // Dark red for dark mode, light red for light
    }
    return isDark ? "#1e3a8a33" : "#dbeafe"; // Dark blue for dark mode, light blue for light
  };

  return (
    <View style={styles.container}>
      {FORECAST_DATA.map((day, index) => (
        <View key={index}>
          <View style={styles.dayRow}>
            <View style={styles.dayLeft}>
              <MaterialIcons
                name={day.icon}
                size={24}
                color={day.iconColor}
              />
              <Text style={styles.dayName}>{day.day}</Text>
            </View>

            <View style={styles.dayRight}>
              {day.precipitation !== null && (
                <View
                  style={[
                    styles.precipitationBadge,
                    {
                      backgroundColor: getPrecipitationBg(day.precipitation),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.precipitationText,
                      { color: getPrecipitationColor(day.precipitation) },
                    ]}
                  >
                    {day.precipitation}%
                  </Text>
                </View>
              )}
              <Text style={styles.highTemp}>{day.high}°</Text>
              <Text style={styles.lowTemp}>{day.low}°</Text>
            </View>
          </View>
          {index < FORECAST_DATA.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  );
}

const createStyles = (theme: Theme, isDark: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      marginHorizontal: 16,
      marginTop: 12,
      overflow: "hidden",
    },
    dayRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
    },
    dayLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    dayName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
    },
    dayRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    precipitationBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    precipitationText: {
      fontSize: 12,
      fontWeight: "700",
    },
    highTemp: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.text,
      minWidth: 32,
      textAlign: "right",
    },
    lowTemp: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.textSubtle,
      minWidth: 32,
      textAlign: "right",
    },
    divider: {
      height: 1,
      backgroundColor: theme.icon + "11",
      marginLeft: 52,
    },
  });
