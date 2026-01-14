import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";
import { Platform } from "react-native";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useUserCrops } from "@/hooks/use-user-crops";
import { useCropPlantingDates } from "@/hooks/use-crop-planting-dates";
import { getCropConfig } from "@/lib/daily-tasks";

export default function SetPlantingDatesScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { crops } = useUserCrops();
  const { plantingDates, savePlantingDate, getPlantingDate, removePlantingDate } = useCropPlantingDates();
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"date" | "time">("date");

  const styles = useMemo(() => createStyles(colors), [colors]);

  const selectedCrops = useMemo(
    () => crops.filter((c) => c.selected),
    [crops]
  );

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (event.type === "set" && date && selectedCropId) {
        savePlantingDate(selectedCropId, date);
        setSelectedCropId(null);
      }
    } else {
      if (date) {
        setSelectedDate(date);
      }
    }
  };

  const handleDateConfirm = () => {
    if (selectedCropId) {
      savePlantingDate(selectedCropId, selectedDate);
      setSelectedCropId(null);
      setShowDatePicker(false);
    }
  };

  const handleSetDate = (cropId: string) => {
    const existingDate = getPlantingDate(cropId);
    if (existingDate) {
      setSelectedDate(existingDate);
    } else {
      setSelectedDate(new Date());
    }
    setSelectedCropId(cropId);
    setShowDatePicker(true);
  };

  const handleRemoveDate = async (cropId: string) => {
    await removePlantingDate(cropId);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysSincePlanting = (plantingDate: Date): number => {
    const today = new Date();
    const diffTime = today.getTime() - plantingDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
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
            accessibilityLabel="Back"
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.screenTitle}>Set Planting Dates</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <MaterialIcons name="info-outline" size={20} color={colors.tint} />
          <Text style={styles.infoText}>
            Set planting dates for your crops to generate daily farming tasks
            automatically.
          </Text>
        </View>

        {/* Crops List */}
        {selectedCrops.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="eco" size={64} color={colors.icon} />
            <Text style={styles.emptyTitle}>No Crops Selected</Text>
            <Text style={styles.emptyText}>
              Select crops in Personalization to set planting dates
            </Text>
          </View>
        ) : (
          <View style={styles.cropsList}>
            {selectedCrops.map((crop) => {
              const plantingDate = getPlantingDate(crop.id);
              const cropConfig = getCropConfig(crop.id);
              const daysSince = plantingDate
                ? getDaysSincePlanting(plantingDate)
                : null;

              return (
                <View key={crop.id} style={styles.cropCard}>
                  <View style={styles.cropHeader}>
                    <View style={styles.cropInfo}>
                      <Text style={styles.cropName}>{crop.name}</Text>
                      {cropConfig && (
                        <Text style={styles.cropDuration}>
                          {cropConfig.durationDays} days cycle
                        </Text>
                      )}
                    </View>
                    {plantingDate && (
                      <View style={styles.dateBadge}>
                        <MaterialIcons
                          name="check-circle"
                          size={20}
                          color="#16a34a"
                        />
                      </View>
                    )}
                  </View>

                  {plantingDate ? (
                    <View style={styles.dateInfo}>
                      <View style={styles.dateRow}>
                        <MaterialIcons
                          name="calendar-today"
                          size={16}
                          color={colors.textSubtle}
                        />
                        <Text style={styles.dateText}>
                          Planted: {formatDate(plantingDate)}
                        </Text>
                      </View>
                      {daysSince !== null && (
                        <View style={styles.dateRow}>
                          <MaterialIcons
                            name="schedule"
                            size={16}
                            color={colors.textSubtle}
                          />
                          <Text style={styles.dateText}>
                            Day {daysSince + 1} of crop cycle
                          </Text>
                        </View>
                      )}
                      <View style={styles.dateActions}>
                        <Pressable
                          style={[styles.actionButton, styles.editButton]}
                          onPress={() => handleSetDate(crop.id)}
                        >
                          <MaterialIcons name="edit" size={16} color={colors.tint} />
                          <Text style={[styles.actionButtonText, { color: colors.tint }]}>
                            Change Date
                          </Text>
                        </Pressable>
                        <Pressable
                          style={[styles.actionButton, styles.removeButton]}
                          onPress={() => handleRemoveDate(crop.id)}
                        >
                          <MaterialIcons name="delete-outline" size={16} color="#e74c3c" />
                          <Text
                            style={[styles.actionButtonText, { color: "#e74c3c" }]}
                          >
                            Remove
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <Pressable
                      style={styles.setDateButton}
                      onPress={() => handleSetDate(crop.id)}
                    >
                      <MaterialIcons name="add-circle-outline" size={20} color={colors.tint} />
                      <Text style={[styles.setDateButtonText, { color: colors.tint }]}>
                        Set Planting Date
                      </Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <MaterialIcons name="info-outline" size={16} color={colors.textSubtle} />
          <Text style={styles.disclaimerText}>
            Tasks are recommended based on your selected crop and planting date. Final
            decisions remain with the farmer.
          </Text>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {Platform.OS === "ios" ? (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerOverlay}>
            <View style={styles.datePickerContent}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Select Planting Date</Text>
                <Pressable onPress={() => setShowDatePicker(false)}>
                  <MaterialIcons name="close" size={24} color={colors.text} />
                </Pressable>
              </View>

              <View style={styles.datePickerBody}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  textColor={colors.text}
                  themeVariant={colors.background === "#101922" ? "dark" : "light"}
                />
              </View>

              <View style={styles.datePickerFooter}>
                <Pressable
                  style={styles.datePickerCancelButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.datePickerCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.datePickerConfirmButton}
                  onPress={handleDateConfirm}
                >
                  <Text style={styles.datePickerConfirmText}>Confirm</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )
      )}
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
      padding: 16,
      paddingBottom: 100,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
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
    infoBanner: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      padding: 16,
      backgroundColor: theme.surface,
      borderRadius: 12,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.tint + "33",
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
      lineHeight: 20,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 64,
      gap: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.text,
    },
    emptyText: {
      fontSize: 14,
      color: theme.textSubtle,
      textAlign: "center",
      paddingHorizontal: 32,
    },
    cropsList: {
      gap: 16,
    },
    cropCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.icon + "22",
    },
    cropHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    cropInfo: {
      flex: 1,
    },
    cropName: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 4,
    },
    cropDuration: {
      fontSize: 13,
      color: theme.textSubtle,
    },
    dateBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    dateInfo: {
      gap: 8,
    },
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    dateText: {
      fontSize: 14,
      color: theme.textSubtle,
    },
    dateActions: {
      flexDirection: "row",
      gap: 8,
      marginTop: 8,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    editButton: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.tint + "33",
    },
    removeButton: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: "#e74c3c33",
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: "700",
    },
    setDateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.tint,
      borderStyle: "dashed",
    },
    setDateButtonText: {
      fontSize: 15,
      fontWeight: "700",
    },
    disclaimer: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      marginTop: 24,
      padding: 12,
      backgroundColor: theme.surface,
      borderRadius: 12,
    },
    disclaimerText: {
      flex: 1,
      fontSize: 12,
      color: theme.textSubtle,
      lineHeight: 18,
      fontStyle: "italic",
    },
    datePickerOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    datePickerContent: {
      backgroundColor: theme.background,
      borderRadius: 24,
      width: "90%",
      maxWidth: 400,
      padding: 24,
    },
    datePickerHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    datePickerTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.text,
    },
    datePickerBody: {
      alignItems: "center",
      marginBottom: 24,
    },
    datePickerFooter: {
      flexDirection: "row",
      gap: 12,
    },
    datePickerCancelButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.surface,
      alignItems: "center",
    },
    datePickerCancelText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
    },
    datePickerConfirmButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.tint,
      alignItems: "center",
    },
    datePickerConfirmText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
    },
  });
