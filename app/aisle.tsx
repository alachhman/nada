/**
 * app/aisle.tsx
 *
 * Full-screen endless aisle: 2-column paged FlatList over generated products.
 * Optional `category` param (one of AISLE_CATS) filters by index % 5 === catIndex.
 * Pagination: 24 items per page, accumulated state + onEndReached.
 * Stable keys: gen-<i>.
 */

import { useCallback, useEffect, useRef, useState } from "react";
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
import { productAt } from "@/lib/catalogGen";
import { AISLE_CATS, aisleIndicesFor } from "@/lib/catalogAisle";
import type { Product } from "@/lib/types";

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

  // pageRef: next page to load (page 0 is loaded by the validCat effect below).
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  // doneRef: set true when aisleIndicesFor returns [] (end of catalog).
  const doneRef = useRef(false);

  // Start empty — the validCat effect is the single source of truth for
  // initial load, so we never render page 0 twice with stale ref values.
  const [products, setProducts] = useState<Product[]>([]);

  // Reset pagination state and load page 0 whenever validCat changes
  // (covers initial mount and any future param changes on a reused instance).
  useEffect(() => {
    pageRef.current = 1;
    loadingRef.current = false;
    doneRef.current = false;
    setProducts(aisleIndicesFor(validCat, 0).map(productAt));
  }, [validCat]);

  const loadMore = useCallback(() => {
    if (loadingRef.current || doneRef.current) return;
    loadingRef.current = true;
    const indices = aisleIndicesFor(validCat, pageRef.current);
    if (indices.length === 0) {
      doneRef.current = true;
      loadingRef.current = false;
      return;
    }
    pageRef.current += 1;
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
