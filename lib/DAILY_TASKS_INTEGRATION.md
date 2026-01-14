# Daily Farming Tasks Module - Integration Guide

## 📋 Overview

This module automatically generates farming tasks based on crop planting dates and growth cycles. Tasks are integrated with the Calendar Screen and work alongside weather-based suggestions.

## 🚀 Quick Start

### Basic Usage

```typescript
import { generateDailyTasks, DailyTask } from "@/lib/daily-tasks";
import { useCropPlantingDates } from "@/hooks/use-crop-planting-dates";
import { useUserCrops } from "@/hooks/use-user-crops";

// Get user's selected crops
const { crops } = useUserCrops();
const { plantingDates, getPlantingDate } = useCropPlantingDates();

// Generate tasks for selected crops
const selectedCrops = crops.filter(c => c.selected);
const allTasks: DailyTask[] = [];

for (const crop of selectedCrops) {
  const plantingDate = getPlantingDate(crop.id);
  if (plantingDate) {
    const tasks = generateDailyTasks(crop.id, plantingDate, new Date(), 60);
    allTasks.push(...tasks);
  }
}
```

## 🔌 Calendar Screen Integration

### Step 1: Import Required Modules

```typescript
import { generateDailyTasks, DailyTask, TaskType } from "@/lib/daily-tasks";
import { useCropPlantingDates } from "@/hooks/use-crop-planting-dates";
import { useUserCrops } from "@/hooks/use-user-crops";
import { generateWeatherSuggestions } from "@/lib/weather-suggestions";
```

### Step 2: Generate Tasks on Component Mount

```typescript
const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
const { crops } = useUserCrops();
const { plantingDates, getPlantingDate } = useCropPlantingDates();

useEffect(() => {
  const loadDailyTasks = async () => {
    const selectedCrops = crops.filter(c => c.selected);
    const tasks: DailyTask[] = [];

    for (const crop of selectedCrops) {
      const plantingDate = getPlantingDate(crop.id);
      if (plantingDate) {
        const cropTasks = generateDailyTasks(
          crop.id,
          plantingDate,
          new Date(),
          60 // Look ahead 60 days
        );
        tasks.push(...cropTasks);
      }
    }

    // Load task statuses from storage
    const statuses = await loadTaskStatuses();
    
    // Merge with saved statuses
    const tasksWithStatus = tasks.map(task => ({
      ...task,
      status: statuses[task.id] || task.status,
    }));

    setDailyTasks(tasksWithStatus);
  };

  if (crops.length > 0) {
    loadDailyTasks();
  }
}, [crops, plantingDates]);
```

### Step 3: Merge with Manual Tasks

```typescript
// Combine daily tasks with manual tasks
const allTasks = useMemo(() => {
  // Convert daily tasks to calendar Task format
  const dailyTasksFormatted = dailyTasks
    .filter(task => task.date === selectedDateString)
    .map(task => ({
      id: task.id,
      title: task.title,
      time: "All Day", // Or extract from task if time is stored
      dateKey: task.date,
      riskLevel: getRiskFromTask(task),
      riskLabel: getRiskLabelFromTask(task),
      riskIcon: getIconFromTaskType(task.taskType),
      borderColor: task.calendarColor,
      recommendation: task.isWeatherSensitive ? "Check weather" : undefined,
      isDailyTask: true, // Flag to identify daily tasks
      dailyTask: task, // Keep reference
    }));

  // Merge with manual tasks
  return [...dailyTasksFormatted, ...manualTasks];
}, [dailyTasks, manualTasks, selectedDateString]);
```

### Step 4: Display Tasks with Status

```typescript
// In task card component
const handleTaskComplete = async (taskId: string) => {
  // Update daily task status
  const task = dailyTasks.find(t => t.id === taskId);
  if (task) {
    await updateTaskStatus(taskId, "Completed");
    setDailyTasks(prev => 
      prev.map(t => t.id === taskId ? { ...t, status: "Completed" } : t)
    );
  }
};

const handleTaskSkip = async (taskId: string, reason: string) => {
  const task = dailyTasks.find(t => t.id === taskId);
  if (task) {
    await updateTaskStatus(taskId, "Skipped", reason);
    setDailyTasks(prev => 
      prev.map(t => t.id === taskId 
        ? { ...t, status: "Skipped", skipReason: reason } 
        : t
      )
    );
  }
};
```

## 🌦️ Weather Integration

### Link Weather-Sensitive Tasks with Suggestions

```typescript
import { generateWeatherSuggestions } from "@/lib/weather-suggestions";

// Generate weather suggestions
const weatherSuggestions = generateWeatherSuggestions(
  weatherData,
  locationContext,
  cropContext,
  farmTasks
);

// Link weather-sensitive tasks with suggestions
const tasksWithWeather = dailyTasks.map(task => {
  if (task.isWeatherSensitive) {
    // Find related suggestion
    const relatedSuggestion = weatherSuggestions.find(s => 
      s.type === "ScheduleSuggestion" && 
      s.message.includes(task.title)
    );
    
    if (relatedSuggestion) {
      return {
        ...task,
        relatedSuggestionId: relatedSuggestion.id,
        hasWeatherWarning: true,
      };
    }
  }
  return task;
});
```

## 💾 Task Status Storage

```typescript
const TASK_STATUS_STORAGE_KEY = "@plantanim:daily_task_statuses";

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
    
    if (skipReason) {
      // Store skip reason separately if needed
      const skipReasons = await loadSkipReasons();
      skipReasons[taskId] = skipReason;
      await AsyncStorage.setItem(
        "@plantanim:task_skip_reasons",
        JSON.stringify(skipReasons)
      );
    }
    
    await AsyncStorage.setItem(TASK_STATUS_STORAGE_KEY, JSON.stringify(statuses));
  } catch (error) {
    console.error("Error updating task status:", error);
  }
}
```

## 📅 Calendar Marking

### Mark Dates with Tasks

```typescript
// Update markedDates to include task indicators
const markedDates = useMemo(() => {
  const marked: any = {};

  // Weather risk dots (existing)
  Object.entries(riskByDate).forEach(([dateString, value]) => {
    marked[dateString] = {
      marked: true,
      dotColor: getRiskColor(value.risk),
    };
  });

  // Add task dots
  dailyTasks.forEach(task => {
    if (task.status === "Pending") {
      if (marked[task.date]) {
        // Multiple dots - use multiDot marking
        if (!marked[task.date].dots) {
          marked[task.date].dots = [];
        }
        marked[task.date].dots.push({
          color: task.calendarColor,
          selectedColor: task.calendarColor,
        });
      } else {
        marked[task.date] = {
          marked: true,
          dotColor: task.calendarColor,
        };
      }
    }
  });

  return marked;
}, [riskByDate, dailyTasks]);
```

## 🎨 UI Enhancements

### Task Type Icons

```typescript
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
```

### Task Status Badges

```typescript
function getStatusBadgeColor(status: TaskStatus): string {
  switch (status) {
    case "Completed":
      return "#16a34a"; // Green
    case "Skipped":
      return "#6b7280"; // Gray
    case "Pending":
      return "#3b82f6"; // Blue
    default:
      return "#6b7280";
  }
}
```

## 🔄 Task Refresh

### Refresh Tasks When Planting Date Changes

```typescript
useEffect(() => {
  // Regenerate tasks when planting dates change
  if (Object.keys(plantingDates).length > 0) {
    loadDailyTasks();
  }
}, [plantingDates]);
```

## 📱 User Flow

1. **User selects crops** → Crops saved to storage
2. **User sets planting dates** → Planting dates saved
3. **Tasks auto-generate** → Based on crop cycle and planting dates
4. **Tasks appear in calendar** → Color-coded by type
5. **User views daily tasks** → See tasks for selected date
6. **User marks task complete** → Status saved
7. **Weather warnings** → Linked to weather-sensitive tasks

## ⚠️ Important Notes

- Tasks are **guidance only** - farmer remains in control
- Tasks don't auto-reschedule based on weather
- Manual tasks and daily tasks coexist
- Task status persists across app sessions
- Tasks expire after crop cycle completes

## 🧪 Testing

See `daily-tasks.test.ts` for sample test cases including:
- Task generation for different crops
- Date calculations
- Status management
- Edge cases (no crops, past dates, etc.)
