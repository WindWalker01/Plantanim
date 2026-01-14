import { StyleSheet, Text, View } from "react-native";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  todayPrecipitation?: number | null;
};

export default function RiskLevel({ todayPrecipitation }: Props) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  const precip = todayPrecipitation ?? 0;

  let label = "LOW";
  let message = "Low risk for your crops today.";
  let fillPercent = 25;
  let riskBg = "#dcfce7"; // green-100
  let riskTrack = "#bbf7d0"; // green-200
  let riskFill = "#16a34a"; // green-600
  let riskText = "#166534"; // green-700

  if (precip >= 70) {
    label = "HIGH";
    message = "High risk: Expect heavy rain. Avoid fertilizing and plan drainage.";
    fillPercent = 90;
    riskBg = "#fee2e2"; // red-100
    riskTrack = "#fecaca"; // red-200
    riskFill = "#dc2626"; // red-600
    riskText = "#7f1d1d"; // red-800
  } else if (precip >= 40) {
    label = "MODERATE";
    message = "Moderate risk: Be prepared for possible heavy showers.";
    fillPercent = 65;
    riskBg = "#fef3c7"; // amber-100
    riskTrack = "#fde68a"; // amber-200
    riskFill = "#f59e0b"; // amber-500
    riskText = "#92400e"; // amber-800
  }

  return (
    <View style={[styles.riskCard, { backgroundColor: riskBg }]}>
      <View style={styles.riskHeader}>
        <MaterialIcons name="warning" size={26} color={riskText} />
        <Text style={[styles.riskTitle, { color: riskText }]}>
          RISK LEVEL: {label}
        </Text>
      </View>

      <View style={[styles.progressBar, { backgroundColor: riskTrack }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${fillPercent}%`, backgroundColor: riskFill },
          ]}
        />
      </View>

      <Text style={[styles.riskText, { color: riskText }]}>{message}</Text>
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
      height: "100%",
      backgroundColor: colors.riskBar,
    },

    riskText: {
      fontWeight: "600",
      color: colors.riskText,
    },
  });
