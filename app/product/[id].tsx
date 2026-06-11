import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { tokens } from "@/lib/theme";
import { usd } from "@/lib/format";
import { formatWeight, hoursOfWork, WORK_WAGE } from "@/lib/dodge";
import { getProduct } from "@/lib/catalog";
import { RatingStars } from "@/components/shop/RatingStars";
import { ReviewBlock } from "@/components/product/ReviewBlock";
import { BuyBar } from "@/components/product/BuyBar";
import { PillButton } from "@/components/ui/PillButton";

const BLURHASH = "L6Pj0^jE.AyE_3t7t7R**0o#DgR4";
const BUYBAR_HEIGHT = 90;

function productDescription(name: string, category: string): string {
  return `${name} — a little ${category.toLowerCase()} something you don't need.`;
}

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const product = getProduct(id ?? "");
  const hrs = product ? hoursOfWork(product.price) : 0;

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="sad-outline" size={52} color={tokens.colors.muted} />
          <Text style={styles.emptyTitle}>We couldn't find that.</Text>
          <Text style={styles.emptySubtitle}>The product may have moved or no longer exists.</Text>
          <PillButton
            label="Back to shop"
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace("/(tabs)");
            }}
            variant="solid"
            style={styles.emptyButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Back button floats over the hero image */}
      <View style={styles.backButtonWrap} pointerEvents="box-none">
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
        contentContainerStyle={[styles.scroll, { paddingBottom: BUYBAR_HEIGHT + tokens.space.xl }]}
      >
        {/* Hero image */}
        <MotiView
          from={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 22, stiffness: 200, delay: 60 }}
          style={styles.heroWrap}
        >
          <Image
            source={product.image}
            placeholder={{ blurhash: BLURHASH }}
            contentFit="cover"
            transition={300}
            style={styles.heroImage}
          />
        </MotiView>

        {/* Product info */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 380, delay: 140 }}
          style={styles.infoBlock}
        >
          {/* Category pill */}
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating row */}
          <View style={styles.ratingRow}>
            <RatingStars
              rating={product.rating}
              reviewCount={product.reviewCount}
              variant="stars"
            />
          </View>

          {/* Price */}
          <Text style={styles.price}>{usd(product.price)}</Text>

          {/* Dodge metrics */}
          <View style={styles.dodgeBlock}>
            <Text style={styles.dodgeLine}>⚖ {formatWeight(product.weightLb)} of future clutter</Text>
            <Text style={styles.dodgeLine}>≈ {hrs} {hrs === 1 ? "hr" : "hrs"} of work at ${WORK_WAGE}/hr</Text>
            <Text style={styles.dodgeLine}>{product.dodgeLine}</Text>
          </View>

          {/* About */}
          <View style={styles.aboutBlock}>
            <Text style={styles.aboutHeading}>About</Text>
            <Text style={styles.aboutText}>
              {productDescription(product.name, product.category)}
            </Text>
          </View>

          {/* Reviews */}
          <View style={styles.reviewsBlock}>
            <ReviewBlock reviews={product.reviews} />
          </View>
        </MotiView>
      </ScrollView>

      {/* Sticky BuyBar — outside ScrollView so it stays fixed */}
      <BuyBar product={product} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  // Back button positioned absolutely over the image
  backButtonWrap: {
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
    // no horizontal padding here; info block handles its own
  },
  heroWrap: {
    marginHorizontal: tokens.space.xl,
    marginTop: tokens.space.sm,
    borderRadius: tokens.radius.xl,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    aspectRatio: 4 / 5,
  },
  infoBlock: {
    paddingHorizontal: tokens.space.xl,
    paddingTop: tokens.space.xl,
    gap: tokens.space.sm,
  },
  categoryPill: {
    alignSelf: "flex-start",
    backgroundColor: tokens.colors.butter,
    paddingHorizontal: tokens.space.md,
    paddingVertical: 5,
    borderRadius: tokens.radius.pill,
    marginBottom: tokens.space.xs,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.ink,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  productName: {
    fontSize: 26,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: tokens.space.xs,
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.5,
    marginTop: tokens.space.xs,
  },
  dodgeBlock: {
    marginTop: tokens.space.sm,
    gap: tokens.space.xs,
    paddingVertical: tokens.space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tokens.colors.hairline,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tokens.colors.hairline,
  },
  dodgeLine: {
    fontSize: 13,
    fontWeight: "400",
    color: tokens.colors.muted,
    lineHeight: 19,
  },
  aboutBlock: {
    marginTop: tokens.space.md,
    gap: tokens.space.xs,
  },
  aboutHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.2,
  },
  aboutText: {
    fontSize: 15,
    fontWeight: "400",
    color: tokens.colors.muted,
    lineHeight: 22,
  },
  reviewsBlock: {
    marginTop: tokens.space.xl,
    paddingBottom: tokens.space.lg,
  },
  // Empty state
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: tokens.space.xl,
    gap: tokens.space.md,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: "400",
    color: tokens.colors.muted,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: tokens.space.md,
  },
});
