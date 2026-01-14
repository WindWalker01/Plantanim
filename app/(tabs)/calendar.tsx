import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useUserCrops } from "@/hooks/use-user-crops";
import { useCropPlantingDates } from "@/hooks/use-crop-planting-dates";
import {
  generateDailyTasks,
  DailyTask,
  TaskType,
  TaskStatus,
  getTaskColor,
} from "@/lib/daily-tasks";
import {
  generateWeatherSuggestions,
  WeatherInput,
  LocationContext,
} from "@/lib/weather-suggestions";
import { DailyForecastItem, fetchWeatherForecast, CurrentWeather } from "@/lib/weather";

type RiskLevel = "safe" | "caution" | "high-risk";

type Task = {
  id: string;
  title: string;
  time: string;
  /** Date key in YYYY-MM-DD format so tasks are shown only on that specific day */
  dateKey: string;
  riskLevel: RiskLevel;
  riskLabel: string;
  riskIcon: keyof typeof MaterialIcons.glyphMap;
  borderColor: string;
  recommendation?: string;
  isDailyTask?: boolean;
  dailyTask?: DailyTask;
  cropName?: string;
  taskType?: TaskType;
};

const getRiskFromPrecipitation = (precipitation: number | null | undefined): RiskLevel => {
  const value = precipitation ?? 0;
  if (value >= 70) return "high-risk";
  if (value >= 40) return "caution";
  return "safe";
};

const getRiskColor = (risk: RiskLevel): string => {
  switch (risk) {
    case "safe":
      return "#16a34a";
    case "caution":
      return "#f59e0b";
    case "high-risk":
      return "#e74c3c";
    default:
      return "#16a34a";
  }
};

const getRiskLabel = (risk: RiskLevel): string => {
  switch (risk) {
    case "safe":
      return "Safe";
    case "caution":
      return "Caution";
    case "high-risk":
      return "High Risk";
    default:
      return "Safe";
  }
};

const formatDate = (date: Date): string => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}`;
};

// Helper to format a JS Date into a YYYY-MM-DD string (same as react-native-calendars)
const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const TASKS_STORAGE_KEY = "@plantanim:calendar_tasks";
const TASK_STATUS_STORAGE_KEY = "@plantanim:daily_task_statuses";

// Task Card Component
function TaskCard({
  task,
  colors,
  styles,
}: {
  task: Task;
  colors: Theme;
  styles: ReturnType<typeof createStyles>;
}) {
  const isCompleted = task.isDailyTask && task.dailyTask?.status === "Completed";
  const isSkipped = task.isDailyTask && task.dailyTask?.status === "Skipped";

  return (
    <View
      style={[
        styles.taskCard,
        { borderLeftColor: task.borderColor },
        (isCompleted || isSkipped) && styles.taskCardInactive,
      ]}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleRow}>
          <Text
            style={[
              styles.taskTitle,
              (isCompleted || isSkipped) && styles.taskTitleInactive,
            ]}
          >
            {task.title}
          </Text>
          {task.riskLevel === "high-risk" && !isCompleted && !isSkipped && (
            <MaterialIcons name="warning" size={20} color="#e74c3c" />
          )}
          {isCompleted && (
            <MaterialIcons name="check-circle" size={20} color="#16a34a" />
          )}
          {isSkipped && (
            <MaterialIcons name="cancel" size={20} color="#6b7280" />
          )}
        </View>
        <View style={styles.taskTimeRow}>
          {task.cropName && (
            <>
              <MaterialIcons name="eco" size={14} color={colors.textSubtle} />
              <Text style={styles.taskCropName}>{task.cropName}</Text>
            </>
          )}
          <MaterialIcons name="access-time" size={16} color={colors.textSubtle} />
          <Text style={styles.taskTime}>{task.time}</Text>
        </View>
        {task.dailyTask?.description && (
          <Text style={styles.taskDescription}>{task.dailyTask.description}</Text>
        )}
      </View>
      <View style={styles.taskFooter}>
        <View
          style={[
            styles.riskBadge,
            {
              backgroundColor:
                task.riskLevel === "high-risk"
                  ? "#fee2e2"
                  : task.riskLevel === "caution"
                    ? "#fef3c7"
                    : "#dcfce7",
            },
          ]}
        >
          <MaterialIcons name={task.riskIcon} size={14} color={task.borderColor} />
          <Text style={[styles.riskBadgeText, { color: task.borderColor }]}>
            {task.riskLabel}
          </Text>
        </View>
        {task.recommendation && !isCompleted && !isSkipped && (
          <Text
            style={[
              styles.recommendation,
              {
                color:
                  task.riskLevel === "high-risk" ? "#e74c3c" : "#f59e0b",
              },
            ]}
          >
            {task.recommendation}
          </Text>
        )}
      </View>
    </View>
  );
}

// Helper functions for daily tasks
function getIconFromTaskType(taskType: TaskType): keyof typeof MaterialIcons.glyphMap {
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
      return "inventory";
    case "Irrigation":
      return "water-drop";
    case "PestControl":
      return "bug-report";
    case "LandPreparation":
      return "landscape";
    default:
      return "check-circle";
  }
}

async function loadTaskStatuses(): Promise<Record<string, TaskStatus>> {
  try {
    const stored = await AsyncStorage.getItem(TASK_STATUS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error loading task statuses:", error);
    return {};
  }
}

async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  skipReason?: string
): Promise<void> {
  try {
    const statuses = await loadTaskStatuses();
    statuses[taskId] = status;
    await AsyncStorage.setItem(TASK_STATUS_STORAGE_KEY, JSON.stringify(statuses));
  } catch (error) {
    console.error("Error updating task status:", error);
  }
}


export default function CalendarScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const { crops } = useUserCrops();
  const { plantingDates, getPlantingDate, loadPlantingDates } = useCropPlantingDates();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [newTask, setNewTask] = useState({
    title: "",
    time: "",
    riskLevel: "safe" as RiskLevel,
  });
  const [dailyForecast, setDailyForecast] = useState<DailyForecastItem[]>([]);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [locationContext, setLocationContext] = useState<LocationContext>({
    municipality: "Balanga City",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const styles = useMemo(() => createStyles(colors), [colors]);

  // Load location context
  useEffect(() => {
    const loadLocation = async () => {
      try {
        const locationJson = await AsyncStorage.getItem("@plantanim:user_location");
        if (locationJson) {
          const location = JSON.parse(locationJson);
          setLocationContext({
            municipality: location.municipality || "Balanga City",
            barangay: location.barangay,
          });
        }
      } catch (error) {
        console.error("Error loading location:", error);
      }
    };
    loadLocation();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadWeather = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { daily, currentWeather: cw } = await fetchWeatherForecast();
        if (!isMounted) return;
        setDailyForecast(daily);
        setCurrentWeather(cw);
      } catch (e) {
        console.error("Error loading calendar weather:", e);
        if (!isMounted) return;
        setError("Unable to load risk levels from latest forecast.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadWeather();
    return () => {
      isMounted = false;
    };
  }, []);

  // Function to load daily tasks
  const loadDailyTasks = useCallback(async () => {
    try {
      const selectedCrops = crops.filter((c) => c.selected);
      if (selectedCrops.length === 0) {
        setDailyTasks([]);
        return;
      }

      const allTasks: DailyTask[] = [];
      const currentDate = new Date();

      for (const crop of selectedCrops) {
        const plantingDate = getPlantingDate(crop.id);
        if (plantingDate) {
          const cropTasks = generateDailyTasks(
            crop.id,
            plantingDate,
            currentDate,
            60 // Look ahead 60 days
          );
          allTasks.push(...cropTasks);
        }
      }

      // Load task statuses
      const statuses = await loadTaskStatuses();

      // Merge with saved statuses
      const tasksWithStatus = allTasks.map((task) => ({
        ...task,
        status: statuses[task.id] || task.status,
      }));

      setDailyTasks(tasksWithStatus);
    } catch (error) {
      console.error("Error loading daily tasks:", error);
    }
  }, [crops, getPlantingDate]);

  // Load tasks on mount and when dependencies change
  useEffect(() => {
    if (crops.length > 0) {
      loadDailyTasks();
    }
  }, [crops, plantingDates, loadDailyTasks]);

  // Refresh tasks when screen comes into focus (e.g., returning from planting dates screen)
  useFocusEffect(
    useCallback(() => {
      // Reload planting dates and regenerate tasks when screen is focused
      const refreshTasks = async () => {
        await loadPlantingDates();
        await loadDailyTasks();
      };
      
      if (crops.length > 0) {
        refreshTasks();
      }
    }, [crops, loadPlantingDates, loadDailyTasks])
  );

  // Load tasks from local storage on mount
  useEffect(() => {
    let isMounted = true;

    const loadTasks = async () => {
      try {
        const stored = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        if (!isMounted) return;

        if (stored) {
          const parsed: Task[] = JSON.parse(stored);
          setTasks(parsed);
        } else {
          // Start with no tasks the first time the user opens the calendar
          setTasks([]);
        }
      } catch (e) {
        console.error("Error loading calendar tasks:", e);
      } finally {
        if (isMounted) setTasksLoaded(true);
      }
    };

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  // Persist tasks whenever they change (after initial load)
  useEffect(() => {
    if (!tasksLoaded) return;

    AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks)).catch(
      (e) => {
        console.error("Error saving calendar tasks:", e);
      }
    );
  }, [tasks, tasksLoaded]);

  // Format selected date for react-native-calendars (YYYY-MM-DD)
  const selectedDateString = useMemo(() => {
    return formatDateKey(selectedDate);
  }, [selectedDate]);

  // Map of date string -> risk level from daily forecast
  const riskByDate = useMemo(() => {
    const map: Record<
      string,
      {
        risk: RiskLevel;
        precipitation: number | null;
      }
    > = {};
    dailyForecast.forEach((day) => {
      const dateKey = day.dateISO?.slice(0, 10);
      if (!dateKey) return;
      const risk = getRiskFromPrecipitation(day.precipitation);
      map[dateKey] = {
        risk,
        precipitation: day.precipitation,
      };
    });
    return map;
  }, [dailyForecast]);

  // Create marked dates with risk indicators and task dots
  const markedDates = useMemo(() => {
    const marked: any = {};

    // Add weather risk dots
    Object.entries(riskByDate).forEach(([dateString, value]) => {
      marked[dateString] = {
        marked: true,
        dots: [
          {
            color: getRiskColor(value.risk),
            selectedColor: getRiskColor(value.risk),
          },
        ],
      };
    });

    // Add task dots for pending daily tasks
    dailyTasks.forEach((task) => {
      if (task.status === "Pending") {
        if (marked[task.date]) {
          // Add to existing dots
          marked[task.date].dots.push({
            color: task.calendarColor,
            selectedColor: task.calendarColor,
          });
        } else {
          marked[task.date] = {
            marked: true,
            dots: [
              {
                color: task.calendarColor,
                selectedColor: task.calendarColor,
              },
            ],
          };
        }
      }
    });

    // Add manual task dots
    tasks.forEach((task) => {
      if (marked[task.dateKey]) {
        marked[task.dateKey].dots.push({
          color: task.borderColor,
          selectedColor: task.borderColor,
        });
      } else {
        marked[task.dateKey] = {
          marked: true,
          dots: [
            {
              color: task.borderColor,
              selectedColor: task.borderColor,
            },
          ],
        };
      }
    });

    // Handle selected date
    const selectedRisk = riskByDate[selectedDateString]?.risk ?? "safe";
    if (marked[selectedDateString]) {
      marked[selectedDateString] = {
        ...marked[selectedDateString],
        selected: true,
        selectedColor: colors.tint + "22",
      };
    } else {
      marked[selectedDateString] = {
        selected: true,
        selectedColor: colors.tint + "22",
        marked: true,
        dots: [
          {
            color: getRiskColor(selectedRisk),
            selectedColor: getRiskColor(selectedRisk),
          },
        ],
      };
    }

    return marked;
  }, [riskByDate, dailyTasks, tasks, selectedDateString, colors.tint]);

  // Memoize calendar theme to ensure it updates when colors change
  const calendarTheme = useMemo(
    () => ({
      backgroundColor: colors.surface,
      calendarBackground: colors.surface,
      textSectionTitleColor: colors.textSubtle,
      selectedDayBackgroundColor: colors.tint + "22",
      selectedDayTextColor: colors.tint,
      todayTextColor: colors.tint,
      dayTextColor: colors.text,
      textDisabledColor: colors.textSubtle + "66",
      dotColor: colors.tint,
      selectedDotColor: colors.tint,
      arrowColor: colors.text,
      monthTextColor: colors.text,
      indicatorColor: colors.tint,
      textDayFontWeight: "600" as const,
      textMonthFontWeight: "700" as const,
      textDayHeaderFontWeight: "700" as const,
      textDayFontSize: 14,
      textMonthFontSize: 18,
      textDayHeaderFontSize: 12,
    }),
    [colors]
  );

  const handleDayPress = (day: DateData) => {
    setSelectedDate(new Date(day.year, day.month - 1, day.day));
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const minuteStr = minutes.toString().padStart(2, "0");
    const period = hours < 12 ? "AM" : "PM";
    return `${displayHour.toString().padStart(2, "0")}:${minuteStr} ${period}`;
  };

  const handleTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
      if (event.type === "set" && date) {
        setSelectedTime(date);
        setNewTask({ ...newTask, time: formatTime(date) });
      }
    } else {
      if (date) {
        setSelectedTime(date);
        setNewTask({ ...newTask, time: formatTime(date) });
      }
    }
  };

  const handleTimePickerConfirm = () => {
    setNewTask({ ...newTask, time: formatTime(selectedTime) });
    setShowTimePicker(false);
  };

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.time) return;

    const selectedRisk =
      riskByDate[selectedDateString]?.risk ?? getRiskFromPrecipitation(null);
    const riskIcon =
      selectedRisk === "high-risk"
        ? "flash-on"
        : selectedRisk === "caution"
          ? "water-drop"
          : "check-circle";

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      time: newTask.time,
      dateKey: selectedDateString,
      riskLevel: selectedRisk,
      riskLabel: getRiskLabel(selectedRisk),
      riskIcon,
      borderColor: getRiskColor(selectedRisk),
      recommendation:
        selectedRisk === "high-risk"
          ? "RESCHEDULE RECOMMENDED"
          : selectedRisk === "caution"
            ? "PROCEED WITH CARE"
            : undefined,
    };

    setTasks([...tasks, task]);
    setNewTask({ title: "", time: "", riskLevel: "safe" });
    setSelectedTime(new Date());
    setShowTaskModal(false);
  };

  // Generate weather suggestions for linking
  const weatherSuggestions = useMemo(() => {
    if (!currentWeather || dailyForecast.length === 0) return [];

    try {
      return generateWeatherSuggestions(
        {
          currentWeather,
          dailyForecast,
          typhoonAlert: false,
        },
        locationContext,
        {
          selectedCropIds: crops.filter((c) => c.selected).map((c) => c.id),
        },
        {
          tasks: dailyTasks.map((t) => ({
            id: t.id,
            title: t.title,
            dateKey: t.date,
            taskType: t.taskType,
          })),
        }
      );
    } catch (error) {
      console.error("Error generating weather suggestions:", error);
      return [];
    }
  }, [currentWeather, dailyForecast, crops, dailyTasks, locationContext]);

  // Merge daily tasks with manual tasks for selected date
  const selectedDateTasks = useMemo(() => {
    const manualTasks = tasks.filter((task) => task.dateKey === selectedDateString);

    // Convert daily tasks to Task format
    const dailyTasksForDate = dailyTasks
      .filter((task) => task.date === selectedDateString && task.status === "Pending")
      .map((task) => {
        const dateRisk = riskByDate[task.date]?.risk ?? "safe";
        const riskIcon = getIconFromTaskType(task.taskType);
        const hasWeatherWarning = task.isWeatherSensitive && dateRisk !== "safe";

        // Find related weather suggestion
        const relatedSuggestion = weatherSuggestions.find(
          (s) =>
            s.type === "ScheduleSuggestion" &&
            (s.message.includes(task.title) ||
              (task.isWeatherSensitive && s.priority === "HIGH"))
        );

        let recommendation: string | undefined;
        if (hasWeatherWarning) {
          if (dateRisk === "high-risk") {
            recommendation = "RESCHEDULE RECOMMENDED";
          } else if (relatedSuggestion) {
            recommendation = relatedSuggestion.recommendedAction.slice(0, 30) + "...";
          } else {
            recommendation = "CHECK WEATHER";
          }
        }

        return {
          id: task.id,
          title: task.title,
          time: "All Day",
          dateKey: task.date,
          riskLevel: dateRisk,
          riskLabel: getRiskLabel(dateRisk),
          riskIcon,
          borderColor: task.calendarColor,
          recommendation,
          isDailyTask: true,
          dailyTask: task,
          cropName: task.cropName,
          taskType: task.taskType,
        } as Task;
      });

    return [...dailyTasksForDate, ...manualTasks];
  }, [dailyTasks, tasks, selectedDateString, riskByDate, weatherSuggestions]);

  const selectedDateRisk =
    riskByDate[selectedDateString]?.risk ?? getRiskFromPrecipitation(null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.placeholder} />
          <Text style={styles.screenTitle}>Farming Calendar</Text>
          <Pressable
            style={styles.menuButton}
            onPress={() => router.push("/set-planting-dates")}
          >
            <MaterialIcons name="calendar-today" size={24} color={colors.text} />
          </Pressable>
        </View>

        {/* Risk Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#16a34a" }]} />
            <Text style={styles.legendText}>Safe</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#f59e0b" }]} />
            <Text style={styles.legendText}>Caution</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#e74c3c" }]} />
            <Text style={styles.legendText}>High Risk</Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendar}>
          <Calendar
            key={`calendar-${isDark ? "dark" : "light"}`}
            current={selectedDateString}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType="multi-dot"
            theme={calendarTheme}
            style={styles.calendarComponent}
          />
        </View>

        {/* Tasks Section */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksHeader}>
            <Text style={styles.tasksTitle}>
              Tasks for {formatDate(selectedDate)}
            </Text>
            {selectedDateRisk === "high-risk" && (
              <Text style={styles.weatherAlert}>Typhoon Signal #1</Text>
            )}
          </View>

          {selectedDateTasks.length > 0 ? (
            selectedDateTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                colors={colors}
                styles={styles}
              />
            ))
          ) : (
            <View style={styles.emptyTasks}>
              <Text style={styles.emptyTasksText}>No tasks scheduled</Text>
              {crops.filter((c) => c.selected).length === 0 && (
                <Text style={[styles.emptyTasksText, { marginTop: 8 }]}>
                  Select crops and set planting dates to see daily tasks
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => setShowTaskModal(true)}
      >
        <MaterialIcons name="add" size={32} color="#fff" />
      </Pressable>

      {/* Task Creation Modal */}
      <Modal
        visible={showTaskModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTaskModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Task</Text>
              <Pressable onPress={() => setShowTaskModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Task Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Fertilizer Application"
                  value={newTask.title}
                  onChangeText={(text) =>
                    setNewTask({ ...newTask, title: text })
                  }
                  placeholderTextColor={colors.textSubtle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Time</Text>
                <Pressable
                  style={styles.timeInput}
                  onPress={() => {
                    // Initialize with current time if no time is selected
                    if (!newTask.time) {
                      setSelectedTime(new Date());
                    }
                    setShowTimePicker(true);
                  }}
                >
                  <MaterialIcons
                    name="access-time"
                    size={20}
                    color={colors.textSubtle}
                  />
                  <Text
                    style={[
                      styles.timeInputText,
                      !newTask.time && styles.timeInputPlaceholder,
                    ]}
                  >
                    {newTask.time || "Select time"}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.modalInfo}>
                <MaterialIcons
                  name="info-outline"
                  size={20}
                  color={colors.textSubtle}
                />
                <Text style={styles.modalInfoText}>
                  Risk level will be automatically determined based on weather
                  conditions for {formatDate(selectedDate)}
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowTaskModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.createButton,
                  (!newTask.title || !newTask.time) && styles.createButtonDisabled,
                ]}
                onPress={handleCreateTask}
                disabled={!newTask.title || !newTask.time}
              >
                <Text style={styles.createButtonText}>Create Task</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Picker */}
      {Platform.OS === "ios" ? (
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.timePickerOverlay}>
            <View style={styles.timePickerContent}>
              <View style={styles.timePickerHeader}>
                <Text style={styles.timePickerTitle}>Select Time</Text>
                <Pressable onPress={() => setShowTimePicker(false)}>
                  <MaterialIcons name="close" size={24} color={colors.text} />
                </Pressable>
              </View>

              <View style={styles.timePickerBody}>
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  textColor={colors.text}
                  themeVariant={colors.background === "#101922" ? "dark" : "light"}
                />
              </View>

              <View style={styles.timePickerFooter}>
                <Pressable
                  style={styles.timePickerCancelButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.timePickerCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.timePickerConfirmButton}
                  onPress={handleTimePickerConfirm}
                >
                  <Text style={styles.timePickerConfirmText}>Confirm</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      ) : (
        showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )
      )}
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
      padding: 16,
      paddingBottom: 100,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    placeholder: {
      width: 40,
    },
    screenTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.text,
    },
    menuButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    legend: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 20,
      justifyContent: "center",
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: theme.surface,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.text,
    },
    calendar: {
      marginBottom: 24,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: theme.surface,
      padding: 8,
    },
    calendarComponent: {
      borderRadius: 16,
    },
    tasksSection: {
      gap: 12,
    },
    tasksHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    tasksTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.text,
    },
    weatherAlert: {
      fontSize: 12,
      fontWeight: "700",
      color: "#e74c3c",
    },
    taskCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      borderLeftWidth: 4,
      gap: 12,
    },
    taskCardInactive: {
      opacity: 0.6,
    },
    taskHeader: {
      gap: 8,
    },
    taskTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    taskTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.text,
      flex: 1,
    },
    taskTitleInactive: {
      textDecorationLine: "line-through",
    },
    taskTimeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    taskTime: {
      fontSize: 14,
      color: theme.textSubtle,
    },
    taskCropName: {
      fontSize: 12,
      color: theme.textSubtle,
      fontWeight: "600",
      marginRight: 8,
    },
    taskDescription: {
      fontSize: 13,
      color: theme.textSubtle,
      lineHeight: 18,
      marginTop: 4,
    },
    taskFooter: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    riskBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    },
    riskBadgeText: {
      fontSize: 12,
      fontWeight: "700",
    },
    recommendation: {
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    emptyTasks: {
      padding: 24,
      alignItems: "center",
    },
    emptyTasksText: {
      fontSize: 14,
      color: theme.textSubtle,
    },
    taskActions: {
      flexDirection: "row",
      gap: 8,
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.icon + "22",
    },
    taskActionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    skipButton: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.icon + "33",
    },
    completeButton: {
      backgroundColor: theme.tint,
    },
    taskActionText: {
      fontSize: 14,
      fontWeight: "700",
    },
    taskActionTextWhite: {
      fontSize: 14,
      fontWeight: "700",
      color: "#fff",
    },
    fab: {
      position: "absolute",
      right: 16,
      bottom: 80,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.tint,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: theme.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      paddingBottom: 40,
      maxHeight: "80%",
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.text,
    },
    modalBody: {
      gap: 20,
      marginBottom: 24,
    },
    inputGroup: {
      gap: 8,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text,
    },
    input: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.icon + "22",
    },
    modalInfo: {
      flexDirection: "row",
      gap: 8,
      padding: 12,
      backgroundColor: theme.surface,
      borderRadius: 12,
      alignItems: "flex-start",
    },
    modalInfoText: {
      flex: 1,
      fontSize: 12,
      color: theme.textSubtle,
      lineHeight: 18,
    },
    modalFooter: {
      flexDirection: "row",
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.surface,
      alignItems: "center",
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
    },
    createButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.tint,
      alignItems: "center",
    },
    createButtonDisabled: {
      opacity: 0.5,
    },
    createButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
    },
    timeInput: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.icon + "22",
    },
    timeInputText: {
      fontSize: 16,
      color: theme.text,
    },
    timeInputPlaceholder: {
      color: theme.textSubtle,
    },
    timePickerOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    timePickerContent: {
      backgroundColor: theme.background,
      borderRadius: 24,
      width: "90%",
      maxWidth: 400,
      padding: 24,
    },
    timePickerHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    timePickerTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.text,
    },
    timePickerBody: {
      alignItems: "center",
      marginBottom: 24,
    },
    timePickerFooter: {
      flexDirection: "row",
      gap: 12,
    },
    timePickerCancelButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.surface,
      alignItems: "center",
    },
    timePickerCancelText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
    },
    timePickerConfirmButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.tint,
      alignItems: "center",
    },
    timePickerConfirmText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
    },
  });
