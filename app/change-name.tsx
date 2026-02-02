import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useLanguage } from "@/hooks/use-language";

const STORAGE_KEY = "@plantanim:user_profile";

type UserProfile = {
  fullName: string;
  phoneNumber?: string;
  email?: string;
  location: {
    municipality: string;
    barangay: string;
  };
  createdAt: string;
};

export default function ChangeNameScreen() {
  const { colors } = useAppTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (profileJson) {
        const profile = JSON.parse(profileJson) as UserProfile;
        setFullName(profile.fullName || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }

    try {
      // Load existing profile
      const profileJson = await AsyncStorage.getItem(STORAGE_KEY);
      let profile: UserProfile;

      if (profileJson) {
        profile = JSON.parse(profileJson);
        profile.fullName = fullName.trim();
      } else {
        // Create new profile with default values
        profile = {
          fullName: fullName.trim(),
          location: {
            municipality: "Pampanga",
            barangay: "Central Luzon",
          },
          createdAt: new Date().toISOString(),
        };
      }

      // Save updated profile
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));

      // Navigate back to settings with a refresh flag
      router.back();
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={handleCancel}>
              <MaterialIcons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
            <Text style={styles.screenTitle}>{t("change.name.title")}</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <Text style={styles.mainQuestion}>{t("change.name.update")}</Text>
            <Text style={styles.instruction}>
              {t("change.name.instruction")}
            </Text>

            {/* Name Input Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t("change.name.full.name")}
              </Text>
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="person"
                  size={20}
                  color={colors.textSubtle}
                />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textSubtle}
                  maxLength={50}
                />
              </View>
            </View>

            {/* Character Counter */}
            <Text style={styles.characterCounter}>
              {fullName.length}/50 characters
            </Text>

            {/* Info Text */}
            <Text style={styles.infoText}>{t("change.name.info")}</Text>
          </View>
        </ScrollView>

        {/* Footer with Save Button */}
        <View style={styles.footer}>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{t("change.name.save")}</Text>
            <MaterialIcons name="check" size={20} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
      paddingBottom: 20,
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
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: theme.icon + "22",
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      marginLeft: 12,
      padding: 0,
    },
    characterCounter: {
      fontSize: 12,
      color: theme.textSubtle,
      textAlign: "right",
      marginBottom: 8,
    },
    infoText: {
      fontSize: 12,
      color: theme.textSubtle,
      lineHeight: 18,
    },
    footer: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.icon + "22",
    },
    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: "#137fec",
      paddingVertical: 16,
      borderRadius: 12,
    },
    saveButtonText: {
      color: "#ffffff",
      fontSize: 18,
      fontWeight: "700",
    },
  });
