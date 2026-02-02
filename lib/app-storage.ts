import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Centralized local storage helper for offline-first app data.
 * All profile + farming cycle data lives under one key to minimize reads/writes.
 */
const APP_DATA_KEY = "@plantanim:app_data";

export type LocationProfile = {
  province: string;
  municipality: string;
  barangay: string;
};

export type UserProfile = {
  fullName: string;
  phoneNumber?: string;
  email?: string;
  location: LocationProfile;
  createdAt: string;
};

export type FarmingTask = {
  dayOffset: number;
  title: string;
  description: string;
};

export type FarmingCycle = {
  id: string;
  cropType: string;
  startDate: string;
  status: "active" | "completed";
  tasks: FarmingTask[];
};

export type AppData = {
  profile: UserProfile | null;
  cycles: FarmingCycle[];
};

const DEFAULT_DATA: AppData = {
  profile: null,
  cycles: [],
};

export async function loadAppData(): Promise<AppData> {
  try {
    const stored = await AsyncStorage.getItem(APP_DATA_KEY);
    if (!stored) {
      return DEFAULT_DATA;
    }
    const parsed = JSON.parse(stored) as AppData;
    return {
      profile: parsed.profile ?? null,
      cycles: parsed.cycles ?? [],
    };
  } catch (error) {
    console.error("Error loading app data:", error);
    return DEFAULT_DATA;
  }
}

export async function saveAppData(data: AppData): Promise<boolean> {
  try {
    await AsyncStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Error saving app data:", error);
    return false;
  }
}

export async function saveProfile(profile: UserProfile): Promise<boolean> {
  const data = await loadAppData();
  return saveAppData({ ...data, profile });
}

export function generateCycleTasks(cropType: string): FarmingTask[] {
  const normalized = cropType.toLowerCase();

  if (normalized.includes("rice")) {
    return [
      {
        dayOffset: 0,
        title: "Day 1 Planting",
        description: "Prepare paddies and plant rice seedlings.",
      },
      {
        dayOffset: 12,
        title: "Day 12 Fertilizer",
        description: "Apply basal fertilizer for healthy growth.",
      },
      {
        dayOffset: 30,
        title: "Day 30 Weeding",
        description: "Remove weeds to avoid nutrient competition.",
      },
      {
        dayOffset: 90,
        title: "Day 90 Harvest",
        description: "Harvest mature rice grains and dry properly.",
      },
    ];
  }

  if (normalized.includes("corn")) {
    return [
      {
        dayOffset: 0,
        title: "Day 1 Planting",
        description: "Sow corn seeds in prepared rows.",
      },
      {
        dayOffset: 10,
        title: "Day 10 Fertilizer",
        description: "Apply nitrogen fertilizer for early growth.",
      },
      {
        dayOffset: 25,
        title: "Day 25 Pest Check",
        description: "Inspect for pests and apply control measures.",
      },
      {
        dayOffset: 75,
        title: "Day 75 Harvest",
        description: "Harvest ears once kernels are mature.",
      },
    ];
  }

  return [
    {
      dayOffset: 0,
      title: "Day 1 Planting",
      description: "Start your planting cycle with soil preparation.",
    },
    {
      dayOffset: 14,
      title: "Day 14 Fertilizer",
      description: "Apply balanced fertilizer to support growth.",
    },
    {
      dayOffset: 35,
      title: "Day 35 Monitoring",
      description: "Monitor plant health and adjust care as needed.",
    },
    {
      dayOffset: 70,
      title: "Day 70 Harvest Prep",
      description: "Prepare tools and labor for harvest.",
    },
  ];
}

export async function addCycle(cycle: FarmingCycle): Promise<boolean> {
  const data = await loadAppData();
  const updated = [...data.cycles, cycle];
  return saveAppData({ ...data, cycles: updated });
}

export async function completeCycle(cycleId: string): Promise<boolean> {
  const data = await loadAppData();
  const updated = data.cycles.map((cycle) =>
    cycle.id === cycleId ? { ...cycle, status: "completed" as const } : cycle,
  );
  return saveAppData({ ...data, cycles: updated });
}
