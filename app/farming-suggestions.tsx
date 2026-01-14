import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useUserCrops } from "@/hooks/use-user-crops";
import {
  generateWeatherSuggestions,
  getSuggestionDisclaimer,
  Suggestion as WeatherSuggestion,
  SuggestionPriority,
  SuggestionType,
} from "@/lib/weather-suggestions";
import { fetchWeatherForecast, DailyForecastItem, CurrentWeather } from "@/lib/weather";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

type Category = "urgent" | "pending" | "completed";

type Suggestion = {
  id: string;
  title: string;
  description: string;
  category: Category;
  accent: string;
  badge: {
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
  };
  image?: string;
  reason?: string;
  recommendedAction?: string;
  dismissible: boolean;
  weatherSuggestion?: WeatherSuggestion; // Keep reference to original
};

const CATEGORY_ORDER: { key: Category; label: string }[] = [
  { key: "urgent", label: "Urgent" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
];

const DISMISSED_STORAGE_KEY = "@plantanim:dismissed_suggestions";

// Helper functions to map weather suggestions to UI format
function getIconForSuggestionType(type: SuggestionType): keyof typeof MaterialIcons.glyphMap {
  switch (type) {
    case "RiskWarning":
      return "warning";
    case "FarmingAdvice":
      return "eco";
    case "ScheduleSuggestion":
      return "event";
    default:
      return "info";
  }
}

function getAccentColorForPriority(priority: SuggestionPriority): string {
  switch (priority) {
    case "HIGH":
      return "#e74c3c";
    case "MEDIUM":
      return "#f59e0b";
    case "LOW":
      return "#2563eb";
    default:
      return "#6b7280";
  }
}

function getBadgeLabelForPriority(priority: SuggestionPriority): string {
  switch (priority) {
    case "HIGH":
      return "High Priority";
    case "MEDIUM":
      return "Medium Priority";
    case "LOW":
      return "Low Priority";
    default:
      return "Advisory";
  }
}

function mapWeatherSuggestionToUI(ws: WeatherSuggestion): Suggestion {
  const category: Category =
    ws.priority === "HIGH" ? "urgent" : ws.priority === "MEDIUM" ? "pending" : "completed";

  return {
    id: ws.id,
    title: ws.title,
    description: ws.message,
    category,
    accent: getAccentColorForPriority(ws.priority),
    badge: {
      label: getBadgeLabelForPriority(ws.priority),
      icon: getIconForSuggestionType(ws.type),
    },
    reason: ws.reason,
    recommendedAction: ws.recommendedAction,
    dismissible: ws.dismissible,
    weatherSuggestion: ws,
  };
}

export default function FarmingSuggestionsScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { crops } = useUserCrops();
  const [activeCategory, setActiveCategory] = useState<Category>("urgent");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyForecastItem[]>([]);
  const [typhoonAlert, setTyphoonAlert] = useState(false);

  // Load dismissed suggestions from storage and fetch weather data
  useEffect(() => {
    let isMounted = true;

    const loadSuggestions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load dismissed IDs first
        let dismissedSet = new Set<string>();
        try {
          const dismissedJson = await AsyncStorage.getItem(DISMISSED_STORAGE_KEY);
          if (dismissedJson) {
            const dismissed = JSON.parse(dismissedJson) as string[];
            dismissedSet = new Set(dismissed);
          }
        } catch (error) {
          console.error("Error loading dismissed suggestions:", error);
        }

        if (!isMounted) return;
        setDismissedIds(dismissedSet);

        // Fetch weather data
        const { daily, currentWeather: cw } = await fetchWeatherForecast();
        if (!isMounted) return;

        setCurrentWeather(cw);
        setDailyForecast(daily);

        // Get location from storage
        const locationJson = await AsyncStorage.getItem("@plantanim:user_location");
        const location = locationJson
          ? JSON.parse(locationJson)
          : { municipality: "Balanga City" };

        // Get tasks from calendar
        const tasksJson = await AsyncStorage.getItem("@plantanim:calendar_tasks");
        const tasks = tasksJson ? JSON.parse(tasksJson) : [];

        // Generate weather suggestions
        const weatherSuggestions = generateWeatherSuggestions(
          {
            currentWeather: cw,
            dailyForecast: daily,
            typhoonAlert: typhoonAlert, // TODO: Get from weather API or alert service
            rainVolumeMm: undefined, // TODO: Get from API if available
          },
          {
            municipality: location.municipality || "Balanga City",
            barangay: location.barangay,
          },
          {
            selectedCropIds: crops.filter((c) => c.selected).map((c) => c.id),
          },
          {
            tasks: tasks.map((t: any) => ({
              id: t.id,
              title: t.title,
              dateKey: t.dateKey,
              taskType: t.taskType,
            })),
          }
        );

        if (!isMounted) return;

        // Map to UI format and filter out dismissed
        const mapped = weatherSuggestions
          .filter((ws) => {
            // Filter out expired suggestions
            const validUntil = new Date(ws.validUntil);
            if (validUntil < new Date()) return false;
            return true;
          })
          .map(mapWeatherSuggestionToUI)
          .filter((s) => !dismissedSet.has(s.id));

        setSuggestions(mapped);
      } catch (err) {
        console.error("Error loading weather suggestions:", err);
        if (isMounted) {
          setError("Unable to load weather suggestions. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSuggestions();

    return () => {
      isMounted = false;
    };
  }, [crops, typhoonAlert]);

  const counts = useMemo(() => {
    return CATEGORY_ORDER.reduce<Record<Category, number>>((acc, cat) => {
      acc[cat.key] = suggestions.filter((item) => item.category === cat.key).length;
      return acc;
    }, {} as Record<Category, number>);
  }, [suggestions]);

  const filteredSuggestions = useMemo(
    () => suggestions.filter((item) => item.category === activeCategory),
    [suggestions, activeCategory]
  );

  // Get highest priority suggestion for banner
  const highestPrioritySuggestion = useMemo(() => {
    const urgent = suggestions.filter((s) => s.category === "urgent");
    return urgent.length > 0 ? urgent[0] : null;
  }, [suggestions]);

  // Handle dismiss
  const handleDismiss = async (suggestionId: string) => {
    try {
      const newDismissed = new Set(dismissedIds);
      newDismissed.add(suggestionId);
      setDismissedIds(newDismissed);
      await AsyncStorage.setItem(
        DISMISSED_STORAGE_KEY,
        JSON.stringify(Array.from(newDismissed))
      );
      // Remove from suggestions immediately
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    } catch (error) {
      console.error("Error dismissing suggestion:", error);
    }
  };

  // Handle mark as done (for now, same as dismiss)
  const handleMarkDone = async (suggestionId: string) => {
    await handleDismiss(suggestionId);
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  // Determine banner content based on weather
  const bannerTitle = useMemo(() => {
    if (typhoonAlert) return "Typhoon Warning";
    if (highestPrioritySuggestion?.category === "urgent") {
      return highestPrioritySuggestion.title;
    }
    if (dailyForecast[0]?.precipitation && dailyForecast[0].precipitation >= 70) {
      return "Heavy Rain Alert";
    }
    return "Weather Advisory";
  }, [typhoonAlert, highestPrioritySuggestion, dailyForecast]);

  const showBanner = useMemo(() => {
    return (
      typhoonAlert ||
      highestPrioritySuggestion?.category === "urgent" ||
      (dailyForecast[0]?.precipitation ?? 0) >= 70
    );
  }, [typhoonAlert, highestPrioritySuggestion, dailyForecast]);

  const signalCardContent = useMemo(() => {
    const today = dailyForecast[0];
    if (!today && !currentWeather) return null;

    const temp = currentWeather?.temperature ?? today?.high ?? 0;
    const wind = currentWeather?.windSpeedKmh ?? 0;
    const precip = today?.precipitation ?? 0;

    let title = "Current Conditions";
    let body = `Temperature: ${temp}°C`;

    if (wind > 0) {
      body += `. Wind: ${wind} km/h`;
    }
    if (precip > 0) {
      body += `. Rain chance: ${precip}%`;
    }

    if (typhoonAlert) {
      title = "Typhoon Alert Active";
      body = `Strong winds and heavy rain expected. ${body}`;
    } else if (precip >= 70) {
      title = "Heavy Rain Expected";
      body = `High chance of heavy rainfall today. ${body}`;
    }

    return { title, body };
  }, [currentWeather, dailyForecast, typhoonAlert]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.back()}
            accessibilityLabel="Back"
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </Pressable>

          <Text style={styles.screenTitle}>Farming Suggestions</Text>

          <Pressable style={styles.iconButton} accessibilityLabel="Settings">
            <MaterialIcons name="settings" size={24} color={colors.text} />
          </Pressable>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
            <Text style={[styles.loadingText, { color: colors.textSubtle }]}>
              Loading weather suggestions...
            </Text>
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color="#e74c3c" />
            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            <Pressable
              style={[styles.retryButton, { backgroundColor: colors.tint }]}
              onPress={() => {
                setError(null);
                setIsLoading(true);
                // Trigger reload by updating a dependency
                setTyphoonAlert((prev) => prev);
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <>
            {/* Headline Alert */}
            {showBanner && (
              <View style={styles.banner}>
                <View style={styles.bannerIcon}>
                  <MaterialIcons
                    name="warning-amber"
                    size={22}
                    color="#e74c3c"
                  />
                </View>
                <Text style={styles.bannerTitle}>{bannerTitle}</Text>
              </View>
            )}

            {/* Signal Card */}
            {signalCardContent && (
              <View style={styles.signalCard}>
                <View style={styles.signalTextBlock}>
                  <Text style={styles.signalTitle}>{signalCardContent.title}</Text>
                  <Text style={styles.signalBody}>{signalCardContent.body}</Text>
                </View>
                <MaterialCommunityIcons
                  name="weather-lightning"
                  size={32}
                  color={colors.tint}
                />
              </View>
            )}

            {/* Category pills */}
            <View style={styles.categoryRow}>
              {CATEGORY_ORDER.map((cat) => {
                const isActive = activeCategory === cat.key;
                return (
                  <Pressable
                    key={cat.key}
                    style={[
                      styles.categoryPill,
                      isActive && {
                        backgroundColor: colors.tint,
                        borderColor: colors.tint,
                      },
                    ]}
                    onPress={() => setActiveCategory(cat.key)}
                  >
                    <Text
                      style={[
                        styles.categoryLabel,
                        isActive && { color: "#fff" },
                      ]}
                    >
                      {cat.label} ({counts[cat.key]})
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Suggestions list */}
            <View style={styles.list}>
              {filteredSuggestions.length > 0 ? (
                <>
                  {filteredSuggestions.map((item) => (
                    <SuggestionCard
                      key={item.id}
                      item={item}
                      theme={colors}
                      styles={styles}
                      onDismiss={handleDismiss}
                      onMarkDone={handleMarkDone}
                    />
                  ))}
                  <Text style={styles.footerText}>End of suggestions</Text>
                </>
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="check-circle" size={64} color={colors.icon} />
                  <Text style={[styles.emptyText, { color: colors.text }]}>
                    No {activeCategory} suggestions at this time
                  </Text>
                  <Text style={[styles.emptySubtext, { color: colors.textSubtle }]}>
                    Weather conditions are favorable for farming activities.
                  </Text>
                </View>
              )}
            </View>

            {/* Disclaimer */}
            <View style={styles.disclaimerContainer}>
              <MaterialIcons name="info-outline" size={16} color={colors.textSubtle} />
              <Text style={[styles.disclaimerText, { color: colors.textSubtle }]}>
                {getSuggestionDisclaimer()}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SuggestionCard({
  item,
  theme,
  styles,
  onDismiss,
  onMarkDone,
}: {
  item: Suggestion;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
  onDismiss: (id: string) => void;
  onMarkDone: (id: string) => void;
}) {
  const accent = item.accent;
  return (
    <View style={[styles.card, { borderColor: accent + "1f" }]}>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: accent + "1a" }]}>
            <MaterialIcons name={item.badge.icon} size={16} color={accent} />
            <Text style={[styles.badgeText, { color: accent }]}>
              {item.badge.label.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardTitleRow}>
          <View style={[styles.cardIconContainer, { backgroundColor: accent + "1a" }]}>
            <MaterialIcons name={item.badge.icon} size={20} color={accent} />
          </View>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {item.title}
          </Text>
        </View>
        <Text style={[styles.cardDescription, { color: theme.textSubtle }]}>
          {item.description}
        </Text>

        {/* Show reason if available */}
        {item.reason && (
          <View style={styles.detailSection}>
            <Text style={[styles.detailLabel, { color: theme.text }]}>Why:</Text>
            <Text style={[styles.detailText, { color: theme.textSubtle }]}>
              {item.reason}
            </Text>
          </View>
        )}

        {/* Show recommended action if available */}
        {item.recommendedAction && (
          <View style={styles.detailSection}>
            <Text style={[styles.detailLabel, { color: theme.text }]}>Action:</Text>
            <Text style={[styles.detailText, { color: theme.textSubtle }]}>
              {item.recommendedAction}
            </Text>
          </View>
        )}

        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.cardImage} />
        ) : null}

        <View style={styles.actions}>
          {item.dismissible ? (
            <Pressable
              style={styles.secondaryButton}
              onPress={() => onDismiss(item.id)}
            >
              <Text style={[styles.secondaryText, { color: theme.text }]}>
                Dismiss
              </Text>
            </Pressable>
          ) : (
            <View style={styles.secondaryButton}>
              <Text style={[styles.secondaryText, { color: theme.textSubtle }]}>
                Cannot dismiss
              </Text>
            </View>
          )}
          <Pressable
            style={[styles.primaryButton, { backgroundColor: accent }]}
            onPress={() => onMarkDone(item.id)}
          >
            <MaterialIcons name="check" size={18} color="#fff" />
            <Text style={styles.primaryText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      padding: 16,
      gap: 16,
      paddingBottom: 56,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    iconButton: {
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
    banner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 12,
    },
    bannerIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fee2e2",
    },
    bannerTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: "#e74c3c",
    },
    signalCard: {
      borderRadius: 16,
      padding: 16,
      gap: 6,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.icon + "22",
    },
    signalTextBlock: {
      flex: 1,
      gap: 4,
    },
    signalTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.text,
    },
    signalBody: {
      fontSize: 15,
      lineHeight: 21,
      color: theme.textSubtle,
    },
    categoryRow: {
      flexDirection: "row",
      gap: 10,
    },
    categoryPill: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.icon + "33",
      backgroundColor: theme.surface,
    },
    categoryLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text,
    },
    list: {
      gap: 14,
    },
    card: {
      borderRadius: 18,
      borderWidth: 1,
      backgroundColor: theme.surface,
      overflow: "hidden",
      flexDirection: "row",
    },
    accentBar: {
      width: 8,
    },
    cardContent: {
      flex: 1,
      padding: 16,
      gap: 10,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    cardTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    cardIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: "800",
      flex: 1,
    },
    cardDescription: {
      fontSize: 15,
      lineHeight: 22,
    },
    cardImage: {
      width: "100%",
      height: 150,
      borderRadius: 14,
      marginTop: 4,
    },
    actions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 4,
    },
    secondaryButton: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.icon + "33",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
    },
    secondaryText: {
      fontSize: 16,
      fontWeight: "700",
    },
    primaryButton: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 6,
    },
    primaryText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "800",
    },
    footerText: {
      textAlign: "center",
      marginTop: 8,
      color: theme.textSubtle,
      fontWeight: "600",
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 48,
      gap: 16,
    },
    loadingText: {
      fontSize: 16,
      fontWeight: "600",
    },
    errorContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 48,
      gap: 16,
    },
    errorText: {
      fontSize: 16,
      textAlign: "center",
      paddingHorizontal: 32,
    },
    retryButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 8,
    },
    retryButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 64,
      gap: 12,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
    },
    emptySubtext: {
      fontSize: 14,
      textAlign: "center",
      paddingHorizontal: 32,
    },
    disclaimerContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      padding: 16,
      marginTop: 16,
      borderRadius: 12,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.icon + "22",
    },
    disclaimerText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
      fontStyle: "italic",
    },
    detailSection: {
      marginTop: 8,
      gap: 4,
    },
    detailLabel: {
      fontSize: 13,
      fontWeight: "700",
    },
    detailText: {
      fontSize: 14,
      lineHeight: 20,
    },
  });
