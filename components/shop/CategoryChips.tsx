import { Platform, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { tokens } from "@/lib/theme";

export const CATEGORIES = ["All", "Apparel", "Home", "Tech", "Kitchen", "Fitness"] as const;
export type Category = (typeof CATEGORIES)[number];

interface CategoryChipsProps {
  selected: Category;
  onSelect: (category: Category) => void;
}

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {CATEGORIES.map((cat) => {
        const active = cat === selected;
        return (
          <Pressable
            key={cat}
            onPress={() => {
              if (Platform.OS !== "web") void Haptics.selectionAsync();
              onSelect(cat);
            }}
            style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={cat}
          >
            <Text style={[styles.label, active ? styles.labelActive : styles.labelIdle]}>
              {cat}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: tokens.space.xl,
    gap: tokens.space.sm,
  },
  chip: {
    paddingHorizontal: tokens.space.lg,
    paddingVertical: 9,
    borderRadius: tokens.radius.pill,
  },
  chipActive: {
    backgroundColor: tokens.colors.accent,
  },
  chipIdle: {
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.hairline,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
  },
  labelActive: {
    color: tokens.colors.accentFg,
  },
  labelIdle: {
    color: tokens.colors.ink,
  },
});
