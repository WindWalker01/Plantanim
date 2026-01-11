import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet, Text, View } from "react-native";

export default function WeatherCard() {
  const { colors } = useAppTheme();

  const style = createStyle(colors);
  return (
    <View style={style.container}>
      <Text style={style.text}>Now</Text>
      <MaterialIcons name="cloud" size={32} color={colors.surface} />
      <Text style={style.temperature}>28°</Text>

      <View style={style.rainProbability}>
        <MaterialIcons name="cloud" size={16} color={colors.surface} />
        <Text style={style.text}>60%</Text>
      </View>
    </View>
  );
}

const createStyle = (colors: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.tint,
      borderColor: colors.tabIconSelected,
      borderRadius: "10%",
      borderWidth: 3,

      width: 96,
      height: 160,

      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: 2,

      margin: 8,
    },

    text: {
      fontWeight: "bold",
      marginBottom: 4,
      color: colors.surface,
    },

    temperature: {
      fontWeight: "bold",
      fontSize: 24,
      marginTop: 4,

      color: colors.surface,
    },

    rainProbability: {
      marginTop: 8,

      display: "flex",
      flexDirection: "row",
      gap: 8,
    },
  });
