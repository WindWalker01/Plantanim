import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";

const MUNICIPALITIES = [
  "Angeles City",
  "Bacolor",
  "Mabalacat",
  "San Fernando",
  "Mexico",
  "Arayat",
  "Candaba",
  "Magalang",
  "Masantol",
  "San Luis",
];

const BARANGAYS: Record<string, string[]> = {
  "Angeles City": ["Balibago", "Pampang", "Sapalibutad", "Cutcut", "Malabanias"],
  "Bacolor": ["Cabambangan", "Dolores", "San Antonio", "San Isidro", "Talba"],
  "Mabalacat": ["Dau", "Dolores", "Lakandula", "Mabiga", "Poblacion"],
  "San Fernando": ["Bulaon", "Calulut", "Del Carmen", "Dolores", "Lourdes"],
  "Mexico": ["Anao", "Balas", "Concepcion", "Lagundi", "San Antonio"],
  "Arayat": ["Bucloc", "Camba", "Candating", "La Paz", "San Juan"],
  "Candaba": ["Bancal", "Barangca", "Bulu", "Mangga", "Pulong Gubat"],
  "Magalang": ["Ayala", "Balen", "Bucal", "Camias", "Dolores"],
  "Masantol": ["Alauli", "Bagang", "Bebe Anac", "Bebe Matua", "Bulacus"],
  "San Luis": ["San Agustin", "San Isidro", "San Jose", "San Nicolas", "San Pedro"],
};

export default function SetLocationScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("");
  const [selectedBarangay, setSelectedBarangay] = useState<string>("");
  const [showMunicipalityModal, setShowMunicipalityModal] = useState(false);
  const [showBarangayModal, setShowBarangayModal] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    loadSavedLocation();
  }, []);

  const loadSavedLocation = async () => {
    try {
      const locationJson = await AsyncStorage.getItem("@plantanim:user_location");
      if (locationJson) {
        const location = JSON.parse(locationJson);
        setSelectedMunicipality(location.municipality);
        setSelectedBarangay(location.barangay);
      }
    } catch (error) {
      console.error("Error loading saved location:", error);
    }
  };

  const availableBarangays = selectedMunicipality
    ? BARANGAYS[selectedMunicipality] || []
    : [];

  const handleAutoDetect = () => {
    // In a real app, this would use GPS
    setSelectedMunicipality("San Fernando");
    setSelectedBarangay("Bulaon");
  };

  const handleSave = async () => {
    try {
      // Save location to local storage
      if (selectedMunicipality && selectedBarangay) {
        await AsyncStorage.setItem(
          "@plantanim:user_location",
          JSON.stringify({
            municipality: selectedMunicipality,
            barangay: selectedBarangay,
          })
        );
      }
    } catch (error) {
      console.error("Error saving location:", error);
    }
    
    // Check if we came from settings (check if setup was already complete)
    const setupComplete = await AsyncStorage.getItem("@plantanim:setup_complete");
    
    if (setupComplete === "true") {
      // User came from settings, go back to settings
      router.back();
    } else {
      // First time setup, navigate to personalization screen
      router.push("/personalization");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.screenTitle}>Set Location</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.mainQuestion}>Where is your farm?</Text>
          <Text style={styles.instruction}>
            Set your location to get accurate typhoon warnings for your crops.
          </Text>

          {/* Map Visual */}
          <View style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              <MaterialIcons name="place" size={64} color="#137fec" />
            </View>
          </View>

          {/* Auto-detect Card */}
          <Pressable style={styles.autoDetectCard} onPress={handleAutoDetect}>
            <MaterialIcons name="my-location" size={24} color="#137fec" />
            <View style={styles.autoDetectTextContainer}>
              <Text style={styles.autoDetectTitle}>Auto-detect Location</Text>
              <Text style={styles.autoDetectSubtitle}>
                Use current GPS position
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSubtle} />
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR MANUALLY SELECT</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Municipality Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Municipality</Text>
            <Pressable
              style={styles.selectField}
              onPress={() => setShowMunicipalityModal(true)}
            >
              <Text
                style={[
                  styles.selectFieldText,
                  !selectedMunicipality && styles.selectFieldPlaceholder,
                ]}
              >
                {selectedMunicipality || "Select Municipality"}
              </Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={24}
                color={colors.textSubtle}
              />
            </Pressable>
          </View>

          {/* Barangay Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Barangay</Text>
            <Pressable
              style={[
                styles.selectField,
                !selectedMunicipality && styles.selectFieldDisabled,
              ]}
              onPress={() => selectedMunicipality && setShowBarangayModal(true)}
              disabled={!selectedMunicipality}
            >
              <Text
                style={[
                  styles.selectFieldText,
                  (!selectedBarangay || !selectedMunicipality) &&
                    styles.selectFieldPlaceholder,
                ]}
              >
                {selectedBarangay || "Select Barangay"}
              </Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={24}
                color={colors.textSubtle}
              />
            </Pressable>
            {!selectedMunicipality && (
              <Text style={styles.helperText}>Select a municipality first</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.saveButton,
            (!selectedMunicipality || !selectedBarangay) &&
              styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!selectedMunicipality || !selectedBarangay}
        >
          <Text style={styles.saveButtonText}>Save and Continue</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Municipality Modal */}
      <Modal
        visible={showMunicipalityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMunicipalityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Municipality</Text>
              <Pressable onPress={() => setShowMunicipalityModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView>
              {MUNICIPALITIES.map((municipality) => (
                <Pressable
                  key={municipality}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedMunicipality(municipality);
                    setSelectedBarangay("");
                    setShowMunicipalityModal(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{municipality}</Text>
                  {selectedMunicipality === municipality && (
                    <MaterialIcons name="check" size={20} color="#137fec" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Barangay Modal */}
      <Modal
        visible={showBarangayModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBarangayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Barangay</Text>
              <Pressable onPress={() => setShowBarangayModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView>
              {availableBarangays.map((barangay) => (
                <Pressable
                  key={barangay}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedBarangay(barangay);
                    setShowBarangayModal(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{barangay}</Text>
                  {selectedBarangay === barangay && (
                    <MaterialIcons name="check" size={20} color="#137fec" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    screenTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.text,
    },
    placeholder: {
      width: 40,
    },
    content: {
      paddingHorizontal: 16,
    },
    mainQuestion: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 12,
    },
    instruction: {
      fontSize: 14,
      color: "#137fec",
      marginBottom: 24,
      lineHeight: 20,
    },
    mapContainer: {
      height: 200,
      backgroundColor: "#f3f4f6",
      borderRadius: 16,
      marginBottom: 20,
      overflow: "hidden",
    },
    mapPlaceholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#e5e7eb",
    },
    autoDetectCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      gap: 12,
    },
    autoDetectTextContainer: {
      flex: 1,
    },
    autoDetectTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 4,
    },
    autoDetectSubtitle: {
      fontSize: 12,
      color: theme.textSubtle,
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
      gap: 12,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.icon + "33",
    },
    dividerText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.textSubtle,
      letterSpacing: 1,
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
    },
    selectField: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.icon + "22",
    },
    selectFieldDisabled: {
      opacity: 0.5,
    },
    selectFieldText: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
    },
    selectFieldPlaceholder: {
      color: theme.textSubtle,
    },
    helperText: {
      fontSize: 12,
      color: theme.textSubtle,
      marginTop: 4,
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.icon + "22",
    },
    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: "#137fec",
      paddingVertical: 16,
      borderRadius: 12,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      color: "#ffffff",
      fontSize: 18,
      fontWeight: "700",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: theme.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "80%",
      paddingTop: 20,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.icon + "22",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.text,
    },
    modalOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.icon + "11",
    },
    modalOptionText: {
      fontSize: 16,
      color: theme.text,
    },
  });
