import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { ImageBackground, StyleSheet, Text, View } from "react-native";

import { Fonts, Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { CurrentWeather } from "@/lib/weather";

type Props = {
  currentWeather?: CurrentWeather | null;
};

export default function HeroCard({ currentWeather }: Props) {
  const { colors, fonts } = useAppTheme();

  const styles = createStyles(colors, fonts);

  const dateLabel = currentWeather?.dateLabel ?? "Today";
  const temperature = currentWeather?.temperature ?? 28;
  const feelsLike = currentWeather?.apparentTemperature ?? null;
  const wind = currentWeather?.windSpeedKmh ?? null;
  const summary = currentWeather?.summary ?? "Cloudy with High Rain Probability";

  return (
    <View style={styles.heroCard}>
      <ImageBackground
        source={{
          uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVzzSKEc9DUI9JpGCfPzlLwUTqCAqDEvncx2-COfssnFL7dyfYnqY1gksmGbjrg9426ltF80rM-gqO02JxC9rUZtmFruephmh2huIyf2Nh8nrU-61pXmsMFtV1BftJ_tlijV6H9iKDWLgtAGJdko1Jq8nH3gquIUwhCPqQl066MzndVywqmNpZdsKB64WdQyFR5NMbIe4AHOkHrDpXCOe-qudNr2LaZ0j6mh4P-EN1wmzgnICVnjY6CNEumD1SHcs2uX7tEy3pWg",
        }}
        style={styles.heroImage}
        imageStyle={{ opacity: 0.35 }}
      >
        <LinearGradient
          colors={[colors.tint + "cc", "#2563ebcc"]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.heroContent}>
          <Text style={styles.heroDate}>{dateLabel}</Text>

          <View style={styles.heroTempRow}>
            <Ionicons name="partly-sunny" size={64} color="#fde047" />
            <Text style={styles.heroTemp}>{temperature}°</Text>
          </View>

          <Text style={styles.heroTitle}>{summary}</Text>
          <Text style={styles.heroSubtitle}>
            {feelsLike !== null ? `Feels like ${feelsLike}°` : "Feels similar to actual temp"}
            {wind !== null ? ` • Wind ${wind} km/h` : ""}
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const createStyles = (colors: Theme, fonts: Fonts) =>
  StyleSheet.create({
    heroCard: {
      margin: 16,
      borderRadius: 16,
      overflow: "hidden",
    },

    heroImage: {
      height: 280,
    },

    heroContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },

    heroDate: {
      color: "#fff",
      opacity: 0.9,
      marginBottom: 8,
      fontFamily: fonts.sans,
    },

    heroTempRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    heroTemp: {
      fontSize: 64,
      fontWeight: "900",
      color: "#fff",
      fontFamily: fonts.sans,
    },

    heroTitle: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
      marginTop: 8,
    },

    heroSubtitle: {
      color: "#e5e7eb",
      marginTop: 4,
    },
  });
