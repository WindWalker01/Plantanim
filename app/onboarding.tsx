import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";

type OnboardingGraphic =
  | "onboarding_stay_ahead"
  | "onboarding_plan"
  | "onboarding_simple_easy";

const onboardingImages: Record<OnboardingGraphic, any> = {
  onboarding_stay_ahead: require("../assets/images/onboarding/onboarding_stay_ahead.png"),
  onboarding_plan: require("../assets/images/onboarding/onboarding_plan.png"),
  onboarding_simple_easy: require("../assets/images/onboarding/onboarding_simple_easy.png"),
};

type OnboardingPage = {
  title: string;
  description: string;
  graphic: OnboardingGraphic;
};

export default function OnboardingScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const pages: OnboardingPage[] = [
    {
      title: "Stay Ahead of the Storm",
      description:
        "We provide localized alerts to protect your crops from typhoons and heavy rain.",
      graphic: "onboarding_stay_ahead",
    },
    {
      title: "Plan Your Farming",
      description:
        "Get weather-based suggestions for planting and harvesting your crops at the right time.",
      graphic: "onboarding_plan",
    },
    {
      title: "Simple and Easy",
      description:
        "Our app is designed for farmers like you - easy to use, even with limited internet.",
      graphic: "onboarding_simple_easy",
    },
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      router.push("/set-location");
    }
  };

  const handleSkip = () => {
    router.push("/set-location");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Skip Button */}
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>

        {/* Graphic */}
        <View style={styles.graphicContainer}>
          <Image
            source={onboardingImages[pages[currentPage].graphic]}
            style={styles.onboardingImage}
          />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{pages[currentPage].title}</Text>
          <Text style={styles.description}>
            {pages[currentPage].description}
          </Text>
        </View>

        {/* Pagination */}
        <View style={styles.pagination}>
          {pages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentPage && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#ffffff",
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 40,
    },
    skipButton: {
      alignSelf: "flex-end",
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    skipText: {
      fontSize: 16,
      color: "#666666",
      fontWeight: "600",
    },
    graphicContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#0f4c75",
      borderRadius: 24,
      marginVertical: 40,
      position: "relative",
      overflow: "hidden",
    },
    onboardingImage: {
      width: 350,
      height: 350,
      resizeMode: "contain",
    },
    textContainer: {
      alignItems: "center",
      marginBottom: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: "#1f2937",
      marginBottom: 16,
      textAlign: "center",
    },
    description: {
      fontSize: 16,
      color: "#6b7280",
      textAlign: "center",
      lineHeight: 24,
      paddingHorizontal: 20,
    },
    pagination: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      marginBottom: 32,
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#d1d5db",
    },
    paginationDotActive: {
      width: 32,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#137fec",
    },
    nextButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: "#137fec",
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 12,
    },
    nextButtonText: {
      color: "#ffffff",
      fontSize: 18,
      fontWeight: "700",
    },
  });
