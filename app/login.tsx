import React, { useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useLanguage } from "@/hooks/use-language";

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("juan@plantanim.com");
  const [password, setPassword] = useState("........");
  const [showPassword, setShowPassword] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleLogin = () => {
    // Skip actual login for now, navigate to location screen
    router.push("/set-location");
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=80",
        }}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.5)"]}
          style={StyleSheet.absoluteFill}
        />

        {/* Logo and Title */}
        <SafeAreaView style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <MaterialIcons name="agriculture" size={40} color="#137fec" />
            </View>
            <Text style={styles.appTitle}>Project Plantanim</Text>
            <Text style={styles.tagline}>Resilient Farming for Central Luzon</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Login Form */}
      <View style={styles.formContainer}>
        <ScrollView
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.welcomeTitle}>{t("login.welcome")}</Text>
          <Text style={styles.instructionText}>
            {t("login.instruction")}
          </Text>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t("login.email")}</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="email"
                size={20}
                color="#6b7280"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="juan@plantanim.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordLabelRow}>
              <Text style={styles.inputLabel}>{t("login.password")}</Text>
              <Pressable>
                <Text style={styles.forgotPassword}>{t("login.forgot.password")}</Text>
              </Pressable>
            </View>
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="lock"
                size={20}
                color="#6b7280"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={20}
                  color="#6b7280"
                />
              </Pressable>
            </View>
          </View>

          {/* Login Button */}
          <Pressable style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>{t("login.button")}</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </Pressable>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>{t("login.signup.text")}</Text>
            <Pressable>
              <Text style={styles.signUpLink}>{t("login.signup.link")}</Text>
            </Pressable>
          </View>

          {/* Footer Links */}
          <View style={styles.footerLinks}>
            <Pressable style={styles.footerLink}>
              <MaterialIcons name="help-outline" size={16} color="#6b7280" />
              <Text style={styles.footerLinkText}>{t("login.help")}</Text>
            </Pressable>
            <Pressable style={styles.footerLink}>
              <MaterialIcons name="check-circle-outline" size={16} color="#6b7280" />
              <Text style={styles.footerLinkText}>{t("login.privacy")}</Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Terms and Policy */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>{t("login.terms.text")}</Text>
          <View style={styles.termsLinks}>
            <Pressable>
              <Text style={styles.termsLink}>{t("login.terms.link")}</Text>
            </Pressable>
            <Text style={styles.termsText}> and </Text>
            <Pressable>
              <Text style={styles.termsLink}>{t("login.privacy.link")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#ffffff",
    },
    backgroundImage: {
      height: "40%",
      width: "100%",
    },
    backgroundImageStyle: {
      opacity: 0.9,
    },
    header: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 40,
    },
    logoContainer: {
      alignItems: "center",
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 20,
      backgroundColor: "#ffffff",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    appTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: "#ffffff",
      marginBottom: 8,
    },
    tagline: {
      fontSize: 14,
      color: "#e5e7eb",
      fontWeight: "500",
    },
    formContainer: {
      flex: 1,
      backgroundColor: "#ffffff",
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      marginTop: -20,
      paddingTop: 32,
    },
    formContent: {
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
    welcomeTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: "#1f2937",
      marginBottom: 8,
    },
    instructionText: {
      fontSize: 14,
      color: "#6b7280",
      marginBottom: 4,
    },
    instructionTextFilipino: {
      fontSize: 12,
      color: "#9ca3af",
      fontStyle: "italic",
      marginBottom: 24,
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: "#1f2937",
      marginBottom: 8,
    },
    passwordLabelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    forgotPassword: {
      fontSize: 14,
      color: "#137fec",
      fontWeight: "600",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#f3f4f6",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: "#1f2937",
    },
    eyeIcon: {
      padding: 4,
    },
    loginButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: "#137fec",
      paddingVertical: 16,
      borderRadius: 12,
      marginTop: 8,
      marginBottom: 24,
    },
    loginButtonText: {
      color: "#ffffff",
      fontSize: 18,
      fontWeight: "700",
    },
    signUpContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    signUpText: {
      fontSize: 14,
      color: "#6b7280",
    },
    signUpLink: {
      fontSize: 14,
      color: "#137fec",
      fontWeight: "700",
    },
    footerLinks: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 24,
      marginBottom: 16,
    },
    footerLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    footerLinkText: {
      fontSize: 12,
      color: "#6b7280",
    },
    termsContainer: {
      paddingHorizontal: 24,
      paddingBottom: 24,
      alignItems: "center",
    },
    termsText: {
      fontSize: 12,
      color: "#9ca3af",
      textAlign: "center",
    },
    termsLinks: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
    },
    termsLink: {
      fontSize: 12,
      color: "#137fec",
      fontWeight: "600",
    },
  });
