import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Fonts, Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function TopBar() {
  const { colors, fonts } = useAppTheme();

  const styles = createStyles(colors, fonts);
  return (
    <View style={styles.header}>
      <View style={styles.location}>
        <MaterialIcons name="location-on" size={24} color={colors.tint} />
        <View>
          <Text style={styles.locationLabel}>Current Location</Text>
          <Text style={styles.locationValue}>Central Luzon, PH</Text>
        </View>
      </View>

      <Pressable style={styles.notificationBtn}>
        <MaterialIcons name="notifications" size={22} color={colors.icon} />
        <View style={styles.notificationDot} />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: Theme, fonts: Fonts) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderColor: colors.icon + "22",
    },

    location: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
    },

    locationLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
      fontFamily: fonts.sans,
    },

    locationValue: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.text,
      fontFamily: fonts.sans,
    },

    notificationBtn: {
      padding: 8,
    },

    notificationDot: {
      position: "absolute",
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "red",
    },
  });
