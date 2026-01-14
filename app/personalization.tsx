import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useLanguage } from "@/hooks/use-language";

const STORAGE_KEY = "@plantanim:user_crops";

type Crop = {
  id: string;
  name: string;
  subtitle: string;
  image: any;
  selected: boolean;
};

const CROPS: Crop[] = [
  {
    id: "rice",
    name: "Rice",
    subtitle: "Selected",
    image: require("../assets/images/rice.jpg"),
    selected: true,
  },
  {
    id: "corn",
    name: "Corn",
    subtitle: "Maize",
    image: require("../assets/images/corn.jpg"),
    selected: false,
  },
  {
    id: "vegetables",
    name: "Vegetables",
    subtitle: "Selected",
    image: require("../assets/images/vegetables.jpg"),
    selected: true,
  },
  {
    id: "root-crops",
    name: "Root crops",
    subtitle: "Potato/Cassava",
    image: require("../assets/images/root_crops.jpg"),
    selected: false,
  },
  {
    id: "mango",
    name: "Mango",
    subtitle: "Fruit trees",
    image: require("../assets/images/mango_tree.jpg"),
    selected: false,
  },
  {
    id: "banana",
    name: "Banana",
    subtitle: "Banana bunch",
    image: require("../assets/images/banana_tree.jpg"),
    selected: false,
  },
  {
    id: "coconut",
    name: "Coconut",
    subtitle: "Palm products",
    image: require("../assets/images/coconut_tree.jpg"),
    selected: false,
  },
];

export default function PersonalizationScreen() {
  const { colors } = useAppTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [crops, setCrops] = useState<Crop[]>(CROPS);
  const [isLoading, setIsLoading] = useState(true);

  const styles = useMemo(() => createStyles(colors), [colors]);

  // Load saved crops on mount
  useEffect(() => {
    loadSavedCrops();
  }, []);

  const loadSavedCrops = async () => {
    try {
      const savedCropsJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedCropsJson) {
        const savedCrops = JSON.parse(savedCropsJson);
        // Merge saved crops with default crops, preserving selection state
        const mergedCrops = CROPS.map((crop) => {
          const savedCrop = savedCrops.find((sc: Crop) => sc.id === crop.id);
          return savedCrop ? { ...crop, selected: savedCrop.selected } : crop;
        });
        setCrops(mergedCrops);
      }
    } catch (error) {
      console.error("Error loading saved crops:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCrop = (id: string) => {
    setCrops((prev) =>
      prev.map((crop) => {
        if (crop.id === id) {
          const newSelected = !crop.selected;
          // Get original subtitle from CROPS array
          const originalCrop = CROPS.find((c) => c.id === crop.id);
          return {
            ...crop,
            selected: newSelected,
            subtitle: newSelected ? "Selected" : originalCrop?.subtitle || "",
          };
        }
        return crop;
      })
    );
  };

  const handleFinish = async () => {
    try {
      // Save selected crops to local storage
      const selectedCrops = crops.filter((crop) => crop.selected);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCrops));

      // Check if we came from settings (check if setup was already complete)
      const setupComplete = await AsyncStorage.getItem(
        "@plantanim:setup_complete"
      );

      if (setupComplete === "true") {
        // User came from settings, go back to settings
        router.back();
      } else {
        // First time setup, mark as complete and go to main app
        await AsyncStorage.setItem("@plantanim:setup_complete", "true");
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Error saving crops:", error);
      // Still navigate even if save fails
      const setupComplete = await AsyncStorage.getItem(
        "@plantanim:setup_complete"
      );
      if (setupComplete === "true") {
        router.back();
      } else {
        router.replace("/(tabs)");
      }
    }
  };

  const selectedCount = crops.filter((crop) => crop.selected).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.screenTitle}>{t("personalization.title")}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.mainQuestion}>
            {t("personalization.question")}
          </Text>
          <Text style={styles.instruction}>
            {t("personalization.instruction")}
          </Text>

          {/* Crop Grid */}
          <View style={styles.cropGrid}>
            {crops.map((crop) => (
              <Pressable
                key={crop.id}
                style={[
                  styles.cropCard,
                  crop.selected && styles.cropCardSelected,
                ]}
                onPress={() => toggleCrop(crop.id)}
              >
                <View style={styles.cropImageContainer}>
                  <Image
                    source={crop.image}
                    style={styles.cropImage}
                    resizeMode="cover"
                  />
                  {crop.selected && (
                    <View style={styles.checkmarkContainer}>
                      <View style={styles.checkmark}>
                        <MaterialIcons name="check" size={16} color="#fff" />
                      </View>
                    </View>
                  )}
                </View>
                <View style={styles.cropTextContainer}>
                  <Text style={styles.cropName}>{crop.name}</Text>
                  <Text
                    style={[
                      styles.cropSubtitle,
                      crop.selected && styles.cropSubtitleSelected,
                    ]}
                  >
                    {crop.selected
                      ? t("personalization.selected")
                      : crop.subtitle}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Finish Button */}
      <View style={styles.footer}>
        <Pressable style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>
            {t("personalization.finish")}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    screenTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.text,
    },
    placeholder: {
      width: 40,
    },
    content: {
      paddingHorizontal: 16,
    },
    mainQuestion: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 12,
    },
    instruction: {
      fontSize: 14,
      color: theme.textSubtle,
      marginBottom: 24,
      lineHeight: 20,
    },
    cropGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 24,
    },
    cropCard: {
      width: "47%",
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 2,
      borderColor: "transparent",
      overflow: "hidden",
    },
    cropCardSelected: {
      borderColor: "#137fec",
    },
    cropImageContainer: {
      width: "100%",
      height: 140,
      position: "relative",
    },
    cropImage: {
      width: "100%",
      height: "100%",
    },
    checkmarkContainer: {
      position: "absolute",
      top: 8,
      right: 8,
    },
    checkmark: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "#137fec",
      alignItems: "center",
      justifyContent: "center",
    },
    cropTextContainer: {
      padding: 12,
    },
    cropName: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 4,
    },
    cropSubtitle: {
      fontSize: 12,
      color: theme.textSubtle,
    },
    cropSubtitleSelected: {
      color: "#137fec",
      fontWeight: "600",
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.icon + "22",
    },
    finishButton: {
      backgroundColor: "#137fec",
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    finishButtonText: {
      color: "#ffffff",
      fontSize: 18,
      fontWeight: "700",
    },
  });
