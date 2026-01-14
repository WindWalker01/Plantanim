/**
 * Notification Service Module
 * 
 * Handles scheduling and managing push notifications for:
 * - Daily farming tasks (due today or tomorrow)
 * - Farming suggestions (urgent/pending)
 */

import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DailyTask } from "./daily-tasks";
import { Suggestion } from "./weather-suggestions";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NOTIFICATION_STORAGE_KEY = "@plantanim:scheduled_notifications";
const NOTIFICATION_ENABLED_KEY = "@plantanim:notifications_enabled";

export interface ScheduledNotification {
  id: string;
  type: "task" | "suggestion";
  entityId: string; // task id or suggestion id
  scheduledFor: string; // ISO date string
  title: string;
  body: string;
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}

/**
 * Check if notifications are enabled in settings
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY);
    return enabled !== "false"; // Default to true
  } catch (error) {
    console.error("Error checking notification settings:", error);
    return true;
  }
}

/**
 * Set notification enabled state
 */
export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, String(enabled));
    if (!enabled) {
      // Cancel all scheduled notifications
      await cancelAllNotifications();
    }
  } catch (error) {
    console.error("Error setting notification preference:", error);
  }
}

/**
 * Schedule a notification for a task
 */
export async function scheduleTaskNotification(
  task: DailyTask,
  notificationTime?: Date
): Promise<string | null> {
  try {
    const enabled = await areNotificationsEnabled();
    if (!enabled) {
      return null;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn("Notification permissions not granted");
      return null;
    }

    // Default to 8:00 AM on the task date
    const taskDate = new Date(task.date + "T00:00:00");
    const notifyDate = notificationTime || new Date(taskDate);
    notifyDate.setHours(8, 0, 0, 0);

    // Don't schedule if the time has passed
    if (notifyDate < new Date()) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "📅 Farming Task Reminder",
        body: `${task.title} - ${task.cropName}`,
        data: {
          type: "task",
          taskId: task.id,
          date: task.date,
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: notifyDate,
      },
    });

    // Store notification info
    await storeNotificationInfo({
      id: notificationId,
      type: "task",
      entityId: task.id,
      scheduledFor: notifyDate.toISOString(),
      title: "Farming Task Reminder",
      body: `${task.title} - ${task.cropName}`,
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling task notification:", error);
    return null;
  }
}

/**
 * Schedule a notification for a farming suggestion
 */
export async function scheduleSuggestionNotification(
  suggestion: Suggestion,
  notificationTime?: Date
): Promise<string | null> {
  try {
    const enabled = await areNotificationsEnabled();
    if (!enabled) {
      return null;
    }

    // Only schedule for HIGH priority suggestions
    if (suggestion.priority !== "HIGH") {
      return null;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn("Notification permissions not granted");
      return null;
    }

    // Default to immediate notification, or use provided time
    const notifyDate = notificationTime || new Date();

    // Don't schedule if the time has passed
    if (notifyDate < new Date()) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ Farming Alert",
        body: suggestion.title,
        data: {
          type: "suggestion",
          suggestionId: suggestion.id,
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: notificationTime
        ? {
            date: notifyDate,
          }
        : null, // Immediate if no time provided
    });

    // Store notification info
    await storeNotificationInfo({
      id: notificationId,
      type: "suggestion",
      entityId: suggestion.id,
      scheduledFor: notifyDate.toISOString(),
      title: "Farming Alert",
      body: suggestion.title,
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling suggestion notification:", error);
    return null;
  }
}

/**
 * Schedule notifications for tasks due today or tomorrow
 */
export async function scheduleTaskNotificationsForUpcoming(
  tasks: DailyTask[]
): Promise<string[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayStr = today.toISOString().split("T")[0];
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const upcomingTasks = tasks.filter(
    (task) =>
      (task.date === todayStr || task.date === tomorrowStr) &&
      task.status === "Pending"
  );

  const notificationIds: string[] = [];

  for (const task of upcomingTasks) {
    const id = await scheduleTaskNotification(task);
    if (id) {
      notificationIds.push(id);
    }
  }

  return notificationIds;
}

/**
 * Schedule notifications for urgent farming suggestions
 */
export async function scheduleSuggestionNotificationsForUrgent(
  suggestions: Suggestion[]
): Promise<string[]> {
  const urgentSuggestions = suggestions.filter(
    (s) => s.priority === "HIGH" && new Date(s.validUntil) >= new Date()
  );

  const notificationIds: string[] = [];

  for (const suggestion of urgentSuggestions) {
    const id = await scheduleSuggestionNotification(suggestion);
    if (id) {
      notificationIds.push(id);
    }
  }

  return notificationIds;
}

/**
 * Cancel a specific notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    await removeNotificationInfo(notificationId);
  } catch (error) {
    console.error("Error canceling notification:", error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(NOTIFICATION_STORAGE_KEY);
  } catch (error) {
    console.error("Error canceling all notifications:", error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<
  ScheduledNotification[]
> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as ScheduledNotification[];
  } catch (error) {
    console.error("Error getting scheduled notifications:", error);
    return [];
  }
}

/**
 * Store notification info for tracking
 */
async function storeNotificationInfo(
  notification: ScheduledNotification
): Promise<void> {
  try {
    const existing = await getAllScheduledNotifications();
    const updated = [...existing.filter((n) => n.id !== notification.id), notification];
    await AsyncStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify(updated)
    );
  } catch (error) {
    console.error("Error storing notification info:", error);
  }
}

/**
 * Remove notification info
 */
async function removeNotificationInfo(notificationId: string): Promise<void> {
  try {
    const existing = await getAllScheduledNotifications();
    const updated = existing.filter((n) => n.id !== notificationId);
    await AsyncStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify(updated)
    );
  } catch (error) {
    console.error("Error removing notification info:", error);
  }
}

/**
 * Clean up expired notifications from storage
 */
export async function cleanupExpiredNotifications(): Promise<void> {
  try {
    const notifications = await getAllScheduledNotifications();
    const now = new Date();
    const active = notifications.filter(
      (n) => new Date(n.scheduledFor) >= now
    );
    await AsyncStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify(active)
    );
  } catch (error) {
    console.error("Error cleaning up notifications:", error);
  }
}

