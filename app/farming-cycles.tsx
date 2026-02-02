import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useLanguage } from "@/hooks/use-language";
import { useUserCrops } from "@/hooks/use-user-crops";
import {
  addCycle,
  completeCycle,
  generateCycleTasks,
  loadAppData,
  type FarmingCycle,
} from "@/lib/app-storage";

export default function FarmingCyclesScreen() {
  const { colors } = useAppTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const { crops } = useUserCrops();

  const [cycles, setCycles] = useState<FarmingCycle[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCycle, setNewCycle] = useState({
    cropType: "",
    startDate: new Date().toISOString().split("T")[0],
  });
  const [isLoading, setIsLoading] = useState(true);

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    loadCycles();
  }, []);

  const loadCycles = async () => {
    try {
      const data = await loadAppData();
      setCycles(data.cycles);
    } catch (error) {
      console.error("Error loading cycles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const availableCrops = crops.filter((crop) => crop.selected);

  const activeCycles = cycles.filter((cycle) => cycle.status === "active");
  const completedCycles = cycles.filter(
    (cycle) => cycle.status === "completed",
  );

  const handleCreateCycle = async () => {
    if (!newCycle.cropType) return;

    try {
      const cycle: FarmingCycle = {
        id: Date.now().toString(),
        cropType: newCycle.cropType,
        startDate: newCycle.startDate,
        status: "active",
        tasks: generateCycleTasks(newCycle.cropType),
      };

      const success = await addCycle(cycle);
      if (success) {
        await loadCycles();
        setNewCycle({
          cropType: "",
          startDate: new Date().toISOString().split("T")[0],
        });
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error("Error creating cycle:", error);
    }
  };

  const handleCompleteCycle = async (cycleId: string) => {
    try {
      const success = await completeCycle(cycleId);
      if (success) {
        await loadCycles();
      }
    } catch (error) {
      console.error("Error completing cycle:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCropName = (cropType: string) => {
    const crop = availableCrops.find((c) => c.id === cropType);
    return crop ? crop.name : cropType;
  };

  const CycleCard = ({ cycle }: { cycle: FarmingCycle }) => (
    <View style={styles.cycleCard}>
      <View style={styles.cycleHeader}>
        <View style={styles.cycleInfo}>
          <Text style={styles.cycleTitle}>{getCropName(cycle.cropType)}</Text>
          <Text style={styles.cycleDate}>
            Started: {formatDate(cycle.startDate)}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            cycle.status === "active"
              ? styles.activeBadge
              : styles.completedBadge,
          ]}
        >
          <Text style={styles.statusText}>
            {cycle.status === "active" ? "Active" : "Completed"}
          </Text>
        </View>
      </View>

      {cycle.status === "active" && (
        <View style={styles.cycleActions}>
          <Pressable
            style={styles.completeButton}
            onPress={() => handleCompleteCycle(cycle.id)}
          >
            <MaterialIcons name="check-circle" size={20} color="#fff" />
            <Text style={styles.completeButtonText}>Mark Complete</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text>Loading farming cycles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.screenTitle}>Farming History</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/set-planting-dates")}
          >
            <MaterialIcons
              name="calendar-today"
              size={24}
              color={colors.text}
            />
          </Pressable>
        </View>

        {/* Active Cycles */}
        {activeCycles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Cycles</Text>
            {activeCycles.map((cycle) => (
              <CycleCard key={cycle.id} cycle={cycle} />
            ))}
          </View>
        )}

        {/* Completed Cycles */}
        {completedCycles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed Cycles</Text>
            {completedCycles.map((cycle) => (
              <CycleCard key={cycle.id} cycle={cycle} />
            ))}
          </View>
        )}

        {/* Empty State */}
        {cycles.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="agriculture"
              size={64}
              color={colors.textSubtle}
            />
            <Text style={styles.emptyTitle}>No farming history yet</Text>
            <Text style={styles.emptyText}>
              Set planting dates in the Calendar to track your farming
              activities.
            </Text>
            <Pressable
              style={styles.createFirstButton}
              onPress={() => router.push("/set-planting-dates")}
            >
              <Text style={styles.createFirstButtonText}>
                Set Planting Dates
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Create Cycle Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Farming Cycle</Text>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              {/* Crop Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Crop Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.cropOptions}>
                    {availableCrops.map((crop) => (
                      <Pressable
                        key={crop.id}
                        style={[
                          styles.cropOption,
                          newCycle.cropType === crop.id &&
                            styles.cropOptionSelected,
                        ]}
                        onPress={() =>
                          setNewCycle({ ...newCycle, cropType: crop.id })
                        }
                      >
                        <Text style={styles.cropOptionText}>{crop.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Start Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Start Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={newCycle.startDate}
                  onChangeText={(text) =>
                    setNewCycle({ ...newCycle, startDate: text })
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSubtle}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.createButton,
                  !newCycle.cropType && styles.createButtonDisabled,
                ]}
                onPress={handleCreateCycle}
                disabled={!newCycle.cropType}
              >
                <Text style={styles.createButtonText}>Create Cycle</Text>
              </Pressable>
            </View>
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
    loading: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
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
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    section: {
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 12,
    },
    cycleCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      gap: 12,
    },
    cycleHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    cycleInfo: {
      flex: 1,
    },
    cycleTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.text,
      marginBottom: 4,
    },
    cycleDate: {
      fontSize: 14,
      color: theme.textSubtle,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    activeBadge: {
      backgroundColor: "#dcfce7",
    },
    completedBadge: {
      backgroundColor: "#e5e7eb",
    },
    statusText: {
      fontSize: 12,
      fontWeight: "700",
    },
    tasksCount: {
      fontSize: 14,
      color: theme.textSubtle,
    },
    cycleActions: {
      flexDirection: "row",
      gap: 8,
    },
    completeButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#16a34a",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    completeButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "700",
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      paddingTop: 100,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.text,
      marginTop: 16,
      marginBottom: 8,
      textAlign: "center",
    },
    emptyText: {
      fontSize: 14,
      color: theme.textSubtle,
      textAlign: "center",
      marginBottom: 24,
    },
    createFirstButton: {
      backgroundColor: "#137fec",
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    createFirstButtonText: {
      color: "#fff",
      fontSize: 16,
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
    modalBody: {
      padding: 20,
      gap: 20,
    },
    inputGroup: {
      gap: 8,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text,
    },
    cropOptions: {
      flexDirection: "row",
      gap: 8,
    },
    cropOption: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.icon + "33",
      backgroundColor: theme.surface,
    },
    cropOptionSelected: {
      backgroundColor: "#137fec",
      borderColor: "#137fec",
    },
    cropOptionText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
    },
    textInput: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.icon + "22",
    },
    modalFooter: {
      flexDirection: "row",
      gap: 12,
      padding: 20,
    },
    cancelButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.surface,
      alignItems: "center",
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
    },
    createButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      backgroundColor: "#137fec",
      alignItems: "center",
    },
    createButtonDisabled: {
      opacity: 0.5,
    },
    createButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
    },
  });
