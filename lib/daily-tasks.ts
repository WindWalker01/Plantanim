/**
 * Daily Farming Tasks Module
 * 
 * Generates simple, actionable daily tasks based on:
 * - Selected crop
 * - Current day of crop cycle
 * - Optional weather influence
 * 
 * Design Principle: "Tasks guide daily work. Suggestions guide risk."
 * Tasks are stable and predictable; suggestions modify behavior during extreme weather.
 */

// ============================================================================
// DATA MODELS
// ============================================================================

/**
 * Task types for different farming activities
 */
export type TaskType = "Planting" | "Fertilizing" | "Weeding" | "Monitoring" | "HarvestPrep" | "Irrigation" | "PestControl" | "LandPreparation";

/**
 * Task status
 */
export type TaskStatus = "Pending" | "Completed" | "Skipped";

/**
 * Growth stages for crops
 */
export type GrowthStage = 
  | "Seedling"
  | "Vegetative"
  | "Flowering"
  | "Fruiting"
  | "Maturation"
  | "Harvest";

/**
 * DailyTask represents a farming task for a specific date
 */
export interface DailyTask {
  /** Unique identifier */
  id: string;
  
  /** Date in YYYY-MM-DD format */
  date: string;
  
  /** Crop type ID (e.g., "rice", "corn", "vegetables") */
  cropType: string;
  
  /** Crop name for display */
  cropName: string;
  
  /** Current growth stage */
  growthStage: GrowthStage;
  
  /** Day number in crop cycle (1 = planting day) */
  dayInCycle: number;
  
  /** Type of task */
  taskType: TaskType;
  
  /** Short, clear title */
  title: string;
  
  /** Detailed description in plain language */
  description: string;
  
  /** Whether this task is affected by weather */
  isWeatherSensitive: boolean;
  
  /** Current status */
  status: TaskStatus;
  
  /** Color for calendar display */
  calendarColor: string;
  
  /** Optional: Reason for skipping */
  skipReason?: string;
  
  /** Optional: Link to related weather suggestion ID */
  relatedSuggestionId?: string;
}

/**
 * Task template defines when a task should occur in the crop cycle
 */
export interface TaskTemplate {
  /** Day in crop cycle when this task occurs */
  day: number;
  
  /** Task type */
  taskType: TaskType;
  
  /** Title template (can include {day} placeholder) */
  title: string;
  
  /** Description template */
  description: string;
  
  /** Growth stage at this point */
  growthStage: GrowthStage;
  
  /** Whether task is weather-sensitive */
  isWeatherSensitive: boolean;
  
  /** Calendar color */
  calendarColor: string;
  
  /** Optional: Range of days (for recurring tasks) */
  dayRange?: { start: number; end: number; interval?: number };
}

/**
 * Crop configuration with task templates
 */
export interface CropConfig {
  /** Crop ID */
  id: string;
  
  /** Crop name */
  name: string;
  
  /** Expected duration in days */
  durationDays: number;
  
  /** Task templates for this crop */
  taskTemplates: TaskTemplate[];
}

// ============================================================================
// CROP TASK TEMPLATES
// ============================================================================

/**
 * Rice crop configuration
 * Typical cycle: 90-120 days
 */
const RICE_CONFIG: CropConfig = {
  id: "rice",
  name: "Rice",
  durationDays: 110,
  taskTemplates: [
    {
      day: 1,
      taskType: "LandPreparation",
      title: "Prepare Land for Planting",
      description: "Clear the field, level the ground, and prepare irrigation channels for rice planting.",
      growthStage: "Seedling",
      isWeatherSensitive: false,
      calendarColor: "#8b5cf6", // Purple
    },
    {
      day: 1,
      taskType: "Planting",
      title: "Plant Rice Seedlings",
      description: "Transplant rice seedlings into the prepared field. Space them properly for good growth.",
      growthStage: "Seedling",
      isWeatherSensitive: true,
      calendarColor: "#16a34a", // Green
    },
    {
      day: 14,
      taskType: "Fertilizing",
      title: "Apply First Fertilizer",
      description: "Apply nitrogen fertilizer to support early growth and tillering.",
      growthStage: "Vegetative",
      isWeatherSensitive: true,
      calendarColor: "#f59e0b", // Amber
    },
    {
      day: 30,
      taskType: "Weeding",
      title: "Remove Weeds",
      description: "Clear weeds around rice plants to prevent competition for nutrients and water.",
      growthStage: "Vegetative",
      isWeatherSensitive: false,
      calendarColor: "#10b981", // Emerald
    },
    {
      day: 45,
      taskType: "Fertilizing",
      title: "Apply Second Fertilizer",
      description: "Apply fertilizer during panicle initiation stage for better grain development.",
      growthStage: "Flowering",
      isWeatherSensitive: true,
      calendarColor: "#f59e0b",
    },
    {
      day: 50,
      taskType: "Monitoring",
      title: "Check for Pests",
      description: "Inspect rice plants for common pests like brown planthopper and stem borer.",
      growthStage: "Flowering",
      isWeatherSensitive: false,
      calendarColor: "#3b82f6", // Blue
    },
    {
      day: 60,
      taskType: "Irrigation",
      title: "Manage Water Level",
      description: "Maintain proper water level in the field. Rice needs consistent water during flowering.",
      growthStage: "Flowering",
      isWeatherSensitive: false,
      calendarColor: "#06b6d4", // Cyan
    },
    {
      day: 90,
      taskType: "HarvestPrep",
      title: "Prepare for Harvest",
      description: "Check grain maturity. Stop irrigation and prepare harvesting tools.",
      growthStage: "Maturation",
      isWeatherSensitive: false,
      calendarColor: "#e74c3c", // Red
    },
    {
      day: 100,
      taskType: "HarvestPrep",
      title: "Harvest Rice",
      description: "Harvest mature rice grains. Dry them properly before storage.",
      growthStage: "Harvest",
      isWeatherSensitive: true,
      calendarColor: "#e74c3c",
    },
  ],
};

/**
 * Corn crop configuration
 * Typical cycle: 75-90 days
 */
const CORN_CONFIG: CropConfig = {
  id: "corn",
  name: "Corn",
  durationDays: 85,
  taskTemplates: [
    {
      day: 1,
      taskType: "LandPreparation",
      title: "Prepare Soil for Corn",
      description: "Plow and harrow the field. Ensure good drainage for corn planting.",
      growthStage: "Seedling",
      isWeatherSensitive: false,
      calendarColor: "#8b5cf6",
    },
    {
      day: 1,
      taskType: "Planting",
      title: "Plant Corn Seeds",
      description: "Plant corn seeds at proper spacing. Cover with soil and water gently.",
      growthStage: "Seedling",
      isWeatherSensitive: true,
      calendarColor: "#16a34a",
    },
    {
      day: 10,
      taskType: "Fertilizing",
      title: "Apply Starter Fertilizer",
      description: "Apply fertilizer to support early root development and growth.",
      growthStage: "Vegetative",
      isWeatherSensitive: true,
      calendarColor: "#f59e0b",
    },
    {
      day: 20,
      taskType: "Weeding",
      title: "First Weeding",
      description: "Remove weeds around corn plants to reduce competition.",
      growthStage: "Vegetative",
      isWeatherSensitive: false,
      calendarColor: "#10b981",
    },
    {
      day: 35,
      taskType: "Fertilizing",
      title: "Side-Dress Fertilizer",
      description: "Apply fertilizer when corn reaches knee-high stage for better yield.",
      growthStage: "Vegetative",
      isWeatherSensitive: true,
      calendarColor: "#f59e0b",
    },
    {
      day: 45,
      taskType: "Monitoring",
      title: "Check Corn Ears",
      description: "Monitor corn development. Check for pests and diseases.",
      growthStage: "Fruiting",
      isWeatherSensitive: false,
      calendarColor: "#3b82f6",
    },
    {
      day: 70,
      taskType: "HarvestPrep",
      title: "Check Maturity",
      description: "Check if corn ears are mature. Kernels should be firm and milky.",
      growthStage: "Maturation",
      isWeatherSensitive: false,
      calendarColor: "#e74c3c",
    },
    {
      day: 80,
      taskType: "HarvestPrep",
      title: "Harvest Corn",
      description: "Harvest mature corn ears. Dry properly before storage or sale.",
      growthStage: "Harvest",
      isWeatherSensitive: true,
      calendarColor: "#e74c3c",
    },
  ],
};

/**
 * Vegetables crop configuration (generic for common vegetables like eggplant, tomato, etc.)
 * Typical cycle: 60-90 days
 */
const VEGETABLES_CONFIG: CropConfig = {
  id: "vegetables",
  name: "Vegetables",
  durationDays: 75,
  taskTemplates: [
    {
      day: 1,
      taskType: "LandPreparation",
      title: "Prepare Garden Bed",
      description: "Prepare soil by tilling and adding compost. Ensure good drainage.",
      growthStage: "Seedling",
      isWeatherSensitive: false,
      calendarColor: "#8b5cf6",
    },
    {
      day: 1,
      taskType: "Planting",
      title: "Plant Vegetable Seedlings",
      description: "Transplant seedlings or plant seeds at proper spacing.",
      growthStage: "Seedling",
      isWeatherSensitive: true,
      calendarColor: "#16a34a",
    },
    {
      day: 12,
      taskType: "Fertilizing",
      title: "Apply First Fertilizer",
      description: "Apply fertilizer to support early growth and root development.",
      growthStage: "Vegetative",
      isWeatherSensitive: true,
      calendarColor: "#f59e0b",
    },
    {
      day: 18,
      taskType: "Weeding",
      title: "Remove Weeds",
      description: "Clear weeds around vegetable plants to prevent competition.",
      growthStage: "Vegetative",
      isWeatherSensitive: false,
      calendarColor: "#10b981",
    },
    {
      day: 30,
      taskType: "Monitoring",
      title: "Check for Pests",
      description: "Inspect plants for pests and diseases. Look for damaged leaves or fruits.",
      growthStage: "Fruiting",
      isWeatherSensitive: false,
      calendarColor: "#3b82f6",
    },
    {
      day: 35,
      taskType: "Fertilizing",
      title: "Apply Flowering Fertilizer",
      description: "Apply fertilizer to support flowering and fruit development.",
      growthStage: "Flowering",
      isWeatherSensitive: true,
      calendarColor: "#f59e0b",
    },
    {
      day: 50,
      taskType: "PestControl",
      title: "Monitor and Control Pests",
      description: "Check for pests regularly. Use appropriate control methods if needed.",
      growthStage: "Fruiting",
      isWeatherSensitive: false,
      calendarColor: "#ef4444", // Red-orange
    },
    {
      day: 60,
      taskType: "HarvestPrep",
      title: "Start Harvesting",
      description: "Begin harvesting mature vegetables. Harvest regularly to encourage more production.",
      growthStage: "Harvest",
      isWeatherSensitive: false,
      calendarColor: "#e74c3c",
    },
  ],
};

/**
 * Root crops configuration (potato, cassava, etc.)
 * Typical cycle: 90-120 days
 */
const ROOT_CROPS_CONFIG: CropConfig = {
  id: "root-crops",
  name: "Root Crops",
  durationDays: 100,
  taskTemplates: [
    {
      day: 1,
      taskType: "LandPreparation",
      title: "Prepare Soil for Root Crops",
      description: "Loosen soil deeply and remove stones. Root crops need loose, well-drained soil.",
      growthStage: "Seedling",
      isWeatherSensitive: false,
      calendarColor: "#8b5cf6",
    },
    {
      day: 1,
      taskType: "Planting",
      title: "Plant Root Crop Seeds or Cuttings",
      description: "Plant seeds or cuttings at proper depth and spacing.",
      growthStage: "Seedling",
      isWeatherSensitive: true,
      calendarColor: "#16a34a",
    },
    {
      day: 15,
      taskType: "Fertilizing",
      title: "Apply First Fertilizer",
      description: "Apply fertilizer to support early growth and root development.",
      growthStage: "Vegetative",
      isWeatherSensitive: true,
      calendarColor: "#f59e0b",
    },
    {
      day: 25,
      taskType: "Weeding",
      title: "First Weeding",
      description: "Remove weeds carefully to avoid damaging developing roots.",
      growthStage: "Vegetative",
      isWeatherSensitive: false,
      calendarColor: "#10b981",
    },
    {
      day: 40,
      taskType: "Weeding",
      title: "Second Weeding",
      description: "Continue weeding to keep the field clean.",
      growthStage: "Vegetative",
      isWeatherSensitive: false,
      calendarColor: "#10b981",
    },
    {
      day: 50,
      taskType: "Monitoring",
      title: "Check Root Development",
      description: "Monitor plant health and check for pests or diseases.",
      growthStage: "Fruiting",
      isWeatherSensitive: false,
      calendarColor: "#3b82f6",
    },
    {
      day: 80,
      taskType: "HarvestPrep",
      title: "Prepare for Harvest",
      description: "Check root maturity. Stop watering a week before harvest.",
      growthStage: "Maturation",
      isWeatherSensitive: false,
      calendarColor: "#e74c3c",
    },
    {
      day: 95,
      taskType: "HarvestPrep",
      title: "Harvest Root Crops",
      description: "Harvest mature root crops. Handle carefully to avoid damage.",
      growthStage: "Harvest",
      isWeatherSensitive: true,
      calendarColor: "#e74c3c",
    },
  ],
};

/**
 * Mango tree configuration
 * Note: Trees have longer cycles, but we focus on annual maintenance tasks
 */
const MANGO_CONFIG: CropConfig = {
  id: "mango",
  name: "Mango",
  durationDays: 365, // Annual cycle
  taskTemplates: [
    {
      day: 1,
      taskType: "Monitoring",
      title: "Annual Tree Inspection",
      description: "Inspect mango trees for health, pests, and structural issues.",
      growthStage: "Vegetative",
      isWeatherSensitive: false,
      calendarColor: "#3b82f6",
    },
    {
      day: 30,
      taskType: "Fertilizing",
      title: "Apply Fertilizer",
      description: "Apply balanced fertilizer to support tree growth and fruit production.",
      growthStage: "Vegetative",
      isWeatherSensitive: true,
      calendarColor: "#f59e0b",
    },
    {
      day: 60,
      taskType: "PestControl",
      title: "Pest and Disease Control",
      description: "Monitor and control common mango pests like fruit flies and anthracnose.",
      growthStage: "Flowering",
      isWeatherSensitive: false,
      calendarColor: "#ef4444",
    },
    {
      day: 90,
      taskType: "Monitoring",
      title: "Monitor Flowering",
      description: "Check flowering progress. Ensure good pollination.",
      growthStage: "Flowering",
      isWeatherSensitive: false,
      calendarColor: "#3b82f6",
    },
    {
      day: 120,
      taskType: "Fertilizing",
      title: "Fruit Development Fertilizer",
      description: "Apply fertilizer to support fruit development and quality.",
      growthStage: "Fruiting",
      isWeatherSensitive: true,
      calendarColor: "#f59e0b",
    },
    {
      day: 180,
      taskType: "HarvestPrep",
      title: "Prepare for Harvest",
      description: "Monitor fruit maturity. Prepare harvesting tools and storage.",
      growthStage: "Maturation",
      isWeatherSensitive: false,
      calendarColor: "#e74c3c",
    },
    {
      day: 210,
      taskType: "HarvestPrep",
      title: "Harvest Mangoes",
      description: "Harvest mature mangoes. Handle carefully to avoid bruising.",
      growthStage: "Harvest",
      isWeatherSensitive: true,
      calendarColor: "#e74c3c",
    },
  ],
};

/**
 * Banana configuration
 * Note: Focus on annual cycle for banana plants
 */
const BANANA_CONFIG: CropConfig = {
  id: "banana",
  name: "Banana",
  durationDays: 300,
  taskTemplates: [
    {
      day: 1,
      taskType: "Planting",
      title: "Plant Banana Suckers",
      description: "Plant banana suckers at proper spacing. Ensure good drainage.",
      growthStage: "Seedling",
      isWeatherSensitive: true,
      calendarColor: "#16a34a",
    },
    {
      day: 30,
      taskType: "Fertilizing",
      title: "Apply First Fertilizer",
      description: "Apply fertilizer to support early growth and root development.",
      growthStage: "Vegetative",
      isWeatherSensitive: true,
      calendarColor: "#f59e0b",
    },
    {
      day: 60,
      taskType: "Weeding",
      title: "Remove Weeds",
      description: "Clear weeds around banana plants to reduce competition.",
      growthStage: "Vegetative",
      isWeatherSensitive: false,
      calendarColor: "#10b981",
    },
    {
      day: 90,
      taskType: "Monitoring",
      title: "Monitor Plant Health",
      description: "Check for pests, diseases, and nutrient deficiencies.",
      growthStage: "Vegetative",
      isWeatherSensitive: false,
      calendarColor: "#3b82f6",
    },
    {
      day: 120,
      taskType: "Fertilizing",
      title: "Apply Flowering Fertilizer",
      description: "Apply fertilizer before flowering to support bunch development.",
      growthStage: "Flowering",
      isWeatherSensitive: true,
      calendarColor: "#f59e0b",
    },
    {
      day: 180,
      taskType: "Monitoring",
      title: "Monitor Bunch Development",
      description: "Check banana bunch development. Protect from pests and wind.",
      growthStage: "Fruiting",
      isWeatherSensitive: false,
      calendarColor: "#3b82f6",
    },
    {
      day: 240,
      taskType: "HarvestPrep",
      title: "Prepare for Harvest",
      description: "Monitor bunch maturity. Prepare harvesting tools.",
      growthStage: "Maturation",
      isWeatherSensitive: false,
      calendarColor: "#e74c3c",
    },
    {
      day: 270,
      taskType: "HarvestPrep",
      title: "Harvest Banana",
      description: "Harvest mature banana bunches. Handle carefully.",
      growthStage: "Harvest",
      isWeatherSensitive: true,
      calendarColor: "#e74c3c",
    },
  ],
};

/**
 * Coconut configuration
 * Note: Focus on annual maintenance tasks
 */
const COCONUT_CONFIG: CropConfig = {
  id: "coconut",
  name: "Coconut",
  durationDays: 365,
  taskTemplates: [
    {
      day: 1,
      taskType: "Monitoring",
      title: "Annual Tree Inspection",
      description: "Inspect coconut trees for health, pests, and structural issues.",
      growthStage: "Vegetative",
      isWeatherSensitive: false,
      calendarColor: "#3b82f6",
    },
    {
      day: 30,
      taskType: "Fertilizing",
      title: "Apply Fertilizer",
      description: "Apply fertilizer to support tree growth and nut production.",
      growthStage: "Vegetative",
      isWeatherSensitive: true,
      calendarColor: "#f59e0b",
    },
    {
      day: 90,
      taskType: "Weeding",
      title: "Clear Underbrush",
      description: "Remove weeds and underbrush around coconut trees.",
      growthStage: "Vegetative",
      isWeatherSensitive: false,
      calendarColor: "#10b981",
    },
    {
      day: 120,
      taskType: "Monitoring",
      title: "Monitor Nut Development",
      description: "Check coconut development and tree health.",
      growthStage: "Fruiting",
      isWeatherSensitive: false,
      calendarColor: "#3b82f6",
    },
    {
      day: 180,
      taskType: "Fertilizing",
      title: "Mid-Year Fertilizer",
      description: "Apply fertilizer to maintain tree health and production.",
      growthStage: "Fruiting",
      isWeatherSensitive: true,
      calendarColor: "#f59e0b",
    },
    {
      day: 240,
      taskType: "HarvestPrep",
      title: "Prepare for Harvest",
      description: "Monitor nut maturity. Prepare harvesting tools.",
      growthStage: "Maturation",
      isWeatherSensitive: false,
      calendarColor: "#e74c3c",
    },
    {
      day: 300,
      taskType: "HarvestPrep",
      title: "Harvest Coconuts",
      description: "Harvest mature coconuts. Continue regular harvesting.",
      growthStage: "Harvest",
      isWeatherSensitive: true,
      calendarColor: "#e74c3c",
    },
  ],
};

/**
 * Registry of all crop configurations
 */
const CROP_REGISTRY: Record<string, CropConfig> = {
  rice: RICE_CONFIG,
  corn: CORN_CONFIG,
  vegetables: VEGETABLES_CONFIG,
  "root-crops": ROOT_CROPS_CONFIG,
  mango: MANGO_CONFIG,
  banana: BANANA_CONFIG,
  coconut: COCONUT_CONFIG,
};

// ============================================================================
// TASK GENERATION LOGIC
// ============================================================================

/**
 * Calculate the day number in crop cycle from planting date
 */
function calculateDayInCycle(plantingDate: Date, currentDate: Date): number {
  const diffTime = currentDate.getTime() - plantingDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1); // Day 1 is planting day
}

/**
 * Generate a unique task ID
 */
function generateTaskId(cropType: string, dayInCycle: number, taskType: TaskType): string {
  return `task-${cropType}-${dayInCycle}-${taskType.toLowerCase()}-${Date.now()}`;
}

/**
 * Format date to YYYY-MM-DD string
 */
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculate task date from planting date and day in cycle
 */
function calculateTaskDate(plantingDate: Date, dayInCycle: number): Date {
  const taskDate = new Date(plantingDate);
  taskDate.setDate(taskDate.getDate() + (dayInCycle - 1));
  return taskDate;
}

/**
 * Generate daily tasks for a crop
 * 
 * @param cropType - Crop ID (e.g., "rice", "corn")
 * @param plantingDate - Date when crop was planted
 * @param currentDate - Current date (defaults to today)
 * @param lookAheadDays - Number of days ahead to generate tasks (default: 30)
 * @returns Array of DailyTask objects
 */
export function generateDailyTasks(
  cropType: string,
  plantingDate: Date,
  currentDate: Date = new Date(),
  lookAheadDays: number = 30
): DailyTask[] {
  const cropConfig = CROP_REGISTRY[cropType];
  
  if (!cropConfig) {
    console.warn(`No crop configuration found for: ${cropType}`);
    return [];
  }

  const currentDayInCycle = calculateDayInCycle(plantingDate, currentDate);
  const endDayInCycle = currentDayInCycle + lookAheadDays;
  const maxDay = Math.min(endDayInCycle, cropConfig.durationDays);

  const tasks: DailyTask[] = [];

  // Generate tasks for each template that falls within the date range
  for (const template of cropConfig.taskTemplates) {
    // Check if template day is within range
    if (template.day >= currentDayInCycle && template.day <= maxDay) {
      const taskDate = calculateTaskDate(plantingDate, template.day);
      const dateKey = formatDateKey(taskDate);

      // Skip if task date is in the past (unless it's today)
      const today = formatDateKey(currentDate);
      if (dateKey < today && dateKey !== today) {
        continue;
      }

      const task: DailyTask = {
        id: generateTaskId(cropType, template.day, template.taskType),
        date: dateKey,
        cropType: cropConfig.id,
        cropName: cropConfig.name,
        growthStage: template.growthStage,
        dayInCycle: template.day,
        taskType: template.taskType,
        title: template.title.replace("{day}", String(template.day)),
        description: template.description,
        isWeatherSensitive: template.isWeatherSensitive,
        status: "Pending",
        calendarColor: template.calendarColor,
      };

      tasks.push(task);
    }
  }

  // Sort by date
  tasks.sort((a, b) => a.date.localeCompare(b.date));

  return tasks;
}

/**
 * Generate tasks for multiple crops
 */
export function generateTasksForCrops(
  crops: Array<{ id: string; plantingDate: Date }>,
  currentDate: Date = new Date(),
  lookAheadDays: number = 30
): DailyTask[] {
  const allTasks: DailyTask[] = [];

  for (const crop of crops) {
    const tasks = generateDailyTasks(crop.id, crop.plantingDate, currentDate, lookAheadDays);
    allTasks.push(...tasks);
  }

  // Sort by date
  allTasks.sort((a, b) => a.date.localeCompare(b.date));

  return allTasks;
}

/**
 * Get crop configuration by ID
 */
export function getCropConfig(cropType: string): CropConfig | null {
  return CROP_REGISTRY[cropType] || null;
}

/**
 * Get all available crop configurations
 */
export function getAllCropConfigs(): CropConfig[] {
  return Object.values(CROP_REGISTRY);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get task color for calendar display
 */
export function getTaskColor(taskType: TaskType): string {
  const colorMap: Record<TaskType, string> = {
    Planting: "#16a34a", // Green
    Fertilizing: "#f59e0b", // Amber
    Weeding: "#10b981", // Emerald
    Monitoring: "#3b82f6", // Blue
    HarvestPrep: "#e74c3c", // Red
    Irrigation: "#06b6d4", // Cyan
    PestControl: "#ef4444", // Red-orange
    LandPreparation: "#8b5cf6", // Purple
  };
  return colorMap[taskType] || "#6b7280";
}

/**
 * Get task type label
 */
export function getTaskTypeLabel(taskType: TaskType): string {
  return taskType;
}

/**
 * Format task for display
 */
export function formatTaskForDisplay(task: DailyTask): string {
  return `${task.title} - ${task.description}`;
}
