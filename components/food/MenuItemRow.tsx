import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { tokens } from "@/lib/theme";
import { usd } from "@/lib/format";
import type { MenuItem } from "@/lib/food";
import { useFoodOrder } from "@/components/providers/FoodOrderProvider";

interface MenuItemRowProps {
  item: MenuItem;
}

const SPRING = { damping: 16, stiffness: 320, mass: 0.6 };
const BLURHASH = "L6Pj0^jE.AyE_3t7t7R**0o#DgR4";
const THUMB_SIZE = 76;

function AddButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => scale.value = withSpring(0.9, SPRING);
  const handlePressOut = () => scale.value = withSpring(1, SPRING);

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.addBtn}
        accessibilityRole="button"
        accessibilityLabel="Add to order"
      >
        <Text style={styles.addBtnLabel}>+</Text>
      </Pressable>
    </Animated.View>
  );
}

function Stepper({ qty, onInc, onDec }: { qty: number; onInc: () => void; onDec: () => void }) {
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={onDec}
        style={styles.stepBtn}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        hitSlop={6}
      >
        <Text style={styles.stepBtnLabel}>−</Text>
      </Pressable>
      <Text style={styles.stepQty}>{qty}</Text>
      <Pressable
        onPress={onInc}
        style={styles.stepBtn}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        hitSlop={6}
      >
        <Text style={styles.stepBtnLabel}>+</Text>
      </Pressable>
    </View>
  );
}

export function MenuItemRow({ item }: MenuItemRowProps) {
  const { items, add, setQty } = useFoodOrder();
  const orderItem = items.find((i) => i.id === item.id);
  const qty = orderItem?.qty ?? 0;

  const handleAdd = () => {
    add(item);
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleInc = () => {
    setQty(item.id, qty + 1);
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDec = () => {
    // setQty with qty-1; provider handles <=0 → remove
    setQty(item.id, qty - 1);
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.row}>
      {/* Left: text block */}
      <View style={styles.textBlock}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.price}>{usd(item.price)}</Text>
      </View>

      {/* Right: thumb + add control */}
      <View style={styles.rightBlock}>
        <Image
          source={item.image}
          placeholder={{ blurhash: BLURHASH }}
          contentFit="cover"
          transition={200}
          style={styles.thumb}
        />
        {/* Control overlaid at the bottom of the thumb */}
        <View style={styles.controlOverlay}>
          {qty === 0 ? (
            <AddButton onPress={handleAdd} />
          ) : (
            <Stepper qty={qty} onInc={handleInc} onDec={handleDec} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: tokens.space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tokens.colors.hairline,
    gap: tokens.space.md,
  },
  textBlock: {
    flex: 1,
    gap: 4,
    paddingRight: tokens.space.xs,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.ink,
    letterSpacing: -0.1,
  },
  description: {
    fontSize: 13,
    fontWeight: "400",
    color: tokens.colors.muted,
    lineHeight: 18,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.colors.ink,
    marginTop: 2,
  },
  rightBlock: {
    width: THUMB_SIZE,
    position: "relative",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: tokens.radius.md,
    backgroundColor: tokens.colors.bg,
  },
  controlOverlay: {
    position: "absolute",
    bottom: -10,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  // "+" / Add button
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    ...tokens.shadow.card,
  },
  addBtnLabel: {
    fontSize: 20,
    fontWeight: "300",
    color: tokens.colors.accentFg,
    lineHeight: 24,
    marginTop: -1,
  },
  // Stepper
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.accent,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 4,
    ...tokens.shadow.card,
  },
  stepBtn: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnLabel: {
    fontSize: 16,
    fontWeight: "300",
    color: tokens.colors.accentFg,
    lineHeight: 20,
  },
  stepQty: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.colors.accentFg,
    minWidth: 16,
    textAlign: "center",
  },
});
