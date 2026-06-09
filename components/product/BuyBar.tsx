import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { MotiView } from "moti";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "@/lib/theme";
import { useCart } from "@/components/providers/CartProvider";
import type { Product } from "@/lib/types";
import { PillButton } from "@/components/ui/PillButton";

interface BuyBarProps {
  product: Product;
}

const SPRING = { damping: 15, stiffness: 300, mass: 0.6 };

export function BuyBar({ product }: BuyBarProps) {
  const { add } = useCart();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [added, setAdded] = useState(false);

  // Scale animation for the add button press confirmation
  const addScale = useSharedValue(1);
  const addAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addScale.value }],
  }));

  const handleAddToCart = () => {
    add(product);

    if (Platform.OS !== "web") {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Quick confirmation: scale up, show "Added" briefly, scale back
    addScale.value = withSequence(
      withSpring(1.06, SPRING),
      withDelay(800, withSpring(1, SPRING)),
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleBuyNow = () => {
    add(product);
    router.push("/(tabs)/cart");
  };

  const bottomPad = Math.max(insets.bottom, tokens.space.lg);

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: bottomPad },
      ]}
    >
      <Animated.View style={[styles.addButton, addAnimStyle]}>
        <MotiView
          key={added ? "added" : "add"}
          from={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 18, stiffness: 260 }}
          style={styles.addInner}
        >
          <PillButton
            label={added ? "Added" : "Add to cart"}
            icon={added ? "checkmark" : undefined}
            onPress={handleAddToCart}
            variant="solid"
            style={styles.fillButton}
          />
        </MotiView>
      </Animated.View>

      <PillButton
        label="Buy now"
        onPress={handleBuyNow}
        variant="outline"
        style={styles.buyNow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.space.md,
    paddingHorizontal: tokens.space.xl,
    paddingTop: tokens.space.lg,
    backgroundColor: tokens.colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tokens.colors.hairline,
    ...tokens.shadow.lifted,
  },
  addButton: {
    flex: 1,
  },
  addInner: {
    flex: 1,
  },
  fillButton: {
    flex: 1,
  },
  buyNow: {
    minWidth: 110,
  },
});
