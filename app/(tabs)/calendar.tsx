import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useMemo, useState } from "react";
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

type RiskLevel = "safe" | "caution" | "high-risk";

type Task = {
  id: string;
  title: string;
  time: string;
  riskLevel: RiskLevel;
  riskLabel: string;
  riskIcon: keyof typeof MaterialIcons.glyphMap;
  borderColor: string;
  recommendation?: string;
};

// Mock risk data for dates - in a real app, this would come from weather API
const getRiskForDate = (date: Date): RiskLevel => {
  const day = date.getDate();
  // Simulate risk levels based on date
  if ([7, 8, 9, 13].includes(day)) return "high-risk";
  if ([4, 5, 6, 10, 14].includes(day)) return "caution";
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


export default function CalendarScreen() {
  const { colors, isDark } = useAppTheme();
  const [selectedDate, setSelectedDate] = useState(new Date(2023, 9, 12)); // Oct 12
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Fertilizer Application",
      time: "06:00 AM",
      riskLevel: "high-risk",
      riskLabel: "High Risk",
      riskIcon: "flash-on",
      borderColor: "#e74c3c",
      recommendation: "RESCHEDULE RECOMMENDED",
    },
    {
      id: "2",
      title: "Equipment Check",
      time: "02:00 PM",
      riskLevel: "caution",
      riskLabel: "Caution: Heavy Rain",
      riskIcon: "water-drop",
      borderColor: "#f59e0b",
      recommendation: "PROCEED WITH CARE",
    },
  ]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [newTask, setNewTask] = useState({
    title: "",
    time: "",
    riskLevel: "safe" as RiskLevel,
  });

  const styles = useMemo(() => createStyles(colors), [colors]);

  // Format selected date for react-native-calendars (YYYY-MM-DD)
  const selectedDateString = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  // Create marked dates with risk indicators
  const markedDates = useMemo(() => {
    const marked: any = {};
    const currentDate = new Date(2023, 9, 1); // October 2023
    const lastDay = new Date(2023, 9, 31);

    for (
      let date = new Date(currentDate);
      date <= lastDay;
      date.setDate(date.getDate() + 1)
    ) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;
      const risk = getRiskForDate(date);

      marked[dateString] = {
        marked: true,
        dotColor: getRiskColor(risk),
      };
    }

    // Mark selected date
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
        dotColor: getRiskColor(getRiskForDate(selectedDate)),
      };
    }

    return marked;
  }, [selectedDateString, colors.tint, selectedDate]);

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

    const selectedRisk = getRiskForDate(selectedDate);
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

  const selectedDateTasks = tasks.filter((task) => {
    // In a real app, tasks would have dates associated with them
    // For now, we'll show all tasks for the selected date
    return true;
  });

  const selectedDateRisk = getRiskForDate(selectedDate);

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
          <Pressable style={styles.menuButton}>
            <MaterialIcons name="more-vert" size={24} color={colors.text} />
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
            markingType="dot"
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
              <View
                key={task.id}
                style={[
                  styles.taskCard,
                  { borderLeftColor: task.borderColor },
                ]}
              >
                <View style={styles.taskHeader}>
                  <View style={styles.taskTitleRow}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    {task.riskLevel === "high-risk" && (
                      <MaterialIcons
                        name="warning"
                        size={20}
                        color="#e74c3c"
                      />
                    )}
                  </View>
                  <View style={styles.taskTimeRow}>
                    <MaterialIcons
                      name="access-time"
                      size={16}
                      color={colors.textSubtle}
                    />
                    <Text style={styles.taskTime}>{task.time}</Text>
                  </View>
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
                    <MaterialIcons
                      name={task.riskIcon}
                      size={14}
                      color={task.borderColor}
                    />
                    <Text
                      style={[styles.riskBadgeText, { color: task.borderColor }]}
                    >
                      {task.riskLabel}
                    </Text>
                  </View>
                  {task.recommendation && (
                    <Text
                      style={[
                        styles.recommendation,
                        {
                          color:
                            task.riskLevel === "high-risk"
                              ? "#e74c3c"
                              : "#f59e0b",
                        },
                      ]}
                    >
                      {task.recommendation}
                    </Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyTasks}>
              <Text style={styles.emptyTasksText}>No tasks scheduled</Text>
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
    taskTimeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    taskTime: {
      fontSize: 14,
      color: theme.textSubtle,
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
