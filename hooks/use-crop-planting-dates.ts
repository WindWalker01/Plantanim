/**
 * Hook for managing crop planting dates
 * Stores planting dates for each selected crop
 */

import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
        for (const item of dates) {
          datesMap[item.cropId] = new Date(item.plantingDate);
        }
        setPlantingDates(datesMap);
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
        })
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
        })
      );

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storageDates));
      return true;
    } catch (error) {
      console.error("Error removing planting date:", error);
      return false;
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
