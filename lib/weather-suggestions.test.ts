/**
 * Weather Suggestions Module - Test Cases and Examples
 * 
 * This file contains sample inputs and expected outputs for testing
 * the weather-based suggestions module.
 */

import {
  generateWeatherSuggestions,
  WeatherInput,
  LocationContext,
  CropContext,
  FarmTasksContext,
  Suggestion,
  getSuggestionDisclaimer,
} from "./weather-suggestions";
import { CurrentWeather, DailyForecastItem } from "./weather";

// ============================================================================
// SAMPLE DATA BUILDERS
// ============================================================================

function createSampleCurrentWeather(overrides?: Partial<CurrentWeather>): CurrentWeather {
  return {
    dateLabel: "Mon, Dec 16",
    temperature: 28,
    apparentTemperature: 30,
    windSpeedKmh: 15,
    windDirection: 180,
    icon: "wb-cloudy",
    summary: "Partly cloudy",
    ...overrides,
  };
}

function createSampleDailyForecast(overrides?: Partial<DailyForecastItem>[]): DailyForecastItem[] {
  const defaultForecast: DailyForecastItem[] = [
    {
      dayLabel: "Today",
      dateISO: new Date().toISOString().split("T")[0],
      icon: "wb-sunny",
      precipitation: 20,
      high: 32,
      low: 24,
    },
    {
      dayLabel: "Tue",
      dateISO: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      icon: "wb-cloudy",
      precipitation: 30,
      high: 31,
      low: 25,
    },
    {
      dayLabel: "Wed",
      dateISO: new Date(Date.now() + 172800000).toISOString().split("T")[0],
      icon: "grain",
      precipitation: 45,
      high: 30,
      low: 24,
    },
  ];

  if (overrides) {
    return overrides.map((override, index) => ({
      ...defaultForecast[index] || defaultForecast[0],
      ...override,
    }));
  }

  return defaultForecast;
}

// ============================================================================
// TEST CASE 1: Typhoon Alert (HIGH Priority)
// ============================================================================

export const testCase1_TyphoonAlert: {
  name: string;
  description: string;
  input: {
    weatherData: WeatherInput;
    locationContext: LocationContext;
  };
  expectedOutput: Partial<Suggestion>[];
} = {
  name: "Typhoon Alert Active",
  description: "When typhoon alert is active, should generate HIGH priority risk warning",
  input: {
    weatherData: {
      currentWeather: createSampleCurrentWeather({ windSpeedKmh: 60 }),
      dailyForecast: createSampleDailyForecast([
        { precipitation: 90, high: 28, low: 24 },
        { precipitation: 85, high: 27, low: 23 },
      ]),
      typhoonAlert: true,
      rainVolumeMm: 50,
    },
    locationContext: {
      municipality: "Balanga City",
      barangay: "San Jose",
    },
  },
  expectedOutput: [
    {
      type: "RiskWarning",
      priority: "HIGH",
      title: "Typhoon Alert Active",
      dismissible: false,
    },
  ],
};

// ============================================================================
// TEST CASE 2: Heavy Rainfall (>30mm)
// ============================================================================

export const testCase2_HeavyRainfall: {
  name: string;
  description: string;
  input: {
    weatherData: WeatherInput;
    locationContext: LocationContext;
  };
  expectedOutput: Partial<Suggestion>[];
} = {
  name: "Heavy Rainfall Warning",
  description: "When rain >30mm or probability >=70%, should suggest delaying planting/fertilizer",
  input: {
    weatherData: {
      currentWeather: createSampleCurrentWeather({ windSpeedKmh: 20 }),
      dailyForecast: createSampleDailyForecast([
        { precipitation: 75, high: 29, low: 25 },
      ]),
      rainVolumeMm: 35,
    },
    locationContext: {
      municipality: "Orani",
    },
  },
  expectedOutput: [
    {
      type: "FarmingAdvice",
      priority: "HIGH",
      title: "Heavy Rain Expected",
      dismissible: true,
    },
  ],
};

// ============================================================================
// TEST CASE 3: Strong Wind (>30 km/h)
// ============================================================================

export const testCase3_StrongWind: {
  name: string;
  description: string;
  input: {
    weatherData: WeatherInput;
    locationContext: LocationContext;
  };
  expectedOutput: Partial<Suggestion>[];
} = {
  name: "Strong Wind Warning",
  description: "When wind speed >30 km/h, should suggest avoiding spraying activities",
  input: {
    weatherData: {
      currentWeather: createSampleCurrentWeather({ windSpeedKmh: 45 }),
      dailyForecast: createSampleDailyForecast([
        { precipitation: 10, high: 33, low: 26 },
      ]),
    },
    locationContext: {
      municipality: "Hermosa",
    },
  },
  expectedOutput: [
    {
      type: "FarmingAdvice",
      priority: "MEDIUM",
      title: "Strong Wind Conditions",
      dismissible: true,
    },
  ],
};

// ============================================================================
// TEST CASE 4: Continuous Rain (3+ days)
// ============================================================================

export const testCase4_ContinuousRain: {
  name: string;
  description: string;
  input: {
    weatherData: WeatherInput;
    locationContext: LocationContext;
  };
  expectedOutput: Partial<Suggestion>[];
} = {
  name: "Continuous Rain Warning",
  description: "When rain for 3+ consecutive days, should suggest checking drainage",
  input: {
    weatherData: {
      currentWeather: createSampleCurrentWeather({ windSpeedKmh: 15 }),
      dailyForecast: createSampleDailyForecast([
        { precipitation: 50, high: 28, low: 24 },
        { precipitation: 55, high: 27, low: 23 },
        { precipitation: 60, high: 26, low: 22 },
        { precipitation: 30, high: 29, low: 24 },
      ]),
    },
    locationContext: {
      municipality: "Dinalupihan",
    },
  },
  expectedOutput: [
    {
      type: "FarmingAdvice",
      priority: "MEDIUM",
      title: "Extended Rain Period",
      dismissible: true,
    },
  ],
};

// ============================================================================
// TEST CASE 5: Heat Stress (High Temp, Low Rain)
// ============================================================================

export const testCase5_HeatStress: {
  name: string;
  description: string;
  input: {
    weatherData: WeatherInput;
    locationContext: LocationContext;
  };
  expectedOutput: Partial<Suggestion>[];
} = {
  name: "Heat Stress Advisory",
  description: "When temp >34°C and low rain, should suggest irrigation and hydration",
  input: {
    weatherData: {
      currentWeather: createSampleCurrentWeather({ temperature: 35 }),
      dailyForecast: createSampleDailyForecast([
        { precipitation: 15, high: 36, low: 27 },
      ]),
    },
    locationContext: {
      municipality: "Mariveles",
    },
  },
  expectedOutput: [
    {
      type: "FarmingAdvice",
      priority: "LOW",
      title: "High Temperature Alert",
      dismissible: true,
    },
  ],
};

// ============================================================================
// TEST CASE 6: Task Conflicts
// ============================================================================

export const testCase6_TaskConflicts: {
  name: string;
  description: string;
  input: {
    weatherData: WeatherInput;
    locationContext: LocationContext;
    farmTasks: FarmTasksContext;
  };
  expectedOutput: Partial<Suggestion>[];
} = {
  name: "Task Scheduling Conflicts",
  description: "When scheduled tasks conflict with rainy days, should suggest rescheduling",
  input: {
    weatherData: {
      currentWeather: createSampleCurrentWeather(),
      dailyForecast: createSampleDailyForecast([
        { precipitation: 20, high: 32, low: 24 },
        { precipitation: 70, high: 30, low: 24 }, // Tomorrow has high rain
        { precipitation: 25, high: 31, low: 25 },
      ]),
    },
    locationContext: {
      municipality: "Balanga City",
    },
    farmTasks: {
      tasks: [
        {
          id: "task-1",
          title: "Apply Fertilizer",
          dateKey: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
          taskType: "Fertilizer Application",
        },
        {
          id: "task-2",
          title: "Planting Rice",
          dateKey: new Date(Date.now() + 172800000).toISOString().split("T")[0], // Day after tomorrow
          taskType: "Planting",
        },
      ],
    },
  },
  expectedOutput: [
    {
      type: "ScheduleSuggestion",
      priority: "HIGH",
      title: "Reschedule: Apply Fertilizer",
      dismissible: true,
    },
  ],
};

// ============================================================================
// TEST CASE 7: Extreme Weather Combination
// ============================================================================

export const testCase7_ExtremeCombination: {
  name: string;
  description: string;
  input: {
    weatherData: WeatherInput;
    locationContext: LocationContext;
  };
  expectedOutput: Partial<Suggestion>[];
} = {
  name: "Multiple Extreme Weather Conditions",
  description: "When multiple extreme conditions exist, should generate comprehensive warning",
  input: {
    weatherData: {
      currentWeather: createSampleCurrentWeather({ windSpeedKmh: 55 }),
      dailyForecast: createSampleDailyForecast([
        { precipitation: 85, high: 28, low: 24 },
      ]),
      typhoonAlert: true,
      rainVolumeMm: 45,
    },
    locationContext: {
      municipality: "Bagac",
    },
  },
  expectedOutput: [
    {
      type: "RiskWarning",
      priority: "HIGH",
      title: "Multiple Weather Risks",
      dismissible: false,
    },
  ],
};

// ============================================================================
// TEST CASE 8: No Weather Risk (Edge Case)
// ============================================================================

export const testCase8_NoRisk: {
  name: string;
  description: string;
  input: {
    weatherData: WeatherInput;
    locationContext: LocationContext;
  };
  expectedOutput: Partial<Suggestion>[];
} = {
  name: "No Weather Risk",
  description: "When weather is normal, should return empty array or low-priority suggestions",
  input: {
    weatherData: {
      currentWeather: createSampleCurrentWeather({ windSpeedKmh: 10 }),
      dailyForecast: createSampleDailyForecast([
        { precipitation: 15, high: 31, low: 25 },
        { precipitation: 20, high: 32, low: 26 },
        { precipitation: 10, high: 33, low: 27 },
      ]),
      typhoonAlert: false,
    },
    locationContext: {
      municipality: "Samal",
    },
  },
  expectedOutput: [], // No suggestions for normal weather
};

// ============================================================================
// TEST CASE 9: All Rules Triggered (Comprehensive)
// ============================================================================

export const testCase9_AllRules: {
  name: string;
  description: string;
  input: {
    weatherData: WeatherInput;
    locationContext: LocationContext;
    cropContext: CropContext;
    farmTasks: FarmTasksContext;
  };
  expectedOutput: Partial<Suggestion>[];
} = {
  name: "All Rules Triggered",
  description: "Complex scenario where multiple rules should generate suggestions",
  input: {
    weatherData: {
      currentWeather: createSampleCurrentWeather({ windSpeedKmh: 45 }),
      dailyForecast: createSampleDailyForecast([
        { precipitation: 80, high: 35, low: 26 }, // Heavy rain + heat
        { precipitation: 60, high: 32, low: 25 },
        { precipitation: 55, high: 31, low: 24 },
        { precipitation: 50, high: 30, low: 23 },
      ]),
      typhoonAlert: false,
      rainVolumeMm: 40,
    },
    locationContext: {
      municipality: "Orion",
    },
    cropContext: {
      selectedCropIds: ["rice", "vegetables"],
    },
    farmTasks: {
      tasks: [
        {
          id: "task-1",
          title: "Spray Pesticide",
          dateKey: new Date().toISOString().split("T")[0], // Today
          taskType: "Spraying",
        },
      ],
    },
  },
  expectedOutput: [
    // Should have multiple suggestions, sorted by priority
    { priority: "HIGH" },
    { priority: "MEDIUM" },
    { priority: "LOW" },
  ],
};

// ============================================================================
// HELPER FUNCTION: Run Test Case
// ============================================================================

/**
 * Run a test case and log results
 * Useful for manual testing and debugging
 */
export function runTestCase(
  testCase: {
    name: string;
    input: {
      weatherData: WeatherInput;
      locationContext: LocationContext;
      cropContext?: CropContext;
      farmTasks?: FarmTasksContext;
    };
    expectedOutput: Partial<Suggestion>[];
  }
): {
  passed: boolean;
  actualOutput: Suggestion[];
  expectedCount: number;
  actualCount: number;
} {
  const { weatherData, locationContext, cropContext, farmTasks } = testCase.input;

  const actualOutput = generateWeatherSuggestions(
    weatherData,
    locationContext,
    cropContext,
    farmTasks
  );

  const expectedCount = testCase.expectedOutput.length;
  const actualCount = actualOutput.length;

  // Basic validation: check if we got the expected number of suggestions
  // In a real test framework, you'd do more detailed assertions
  const passed = actualCount >= expectedCount;

  return {
    passed,
    actualOutput,
    expectedCount,
    actualCount,
  };
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: How to use the suggestion generator in your app
 */
export function exampleUsage() {
  // 1. Fetch weather data (using existing weather.ts functions)
  // const { daily, currentWeather } = await fetchWeatherForecast();

  // 2. Prepare inputs
  const weatherData: WeatherInput = {
    currentWeather: createSampleCurrentWeather({ windSpeedKmh: 35 }),
    dailyForecast: createSampleDailyForecast([
      { precipitation: 75, high: 30, low: 24 },
    ]),
    typhoonAlert: false,
    rainVolumeMm: 32,
  };

  const locationContext: LocationContext = {
    municipality: "Balanga City",
    barangay: "San Jose",
  };

  const cropContext: CropContext = {
    selectedCropIds: ["rice", "corn"],
  };

  const farmTasks: FarmTasksContext = {
    tasks: [
      {
        id: "task-1",
        title: "Apply Fertilizer",
        dateKey: new Date().toISOString().split("T")[0],
        taskType: "Fertilizer",
      },
    ],
  };

  // 3. Generate suggestions
  const suggestions = generateWeatherSuggestions(
    weatherData,
    locationContext,
    cropContext,
    farmTasks
  );

  // 4. Display suggestions with disclaimer
  console.log("Suggestions:", suggestions);
  console.log("Disclaimer:", getSuggestionDisclaimer());

  // 5. Sort is already done by priority (HIGH > MEDIUM > LOW)
  // 6. Each suggestion has all required fields for UI display

  return suggestions;
}
