import { StyleSheet, Text, View } from "react-native";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { MaterialIcons } from "@expo/vector-icons";

export default function RiskLevel() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.riskCard}>
      <View style={styles.riskHeader}>
        <MaterialIcons name="warning" size={26} color={colors.riskText} />
        <Text style={styles.riskTitle}>RISK LEVEL: MODERATE</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>

      <Text style={styles.riskText}>Yellow Warnings: Be Prepared</Text>
    </View>
  );
}

const createStyles = (colors: Theme) =>
  StyleSheet.create({
    riskCard: {
      marginHorizontal: 16,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.riskBg,
    },

    riskHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },

    riskTitle: {
      fontWeight: "800",
      color: colors.riskText,
    },

    progressBar: {
      height: 10,
      backgroundColor: colors.riskBar + "33",
      borderRadius: 999,
      overflow: "hidden",
      marginBottom: 8,
    },

    progressFill: {
      width: "65%",
      height: "100%",
      backgroundColor: colors.riskBar,
    },

    riskText: {
      fontWeight: "600",
      color: colors.riskText,
    },
  });
