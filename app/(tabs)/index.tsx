import HeroCard from "@/components/home/hero";
import RiskLevel from "@/components/home/risk-level";
import TopBar from "@/components/home/top-bar";
import WeatherCard from "@/components/weather-card";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { MaterialIcons } from "@expo/vector-icons";
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

  const styles = createStyles(colors, scheme);

  return (
    <SafeAreaView style={styles.container}>
      <TopBar />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HERO */}
        <HeroCard />

        {/* RISK */}
        <RiskLevel />

        {/* ADVICE */}
        <Text style={styles.sectionTitle}>What this means for your farm</Text>

        <View style={styles.adviceCard}>
          <View style={styles.adviceIcon}>
            <MaterialIcons name="water-drop" size={20} color={colors.tint} />
          </View>
          <Text style={styles.adviceText}>
            Expect heavy rain by 2 PM. Avoid applying fertilizer today to
            prevent runoff and nutrient loss.
          </Text>
        </View>

        {/* CTA */}
        <Pressable style={styles.ctaButton}>
          <MaterialIcons name="agriculture" size={22} color="#fff" />
          <Text style={styles.ctaText}>See Farming Suggestions</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Hourly Forecast</Text>

        <View style={styles.forecastContainer}></View>

        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          pagingEnabled={false}
          style={styles.forecastContainer}
        >
          <WeatherCard />
          <WeatherCard />
          <WeatherCard />
          <WeatherCard />
          <WeatherCard />
          <WeatherCard />
          <WeatherCard />
        </ScrollView>

        <Text style={styles.sectionTitle}>7-Day Outlook</Text>

        <View></View>
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

    forecastContainer: {
      display: "flex",
      flexDirection: "row",
      gap: 4,
    },
  });
