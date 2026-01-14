import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { DailyForecastItem, fetchWeatherForecast } from "@/lib/weather";
import { MaterialIcons } from "@expo/vector-icons";
import {
  requestNotificationPermissions,
  areNotificationsEnabled,
  setNotificationsEnabled,
  scheduleTaskNotificationsForUpcoming,
  scheduleSuggestionNotificationsForUrgent,
  getAllScheduledNotifications,
  ScheduledNotification,
  cleanupExpiredNotifications,
  isExpoGo,
  areNotificationsSupported,
} from "@/lib/notifications";
import { DailyTask, TaskStatus, generateDailyTasks } from "@/lib/daily-tasks";
import { Suggestion } from "@/lib/weather-suggestions";
import { useUserCrops } from "@/hooks/use-user-crops";
import { useCropPlantingDates } from "@/hooks/use-crop-planting-dates";
import { generateWeatherSuggestions } from "@/lib/weather-suggestions";

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

// Helper function to get icon for task type
function getIconForTaskType(taskType: string): keyof typeof MaterialIcons.glyphMap {
  switch (taskType) {
    case "Planting":
      return "eco";
    case "Fertilizing":
      return "agriculture";
    case "Weeding":
      return "grass";
    case "Monitoring":
      return "visibility";
    case "HarvestPrep":
    case "Harvest":
      return "inventory";
    case "Irrigation":
      return "water-drop";
    case "PestControl":
      return "pest-control";
    case "LandPreparation":
      return "landscape";
    default:
      return "check-circle";
  }
}

// Helper function to format date for display
function formatAlertDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  if (dateOnly.getTime() === today.getTime()) {
    return "Today";
  } else if (dateOnly.getTime() === yesterday.getTime()) {
    return "Yesterday";
  } else {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return daysOfWeek[date.getDay()];
  }
}

const FILTER_CATEGORIES: { key: FilterCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "urgent", label: "Urgent" },
  { key: "weather", label: "Weather" },
  { key: "farming", label: "Farming" },
];

export default function AlertsScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const { crops } = useUserCrops();
  const { plantingDates } = useCropPlantingDates();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [weatherAlerts, setWeatherAlerts] = useState<Alert[]>([]);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<DailyTask[]>([]);
  const [urgentSuggestions, setUrgentSuggestions] = useState<Suggestion[]>([]);
  const [isExpoGoEnv, setIsExpoGoEnv] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Alert[]>([]);

  // Check if running in Expo Go
  useEffect(() => {
    setIsExpoGoEnv(isExpoGo());
  }, []);

  // Load notification settings and permissions
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        // Check if notifications are supported
        if (!areNotificationsSupported()) {
          setNotificationsEnabledState(false);
          return;
        }

        const enabled = await areNotificationsEnabled();
        setNotificationsEnabledState(enabled);
        
        if (enabled) {
          const hasPermission = await requestNotificationPermissions();
          if (!hasPermission && !isExpoGo()) {
            Alert.alert(
              "Notification Permission",
              "Please enable notifications in your device settings to receive farming reminders.",
              [{ text: "OK" }]
            );
          }
        }
      } catch (error) {
        console.error("Error loading notification settings:", error);
      }
    };

    loadNotificationSettings();
  }, []);

  // Load scheduled notifications
  useEffect(() => {
    const loadScheduledNotifications = async () => {
      try {
        await cleanupExpiredNotifications();
        const notifications = await getAllScheduledNotifications();
        setScheduledNotifications(notifications);
      } catch (error) {
        console.error("Error loading scheduled notifications:", error);
      }
    };

    if (notificationsEnabled) {
      loadScheduledNotifications();
    }
  }, [notificationsEnabled]);

  // Load tasks and suggestions for notification scheduling
  useEffect(() => {
    const loadTasksAndSuggestions = async () => {
      try {
        // Generate tasks for all crops
        const allTasks: DailyTask[] = [];
        const selectedCrops = crops.filter((c) => c.selected);
        
        for (const crop of selectedCrops) {
          const dates = plantingDates.filter((pd) => pd.cropId === crop.id);
          for (const pd of dates) {
            const tasks = generateDailyTasks(
              crop.id,
              new Date(pd.plantingDate),
              new Date(),
              7 // Look ahead 7 days
            );
            allTasks.push(...tasks);
          }
        }

        // Filter for today and tomorrow
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayStr = today.toISOString().split("T")[0];
        const tomorrowStr = tomorrow.toISOString().split("T")[0];
        
        const upcoming = allTasks.filter(
          (task) =>
            (task.date === todayStr || task.date === tomorrowStr) &&
            task.status === "Pending"
        );
        setUpcomingTasks(upcoming);

        // Generate weather suggestions
        const { daily, currentWeather } = await fetchWeatherForecast();
        const locationJson = await AsyncStorage.getItem("@plantanim:user_location");
        const location = locationJson
          ? JSON.parse(locationJson)
          : { municipality: "Balanga City" };
        
        const tasksJson = await AsyncStorage.getItem("@plantanim:calendar_tasks");
        const tasks = tasksJson ? JSON.parse(tasksJson) : [];

        const suggestions = generateWeatherSuggestions(
          {
            currentWeather,
            dailyForecast: daily,
            typhoonAlert: false,
            rainVolumeMm: undefined,
          },
          {
            municipality: location.municipality || "Balanga City",
            barangay: location.barangay,
          },
          {
            selectedCropIds: selectedCrops.map((c) => c.id),
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

        const urgent = suggestions.filter(
          (s) => s.priority === "HIGH" && new Date(s.validUntil) >= new Date()
        );
        setUrgentSuggestions(urgent);

        // Schedule notifications if enabled
        if (notificationsEnabled) {
          await scheduleTaskNotificationsForUpcoming(upcoming);
          await scheduleSuggestionNotificationsForUrgent(urgent);
          
          // Reload scheduled notifications
          const notifications = await getAllScheduledNotifications();
          setScheduledNotifications(notifications);
        }
      } catch (error) {
        console.error("Error loading tasks and suggestions:", error);
      }
    };

    if (notificationsEnabled && crops.length > 0) {
      loadTasksAndSuggestions();
    }
  }, [notificationsEnabled, crops, plantingDates]);

  useEffect(() => {
    let isMounted = true;

    const buildWeatherAlerts = (daily: DailyForecastItem[]): Alert[] => {
      const alerts: Alert[] = [];

      if (!daily || daily.length === 0) {
        return alerts;
      }

      const today = daily[0];
      const tomorrow = daily[1];
      const todayPrecip = today?.precipitation ?? 0;

      // Urgent / heavy rain alert for today
      if (todayPrecip >= 70) {
        alerts.push({
          id: "today-urgent-rain",
          type: "urgent",
          title: "URGENT: HEAVY RAIN TODAY",
          subtitle: "High Flood & Runoff Risk Near Your Farm",
          timestamp: "Now",
          description: `Rain chance today is ${todayPrecip}%. Secure irrigation channels and delay fertilizer.`,
          details:
            "Expect intense showers and possible localized flooding, especially in low-lying areas.",
          image:
            "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1200&q=80",
          buttonText: "View Safety Protocols",
          buttonIcon: "shield",
        });
      } else if (todayPrecip >= 40) {
        alerts.push({
          id: "today-heavy-rain",
          type: "weather",
          title: "Heavy Rainfall Advisory",
          subtitle: "Plan Field Work Carefully",
          timestamp: "Today",
          description: `Moderate to heavy rain possible today (${todayPrecip}% chance).`,
          icon: "water-drop",
          iconColor: "#3b82f6",
          iconBg: "#dbeafe",
        });
      }

      // Heat alert for today
      if (today && today.high >= 34 && todayPrecip < 40) {
        alerts.push({
          id: "today-heat-stress",
          type: "weather",
          title: "Heat Stress Warning",
          subtitle: "High Temperature Near Your Area",
          timestamp: "Today Afternoon",
          description: `High of ${today.high}°C. Extra irrigation and farmer hydration recommended.`,
          icon: "wb-sunny",
          iconColor: "#f59e0b",
          iconBg: "#fef3c7",
        });
      }

      // Tomorrow rain heads-up
      if (tomorrow && (tomorrow.precipitation ?? 0) >= 60) {
        alerts.push({
          id: "tomorrow-rain",
          type: "weather",
          title: "Tomorrow Rain Alert",
          subtitle: "Advance Planning",
          timestamp: "Tomorrow",
          description: `Rain chance tomorrow is ${tomorrow.precipitation}% – finish sensitive tasks today.`,
          icon: "grain",
          iconColor: "#3b82f6",
          iconBg: "#dbeafe",
        });
      }

      return alerts;
    };

    const loadWeatherAlerts = async () => {
      try {
        const { daily } = await fetchWeatherForecast();
        if (!isMounted) return;
        setWeatherAlerts(buildWeatherAlerts(daily));
      } catch (error) {
        console.error("Error building weather alerts:", error);
      }
    };

    loadWeatherAlerts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load completed tasks from the past week
  useEffect(() => {
    const loadCompletedTasks = async () => {
      try {
        const TASK_STATUS_STORAGE_KEY = "@plantanim:daily_task_statuses";
        const statusesJson = await AsyncStorage.getItem(TASK_STATUS_STORAGE_KEY);
        const statuses: Record<string, TaskStatus> = statusesJson ? JSON.parse(statusesJson) : {};

        // Generate all tasks for all crops
        const allTasks: DailyTask[] = [];
        const selectedCrops = crops.filter((c) => c.selected);
        
        for (const crop of selectedCrops) {
          const dates = plantingDates.filter((pd) => pd.cropId === crop.id);
          for (const pd of dates) {
            // Generate tasks for the past 30 days to catch completed ones
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 30);
            const tasks = generateDailyTasks(
              crop.id,
              new Date(pd.plantingDate),
              pastDate,
              60 // Look back 30 days and ahead 30 days
            );
            allTasks.push(...tasks);
          }
        }

        // Filter for completed tasks from the past week
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const completedAlerts: Alert[] = [];
        for (const task of allTasks) {
          const taskStatus = statuses[task.id];
          if (taskStatus === "Completed") {
            const taskDate = new Date(task.date + "T00:00:00");
            // Only include tasks from the past week
            if (taskDate >= weekAgo && taskDate < today) {
              completedAlerts.push({
                id: task.id,
                type: "completed",
                title: task.title,
                timestamp: formatAlertDate(taskDate),
                icon: getIconForTaskType(task.taskType),
                iconColor: "#16a34a",
                iconBg: "#dcfce7",
                isCompleted: true,
                description: task.cropName,
              });
            }
          }
        }

        // Sort by date (most recent first)
        // Store the actual date in the alert for sorting
        const alertsWithDates = completedAlerts.map(alert => {
          const task = allTasks.find(t => t.id === alert.id);
          return {
            ...alert,
            _sortDate: task ? new Date(task.date + "T00:00:00") : new Date(0),
          };
        });
        
        alertsWithDates.sort((a, b) => b._sortDate.getTime() - a._sortDate.getTime());
        
        // Remove the temporary _sortDate property
        const sortedAlerts = alertsWithDates.map(({ _sortDate, ...alert }) => alert);

        setCompletedTasks(sortedAlerts);
      } catch (error) {
        console.error("Error loading completed tasks:", error);
        setCompletedTasks([]);
      }
    };

    if (crops.length > 0 && plantingDates.length > 0) {
      loadCompletedTasks();
    }
  }, [crops, plantingDates]);

  const allActiveAlerts = useMemo(
    () => [...weatherAlerts],
    [weatherAlerts],
  );

  const filteredAlerts = useMemo(() => {
    if (activeFilter === "all") {
      return allActiveAlerts;
    }
    return allActiveAlerts.filter((alert) => alert.type === activeFilter);
  }, [activeFilter, allActiveAlerts]);

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

        {/* Notification Module */}
        <View style={styles.notificationModule}>
          <View style={styles.notificationHeader}>
            <View style={styles.notificationHeaderLeft}>
              <MaterialIcons name="notifications" size={24} color={colors.tint} />
              <Text style={styles.notificationModuleTitle}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled && !isExpoGoEnv}
              onValueChange={async (value) => {
                if (isExpoGoEnv) {
                  Alert.alert(
                    "Development Build Required",
                    "Push notifications are not available in Expo Go (SDK 53+). To use notifications, please create a development build:\n\n1. Run: npx expo prebuild\n2. Run: npx expo run:android (or run:ios)\n\nOr use EAS Build to create a development build.",
                    [{ text: "OK" }]
                  );
                  return;
                }
                setNotificationsEnabledState(value);
                await setNotificationsEnabled(value);
                if (value) {
                  const hasPermission = await requestNotificationPermissions();
                  if (!hasPermission) {
                    Alert.alert(
                      "Permission Required",
                      "Please enable notifications in your device settings.",
                      [{ text: "OK" }]
                    );
                  }
                }
              }}
              trackColor={{ false: colors.icon + "33", true: colors.tint + "80" }}
              thumbColor={notificationsEnabled && !isExpoGoEnv ? colors.tint : colors.icon}
              disabled={isExpoGoEnv}
            />
          </View>

          {isExpoGoEnv && (
            <View style={styles.expoGoWarning}>
              <MaterialIcons name="info" size={20} color="#f59e0b" />
              <View style={styles.expoGoWarningText}>
                <Text style={styles.expoGoWarningTitle}>
                  Notifications Not Available in Expo Go
                </Text>
                <Text style={styles.expoGoWarningBody}>
                  Push notifications require a development build. Use "npx expo prebuild" and "npx expo run:android" to create one.
                </Text>
              </View>
            </View>
          )}
          
          {!isExpoGoEnv && notificationsEnabled && (
            <View style={styles.notificationStats}>
              <View style={styles.statItem}>
                <MaterialIcons name="schedule" size={20} color={colors.tint} />
                <Text style={styles.statText}>
                  {scheduledNotifications.length} scheduled
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="task" size={20} color="#16a34a" />
                <Text style={styles.statText}>
                  {upcomingTasks.length} tasks
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="warning" size={20} color="#e74c3c" />
                <Text style={styles.statText}>
                  {urgentSuggestions.length} alerts
                </Text>
              </View>
            </View>
          )}

          {!isExpoGoEnv && !notificationsEnabled && (
            <Text style={styles.notificationHint}>
              Enable notifications to receive reminders for farming tasks and urgent alerts
            </Text>
          )}
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
        {completedTasks.length > 0 && (
          <View style={styles.completedSection}>
            <Text style={styles.sectionLabel}>EARLIER THIS WEEK</Text>
            {completedTasks.map((alert) => (
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
    notificationModule: {
      borderRadius: 16,
      backgroundColor: theme.surface,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.icon + "22",
    },
    notificationHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    notificationHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    notificationModuleTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.text,
    },
    notificationStats: {
      flexDirection: "row",
      gap: 16,
      flexWrap: "wrap",
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    statText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
    },
    notificationHint: {
      fontSize: 14,
      color: theme.textSubtle,
      lineHeight: 20,
    },
    expoGoWarning: {
      flexDirection: "row",
      gap: 12,
      padding: 12,
      borderRadius: 12,
      backgroundColor: isDark ? "#78350f33" : "#fef3c7",
      borderWidth: 1,
      borderColor: "#f59e0b33",
      marginTop: 8,
    },
    expoGoWarningText: {
      flex: 1,
      gap: 4,
    },
    expoGoWarningTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: "#f59e0b",
    },
    expoGoWarningBody: {
      fontSize: 13,
      color: theme.textSubtle,
      lineHeight: 18,
    },
  });
