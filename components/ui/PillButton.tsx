import { Platform, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { tokens } from "@/lib/theme";

type Variant = "solid" | "outline" | "subtle";

interface PillButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

const SPRING = { damping: 16, stiffness: 320, mass: 0.6 };

export function PillButton({ label, onPress, variant = "solid", icon, style }: PillButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onPressIn = () => {
    scale.value = withSpring(0.94, SPRING);
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const onPressOut = () => {
    scale.value = withSpring(1, SPRING);
  };

  const fg =
    variant === "solid" ? tokens.colors.accentFg : tokens.colors.ink;

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.base, styles[variant]]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {icon ? <Ionicons name={icon} size={17} color={fg} style={styles.icon} /> : null}
        <Text style={[styles.label, { color: fg }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: tokens.space.xl,
    paddingVertical: tokens.space.md,
    borderRadius: tokens.radius.pill,
  },
  solid: {
    backgroundColor: tokens.colors.accent,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: tokens.colors.hairline,
  },
  subtle: {
    backgroundColor: tokens.colors.surface,
  },
  icon: {
    marginRight: tokens.space.sm,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
});
