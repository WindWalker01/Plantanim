import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  generateWeatherSuggestions,
  Suggestion as WeatherSuggestion,
  SuggestionPriority,
  SuggestionType,
} from "@/lib/weather-suggestions";
import { CurrentWeather, DailyForecastItem } from "@/lib/weather";
import { generateDailyTasks, DailyTask } from "@/lib/daily-tasks";

type DemoScenario = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  weatherData: {
    currentWeather: CurrentWeather | null;
    dailyForecast: DailyForecastItem[];
    typhoonAlert?: boolean;
    rainVolumeMm?: number;
  };
  crops?: Array<{ id: string; name: string; plantingDate: Date }>;
};

// Demo Scenarios
const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "typhoon",
    title: "Typhoon Alert",
    description: "See how the app responds to extreme weather warnings",
    icon: "warning",
    weatherData: {
      currentWeather: {
        dateLabel: "Today",
        temperature: 28,
        apparentTemperature: 27,
        windSpeedKmh: 65,
        windDirection: 180,
        icon: "grain",
        summary: "Heavy rain showers",
      },
      dailyForecast: [
        {
          dateISO: new Date().toISOString().split("T")[0],
          dayLabel: "Today",
          high: 28,
          low: 24,
          icon: "grain",
          precipitation: 95,
        },
        {
          dateISO: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          dayLabel: "Tomorrow",
          high: 26,
          low: 23,
          icon: "grain",
          precipitation: 80,
        },
        {
          dateISO: new Date(Date.now() + 172800000).toISOString().split("T")[0],
          dayLabel: "Day 3",
          high: 29,
          low: 25,
          icon: "wb-cloudy",
          precipitation: 40,
        },
      ],
      typhoonAlert: true,
      rainVolumeMm: 120,
    },
    crops: [
      {
        id: "rice",
        name: "Rice",
        plantingDate: new Date(Date.now() - 30 * 86400000), // 30 days ago
      },
    ],
  },
  {
    id: "heavy-rain",
    title: "Heavy Rain Expected",
    description: "App suggests delaying planting and fertilizer application",
    icon: "water-drop",
    weatherData: {
      currentWeather: {
        dateLabel: "Today",
        temperature: 30,
        apparentTemperature: 31,
        windSpeedKmh: 15,
        windDirection: 90,
        icon: "wb-cloudy",
        summary: "Overcast",
      },
      dailyForecast: [
        {
          dateISO: new Date().toISOString().split("T")[0],
          dayLabel: "Today",
          high: 30,
          low: 25,
          icon: "grain",
          precipitation: 85,
        },
        {
          dateISO: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          dayLabel: "Tomorrow",
          high: 29,
          low: 24,
          icon: "grain",
          precipitation: 70,
        },
        {
          dateISO: new Date(Date.now() + 172800000).toISOString().split("T")[0],
          dayLabel: "Day 3",
          high: 31,
          low: 25,
          icon: "wb-cloudy",
          precipitation: 30,
        },
      ],
      typhoonAlert: false,
      rainVolumeMm: 45,
    },
    crops: [
      {
        id: "corn",
        name: "Corn",
        plantingDate: new Date(Date.now() - 10 * 86400000), // 10 days ago
      },
    ],
  },
  {
    id: "normal-tasks",
    title: "Normal Farming Day",
    description: "See daily tasks generated for your crops",
    icon: "agriculture",
    weatherData: {
      currentWeather: {
        dateLabel: "Today",
        temperature: 32,
        apparentTemperature: 33,
        windSpeedKmh: 12,
        windDirection: 135,
        icon: "wb-sunny",
        summary: "Clear sky",
      },
      dailyForecast: [
        {
          dateISO: new Date().toISOString().split("T")[0],
          dayLabel: "Today",
          high: 32,
          low: 26,
          icon: "wb-sunny",
          precipitation: 10,
        },
        {
          dateISO: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          dayLabel: "Tomorrow",
          high: 33,
          low: 27,
          icon: "wb-cloudy",
          precipitation: 20,
        },
        {
          dateISO: new Date(Date.now() + 172800000).toISOString().split("T")[0],
          dayLabel: "Day 3",
          high: 31,
          low: 26,
          icon: "wb-sunny",
          precipitation: 15,
        },
      ],
      typhoonAlert: false,
    },
    crops: [
      {
        id: "rice",
        name: "Rice",
        plantingDate: new Date(Date.now() - 14 * 86400000), // 14 days ago
      },
      {
        id: "vegetables",
        name: "Vegetables",
        plantingDate: new Date(Date.now() - 5 * 86400000), // 5 days ago
      },
    ],
  },
  {
    id: "heat-stress",
    title: "Heat Stress Warning",
    description: "High temperature advisory with irrigation recommendations",
    icon: "wb-sunny",
    weatherData: {
      currentWeather: {
        dateLabel: "Today",
        temperature: 36,
        apparentTemperature: 38,
        windSpeedKmh: 8,
        windDirection: 45,
        icon: "wb-sunny",
        summary: "Clear sky",
      },
      dailyForecast: [
        {
          dateISO: new Date().toISOString().split("T")[0],
          dayLabel: "Today",
          high: 36,
          low: 28,
          icon: "wb-sunny",
          precipitation: 5,
        },
        {
          dateISO: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          dayLabel: "Tomorrow",
          high: 35,
          low: 27,
          icon: "wb-sunny",
          precipitation: 8,
        },
        {
          dateISO: new Date(Date.now() + 172800000).toISOString().split("T")[0],
          dayLabel: "Day 3",
          high: 34,
          low: 26,
          icon: "wb-cloudy",
          precipitation: 15,
        },
      ],
      typhoonAlert: false,
    },
    crops: [
      {
        id: "rice",
        name: "Rice",
        plantingDate: new Date(Date.now() - 45 * 86400000), // 45 days ago
      },
    ],
  },
  {
    id: "strong-wind",
    title: "Strong Wind Conditions",
    description: "Warning about spraying activities due to high winds",
    icon: "air",
    weatherData: {
      currentWeather: {
        dateLabel: "Today",
        temperature: 29,
        apparentTemperature: 28,
        windSpeedKmh: 42,
        windDirection: 270,
        icon: "wb-cloudy",
        summary: "Windy conditions",
      },
      dailyForecast: [
        {
          dateISO: new Date().toISOString().split("T")[0],
          dayLabel: "Today",
          high: 29,
          low: 24,
          icon: "wb-cloudy",
          precipitation: 20,
        },
        {
          dateISO: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          dayLabel: "Tomorrow",
          high: 30,
          low: 25,
          icon: "wb-cloudy",
          precipitation: 15,
        },
        {
          dateISO: new Date(Date.now() + 172800000).toISOString().split("T")[0],
          dayLabel: "Day 3",
          high: 31,
          low: 26,
          icon: "wb-sunny",
          precipitation: 10,
        },
      ],
      typhoonAlert: false,
    },
    crops: [
      {
        id: "vegetables",
        name: "Vegetables",
        plantingDate: new Date(Date.now() - 12 * 86400000), // 12 days ago
      },
    ],
  },
];

export default function DemoScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);
  const [suggestions, setSuggestions] = useState<WeatherSuggestion[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSelectScenario = (scenario: DemoScenario) => {
    setIsLoading(true);
    setSelectedScenario(scenario);

    // Generate weather suggestions
    const weatherSuggestions = generateWeatherSuggestions(
      scenario.weatherData,
      {
        municipality: "Abucay, Bataan",
        barangay: "Demo Location",
      },
      {
        selectedCropIds: scenario.crops?.map((c) => c.id) || [],
      },
      {
        tasks: [], // No manual tasks for demo
      }
    );

    // Generate daily tasks
    const allTasks: DailyTask[] = [];
    if (scenario.crops) {
      for (const crop of scenario.crops) {
        const cropTasks = generateDailyTasks(
          crop.id,
          crop.plantingDate,
          new Date(),
          7 // Show next 7 days
        );
        allTasks.push(...cropTasks);
      }
    }

    setSuggestions(weatherSuggestions);
    setTasks(allTasks);
    setIsLoading(false);
  };

  const handleBack = () => {
    setSelectedScenario(null);
    setSuggestions([]);
    setTasks([]);
  };

  if (selectedScenario) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>{selectedScenario.title}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.tint} />
              <Text style={styles.loadingText}>Generating demo data...</Text>
            </View>
          ) : (
            <>
              {/* Scenario Info */}
              <View style={styles.infoCard}>
                <MaterialIcons
                  name={selectedScenario.icon}
                  size={32}
                  color={colors.tint}
                />
                <Text style={styles.infoTitle}>{selectedScenario.title}</Text>
                <Text style={styles.infoDescription}>
                  {selectedScenario.description}
                </Text>
              </View>

              {/* Weather Suggestions */}
              <Text style={styles.sectionTitle}>Weather Suggestions</Text>
              {suggestions.length > 0 ? (
                suggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    colors={colors}
                    styles={styles}
                  />
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>
                    No weather suggestions for this scenario
                  </Text>
                </View>
              )}

              {/* Daily Tasks */}
              {tasks.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Daily Tasks</Text>
                  {tasks.slice(0, 5).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      colors={colors}
                      styles={styles}
                    />
                  ))}
                  {tasks.length > 5 && (
                    <Text style={styles.moreText}>
                      +{tasks.length - 5} more tasks in the next 7 days
                    </Text>
                  )}
                </>
              )}

              {/* Demo Notice */}
              <View style={styles.noticeCard}>
                <MaterialIcons name="info" size={20} color={colors.tint} />
                <Text style={styles.noticeText}>
                  This is demo data showing how the app responds to different
                  weather scenarios. In the actual app, suggestions are generated
                  based on real-time weather data.
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>App Demo</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introCard}>
          <MaterialIcons name="play-circle-filled" size={48} color={colors.tint} />
          <Text style={styles.introTitle}>See the App in Action</Text>
          <Text style={styles.introDescription}>
            Explore different scenarios to see how Plantanim provides weather-based
            farming suggestions and daily task recommendations.
          </Text>
        </View>

        <Text style={styles.scenariosTitle}>Choose a Scenario</Text>

        {DEMO_SCENARIOS.map((scenario) => (
          <Pressable
            key={scenario.id}
            style={styles.scenarioCard}
            onPress={() => handleSelectScenario(scenario)}
          >
            <View style={styles.scenarioIcon}>
              <MaterialIcons
                name={scenario.icon}
                size={28}
                color={colors.tint}
              />
            </View>
            <View style={styles.scenarioContent}>
              <Text style={styles.scenarioTitle}>{scenario.title}</Text>
              <Text style={styles.scenarioDescription}>
                {scenario.description}
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={colors.textSubtle}
            />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function SuggestionCard({
  suggestion,
  colors,
  styles,
}: {
  suggestion: WeatherSuggestion;
  colors: Theme;
  styles: ReturnType<typeof createStyles>;
}) {
  const getPriorityColor = (priority: SuggestionPriority): string => {
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
  };

  const getTypeIcon = (type: SuggestionType): keyof typeof MaterialIcons.glyphMap => {
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
  };

  const accentColor = getPriorityColor(suggestion.priority);

  return (
    <View style={[styles.suggestionCard, { borderLeftColor: accentColor }]}>
      <View style={styles.suggestionHeader}>
        <View style={[styles.priorityBadge, { backgroundColor: accentColor + "1a" }]}>
          <MaterialIcons
            name={getTypeIcon(suggestion.type)}
            size={16}
            color={accentColor}
          />
          <Text style={[styles.priorityText, { color: accentColor }]}>
            {suggestion.priority}
          </Text>
        </View>
      </View>
      <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
      <Text style={styles.suggestionMessage}>{suggestion.message}</Text>
      <View style={styles.suggestionDetails}>
        <Text style={styles.detailLabel}>Why:</Text>
        <Text style={styles.detailText}>{suggestion.reason}</Text>
      </View>
      <View style={styles.suggestionDetails}>
        <Text style={styles.detailLabel}>Action:</Text>
        <Text style={styles.detailText}>{suggestion.recommendedAction}</Text>
      </View>
    </View>
  );
}

function TaskCard({
  task,
  colors,
  styles,
}: {
  task: DailyTask;
  colors: Theme;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.taskCard}>
      <View style={[styles.taskColorBar, { backgroundColor: task.calendarColor }]} />
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskCrop}>{task.cropName}</Text>
        </View>
        <Text style={styles.taskDescription}>{task.description}</Text>
        <View style={styles.taskMeta}>
          <Text style={styles.taskMetaText}>
            Day {task.dayInCycle} • {task.growthStage}
          </Text>
          {task.isWeatherSensitive && (
            <View style={styles.weatherBadge}>
              <MaterialIcons name="wb-cloudy" size={14} color={colors.tint} />
              <Text style={styles.weatherBadgeText}>Weather Sensitive</Text>
            </View>
          )}
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
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.icon + "11",
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.text,
    },
    placeholder: {
      width: 40,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    introCard: {
      alignItems: "center",
      padding: 24,
      marginBottom: 24,
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.icon + "22",
    },
    introTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.text,
      marginTop: 12,
      marginBottom: 8,
      textAlign: "center",
    },
    introDescription: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.textSubtle,
      textAlign: "center",
    },
    scenariosTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 16,
    },
    scenarioCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      marginBottom: 12,
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.icon + "22",
    },
    scenarioIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: theme.tint + "1a",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    scenarioContent: {
      flex: 1,
    },
    scenarioTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 4,
    },
    scenarioDescription: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.textSubtle,
    },
    infoCard: {
      alignItems: "center",
      padding: 20,
      marginBottom: 24,
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.icon + "22",
    },
    infoTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.text,
      marginTop: 12,
      marginBottom: 8,
    },
    infoDescription: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.textSubtle,
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.text,
      marginTop: 24,
      marginBottom: 12,
    },
    suggestionCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderWidth: 1,
      borderColor: theme.icon + "22",
    },
    suggestionHeader: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 12,
    },
    priorityBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    },
    priorityText: {
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    suggestionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 8,
    },
    suggestionMessage: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.textSubtle,
      marginBottom: 12,
    },
    suggestionDetails: {
      marginTop: 8,
    },
    detailLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 4,
    },
    detailText: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.textSubtle,
    },
    taskCard: {
      flexDirection: "row",
      backgroundColor: theme.surface,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.icon + "22",
      overflow: "hidden",
    },
    taskColorBar: {
      width: 6,
    },
    taskContent: {
      flex: 1,
      padding: 16,
    },
    taskHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    taskTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
    },
    taskCrop: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.tint,
      backgroundColor: theme.tint + "1a",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    taskDescription: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.textSubtle,
      marginBottom: 8,
    },
    taskMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    taskMetaText: {
      fontSize: 12,
      color: theme.textSubtle,
    },
    weatherBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: theme.tint + "1a",
    },
    weatherBadgeText: {
      fontSize: 11,
      fontWeight: "600",
      color: theme.tint,
    },
    moreText: {
      fontSize: 14,
      color: theme.textSubtle,
      textAlign: "center",
      marginTop: 8,
      fontStyle: "italic",
    },
    noticeCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      padding: 16,
      marginTop: 24,
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.icon + "22",
    },
    noticeText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 20,
      color: theme.textSubtle,
      fontStyle: "italic",
    },
    emptyCard: {
      padding: 24,
      backgroundColor: theme.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.icon + "22",
      alignItems: "center",
    },
    emptyText: {
      fontSize: 15,
      color: theme.textSubtle,
      textAlign: "center",
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
      color: theme.textSubtle,
    },
  });

