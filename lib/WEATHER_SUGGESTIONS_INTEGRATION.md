# Weather-Based Suggestions Module - Integration Guide

## 📋 Overview

This module provides a rule-based decision support system that converts weather forecasts into actionable farming advisories. It is designed to be **transparent**, **explainable**, and **farmer-friendly**.

## 🚀 Quick Start

### Basic Usage

```typescript
import { generateWeatherSuggestions, getSuggestionDisclaimer } from "@/lib/weather-suggestions";
import { fetchWeatherForecast } from "@/lib/weather";

// 1. Fetch weather data
const { daily, currentWeather } = await fetchWeatherForecast();

// 2. Prepare weather input
const weatherData = {
  currentWeather,
  dailyForecast: daily,
  typhoonAlert: false, // Set to true if typhoon alert is active
  rainVolumeMm: undefined, // Optional: if available from API
};

// 3. Get location context (from user settings)
const locationContext = {
  municipality: "Balanga City", // From user's saved location
  barangay: "San Jose", // Optional
};

// 4. Generate suggestions
const suggestions = generateWeatherSuggestions(
  weatherData,
  locationContext
);

// 5. Display with disclaimer
const disclaimer = getSuggestionDisclaimer();
```

### With Crop and Task Context

```typescript
import { useUserCrops } from "@/hooks/use-user-crops";

// Get user's selected crops
const { crops } = useUserCrops();
const cropContext = {
  selectedCropIds: crops.filter(c => c.selected).map(c => c.id),
};

// Get scheduled tasks (from calendar)
const farmTasks = {
  tasks: [
    {
      id: "task-1",
      title: "Apply Fertilizer",
      dateKey: "2024-12-17",
      taskType: "Fertilizer Application",
    },
  ],
};

// Generate suggestions with full context
const suggestions = generateWeatherSuggestions(
  weatherData,
  locationContext,
  cropContext,
  farmTasks
);
```

## 🔌 Integration Points

### 1. Alerts Screen (`app/(tabs)/alerts.tsx`)

**Current State:** The alerts screen already has basic weather alert logic.

**Integration:** Replace or supplement the existing `buildWeatherAlerts` function with suggestions from this module.

```typescript
// In alerts.tsx
import { generateWeatherSuggestions } from "@/lib/weather-suggestions";

useEffect(() => {
  const loadWeatherAlerts = async () => {
    try {
      const { daily, currentWeather } = await fetchWeatherForecast();
      
      // Get location from storage
      const saved = await AsyncStorage.getItem("@plantanim:user_location");
      const { municipality } = saved ? JSON.parse(saved) : { municipality: "Balanga City" };
      
      // Generate suggestions
      const suggestions = generateWeatherSuggestions(
        {
          currentWeather,
          dailyForecast: daily,
          typhoonAlert: false, // TODO: Get from weather API or alert service
        },
        { municipality }
      );
      
      // Convert suggestions to Alert format for display
      const weatherAlerts = suggestions.map(s => ({
        id: s.id,
        type: s.priority === "HIGH" ? "urgent" : "weather",
        title: s.title,
        subtitle: s.message,
        timestamp: "Now",
        description: s.recommendedAction,
        details: s.reason,
        icon: getIconForSuggestionType(s.type),
        iconColor: getColorForPriority(s.priority),
        iconBg: getBgColorForPriority(s.priority),
      }));
      
      setWeatherAlerts(weatherAlerts);
    } catch (error) {
      console.error("Error loading weather suggestions:", error);
    }
  };
  
  loadWeatherAlerts();
}, []);
```

### 2. Farming Suggestions Screen (`app/farming-suggestions.tsx`)

**Current State:** This screen has hardcoded suggestions.

**Integration:** Replace hardcoded `SUGGESTIONS` array with dynamic suggestions from this module.

```typescript
// In farming-suggestions.tsx
import { generateWeatherSuggestions, Suggestion } from "@/lib/weather-suggestions";
import { useUserCrops } from "@/hooks/use-user-crops";

export default function FarmingSuggestionsScreen() {
  const { crops } = useUserCrops();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  
  useEffect(() => {
    const loadSuggestions = async () => {
      const { daily, currentWeather } = await fetchWeatherForecast();
      const saved = await AsyncStorage.getItem("@plantanim:user_location");
      const { municipality } = saved ? JSON.parse(saved) : {};
      
      // Get tasks from calendar (if available)
      const tasksJson = await AsyncStorage.getItem("@plantanim:calendar_tasks");
      const tasks = tasksJson ? JSON.parse(tasksJson) : [];
      
      const generated = generateWeatherSuggestions(
        {
          currentWeather,
          dailyForecast: daily,
          typhoonAlert: false,
        },
        { municipality },
        {
          selectedCropIds: crops.filter(c => c.selected).map(c => c.id),
        },
        { tasks }
      );
      
      setSuggestions(generated);
    };
    
    loadSuggestions();
  }, [crops]);
  
  // Map suggestions to existing UI format
  const mappedSuggestions = suggestions.map(s => ({
    id: s.id,
    title: s.title,
    description: s.message,
    category: s.priority === "HIGH" ? "urgent" : s.priority === "MEDIUM" ? "pending" : "completed",
    accent: getAccentColor(s.priority),
    badge: {
      label: s.priority,
      icon: getIconForType(s.type),
    },
  }));
  
  // ... rest of component
}
```

### 3. Home Screen (`app/(tabs)/index.tsx`)

**Integration:** Show high-priority suggestions as prominent alerts on the home screen.

```typescript
// In index.tsx
const [urgentSuggestions, setUrgentSuggestions] = useState<Suggestion[]>([]);

useEffect(() => {
  const loadUrgentSuggestions = async () => {
    const { daily, currentWeather } = await fetchWeatherForecast();
    const saved = await AsyncStorage.getItem("@plantanim:user_location");
    const { municipality } = saved ? JSON.parse(saved) : {};
    
    const allSuggestions = generateWeatherSuggestions(
      { currentWeather, dailyForecast: daily },
      { municipality }
    );
    
    // Only show HIGH priority on home screen
    setUrgentSuggestions(allSuggestions.filter(s => s.priority === "HIGH"));
  };
  
  loadUrgentSuggestions();
}, []);
```

### 4. Calendar Screen (`app/(tabs)/calendar.tsx`)

**Integration:** Show suggestions related to scheduled tasks.

```typescript
// In calendar.tsx
const [taskSuggestions, setTaskSuggestions] = useState<Suggestion[]>([]);

useEffect(() => {
  const loadTaskSuggestions = async () => {
    const { daily, currentWeather } = await fetchWeatherForecast();
    const saved = await AsyncStorage.getItem("@plantanim:user_location");
    const { municipality } = saved ? JSON.parse(saved) : {};
    
    const allSuggestions = generateWeatherSuggestions(
      { currentWeather, dailyForecast: daily },
      { municipality },
      undefined,
      { tasks } // Pass calendar tasks
    );
    
    // Filter for schedule-related suggestions
    setTaskSuggestions(
      allSuggestions.filter(s => s.type === "ScheduleSuggestion")
    );
  };
  
  loadTaskSuggestions();
}, [tasks]);
```

## 🎨 UI Integration Helpers

### Icon Mapping

```typescript
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
```

### Color Mapping

```typescript
function getColorForPriority(priority: SuggestionPriority): string {
  switch (priority) {
    case "HIGH":
      return "#e74c3c";
    case "MEDIUM":
      return "#f59e0b";
    case "LOW":
      return "#3b82f6";
    default:
      return "#6b7280";
  }
}

function getBgColorForPriority(priority: SuggestionPriority): string {
  switch (priority) {
    case "HIGH":
      return "#fee2e2";
    case "MEDIUM":
      return "#fef3c7";
    case "LOW":
      return "#dbeafe";
    default:
      return "#f3f4f6";
  }
}
```

## 📱 Notification Integration

### Push Notifications

For HIGH priority suggestions, consider sending push notifications:

```typescript
import * as Notifications from "expo-notifications";

async function sendSuggestionNotification(suggestion: Suggestion) {
  if (suggestion.priority === "HIGH" && !suggestion.dismissible) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: suggestion.title,
        body: suggestion.message,
        data: { suggestionId: suggestion.id },
      },
      trigger: null, // Send immediately
    });
  }
}
```

### In-App Notifications

Show dismissible notifications for MEDIUM and LOW priority suggestions:

```typescript
function showInAppNotification(suggestion: Suggestion) {
  // Use your notification component/library
  showNotification({
    title: suggestion.title,
    message: suggestion.message,
    type: suggestion.priority.toLowerCase(),
    dismissible: suggestion.dismissible,
    onDismiss: () => {
      // Mark as dismissed in storage
      markSuggestionDismissed(suggestion.id);
    },
  });
}
```

## 🔄 Data Flow

```
┌─────────────────┐
│ Weather API     │
│ (Open-Meteo)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ fetchWeather    │
│ Forecast()      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐      ┌──────────────┐
│ generateWeather │◄─────│ Location     │      │ Crops/Tasks  │
│ Suggestions()   │      │ Context      │      │ (Optional)   │
└────────┬────────┘      └──────────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│ Suggestion[]    │
│ (Sorted by      │
│  Priority)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ UI Components   │
│ (Alerts, Home,  │
│  Calendar)      │
└─────────────────┘
```

## 🧪 Testing

See `weather-suggestions.test.ts` for comprehensive test cases including:

- Typhoon alerts
- Heavy rainfall warnings
- Strong wind conditions
- Continuous rain periods
- Heat stress advisories
- Task scheduling conflicts
- Extreme weather combinations
- Edge cases (no risk)

Run test cases:

```typescript
import { runTestCase, testCase1_TyphoonAlert } from "@/lib/weather-suggestions.test";

const result = runTestCase(testCase1_TyphoonAlert);
console.log("Test passed:", result.passed);
console.log("Suggestions:", result.actualOutput);
```

## ⚠️ Important Notes

### Disclaimer Display

**Always display the disclaimer** with suggestions:

```typescript
import { getSuggestionDisclaimer } from "@/lib/weather-suggestions";

// In your UI component
<Text style={styles.disclaimer}>
  {getSuggestionDisclaimer()}
</Text>
```

### Dismissible Suggestions

- HIGH priority suggestions with `dismissible: false` should NOT have a dismiss button
- MEDIUM and LOW priority suggestions can be dismissed
- Store dismissed suggestion IDs to avoid showing them again

### Valid Until

Check `validUntil` date before displaying suggestions:

```typescript
const activeSuggestions = suggestions.filter(
  s => new Date(s.validUntil) > new Date()
);
```

### Typhoon Alert Source

Currently, `typhoonAlert` must be set manually. Consider:

1. Integrating with PAGASA (Philippine weather service) API
2. Using weather code thresholds (e.g., weathercode 95+ = thunderstorm)
3. User-reported alerts
4. Third-party typhoon tracking service

## 🔧 Extending the Module

### Adding New Rules

1. Create a new rule function following the pattern:

```typescript
function checkNewRule(
  weatherInput: WeatherInput,
  locationContext: LocationContext
): Suggestion | null {
  // Check conditions
  if (!condition) return null;
  
  // Return suggestion
  return {
    id: generateSuggestionId("type", "key"),
    type: "FarmingAdvice",
    priority: "MEDIUM",
    title: "Clear Title",
    message: "Farmer-friendly message",
    reason: "Why this exists",
    recommendedAction: "What to do",
    validUntil: getValidUntil(24),
    dismissible: true,
  };
}
```

2. Call it in `generateWeatherSuggestions()`:

```typescript
const newRuleSuggestion = checkNewRule(weatherData, locationContext);
if (newRuleSuggestion) suggestions.push(newRuleSuggestion);
```

### Modifying Existing Rules

All rules are clearly separated and documented. Modify thresholds or messages as needed for your region's specific conditions.

## 📊 Performance Considerations

- Suggestions are generated synchronously (fast, no async operations)
- Rule evaluation is O(n) where n = number of rules
- Sorting is O(m log m) where m = number of suggestions
- Typical execution time: < 10ms for 7-day forecast

## 🐛 Troubleshooting

### No Suggestions Generated

- Check if weather data is valid (not null/undefined)
- Verify location context has municipality
- Check rule thresholds match your weather data format

### Wrong Priority Order

- Suggestions are automatically sorted by priority
- Check that priority values are correct: "HIGH" | "MEDIUM" | "LOW"

### Suggestions Not Updating

- Ensure weather data is refreshed regularly
- Check `validUntil` dates haven't expired
- Verify dismissed suggestions are filtered out

## 📚 Related Files

- `lib/weather.ts` - Weather data fetching and types
- `lib/weather-suggestions.ts` - Core suggestion engine
- `lib/weather-suggestions.test.ts` - Test cases and examples
- `app/(tabs)/alerts.tsx` - Alerts screen (integration point)
- `app/farming-suggestions.tsx` - Suggestions screen (integration point)
