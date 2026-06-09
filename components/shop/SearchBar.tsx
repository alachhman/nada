import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { tokens } from "@/lib/theme";

interface SearchBarProps {
  /** "shortcut" is a tappable navigation affordance; "input" is a real text field. */
  mode?: "shortcut" | "input";
  placeholder?: string;
  // shortcut mode
  onPress?: () => void;
  // input mode
  value?: string;
  onChangeText?: (text: string) => void;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
}

export function SearchBar({
  mode = "shortcut",
  placeholder = "Search nada",
  onPress,
  value,
  onChangeText,
  autoFocus,
  onSubmitEditing,
}: SearchBarProps) {
  if (mode === "input") {
    return (
      <View style={styles.bar}>
        <Ionicons name="search" size={19} color={tokens.colors.muted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={tokens.colors.muted}
          value={value}
          onChangeText={onChangeText}
          autoFocus={autoFocus}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value ? (
          <Pressable onPress={() => onChangeText?.("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={tokens.colors.muted} />
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <Pressable
      style={styles.bar}
      onPress={() => {
        if (Platform.OS !== "web") void Haptics.selectionAsync();
        onPress?.();
      }}
      accessibilityRole="search"
      accessibilityLabel="Search nada"
    >
      <Ionicons name="search" size={19} color={tokens.colors.muted} />
      <Text style={styles.placeholder}>{placeholder}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    borderColor: tokens.colors.hairline,
    paddingHorizontal: tokens.space.lg,
    height: 48,
    gap: tokens.space.sm,
  },
  placeholder: {
    fontSize: 15,
    color: tokens.colors.muted,
    fontWeight: "500",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: tokens.colors.ink,
    fontWeight: "500",
    padding: 0,
  },
});
