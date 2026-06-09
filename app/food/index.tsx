import { useEffect } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Reveal } from "@/components/ui/Reveal";
import { tokens } from "@/lib/theme";
import { RESTAURANTS } from "@/lib/food";
import { useFoodOrder } from "@/components/providers/FoodOrderProvider";
import { RestaurantCard } from "@/components/food/RestaurantCard";

export default function RestaurantsScreen() {
  const router = useRouter();
  const { clear } = useFoodOrder();

  // Start fresh on every visit
  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Floating back button */}
      <View style={styles.backWrap} pointerEvents="box-none">
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(tabs)");
          }}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={tokens.colors.ink} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <Reveal delay={60} style={styles.header}>
          <Text style={styles.title}>Order in</Text>
          <Text style={styles.subtitle}>Browse. Order. Don't pay. Obviously.</Text>
        </Reveal>

        {/* Restaurant list with staggered entrance */}
        {RESTAURANTS.map((restaurant, i) => (
          <Reveal key={restaurant.id} delay={120 + i * 60}>
            <RestaurantCard restaurant={restaurant} />
          </Reveal>
        ))}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  backWrap: {
    position: "absolute",
    top: Platform.select({ ios: 56, android: 48, default: 56 }),
    left: tokens.space.xl,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...tokens.shadow.card,
  },
  scroll: {
    paddingHorizontal: tokens.space.xl,
    paddingTop: tokens.space.xxl,
  },
  header: {
    marginTop: tokens.space.xxxl,
    marginBottom: tokens.space.xl,
    gap: tokens.space.xs,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "400",
    color: tokens.colors.muted,
    lineHeight: 21,
  },
  bottomPad: {
    height: tokens.space.xxxl,
  },
});
