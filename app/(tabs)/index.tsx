import { useMemo } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Reveal } from "@/components/ui/Reveal";
import { tokens } from "@/lib/theme";
import { usd } from "@/lib/format";
import { CATALOG } from "@/lib/catalog";
import { productAt } from "@/lib/catalogGen";
import { useNada } from "@/components/providers/NadaProvider";
import { SearchBar } from "@/components/shop/SearchBar";
import { CategoryChips, type Category } from "@/components/shop/CategoryChips";
import { DealCarousel } from "@/components/shop/DealCarousel";
import { ProductCard } from "@/components/shop/ProductCard";
import { AISLE_CATS } from "@/lib/catalogAisle";
import type { Product } from "@/lib/types";

// First 24 generated products for the aisle preview — computed once at module level
// so the array is stable across renders (no useMemo needed for a constant).
const AISLE_PREVIEW: Product[] = Array.from({ length: 24 }, (_, i) => productAt(i));

const STAGGER = 70;

export default function ShopScreen() {
  const router = useRouter();
  const { state } = useNada();

  // Section data sliced from the catalog.
  const { trending, underFifty, forYou } = useMemo(() => {
    const byReviews = [...CATALOG].sort((a, b) => b.reviewCount - a.reviewCount);
    const trending = byReviews.slice(0, 8);
    const underFifty = CATALOG.filter((p) => p.price < 50).slice(0, 6);
    const featured = new Set([...trending.slice(0, 4), ...underFifty].map((p) => p.id));
    const forYou = CATALOG.filter((p) => !featured.has(p.id));
    return { trending, underFifty, forYou };
  }, []);

  const goToSearch = (category?: Category) => {
    if (category && category !== "All") {
      router.push({ pathname: "/(tabs)/search", params: { category } });
    } else {
      router.push("/(tabs)/search");
    }
  };

  const onCategory = (category: Category) => {
    if (category !== "All" && (AISLE_CATS as readonly string[]).includes(category)) {
      if (Platform.OS !== "web") void Haptics.selectionAsync();
      router.push({ pathname: "/aisle", params: { category } });
    } else {
      goToSearch(category);
    }
  };

  const savedLabel = state.totalSaved > 0 ? `${usd(state.totalSaved)} saved` : "$0 saved";

  let stagger = 0;
  const nextDelay = () => stagger++ * STAGGER;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.wordmark}>nada</Text>
          <Pressable
            style={styles.savedPill}
            onPress={() => {
              if (Platform.OS !== "web") void Haptics.selectionAsync();
              router.push("/(tabs)/you");
            }}
            accessibilityRole="button"
            accessibilityLabel={`You have saved ${savedLabel}. View your savings.`}
          >
            <Ionicons name="sparkles" size={14} color={tokens.colors.positive} />
            <Text style={styles.savedText}>
              {savedLabel}
            </Text>
          </Pressable>
        </View>

        <Reveal delay={nextDelay()}>
          <View style={styles.block}>
            <SearchBar mode="shortcut" onPress={() => goToSearch()} />
          </View>
        </Reveal>

        <Reveal delay={nextDelay()}>
          <View style={styles.chipsBlock}>
            <CategoryChips selected="All" onSelect={onCategory} />
          </View>
        </Reveal>

        <Reveal delay={nextDelay()}>
          <View style={styles.carouselBlock}>
            <DealCarousel />
          </View>
        </Reveal>

        {/* Trending — horizontal rail */}
        <Reveal delay={nextDelay()}>
          <SectionHeader title="Trending now" onSeeAll={() => goToSearch()} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
          >
            {trending.map((p) => (
              <ProductCard key={p.id} product={p} layout="rail" />
            ))}
          </ScrollView>
        </Reveal>

        {/* Under $50 — grid */}
        <Reveal delay={nextDelay()}>
          <SectionHeader title="Under $50" onSeeAll={() => goToSearch()} />
          <Grid products={underFifty} />
        </Reveal>

        {/* For you — grid */}
        <Reveal delay={nextDelay()}>
          <SectionHeader title="For you" onSeeAll={() => goToSearch()} />
          <Grid products={forYou} />
        </Reveal>

        {/* Endless aisle preview — 24-item 2-col static grid + link */}
        <Reveal delay={nextDelay()}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>the endless aisle</Text>
              <Text style={styles.aisleSubtitle}>5,000 things you don't need</Text>
            </View>
            <Pressable
              onPress={() => router.push("/aisle")}
              hitSlop={8}
              style={styles.seeAll}
              accessibilityRole="button"
              accessibilityLabel="Keep browsing the endless aisle"
            >
              <Text style={styles.seeAllText}>keep browsing</Text>
              <Ionicons name="chevron-forward" size={14} color={tokens.colors.muted} />
            </Pressable>
          </View>
          <Grid products={AISLE_PREVIEW} />
        </Reveal>

        {/* Keep browsing link */}
        <Pressable
          onPress={() => router.push("/aisle")}
          style={styles.keepBrowsing}
          accessibilityRole="button"
          accessibilityLabel="Keep browsing the endless aisle"
        >
          <Text style={styles.keepBrowsingText}>keep browsing →</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>You've reached the end. Buy nothing. Save everything.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable
        onPress={onSeeAll}
        hitSlop={8}
        style={styles.seeAll}
        accessibilityRole="button"
        accessibilityLabel={`See all ${title}`}
      >
        <Text style={styles.seeAllText}>See all</Text>
        <Ionicons name="chevron-forward" size={14} color={tokens.colors.muted} />
      </Pressable>
    </View>
  );
}

function Grid({ products }: { products: Product[] }) {
  // Pair items into rows of two for a balanced 2-col layout.
  const rows: Product[][] = [];
  for (let i = 0; i < products.length; i += 2) rows.push(products.slice(i, i + 2));
  return (
    <View style={styles.grid}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.gridRow}>
          {row.map((p) => (
            <ProductCard key={p.id} product={p} layout="grid" />
          ))}
          {row.length === 1 ? <View style={styles.gridSpacer} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  scroll: {
    paddingBottom: tokens.space.xxxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: tokens.space.xl,
    paddingTop: tokens.space.sm,
    paddingBottom: tokens.space.md,
  },
  wordmark: {
    fontSize: 30,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.8,
  },
  savedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.hairline,
    paddingHorizontal: tokens.space.md,
    paddingVertical: 7,
    borderRadius: tokens.radius.pill,
    ...tokens.shadow.card,
  },
  savedText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  block: {
    paddingHorizontal: tokens.space.xl,
    marginTop: tokens.space.xs,
  },
  chipsBlock: {
    marginTop: tokens.space.lg,
  },
  carouselBlock: {
    marginTop: tokens.space.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: tokens.space.xl,
    marginTop: tokens.space.xxl,
    marginBottom: tokens.space.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.4,
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: tokens.colors.muted,
  },
  rail: {
    paddingHorizontal: tokens.space.xl,
    gap: tokens.space.md,
    paddingVertical: tokens.space.xs,
  },
  grid: {
    paddingHorizontal: tokens.space.xl,
    gap: tokens.space.md,
  },
  gridRow: {
    flexDirection: "row",
    gap: tokens.space.md,
  },
  gridSpacer: {
    flex: 1,
  },
  aisleSubtitle: {
    fontSize: 12.5,
    fontWeight: "500",
    color: tokens.colors.muted,
    marginTop: 2,
  },
  keepBrowsing: {
    alignSelf: "center",
    marginTop: tokens.space.xl,
    marginBottom: tokens.space.sm,
    paddingHorizontal: tokens.space.xl,
    paddingVertical: tokens.space.md,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.hairline,
    ...tokens.shadow.card,
  },
  keepBrowsingText: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.colors.ink,
    letterSpacing: -0.2,
  },
  footer: {
    paddingHorizontal: tokens.space.xl,
    paddingTop: tokens.space.xxxl,
    paddingBottom: tokens.space.lg,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    fontWeight: "500",
    color: tokens.colors.muted,
    textAlign: "center",
  },
});
