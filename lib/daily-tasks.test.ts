/**
 * Daily Tasks Module - Test Cases and Examples
 */

import {
  generateDailyTasks,
  generateTasksForCrops,
  getCropConfig,
  getAllCropConfigs,
  DailyTask,
  CropConfig,
} from "./daily-tasks";

// ============================================================================
// TEST CASE 1: Rice Task Generation
// ============================================================================

export const testCase1_RiceTasks = {
  name: "Rice Task Generation",
  description: "Generate tasks for rice crop starting from planting date",
  input: {
    cropType: "rice",
    plantingDate: new Date("2024-01-01"),
    currentDate: new Date("2024-01-01"),
    lookAheadDays: 30,
  },
  expectedOutput: {
    minTasks: 3, // Should have at least planting, first fertilizer, etc.
    taskTypes: ["LandPreparation", "Planting", "Fertilizing"],
  },
};

// ============================================================================
// TEST CASE 2: Vegetables Task Generation
// ============================================================================

export const testCase2_VegetablesTasks = {
  name: "Vegetables Task Generation",
  description: "Generate tasks for vegetables crop",
  input: {
    cropType: "vegetables",
    plantingDate: new Date("2024-01-01"),
    currentDate: new Date("2024-01-15"), // Day 15
    lookAheadDays: 30,
  },
  expectedOutput: {
    minTasks: 2, // Should include tasks around day 15-45
    includesWeeding: true,
  },
};

// ============================================================================
// TEST CASE 3: Multiple Crops
// ============================================================================

export const testCase3_MultipleCrops = {
  name: "Multiple Crops Task Generation",
  description: "Generate tasks for multiple crops",
  input: {
    crops: [
      { id: "rice", plantingDate: new Date("2024-01-01") },
      { id: "corn", plantingDate: new Date("2024-01-15") },
    ],
    currentDate: new Date("2024-01-20"),
    lookAheadDays: 30,
  },
  expectedOutput: {
    minTasks: 4, // Tasks from both crops
  },
};

// ============================================================================
// TEST CASE 4: Past Dates Filtering
// ============================================================================

export const testCase4_PastDates = {
  name: "Past Dates Filtering",
  description: "Tasks in the past should be filtered out",
  input: {
    cropType: "rice",
    plantingDate: new Date("2024-01-01"),
    currentDate: new Date("2024-02-01"), // 31 days later
    lookAheadDays: 30,
  },
  expectedOutput: {
    noPastTasks: true, // Should not include tasks before current date
  },
};

// ============================================================================
// TEST CASE 5: No Crop Selected
// ============================================================================

export const testCase5_NoCrop = {
  name: "No Crop Selected",
  description: "Should return empty array for unknown crop",
  input: {
    cropType: "unknown-crop",
    plantingDate: new Date("2024-01-01"),
    currentDate: new Date("2024-01-01"),
    lookAheadDays: 30,
  },
  expectedOutput: {
    empty: true,
  },
};

// ============================================================================
// TEST CASE 6: Harvest Completed
// ============================================================================

export const testCase6_HarvestCompleted = {
  name: "Harvest Completed",
  description: "No tasks after crop duration",
  input: {
    cropType: "rice",
    plantingDate: new Date("2024-01-01"),
    currentDate: new Date("2024-05-01"), // After 120 days
    lookAheadDays: 30,
  },
  expectedOutput: {
    empty: true, // No tasks after crop cycle completes
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Run a test case
 */
export function runTestCase(testCase: {
  name: string;
  input: any;
  expectedOutput: any;
}): {
  passed: boolean;
  actualOutput: DailyTask[];
  message: string;
} {
  let actualOutput: DailyTask[] = [];
  let passed = false;
  let message = "";

  try {
    if (testCase.name.includes("Multiple")) {
      actualOutput = generateTasksForCrops(
        testCase.input.crops,
        testCase.input.currentDate,
        testCase.input.lookAheadDays
      );
    } else {
      actualOutput = generateDailyTasks(
        testCase.input.cropType,
        testCase.input.plantingDate,
        testCase.input.currentDate,
        testCase.input.lookAheadDays
      );
    }

    // Validate output
    if (testCase.expectedOutput.empty) {
      passed = actualOutput.length === 0;
      message = passed ? "Correctly returned empty array" : "Expected empty array";
    } else if (testCase.expectedOutput.minTasks) {
      passed = actualOutput.length >= testCase.expectedOutput.minTasks;
      message = passed
        ? `Generated ${actualOutput.length} tasks (expected at least ${testCase.expectedOutput.minTasks})`
        : `Only generated ${actualOutput.length} tasks (expected at least ${testCase.expectedOutput.minTasks})`;
    } else if (testCase.expectedOutput.noPastTasks) {
      const today = testCase.input.currentDate.toISOString().split("T")[0];
      const pastTasks = actualOutput.filter((t) => t.date < today);
      passed = pastTasks.length === 0;
      message = passed
        ? "No past tasks included"
        : `Found ${pastTasks.length} past tasks`;
    } else {
      passed = true;
      message = "Test completed";
    }
  } catch (error) {
    message = `Error: ${error}`;
    passed = false;
  }

  return { passed, actualOutput, message };
}

// ============================================================================
// SAMPLE DATA GENERATORS
// ============================================================================

/**
 * Generate sample tasks for demonstration
 */
export function generateSampleTasks(): DailyTask[] {
  const today = new Date();
  const ricePlantingDate = new Date(today);
  ricePlantingDate.setDate(ricePlantingDate.getDate() - 20); // Planted 20 days ago

  const cornPlantingDate = new Date(today);
  cornPlantingDate.setDate(cornPlantingDate.getDate() - 5); // Planted 5 days ago

  const riceTasks = generateDailyTasks("rice", ricePlantingDate, today, 30);
  const cornTasks = generateDailyTasks("corn", cornPlantingDate, today, 30);

  return [...riceTasks, ...cornTasks].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

/**
 * Get sample planting dates for all crops
 */
export function getSamplePlantingDates(): Record<string, Date> {
  const today = new Date();
  return {
    rice: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    corn: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    vegetables: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    "root-crops": new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  };
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example: How to use the task generator in your app
 */
export function exampleUsage() {
  // 1. Get user's selected crops (from useUserCrops hook)
  const selectedCrops = [
    { id: "rice", name: "Rice" },
    { id: "corn", name: "Corn" },
  ];

  // 2. Get planting dates (from useCropPlantingDates hook)
  const plantingDates: Record<string, Date> = {
    rice: new Date("2024-01-01"),
    corn: new Date("2024-01-15"),
  };

  // 3. Generate tasks for each crop
  const allTasks: DailyTask[] = [];
  const currentDate = new Date();
  const lookAheadDays = 60; // Generate tasks for next 60 days

  for (const crop of selectedCrops) {
    const plantingDate = plantingDates[crop.id];
    if (plantingDate) {
      const tasks = generateDailyTasks(
        crop.id,
        plantingDate,
        currentDate,
        lookAheadDays
      );
      allTasks.push(...tasks);
    }
  }

  // 4. Sort by date
  allTasks.sort((a, b) => a.date.localeCompare(b.date));

  // 5. Group by date for calendar display
  const tasksByDate: Record<string, DailyTask[]> = {};
  for (const task of allTasks) {
    if (!tasksByDate[task.date]) {
      tasksByDate[task.date] = [];
    }
    tasksByDate[task.date].push(task);
  }

  return {
    allTasks,
    tasksByDate,
    totalTasks: allTasks.length,
  };
}

/**
 * Example: Calendar-formatted data
 */
export function exampleCalendarFormat() {
  const tasks = generateSampleTasks();

  // Format for react-native-calendars
  const markedDates: Record<string, any> = {};

  for (const task of tasks) {
    if (task.status === "Pending") {
      if (!markedDates[task.date]) {
        markedDates[task.date] = {
          marked: true,
          dots: [],
        };
      }
      markedDates[task.date].dots.push({
        color: task.calendarColor,
        selectedColor: task.calendarColor,
      });
    }
  }

  return markedDates;
}
