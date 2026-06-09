import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { tokens } from "@/lib/theme";
import { usd } from "@/lib/format";
import { useCart } from "@/components/providers/CartProvider";
import type { CartItem } from "@/lib/types";

interface CartLineProps {
  item: CartItem;
}

const SPRING = { damping: 16, stiffness: 320, mass: 0.6 };
const BLURHASH = "L6Pj0^jE.AyE_3t7t7R**0o#DgR4";

function lightHaptic() {
  if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function CartLine({ item }: CartLineProps) {
  const { setQty } = useCart();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onPressIn = () => {
    scale.value = withSpring(0.985, SPRING);
  };
  const onPressOut = () => {
    scale.value = withSpring(1, SPRING);
  };

  const dec = () => {
    lightHaptic();
    setQty(item.id, item.qty - 1); // qty<=0 removes (handled by provider)
  };
  const inc = () => {
    lightHaptic();
    setQty(item.id, item.qty + 1);
  };
  const onRemove = () => {
    lightHaptic();
    setQty(item.id, 0);
  };

  return (
    <Animated.View
      style={[styles.card, animatedStyle]}
      onTouchStart={onPressIn}
      onTouchEnd={onPressOut}
      onTouchCancel={onPressOut}
    >
      <Image
        source={item.image}
        placeholder={{ blurhash: BLURHASH }}
        contentFit="cover"
        transition={200}
        style={styles.thumb}
      />

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.price}>{usd(item.price)}</Text>

        <View style={styles.stepper}>
          <Pressable
            onPress={dec}
            style={styles.stepBtn}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Decrease quantity of ${item.name}`}
          >
            <Ionicons name="remove" size={18} color={tokens.colors.ink} />
          </Pressable>
          <Text style={styles.qty}>{item.qty}</Text>
          <Pressable
            onPress={inc}
            style={styles.stepBtn}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Increase quantity of ${item.name}`}
          >
            <Ionicons name="add" size={18} color={tokens.colors.ink} />
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={onRemove}
        style={styles.remove}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.name}`}
      >
        <Ionicons name="close" size={18} color={tokens.colors.muted} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.space.md,
    padding: tokens.space.md,
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tokens.colors.hairline,
    ...tokens.shadow.card,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.bg,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: tokens.colors.ink,
    lineHeight: 18,
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: tokens.colors.ink,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 4,
    gap: tokens.space.md,
    paddingHorizontal: tokens.space.xs,
    paddingVertical: 2,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.bg,
  },
  stepBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: tokens.radius.pill,
  },
  qty: {
    minWidth: 16,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  remove: {
    alignSelf: "flex-start",
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: tokens.radius.pill,
  },
});
