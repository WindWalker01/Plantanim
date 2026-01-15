import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useLanguage } from "@/hooks/use-language";

const NOTIFICATIONS_KEY = "@plantanim:notifications_enabled";
const LOCATION_KEY = "@plantanim:user_location";

export default function SettingsScreen() {
  const { colors, isDark } = useAppTheme();
  const { language, setLanguage, t, languageName } = useLanguage();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    municipality: string;
    barangay: string;
  } | null>(null);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load notifications setting
      const notifications = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (notifications !== null) {
        setNotificationsEnabled(notifications === "true");
      }

      // Load location
      const locationJson = await AsyncStorage.getItem(LOCATION_KEY);
      if (locationJson) {
        setUserLocation(JSON.parse(locationJson));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, value.toString());
    } catch (error) {
      console.error("Error saving notifications setting:", error);
    }
  };

  const handleUpdateLocation = () => {
    router.push("/set-location");
  };

  const handleManageCrops = () => {
    router.push("/personalization");
  };

  const handleLanguage = () => {
    // Toggle between English and Filipino
    const newLanguage = language === "en" ? "tl" : "en";
    setLanguage(newLanguage);
  };

  const displayLocation = userLocation
    ? `${userLocation.municipality}, ${userLocation.barangay}`
    : "Pampanga, Central Luzon";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.placeholder} />
          <Text style={styles.screenTitle}>{t("settings.title")}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileAvatar}>
              <MaterialIcons name="person" size={48} color={colors.text} />
            </View>
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="check" size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.userName}>Juan Dela Cruz</Text>
          <View style={styles.locationRow}>
            <MaterialIcons name="place" size={16} color={colors.textSubtle} />
            <Text style={styles.locationText}>{displayLocation}</Text>
          </View>
          <Text style={styles.farmerId}>{t("settings.farmer.id")} 2024-PLNT-001</Text>
        </View>

        {/* Farming Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.farming.settings")}</Text>
          <View style={styles.sectionCard}>
            <Pressable
              style={styles.settingRow}
              onPress={handleUpdateLocation}
            >
              <View style={styles.iconContainer}>
                <MaterialIcons name="map" size={20} color={colors.text} />
              </View>
              <Text style={styles.settingText}>{t("settings.update.location")}</Text>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={colors.textSubtle}
              />
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              style={styles.settingRow}
              onPress={handleManageCrops}
            >
              <View style={styles.iconContainer}>
                <MaterialIcons name="eco" size={20} color={colors.text} />
              </View>
              <Text style={styles.settingText}>{t("settings.manage.crops")}</Text>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={colors.textSubtle}
              />
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              style={styles.settingRow}
              onPress={() => router.push("/demo")}
            >
              <View style={styles.iconContainer}>
                <MaterialIcons name="play-circle-filled" size={20} color={colors.text} />
              </View>
              <Text style={styles.settingText}>App Demo</Text>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={colors.textSubtle}
              />
            </Pressable>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.preferences")}</Text>
          <View style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <View style={styles.iconContainer}>
                <View style={styles.bellContainer}>
                  <MaterialIcons name="notifications" size={20} color={colors.text} />
                  {notificationsEnabled && (
                    <View style={styles.notificationBadge} />
                  )}
                </View>
              </View>
              <Text style={styles.settingText}>{t("settings.notifications")}</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: colors.icon + "33", true: colors.tint }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.divider} />

            <Pressable style={styles.settingRow} onPress={handleLanguage}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="language" size={20} color={colors.text} />
              </View>
              <View style={styles.languageContainer}>
                <Text style={styles.settingText}>{t("settings.language")}</Text>
                <Text style={styles.languageValue}>{languageName}</Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={colors.textSubtle}
              />
            </Pressable>
          </View>
        </View>

        {/* Version Info */}
        <Text style={styles.versionText}>{t("settings.version")}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    placeholder: {
      width: 40,
    },
    screenTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.text,
    },
    profileSection: {
      alignItems: "center",
      marginBottom: 32,
    },
    profileImageContainer: {
      position: "relative",
      marginBottom: 16,
    },
    profileAvatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: "#137fec",
      backgroundColor: theme.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    verifiedBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#137fec",
      borderWidth: 3,
      borderColor: theme.background,
      alignItems: "center",
      justifyContent: "center",
    },
    userName: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 8,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 8,
    },
    locationText: {
      fontSize: 14,
      color: theme.textSubtle,
    },
    farmerId: {
      fontSize: 12,
      color: theme.textSubtle,
      fontWeight: "600",
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.textSubtle,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 12,
      marginLeft: 4,
    },
    sectionCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      overflow: "hidden",
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 12,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? theme.icon + "22" : "#dcfce7",
    },
    bellContainer: {
      position: "relative",
    },
    notificationBadge: {
      position: "absolute",
      top: -2,
      right: -2,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#e74c3c",
    },
    settingText: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
    },
    languageContainer: {
      flex: 1,
    },
    languageValue: {
      fontSize: 14,
      color: "#137fec",
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: theme.icon + "11",
      marginLeft: 68,
    },
    versionText: {
      fontSize: 12,
      color: theme.textSubtle,
      textAlign: "center",
    },
  });
