import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@plantanim:user_crops";

export type Crop = {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  selected: boolean;
};

export function useUserCrops() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    try {
      const savedCropsJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedCropsJson) {
        const savedCrops = JSON.parse(savedCropsJson);
        setCrops(savedCrops);
      }
    } catch (error) {
      console.error("Error loading crops:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCrops = async (selectedCrops: Crop[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCrops));
      setCrops(selectedCrops);
      return true;
    } catch (error) {
      console.error("Error saving crops:", error);
      return false;
    }
  };

  return {
    crops,
    isLoading,
    loadCrops,
    saveCrops,
  };
}
