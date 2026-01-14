import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { DailyForecastItem } from "@/lib/weather";

type Props = {
  data: DailyForecastItem[];
  isLoading?: boolean;
};

export default function SevenDayOutlook({ data, isLoading }: Props) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const getPrecipitationColor = (precipitation: number | null): string => {
    if (precipitation === null) return "transparent";
    if (precipitation >= 80) return "#e74c3c";
    return "#3b82f6";
  };

  const getPrecipitationBg = (precipitation: number | null): string => {
    if (precipitation === null) return "transparent";
    if (precipitation >= 80) {
      return isDark ? "#7f1d1d" : "#fee2e2";
    }
    return isDark ? "#1e3a8a33" : "#dbeafe";
  };

  const items = data && data.length > 0 ? data : [];

  return (
    <View style={styles.container}>
      {isLoading && items.length === 0 ? (
        <Text style={styles.placeholder}>Loading...</Text>
      ) : items.length === 0 ? (
        <Text style={styles.placeholder}>No forecast data</Text>
      ) : (
        items.map((day, index) => (
          <View key={`${day.dayLabel}-${index}`}>
            <View style={styles.dayRow}>
              <View style={styles.dayLeft}>
                <MaterialIcons
                  name={day.icon as keyof typeof MaterialIcons.glyphMap}
                  size={24}
                  color={colors.text}
                />
                <Text style={styles.dayName}>{day.dayLabel}</Text>
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
            {index < items.length - 1 && <View style={styles.divider} />}
          </View>
        ))
      )}
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
      borderWidth: 1,
      borderColor: theme.icon + "11",
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
    placeholder: {
      padding: 16,
      color: theme.textSubtle,
      fontSize: 14,
      textAlign: "center",
    },
  });
