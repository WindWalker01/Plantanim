import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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
import { MaterialIcons } from "@expo/vector-icons";

type FilterCategory = "all" | "urgent" | "weather" | "farming";

type Alert = {
  id: string;
  type: "urgent" | "weather" | "farming" | "completed";
  title: string;
  subtitle?: string;
  timestamp: string;
  description?: string;
  details?: string;
  image?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  buttonText?: string;
  buttonIcon?: keyof typeof MaterialIcons.glyphMap;
  isCompleted?: boolean;
};

const ALERTS: Alert[] = [
  {
    id: "typhoon-signal-2",
    type: "urgent",
    title: "URGENT: TYPHOON SIGNAL NO. 2",
    subtitle: "Critical Weather Warning • Central Luzon",
    timestamp: "Now",
    description: "Expected landfall in 4 hours. Secure crops immediately.",
    details:
      "Strong winds (61-120 kph) expected within 24 hours. Risk of storm surge in coastal areas.",
    image:
      "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1200&q=80",
    buttonText: "View Safety Protocols",
    buttonIcon: "shield",
  },
  {
    id: "pest-warning",
    type: "farming",
    title: "FARMING ALERT",
    subtitle: "Pest Warning: Brown Planthopper",
    timestamp: "Today, 8:00 AM",
    description: "High risk of infestation",
    details:
      "Scouting reports indicate increased population in rice fields. Immediate preventive action recommended.",
    icon: "pest-control",
    iconColor: "#f59e0b",
    iconBg: "#fef3c7",
    buttonText: "See Treatment Plan",
  },
  {
    id: "heavy-rainfall",
    type: "weather",
    title: "Heavy Rainfall Advisory",
    timestamp: "Yesterday",
    description: "Moderate rain expected",
    icon: "water-drop",
    iconColor: "#3b82f6",
    iconBg: "#dbeafe",
  },
  {
    id: "heat-stress",
    type: "weather",
    title: "Heat Stress Warning",
    timestamp: "Yesterday, 1:45 PM",
    description: "Hydration required",
    icon: "wb-sunny",
    iconColor: "#f59e0b",
    iconBg: "#fef3c7",
  },
  {
    id: "fertilizer-schedule",
    type: "completed",
    title: "Fertilizer Schedule",
    timestamp: "Mon, 9:00 AM",
    icon: "eco",
    iconColor: "#16a34a",
    iconBg: "#dcfce7",
    isCompleted: true,
  },
  {
    id: "irrigation-complete",
    type: "completed",
    title: "Irrigation Complete",
    timestamp: "Sun, 5:30 PM",
    icon: "water-drop",
    iconColor: "#3b82f6",
    iconBg: "#dbeafe",
    isCompleted: true,
  },
];

const FILTER_CATEGORIES: { key: FilterCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "urgent", label: "Urgent" },
  { key: "weather", label: "Weather" },
  { key: "farming", label: "Farming" },
];

export default function AlertsScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  const filteredAlerts = useMemo(() => {
    if (activeFilter === "all") {
      return ALERTS.filter((alert) => alert.type !== "completed");
    }
    return ALERTS.filter(
      (alert) =>
        alert.type === activeFilter || (activeFilter === "urgent" && alert.type === "urgent"),
    );
  }, [activeFilter]);

  const completedAlerts = useMemo(
    () => ALERTS.filter((alert) => alert.type === "completed"),
    [],
  );

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Back"
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.screenTitle}>Alerts & Notifications</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Category Filters */}
        <View style={styles.categoryRow}>
          {FILTER_CATEGORIES.map((cat) => {
            const isActive = activeFilter === cat.key;
            return (
              <Pressable
                key={cat.key}
                style={[
                  styles.categoryPill,
                  isActive && styles.categoryPillActive,
                ]}
                onPress={() => setActiveFilter(cat.key)}
              >
                {cat.key === "urgent" && !isActive && (
                  <MaterialIcons
                    name="warning"
                    size={16}
                    color="#e74c3c"
                    style={styles.categoryIcon}
                  />
                )}
                <Text
                  style={[
                    styles.categoryLabel,
                    isActive && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Alerts List */}
        <View style={styles.alertsList}>
          {filteredAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} theme={colors} styles={styles} isDark={isDark} />
          ))}
        </View>

        {/* Earlier This Week Section */}
        {completedAlerts.length > 0 && (
          <View style={styles.completedSection}>
            <Text style={styles.sectionLabel}>EARLIER THIS WEEK</Text>
            {completedAlerts.map((alert) => (
              <CompletedAlertCard
                key={alert.id}
                alert={alert}
                theme={colors}
                styles={styles}
                isDark={isDark}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AlertCard({
  alert,
  theme,
  styles,
  isDark,
}: {
  alert: Alert;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
  isDark?: boolean;
}) {
  if (alert.type === "urgent") {
    return <UrgentAlertCard alert={alert} theme={theme} styles={styles} isDark={isDark} />;
  }

  if (alert.type === "farming") {
    return <FarmingAlertCard alert={alert} theme={theme} styles={styles} isDark={isDark} />;
  }

  return <SimpleAlertCard alert={alert} theme={theme} styles={styles} isDark={isDark} />;
}

function UrgentAlertCard({
  alert,
  theme,
  styles,
  isDark,
}: {
  alert: Alert;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
  isDark?: boolean;
}) {
  return (
    <View style={styles.urgentCard}>
      <View style={styles.urgentCardContent}>
        <View style={styles.urgentHeader}>
          <MaterialIcons name="warning" size={32} color="#e74c3c" />
          <Text style={styles.urgentTitle}>{alert.title}</Text>
        </View>
        {alert.subtitle && (
          <Text style={styles.urgentSubtitle}>{alert.subtitle}</Text>
        )}
        {alert.image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: alert.image }} style={styles.urgentImage} />
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE TRACKING</Text>
            </View>
          </View>
        )}
        {alert.description && (
          <Text style={styles.urgentDescription}>{alert.description}</Text>
        )}
        {alert.details && (
          <Text style={styles.urgentDetails}>{alert.details}</Text>
        )}
        {alert.buttonText && (
          <Pressable style={styles.safetyButton}>
            <MaterialIcons name={alert.buttonIcon || "shield"} size={20} color="#fff" />
            <Text style={styles.safetyButtonText}>{alert.buttonText}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function FarmingAlertCard({
  alert,
  theme,
  styles,
  isDark,
}: {
  alert: Alert;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
  isDark?: boolean;
}) {
  // Adapt icon background for dark mode
  const getIconBg = (defaultBg: string) => {
    if (isDark) {
      // Use darker, more transparent versions for dark mode
      if (defaultBg === "#fef3c7") return "#f59e0b33"; // yellow
      if (defaultBg === "#dbeafe") return "#3b82f633"; // blue
      return defaultBg + "33";
    }
    return defaultBg;
  };

  return (
    <View style={styles.farmingCard}>
      <View style={styles.farmingHeader}>
        <View
          style={[
            styles.farmingIconContainer,
            { backgroundColor: getIconBg(alert.iconBg || "#fef3c7") },
          ]}
        >
          <MaterialIcons
            name={alert.icon || "pest-control"}
            size={24}
            color={alert.iconColor || "#f59e0b"}
          />
        </View>
        <View style={styles.farmingTextBlock}>
          <Text style={styles.farmingLabel}>{alert.title}</Text>
          <Text style={styles.farmingTitle}>{alert.subtitle}</Text>
          <Text style={styles.farmingTimestamp}>
            {alert.timestamp} • {alert.description}
          </Text>
        </View>
      </View>
      {alert.details && (
        <Text style={styles.farmingDetails}>{alert.details}</Text>
      )}
      {alert.buttonText && (
        <Pressable style={styles.treatmentButton}>
          <Text style={styles.treatmentButtonText}>
            {alert.buttonText} →
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function SimpleAlertCard({
  alert,
  theme,
  styles,
  isDark,
}: {
  alert: Alert;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
  isDark?: boolean;
}) {
  // Adapt icon background for dark mode
  const getIconBg = (defaultBg: string) => {
    if (isDark) {
      if (defaultBg === "#dbeafe") return "#3b82f633"; // blue
      if (defaultBg === "#fef3c7") return "#f59e0b33"; // yellow
      return defaultBg + "33";
    }
    return defaultBg;
  };

  return (
    <Pressable style={styles.simpleCard}>
      <View
        style={[
          styles.simpleIconContainer,
          { backgroundColor: getIconBg(alert.iconBg || "#dbeafe") },
        ]}
      >
        <MaterialIcons
          name={alert.icon || "info"}
          size={20}
          color={alert.iconColor || "#3b82f6"}
        />
      </View>
      <View style={styles.simpleTextBlock}>
        <Text style={styles.simpleTitle}>{alert.title}</Text>
        <Text style={styles.simpleTimestamp}>
          {alert.timestamp} • {alert.description}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={theme.icon} />
    </Pressable>
  );
}

function CompletedAlertCard({
  alert,
  theme,
  styles,
  isDark,
}: {
  alert: Alert;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
  isDark?: boolean;
}) {
  // Adapt icon background for dark mode
  const getIconBg = (defaultBg: string) => {
    if (isDark) {
      if (defaultBg === "#dbeafe") return "#3b82f633"; // blue
      if (defaultBg === "#dcfce7") return "#16a34a33"; // green
      return defaultBg + "33";
    }
    return defaultBg;
  };

  return (
    <Pressable style={styles.completedCard}>
      <View
        style={[
          styles.completedIconContainer,
          { backgroundColor: getIconBg(alert.iconBg || "#dbeafe") },
        ]}
      >
        <MaterialIcons
          name={alert.icon || "check-circle"}
          size={20}
          color={alert.iconColor || "#3b82f6"}
        />
      </View>
      <View style={styles.completedTextBlock}>
        <Text style={styles.completedTitle}>{alert.title}</Text>
        <Text style={styles.completedTimestamp}>{alert.timestamp}</Text>
      </View>
      <MaterialIcons name="check" size={20} color={theme.icon} />
    </Pressable>
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
      paddingBottom: 100,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
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
    categoryRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 20,
    },
    categoryPill: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.icon + "33",
      backgroundColor: theme.surface,
    },
    categoryPillActive: {
      backgroundColor: theme.tint,
      borderColor: theme.tint,
    },
    categoryIcon: {
      marginRight: 6,
    },
    categoryLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text,
    },
    categoryLabelActive: {
      color: "#fff",
    },
    alertsList: {
      gap: 16,
    },
    urgentCard: {
      borderRadius: 16,
      backgroundColor: isDark ? "#7f1d1d" : "#fee2e2",
      borderLeftWidth: 6,
      borderLeftColor: "#e74c3c",
      overflow: "hidden",
    },
    urgentCardContent: {
      padding: 16,
      gap: 12,
    },
    urgentHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    urgentTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: "900",
      color: "#e74c3c",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    urgentSubtitle: {
      fontSize: 14,
      color: theme.text,
      fontWeight: "600",
      marginTop: -4,
    },
    imageContainer: {
      position: "relative",
      borderRadius: 12,
      overflow: "hidden",
      marginVertical: 8,
    },
    urgentImage: {
      width: "100%",
      height: 200,
      resizeMode: "cover",
    },
    liveBadge: {
      position: "absolute",
      bottom: 12,
      left: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#e74c3c",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
    },
    liveDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#fff",
    },
    liveText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    urgentDescription: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.text,
      marginTop: 4,
    },
    urgentDetails: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.textSubtle,
    },
    safetyButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: theme.tint,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginTop: 8,
    },
    safetyButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "800",
    },
    farmingCard: {
      borderRadius: 16,
      backgroundColor: theme.surface,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: theme.icon + "22",
    },
    farmingHeader: {
      flexDirection: "row",
      gap: 12,
    },
    farmingIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    farmingTextBlock: {
      flex: 1,
      gap: 4,
    },
    farmingLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.text,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    farmingTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.text,
    },
    farmingTimestamp: {
      fontSize: 14,
      color: theme.textSubtle,
    },
    farmingDetails: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.textSubtle,
      marginTop: 4,
    },
    treatmentButton: {
      alignSelf: "flex-start",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.tint,
      backgroundColor: theme.surface,
    },
    treatmentButtonText: {
      color: theme.tint,
      fontSize: 15,
      fontWeight: "700",
    },
    simpleCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.icon + "22",
    },
    simpleIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    simpleTextBlock: {
      flex: 1,
      gap: 4,
    },
    simpleTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.text,
    },
    simpleTimestamp: {
      fontSize: 14,
      color: theme.textSubtle,
    },
    completedSection: {
      marginTop: 32,
      gap: 12,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.textSubtle,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 8,
    },
    completedCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.icon + "22",
    },
    completedIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    completedTextBlock: {
      flex: 1,
      gap: 4,
    },
    completedTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.text,
    },
    completedTimestamp: {
      fontSize: 14,
      color: theme.textSubtle,
    },
  });
