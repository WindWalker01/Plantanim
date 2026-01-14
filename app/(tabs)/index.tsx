import { useEffect, useState } from "react";
import HeroCard from "@/components/home/hero";
import HourlyForecast from "@/components/hourly-forecast";
import RiskLevel from "@/components/home/risk-level";
import TopBar from "@/components/home/top-bar";
import SevenDayOutlook from "@/components/seven-day-outlook";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  CurrentWeather,
  DailyForecastItem,
  HourlyForecastItem,
  fetchWeatherForecast,
} from "@/lib/weather";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const scheme = useColorScheme() ?? "light";
  const { colors } = useAppTheme();
  const router = useRouter();
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastItem[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecastItem[]>([]);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const styles = createStyles(colors, scheme);

  useEffect(() => {
    let isMounted = true;
    const loadWeather = async () => {
      try {
        setIsWeatherLoading(true);
        setWeatherError(null);
        const { hourly, daily, currentWeather: cw } = await fetchWeatherForecast();
        if (!isMounted) return;
        setHourlyForecast(hourly);
        setDailyForecast(daily);
        setCurrentWeather(cw ?? null);
      } catch (error) {
        console.error("Error fetching weather:", error);
        if (!isMounted) return;
        setWeatherError("Unable to load latest forecast.");
      } finally {
        if (isMounted) setIsWeatherLoading(false);
      }
    };
    loadWeather();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TopBar />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HERO */}
        <HeroCard currentWeather={currentWeather} />

        {/* RISK */}
        <RiskLevel todayPrecipitation={dailyForecast[0]?.precipitation} />

        {/* ADVICE */}
        <Text style={styles.sectionTitle}>What this means for your farm</Text>

        <View style={styles.adviceCard}>
          <View style={styles.adviceIcon}>
            <MaterialIcons name="water-drop" size={20} color={colors.tint} />
          </View>
          <Text style={styles.adviceText}>
            {dailyForecast[0]?.precipitation != null
              ? `Rain chance today is ${dailyForecast[0].precipitation}%. Plan fertilizer and field work around heavy showers.`
              : "We’ll tailor farming advice as soon as the latest rain forecast is available for your farm."}
          </Text>
        </View>

        {/* CTA */}
        <Pressable
          style={styles.ctaButton}
          onPress={() => router.push("/farming-suggestions")}
        >
          <MaterialIcons name="agriculture" size={22} color="#fff" />
          <Text style={styles.ctaText}>See Farming Suggestions</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Hourly Forecast</Text>

        {weatherError && <Text style={styles.infoText}>{weatherError}</Text>}

        <HourlyForecast data={hourlyForecast} isLoading={isWeatherLoading} />

        <Text style={styles.sectionTitle}>7-Day Outlook</Text>

        <SevenDayOutlook data={dailyForecast} isLoading={isWeatherLoading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: Theme, scheme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scrollContent: {
      paddingBottom: 140,
    },

    sectionTitle: {
      marginTop: 24,
      marginHorizontal: 16,
      fontSize: 18,
      fontWeight: "800",
      color: colors.text,
    },

    adviceCard: {
      flexDirection: "row",
      gap: 12,
      margin: 16,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.icon + "22",
    },

    adviceIcon: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.tint + "22",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },

    adviceText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
      color: colors.text,
    },

    ctaButton: {
      flexDirection: "row",
      gap: 8,
      backgroundColor: colors.tint,
      margin: 16,
      padding: 18,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },

    ctaText: {
      color: scheme === "dark" ? "#000" : "#fff",
      fontSize: 18,
      fontWeight: "800",
    },

    infoText: {
      marginTop: 8,
      marginHorizontal: 16,
      color: colors.textSubtle,
      fontSize: 14,
    },

  });
