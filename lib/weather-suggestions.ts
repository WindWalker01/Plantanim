/**
 * Weather-Based Suggestions Module
 * 
 * A rule-based decision support system that converts weather forecasts
 * into actionable farming advisories for typhoon-prone regions.
 * 
 * Design Philosophy: "If a farmer cannot understand the suggestion in 5 seconds, it is too complex."
 */

import { CurrentWeather, DailyForecastItem } from "./weather";

// ============================================================================
// DATA MODELS
// ============================================================================

/**
 * Priority levels for suggestions
 * HIGH: Immediate action required (typhoon/flood risk)
 * MEDIUM: Important but not urgent (rain affects tasks)
 * LOW: General advisory
 */
export type SuggestionPriority = "HIGH" | "MEDIUM" | "LOW";

/**
 * Types of suggestions
 * RiskWarning: Weather-related risk alerts
 * FarmingAdvice: Farming activity recommendations
 * ScheduleSuggestion: Task scheduling recommendations
 */
export type SuggestionType = "RiskWarning" | "FarmingAdvice" | "ScheduleSuggestion";

/**
 * Core Suggestion object that represents a weather-based advisory
 */
export interface Suggestion {
  /** Unique identifier for this suggestion */
  id: string;
  
  /** Type of suggestion */
  type: SuggestionType;
  
  /** Priority level (HIGH > MEDIUM > LOW) */
  priority: SuggestionPriority;
  
  /** Short, clear title (farmer-friendly) */
  title: string;
  
  /** Detailed message explaining the situation */
  message: string;
  
  /** Explanation of why this suggestion exists (transparency) */
  reason: string;
  
  /** Specific recommended action */
  recommendedAction: string;
  
  /** ISO date string when this suggestion expires */
  validUntil: string;
  
  /** Whether the farmer can dismiss this suggestion */
  dismissible: boolean;
}

/**
 * Weather input data for suggestion generation
 */
export interface WeatherInput {
  /** Current weather conditions */
  currentWeather: CurrentWeather | null;
  
  /** Daily forecast (typically 7 days) */
  dailyForecast: DailyForecastItem[];
  
  /** Typhoon/storm alert flag (true if active) */
  typhoonAlert?: boolean;
  
  /** Additional rain volume in mm (if available from API) */
  rainVolumeMm?: number;
}

/**
 * Location context for suggestions
 */
export interface LocationContext {
  /** Municipality name (e.g., "Balanga City") */
  municipality: string;
  
  /** Barangay name (optional) */
  barangay?: string;
}

/**
 * Crop context (optional)
 */
export interface CropContext {
  /** Array of selected crop IDs */
  selectedCropIds: string[];
}

/**
 * Farm task context (optional)
 */
export interface FarmTask {
  /** Task ID */
  id: string;
  
  /** Task title */
  title: string;
  
  /** Date key in YYYY-MM-DD format */
  dateKey: string;
  
  /** Task type/category */
  taskType?: string;
}

/**
 * Farm tasks context (optional)
 */
export interface FarmTasksContext {
  /** Array of scheduled farm tasks */
  tasks: FarmTask[];
}

// ============================================================================
// RULE ENGINE
// ============================================================================

/**
 * Generate a unique suggestion ID based on type and key
 */
function generateSuggestionId(type: string, key: string): string {
  return `suggestion-${type.toLowerCase()}-${key}-${Date.now()}`;
}

/**
 * Calculate valid until date (default: 24 hours from now)
 */
function getValidUntil(hours: number = 24): string {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

/**
 * RULE 1: Typhoon Alert
 * If typhoon alert is active → Suggest securing crops and tools
 */
function checkTyphoonAlert(
  weatherInput: WeatherInput,
  locationContext: LocationContext
): Suggestion | null {
  if (!weatherInput.typhoonAlert) {
    return null;
  }

  return {
    id: generateSuggestionId("risk", "typhoon"),
    type: "RiskWarning",
    priority: "HIGH",
    title: "Typhoon Alert Active",
    message: `A typhoon warning is active in ${locationContext.municipality}. Strong winds and heavy rain are expected.`,
    reason: "Typhoon alerts indicate severe weather conditions that can cause significant crop damage and safety risks.",
    recommendedAction: "Secure all crops, tools, and equipment. Move seedlings to shelter. Reinforce structures and clear drainage channels.",
    validUntil: getValidUntil(48), // Valid for 48 hours
    dismissible: false, // Critical safety alert - not dismissible
  };
}

/**
 * RULE 2: Heavy Rainfall (>30mm within 24 hours)
 * If rain > 30mm within 24 hours → Suggest delaying planting or fertilizer application
 */
function checkHeavyRainfall(
  weatherInput: WeatherInput,
  locationContext: LocationContext
): Suggestion | null {
  const today = weatherInput.dailyForecast[0];
  if (!today) return null;

  // Check if precipitation probability is very high (>=70%) or if rain volume is significant
  const precipProb = today.precipitation ?? 0;
  const rainVolume = weatherInput.rainVolumeMm ?? 0;

  // High probability OR significant volume indicates heavy rain
  if (precipProb < 70 && rainVolume < 30) {
    return null;
  }

  const rainDescription = rainVolume >= 30 
    ? `${rainVolume}mm of rain` 
    : `${precipProb}% chance of heavy rain`;

  return {
    id: generateSuggestionId("advice", "heavy-rain"),
    type: "FarmingAdvice",
    priority: precipProb >= 80 ? "HIGH" : "MEDIUM",
    title: "Heavy Rain Expected",
    message: `${rainDescription} is forecasted for today in ${locationContext.municipality}. This amount of rain can cause runoff and waterlogging.`,
    reason: "Heavy rainfall (>30mm) washes away fertilizer and can damage newly planted crops. Waterlogged soil also prevents proper root development.",
    recommendedAction: "Delay planting new crops and fertilizer application until after the rain passes. If already applied, consider covering with mulch.",
    validUntil: getValidUntil(24),
    dismissible: true,
  };
}

/**
 * RULE 3: Strong Wind (>30 km/h)
 * If wind speed > 30 km/h → Suggest avoiding spraying activities
 */
function checkStrongWind(
  weatherInput: WeatherInput,
  locationContext: LocationContext
): Suggestion | null {
  const windSpeed = weatherInput.currentWeather?.windSpeedKmh ?? 0;
  
  if (windSpeed <= 30) {
    return null;
  }

  return {
    id: generateSuggestionId("advice", "strong-wind"),
    type: "FarmingAdvice",
    priority: windSpeed > 50 ? "HIGH" : "MEDIUM",
    title: "Strong Wind Conditions",
    message: `Wind speed is ${windSpeed} km/h in ${locationContext.municipality}. This is too strong for safe spraying activities.`,
    reason: "Wind speeds above 30 km/h cause pesticide and fertilizer drift, reducing effectiveness and potentially harming nearby crops or people.",
    recommendedAction: "Postpone all spraying activities (pesticides, fertilizers, foliar feeds) until wind speed drops below 30 km/h.",
    validUntil: getValidUntil(12), // Check again in 12 hours
    dismissible: true,
  };
}

/**
 * RULE 4: Continuous Rain (3+ consecutive days)
 * If rain for 3 consecutive days → Suggest checking drainage
 */
function checkContinuousRain(
  weatherInput: WeatherInput,
  locationContext: LocationContext
): Suggestion | null {
  if (weatherInput.dailyForecast.length < 3) {
    return null;
  }

  // Check next 3 days for rain (precipitation probability >= 40%)
  const nextThreeDays = weatherInput.dailyForecast.slice(0, 3);
  const rainyDays = nextThreeDays.filter(
    (day) => (day.precipitation ?? 0) >= 40
  );

  if (rainyDays.length < 3) {
    return null;
  }

  return {
    id: generateSuggestionId("advice", "continuous-rain"),
    type: "FarmingAdvice",
    priority: "MEDIUM",
    title: "Extended Rain Period",
    message: `Rain is expected for the next 3 days in ${locationContext.municipality}. Continuous rain can cause waterlogging and drainage issues.`,
    reason: "Three or more consecutive days of rain can saturate soil, leading to poor drainage, root rot, and increased disease risk.",
    recommendedAction: "Check and clear all drainage channels and field canals. Ensure water can flow away from crops. Monitor for standing water.",
    validUntil: getValidUntil(72), // Valid for 3 days
    dismissible: true,
  };
}

/**
 * RULE 5: High Temperature with Low Rain
 * If temperature > 34°C and low rain → Suggest irrigation and hydration
 */
function checkHeatStress(
  weatherInput: WeatherInput,
  locationContext: LocationContext
): Suggestion | null {
  const today = weatherInput.dailyForecast[0];
  if (!today) return null;

  const highTemp = today.high;
  const precipProb = today.precipitation ?? 0;

  if (highTemp < 34 || precipProb >= 40) {
    return null;
  }

  return {
    id: generateSuggestionId("advice", "heat-stress"),
    type: "FarmingAdvice",
    priority: "LOW",
    title: "High Temperature Alert",
    message: `Temperature will reach ${highTemp}°C today in ${locationContext.municipality} with low chance of rain.`,
    reason: "High temperatures without rain increase water stress in crops and can reduce yields. Farmers also need extra hydration.",
    recommendedAction: "Increase irrigation frequency, especially in the morning. Ensure adequate water supply. Stay hydrated and avoid working during peak heat hours (11 AM - 3 PM).",
    validUntil: getValidUntil(24),
    dismissible: true,
  };
}

/**
 * RULE 6: Upcoming Rain Affects Scheduled Tasks
 * If scheduled tasks conflict with rainy days → Suggest rescheduling
 */
function checkTaskConflicts(
  weatherInput: WeatherInput,
  farmTasks?: FarmTasksContext
): Suggestion[] {
  if (!farmTasks || farmTasks.tasks.length === 0) {
    return [];
  }

  const suggestions: Suggestion[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check tasks in the next 3 days
  for (const task of farmTasks.tasks) {
    const taskDate = new Date(task.dateKey + "T00:00:00");
    if (taskDate < today) continue; // Skip past tasks

    const daysUntilTask = Math.floor(
      (taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilTask > 3) continue; // Only check next 3 days

    const forecastDay = weatherInput.dailyForecast[daysUntilTask];
    if (!forecastDay) continue;

    const precipProb = forecastDay.precipitation ?? 0;

    // If rain probability is high (>=60%), suggest rescheduling
    if (precipProb >= 60) {
      const taskType = task.taskType || "farm task";
      suggestions.push({
        id: generateSuggestionId("schedule", `task-${task.id}`),
        type: "ScheduleSuggestion",
        priority: precipProb >= 80 ? "HIGH" : "MEDIUM",
        title: `Reschedule: ${task.title}`,
        message: `Your scheduled ${taskType.toLowerCase()} "${task.title}" is planned for ${forecastDay.dayLabel}, but there's a ${precipProb}% chance of rain.`,
        reason: `Rainy conditions make outdoor farming activities less effective and can be unsafe. ${taskType} work is best done in dry weather.`,
        recommendedAction: `Consider moving this task to a drier day. Check the forecast for better weather windows.`,
        validUntil: getValidUntil(24),
        dismissible: true,
      });
    }
  }

  return suggestions;
}

/**
 * RULE 7: Extreme Weather Combination
 * Multiple risk factors present → Comprehensive warning
 */
function checkExtremeWeatherCombination(
  weatherInput: WeatherInput,
  locationContext: LocationContext
): Suggestion | null {
  const today = weatherInput.dailyForecast[0];
  if (!today) return null;

  const precipProb = today.precipitation ?? 0;
  const windSpeed = weatherInput.currentWeather?.windSpeedKmh ?? 0;
  const highTemp = today.high;

  // Check for multiple extreme conditions
  const hasHeavyRain = precipProb >= 80;
  const hasStrongWind = windSpeed > 40;
  const hasTyphoon = weatherInput.typhoonAlert === true;

  // Only create this if we have multiple extreme conditions
  const extremeCount = [hasHeavyRain, hasStrongWind, hasTyphoon].filter(Boolean).length;
  
  if (extremeCount < 2) {
    return null; // Not extreme enough
  }

  const conditions: string[] = [];
  if (hasTyphoon) conditions.push("typhoon");
  if (hasHeavyRain) conditions.push("heavy rain");
  if (hasStrongWind) conditions.push("strong winds");

  return {
    id: generateSuggestionId("risk", "extreme-combo"),
    type: "RiskWarning",
    priority: "HIGH",
    title: "Multiple Weather Risks",
    message: `${locationContext.municipality} is experiencing multiple weather risks: ${conditions.join(", ")}.`,
    reason: "Combined extreme weather conditions significantly increase the risk of crop damage, flooding, and safety hazards.",
    recommendedAction: "Take comprehensive protective measures: secure all structures, move valuable crops to shelter, clear all drainage, and avoid outdoor work. Monitor weather updates closely.",
    validUntil: getValidUntil(24),
    dismissible: false, // Critical - not dismissible
  };
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Generate weather-based farming suggestions
 * 
 * This is the main entry point for the suggestion engine.
 * It evaluates all rules and returns sorted suggestions by priority.
 * 
 * @param weatherData - Current weather and forecast data
 * @param locationContext - User's location information
 * @param cropContext - Optional: Selected crops
 * @param farmTasks - Optional: Scheduled farm tasks
 * @returns Array of suggestions sorted by priority (HIGH > MEDIUM > LOW)
 */
export function generateWeatherSuggestions(
  weatherData: WeatherInput,
  locationContext: LocationContext,
  cropContext?: CropContext,
  farmTasks?: FarmTasksContext
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Apply all rules
  // Note: Rules are independent - multiple suggestions can be generated

  // RULE 1: Typhoon Alert (HIGH priority)
  const typhoonSuggestion = checkTyphoonAlert(weatherData, locationContext);
  if (typhoonSuggestion) suggestions.push(typhoonSuggestion);

  // RULE 7: Extreme Weather Combination (HIGH priority)
  const extremeSuggestion = checkExtremeWeatherCombination(weatherData, locationContext);
  if (extremeSuggestion) suggestions.push(extremeSuggestion);

  // RULE 2: Heavy Rainfall
  const heavyRainSuggestion = checkHeavyRainfall(weatherData, locationContext);
  if (heavyRainSuggestion) suggestions.push(heavyRainSuggestion);

  // RULE 3: Strong Wind
  const windSuggestion = checkStrongWind(weatherData, locationContext);
  if (windSuggestion) suggestions.push(windSuggestion);

  // RULE 4: Continuous Rain
  const continuousRainSuggestion = checkContinuousRain(weatherData, locationContext);
  if (continuousRainSuggestion) suggestions.push(continuousRainSuggestion);

  // RULE 5: Heat Stress
  const heatSuggestion = checkHeatStress(weatherData, locationContext);
  if (heatSuggestion) suggestions.push(heatSuggestion);

  // RULE 6: Task Conflicts (can generate multiple suggestions)
  const taskSuggestions = checkTaskConflicts(weatherData, farmTasks);
  suggestions.push(...taskSuggestions);

  // Sort by priority: HIGH > MEDIUM > LOW
  const priorityOrder: Record<SuggestionPriority, number> = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  suggestions.sort((a, b) => {
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    // If same priority, maintain original order
    return 0;
  });

  return suggestions;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get disclaimer text for suggestions
 * This should be displayed with all suggestions to maintain transparency
 */
export function getSuggestionDisclaimer(): string {
  return "This is a weather-based suggestion. Final decisions remain with the farmer.";
}

/**
 * Format suggestion for display (helper function)
 */
export function formatSuggestionForDisplay(suggestion: Suggestion): string {
  return `${suggestion.title}\n\n${suggestion.message}\n\nWhy: ${suggestion.reason}\n\nAction: ${suggestion.recommendedAction}`;
}
