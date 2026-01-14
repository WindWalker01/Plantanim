import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { HourlyForecastItem } from "@/lib/weather";

type Props = {
  data: HourlyForecastItem[];
  isLoading?: boolean;
};

export default function HourlyForecast({ data, isLoading }: Props) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const items = data && data.length > 0 ? data : [];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {isLoading && items.length === 0 ? (
        <Text style={styles.placeholder}>Loading...</Text>
      ) : items.length === 0 ? (
        <Text style={styles.placeholder}>No forecast data</Text>
      ) : (
        items.map((hour, index) => (
          <View
            key={`${hour.timeLabel}-${index}`}
            style={[styles.card, hour.isNow && styles.cardActive]}
          >
            <Text style={[styles.timeText, hour.isNow && styles.timeTextActive]}>
              {hour.timeLabel}
            </Text>
            <MaterialIcons
              name={hour.icon as keyof typeof MaterialIcons.glyphMap}
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
        ))
      )}
    </ScrollView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    scrollContent: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 8,
      alignItems: "stretch",
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
      borderWidth: 1,
      borderColor: theme.icon + "22",
    },
    cardActive: {
      backgroundColor: "#137fec",
      borderColor: "#137fec",
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
    placeholder: {
      fontSize: 14,
      color: theme.textSubtle,
      paddingHorizontal: 16,
    },
  });
