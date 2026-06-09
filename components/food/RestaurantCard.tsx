import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { tokens } from "@/lib/theme";
import { usd } from "@/lib/format";
import type { Restaurant } from "@/lib/food";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const SPRING = { damping: 15, stiffness: 300, mass: 0.6 };
const BLURHASH = "L6Pj0^jE.AyE_3t7t7R**0o#DgR4";

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const onPressIn = () => {
    scale.value = withSpring(0.97, SPRING);
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const onPressOut = () => {
    scale.value = withSpring(1, SPRING);
  };

  const deliveryLabel =
    restaurant.deliveryFee === 0 ? "Free delivery" : `${usd(restaurant.deliveryFee)} delivery`;

  return (
    <Animated.View style={[animatedStyle, styles.wrap]}>
      <Pressable
        onPress={() => router.push(`/food/${restaurant.id}`)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel={`${restaurant.name}, ${restaurant.cuisine}`}
      >
        {/* Banner image — 16:9 */}
        <View style={styles.bannerWrap}>
          <Image
            source={restaurant.image}
            placeholder={{ blurhash: BLURHASH }}
            contentFit="cover"
            transition={250}
            style={styles.bannerImage}
          />
        </View>

        {/* Card body */}
        <View style={styles.body}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
          {/* Meta row */}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              ★ {restaurant.rating.toFixed(1)}
            </Text>
            <Text style={styles.metaDot}> · </Text>
            <Text style={styles.metaText}>{restaurant.etaMins} min</Text>
            <Text style={styles.metaDot}> · </Text>
            <Text style={styles.metaText}>{deliveryLabel}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: tokens.space.md,
  },
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    overflow: "hidden",
    ...tokens.shadow.card,
  },
  bannerWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: tokens.colors.bg,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  body: {
    paddingHorizontal: tokens.space.lg,
    paddingTop: tokens.space.md,
    paddingBottom: tokens.space.lg,
    gap: 3,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: tokens.colors.ink,
    letterSpacing: -0.2,
  },
  cuisine: {
    fontSize: 13,
    fontWeight: "500",
    color: tokens.colors.muted,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: tokens.space.xs,
    flexWrap: "wrap",
  },
  metaText: {
    fontSize: 12.5,
    fontWeight: "500",
    color: tokens.colors.muted,
  },
  metaDot: {
    fontSize: 12.5,
    color: tokens.colors.hairline,
    fontWeight: "500",
  },
});
