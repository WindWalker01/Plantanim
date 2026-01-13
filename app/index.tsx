import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const setupComplete = await AsyncStorage.getItem("@plantanim:setup_complete");
      if (setupComplete === "true") {
        // Setup is complete, go to main app
        router.replace("/(tabs)");
      } else {
        // Setup not complete, go to onboarding
        router.replace("/onboarding");
      }
    } catch (error) {
      console.error("Error checking setup status:", error);
      // On error, go to onboarding
      router.replace("/onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}
