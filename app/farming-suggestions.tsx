import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

type Category = "urgent" | "pending" | "completed";

type Suggestion = {
  id: string;
  title: string;
  description: string;
  category: Category;
  accent: string;
  badge: {
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
  };
  image?: string;
};

const SUGGESTIONS: Suggestion[] = [
  {
    id: "secure-nursery",
    title: "Secure Nursery",
    description:
      "Strong winds expected. Move seedlings to shelter immediately to prevent loss. Check roof reinforcements.",
    category: "urgent",
    accent: "#e74c3c",
    badge: { label: "Red Alert", icon: "home" },
    image:
      "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "postpone-fertilizer",
    title: "Postpone Fertilizer",
    description:
      "Heavy rain will cause runoff. Efficiency decreases significantly. Wait for the upcoming dry spell on Friday.",
    category: "urgent",
    accent: "#f59e0b",
    badge: { label: "Rain Warning", icon: "water-drop" },
  },
  {
    id: "clear-drainage",
    title: "Clear Drainage",
    description:
      "Ensure all field canals are free of debris to accommodate expected heavy rainfall tonight.",
    category: "pending",
    accent: "#2563eb",
    badge: { label: "Maintenance", icon: "build" },
  },
  {
    id: "tie-trellis",
    title: "Tie Up Trellis Vines",
    description:
      "Reinforce climbing crops to avoid wind damage. Focus on tomatoes and beans near the south fence line.",
    category: "completed",
    accent: "#16a34a",
    badge: { label: "Completed", icon: "check-circle" },
  },
];

const CATEGORY_ORDER: { key: Category; label: string }[] = [
  { key: "urgent", label: "Urgent" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
];

export default function FarmingSuggestionsScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>("urgent");

  const counts = useMemo(() => {
    return CATEGORY_ORDER.reduce<Record<Category, number>>((acc, cat) => {
      acc[cat.key] = SUGGESTIONS.filter(
        (item) => item.category === cat.key,
      ).length;
      return acc;
    }, {} as Record<Category, number>);
  }, []);

  const filteredSuggestions = useMemo(
    () => SUGGESTIONS.filter((item) => item.category === activeCategory),
    [activeCategory],
  );

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.back()}
            accessibilityLabel="Back"
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </Pressable>

          <Text style={styles.screenTitle}>Farming Suggestions</Text>

          <Pressable style={styles.iconButton} accessibilityLabel="Settings">
            <MaterialIcons name="settings" size={24} color={colors.text} />
          </Pressable>
        </View>

        {/* Headline Alert */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <MaterialIcons
              name="warning-amber"
              size={22}
              color="#e74c3c"
            />
          </View>
          <Text style={styles.bannerTitle}>Typhoon Warning</Text>
        </View>

        {/* Signal Card */}
        <View style={styles.signalCard}>
          <View style={styles.signalTextBlock}>
            <Text style={styles.signalTitle}>Signal #2 Active</Text>
            <Text style={styles.signalBody}>
              Heavy rain expected. 28°C. Wind 60kph.
            </Text>
          </View>
          <MaterialCommunityIcons
            name="weather-lightning"
            size={32}
            color={colors.tint}
          />
        </View>

        {/* Category pills */}
        <View style={styles.categoryRow}>
          {CATEGORY_ORDER.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <Pressable
                key={cat.key}
                style={[
                  styles.categoryPill,
                  isActive && {
                    backgroundColor: colors.tint,
                    borderColor: colors.tint,
                  },
                ]}
                onPress={() => setActiveCategory(cat.key)}
              >
                <Text
                  style={[
                    styles.categoryLabel,
                    isActive && { color: "#fff" },
                  ]}
                >
                  {cat.label} ({counts[cat.key]})
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Suggestions list */}
        <View style={styles.list}>
          {filteredSuggestions.map((item) => (
            <SuggestionCard
              key={item.id}
              item={item}
              theme={colors}
              styles={styles}
            />
          ))}
          <Text style={styles.footerText}>End of suggestions</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SuggestionCard({
  item,
  theme,
  styles,
}: {
  item: Suggestion;
  theme: Theme;
  styles: ReturnType<typeof createStyles>;
}) {
  const accent = item.accent;
  return (
    <View style={[styles.card, { borderColor: accent + "1f" }]}>
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: accent + "1a" }]}>
            <MaterialIcons name={item.badge.icon} size={16} color={accent} />
            <Text style={[styles.badgeText, { color: accent }]}>
              {item.badge.label.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardTitleRow}>
          <View style={[styles.cardIconContainer, { backgroundColor: accent + "1a" }]}>
            <MaterialIcons name={item.badge.icon} size={20} color={accent} />
          </View>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {item.title}
          </Text>
        </View>
        <Text style={[styles.cardDescription, { color: theme.textSubtle }]}>
          {item.description}
        </Text>

        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.cardImage} />
        ) : null}

        <View style={styles.actions}>
          <Pressable style={styles.secondaryButton}>
            <Text style={[styles.secondaryText, { color: theme.text }]}>
              Dismiss
            </Text>
          </Pressable>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: accent }]}
          >
            <MaterialIcons name="check" size={18} color="#fff" />
            <Text style={styles.primaryText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </View>
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
      gap: 16,
      paddingBottom: 56,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    iconButton: {
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
    banner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 12,
    },
    bannerIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fee2e2",
    },
    bannerTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: "#e74c3c",
    },
    signalCard: {
      borderRadius: 16,
      padding: 16,
      gap: 6,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.icon + "22",
    },
    signalTextBlock: {
      flex: 1,
      gap: 4,
    },
    signalTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.text,
    },
    signalBody: {
      fontSize: 15,
      lineHeight: 21,
      color: theme.textSubtle,
    },
    categoryRow: {
      flexDirection: "row",
      gap: 10,
    },
    categoryPill: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.icon + "33",
      backgroundColor: theme.surface,
    },
    categoryLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text,
    },
    list: {
      gap: 14,
    },
    card: {
      borderRadius: 18,
      borderWidth: 1,
      backgroundColor: theme.surface,
      overflow: "hidden",
      flexDirection: "row",
    },
    accentBar: {
      width: 8,
    },
    cardContent: {
      flex: 1,
      padding: 16,
      gap: 10,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    cardTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    cardIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: "800",
      flex: 1,
    },
    cardDescription: {
      fontSize: 15,
      lineHeight: 22,
    },
    cardImage: {
      width: "100%",
      height: 150,
      borderRadius: 14,
      marginTop: 4,
    },
    actions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 4,
    },
    secondaryButton: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.icon + "33",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
    },
    secondaryText: {
      fontSize: 16,
      fontWeight: "700",
    },
    primaryButton: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 6,
    },
    primaryText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "800",
    },
    footerText: {
      textAlign: "center",
      marginTop: 8,
      color: theme.textSubtle,
      fontWeight: "600",
    },
  });
