/**
 * Hook for managing crop planting dates
 * Stores planting dates for each selected crop
 */

import { getCropConfig } from "@/lib/daily-tasks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const STORAGE_KEY = "@plantanim:crop_planting_dates";

export interface CropPlantingDate {
  cropId: string;
  plantingDate: string; // ISO date string
}

export function useCropPlantingDates() {
  const [plantingDates, setPlantingDates] = useState<Record<string, Date>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlantingDates();
  }, []);

  const loadPlantingDates = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const dates: CropPlantingDate[] = JSON.parse(stored);
        const datesMap: Record<string, Date> = {};
        const completedCycles: { cropId: string; plantingDate: Date }[] = [];
        const today = new Date();

        for (const item of dates) {
          const plantingDate = new Date(item.plantingDate);
          datesMap[item.cropId] = plantingDate;

          // Check if cycle is completed
          const cropConfig = getCropConfig(item.cropId);
          if (cropConfig) {
            const daysSincePlanting = Math.floor(
              (today.getTime() - plantingDate.getTime()) /
                (1000 * 60 * 60 * 24),
            );
            const daysInCycle = daysSincePlanting + 1; // Day 1 is planting day

            if (daysInCycle > cropConfig.durationDays) {
              // Cycle is completed, add to completed cycles for migration
              completedCycles.push({
                cropId: item.cropId,
                plantingDate: plantingDate,
              });
            }
          }
        }

        // Migrate completed cycles to farming history
        if (completedCycles.length > 0) {
          await migrateCompletedCyclesToHistory(completedCycles);
        }

        // Keep only active cycles in planting dates
        const activeDatesMap: Record<string, Date> = {};
        for (const [cropId, plantingDate] of Object.entries(datesMap)) {
          const cropConfig = getCropConfig(cropId);
          if (cropConfig) {
            const daysSincePlanting = Math.floor(
              (today.getTime() - plantingDate.getTime()) /
                (1000 * 60 * 60 * 24),
            );
            const daysInCycle = daysSincePlanting + 1;

            if (daysInCycle <= cropConfig.durationDays) {
              activeDatesMap[cropId] = plantingDate;
            }
          } else {
            activeDatesMap[cropId] = plantingDate;
          }
        }

        setPlantingDates(activeDatesMap);

        // Save the filtered dates back to storage
        if (
          Object.keys(activeDatesMap).length !== Object.keys(datesMap).length
        ) {
          const storageDates: CropPlantingDate[] = Object.entries(
            activeDatesMap,
          ).map(([id, date]) => ({
            cropId: id,
            plantingDate: date.toISOString(),
          }));
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storageDates));
        }
      }
    } catch (error) {
      console.error("Error loading planting dates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePlantingDate = async (cropId: string, plantingDate: Date) => {
    try {
      // Create a new object to ensure React detects the change
      const newDates = { ...plantingDates, [cropId]: new Date(plantingDate) };
      setPlantingDates(newDates);

      // Convert to storage format
      const storageDates: CropPlantingDate[] = Object.entries(newDates).map(
        ([id, date]) => ({
          cropId: id,
          plantingDate: date.toISOString(),
        }),
      );

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storageDates));
      return true;
    } catch (error) {
      console.error("Error saving planting date:", error);
      return false;
    }
  };

  const getPlantingDate = (cropId: string): Date | null => {
    return plantingDates[cropId] || null;
  };

  const removePlantingDate = async (cropId: string) => {
    try {
      // Create a new object without the removed crop to ensure React detects the change
      const newDates = { ...plantingDates };
      delete newDates[cropId];
      setPlantingDates({ ...newDates }); // Create new object reference

      const storageDates: CropPlantingDate[] = Object.entries(newDates).map(
        ([id, date]) => ({
          cropId: id,
          plantingDate: date.toISOString(),
        }),
      );

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storageDates));
      return true;
    } catch (error) {
      console.error("Error removing planting date:", error);
      return false;
    }
  };

  // Helper function to migrate completed cycles to farming history
  const migrateCompletedCyclesToHistory = async (
    completedCycles: { cropId: string; plantingDate: Date }[],
  ) => {
    try {
      const { loadAppData, saveAppData, addCycle } =
        await import("@/lib/app-storage");
      const appData = await loadAppData();

      // Create farming cycles for completed planting dates
      for (const completedCycle of completedCycles) {
        const cycle = {
          id: `${completedCycle.cropId}-${completedCycle.plantingDate.getTime()}`,
          cropType: completedCycle.cropId,
          startDate: completedCycle.plantingDate.toISOString(),
          status: "completed" as const,
          tasks: [], // No tasks needed for history
        };

        await addCycle(cycle);
      }
    } catch (error) {
      console.error("Error migrating completed cycles to history:", error);
    }
  };

  return {
    plantingDates,
    isLoading,
    savePlantingDate,
    getPlantingDate,
    removePlantingDate,
    loadPlantingDates,
  };
}
