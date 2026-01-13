import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function OnboardingScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const pages = [
    {
      title: "Stay Ahead of the Storm",
      description: "We provide localized alerts to protect your crops from typhoons and heavy rain.",
      graphic: "storm",
    },
    // Add more pages here if needed
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
          <View style={styles.stormCloud}>
            {/* Cloud shapes */}
            <View style={[styles.cloudPart, styles.cloudPart1]} />
            <View style={[styles.cloudPart, styles.cloudPart2]} />
            <View style={[styles.cloudPart, styles.cloudPart3]} />
            <View style={[styles.cloudPart, styles.cloudPart4]} />
            
            {/* Lightning bolt */}
            <View style={styles.lightningContainer}>
              <View style={styles.lightningBolt} />
            </View>
          </View>
          
          {/* Raindrops */}
          <View style={styles.rainContainer}>
            <View style={[styles.raindrop, styles.raindrop1]} />
            <View style={[styles.raindrop, styles.raindrop2]} />
            <View style={[styles.raindrop, styles.raindrop3]} />
            <View style={[styles.raindrop, styles.raindrop4]} />
            <View style={[styles.raindrop, styles.raindrop5]} />
          </View>
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
    stormCloud: {
      width: 200,
      height: 150,
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
    },
    cloudPart: {
      position: "absolute",
      backgroundColor: "#4a5568",
      borderRadius: 50,
    },
    cloudPart1: {
      width: 80,
      height: 80,
      top: 20,
      left: 20,
    },
    cloudPart2: {
      width: 100,
      height: 100,
      top: 10,
      left: 50,
    },
    cloudPart3: {
      width: 90,
      height: 90,
      top: 30,
      left: 90,
    },
    cloudPart4: {
      width: 70,
      height: 70,
      top: 40,
      left: 120,
    },
    lightningContainer: {
      position: "absolute",
      top: 60,
      left: 90,
      zIndex: 10,
    },
    lightningBolt: {
      width: 20,
      height: 60,
      backgroundColor: "#fbbf24",
      transform: [{ rotate: "15deg" }, { skewX: "-20deg" }],
    },
    rainContainer: {
      position: "absolute",
      bottom: 20,
      width: "100%",
      height: 100,
    },
    raindrop: {
      position: "absolute",
      width: 4,
      height: 20,
      backgroundColor: "#1e40af",
      borderRadius: 2,
    },
    raindrop1: {
      left: "20%",
      top: 10,
    },
    raindrop2: {
      left: "35%",
      top: 20,
    },
    raindrop3: {
      left: "50%",
      top: 15,
    },
    raindrop4: {
      left: "65%",
      top: 25,
    },
    raindrop5: {
      left: "80%",
      top: 18,
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
