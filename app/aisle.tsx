/**
 * app/aisle.tsx
 *
 * Full-screen endless aisle: 2-column paged FlatList over generated products.
 * Optional `category` param (one of CATS) filters by index % 5 === catIndex.
 * Pagination: 24 items per page, accumulated state + onEndReached.
 * Stable keys: gen-<i>.
 */

import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ProductCard } from "@/components/shop/ProductCard";
import { tokens } from "@/lib/theme";
import { productAt, TOTAL_GENERATED } from "@/lib/catalogGen";
import type { Product } from "@/lib/types";

// ---------------------------------------------------------------------------
// Category helpers
// ---------------------------------------------------------------------------

export const AISLE_CATS = ["Apparel", "Home", "Tech", "Kitchen", "Fitness"] as const;
export type AisleCat = (typeof AISLE_CATS)[number];

const PAGE_SIZE = 24;

/**
 * Return the next PAGE_SIZE global product indices for the given page,
 * optionally filtered to a single category.
 *
 * Without filter: indices are just sequential (0, 1, 2, …).
 * With filter:    walk multiples of 5 starting at catIndex + catOffset * 5.
 *
 * Pure function — can be unit-tested in lib/ if needed.
 */
export function aisleIndicesFor(
  catName: string | undefined,
  page: number,
): number[] {
  const catIndex = catName
    ? AISLE_CATS.indexOf(catName as AisleCat)
    : -1;

  const out: number[] = [];

  if (catIndex < 0) {
    // No filter — plain sequential indices
    const start = page * PAGE_SIZE;
    for (let i = start; i < start + PAGE_SIZE && i < TOTAL_GENERATED; i++) {
      out.push(i);
    }
  } else {
    // Filtered: indices where index % 5 === catIndex
    // Capacity per category = TOTAL_GENERATED / 5 = 1000
    const catStart = page * PAGE_SIZE; // nth product within the category
    for (let k = catStart; k < catStart + PAGE_SIZE && k < TOTAL_GENERATED / 5; k++) {
      out.push(k * 5 + catIndex);
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function AisleScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();

  // Validate category param
  const validCat =
    category && (AISLE_CATS as readonly string[]).includes(category)
      ? category
      : undefined;

  const pageRef = useRef(0);
  const loadingRef = useRef(false);

  const [products, setProducts] = useState<Product[]>(() => {
    return aisleIndicesFor(validCat, 0).map(productAt);
  });

  const loadMore = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    pageRef.current += 1;
    const indices = aisleIndicesFor(validCat, pageRef.current);
    if (indices.length === 0) {
      loadingRef.current = false;
      return;
    }
    setProducts((prev) => {
      loadingRef.current = false;
      return [...prev, ...indices.map(productAt)];
    });
  }, [validCat]);

  const onBack = () => {
    if (Platform.OS !== "web") void Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/");
  };

  const title = validCat ? validCat : "the endless aisle";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={tokens.colors.ink} />
        </Pressable>
        <View style={styles.headerTitles}>
          <Text style={styles.heading}>{title}</Text>
          {!validCat ? (
            <Text style={styles.sub}>5,000 things you don't need</Text>
          ) : null}
        </View>
      </View>

      {/* 2-col FlatList */}
      <FlatList<Product>
        data={products}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        renderItem={({ item }) => (
          <ProductCard product={item} layout="grid" />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: tokens.space.lg,
    paddingTop: tokens.space.sm,
    paddingBottom: tokens.space.md,
    gap: tokens.space.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...tokens.shadow.card,
  },
  headerTitles: {
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.4,
  },
  sub: {
    fontSize: 13,
    fontWeight: "500",
    color: tokens.colors.muted,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: tokens.space.xl,
    paddingBottom: tokens.space.xxxl * 2,
    gap: tokens.space.md,
  },
  row: {
    gap: tokens.space.md,
  },
});
