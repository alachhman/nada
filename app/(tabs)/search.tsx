import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { tokens } from "@/lib/theme";
import { CATALOG } from "@/lib/catalog";
import { SearchBar } from "@/components/shop/SearchBar";
import { CategoryChips, CATEGORIES, type Category } from "@/components/shop/CategoryChips";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Product } from "@/lib/types";

function Grid({ products }: { products: Product[] }) {
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

export default function SearchScreen() {
  const params = useLocalSearchParams<{ category?: string }>();

  // Resolve incoming category param or default to "All"
  const initialCategory: Category = useMemo(() => {
    const incoming = params.category;
    if (incoming && (CATEGORIES as readonly string[]).includes(incoming)) {
      return incoming as Category;
    }
    return "All";
  }, [params.category]);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>(initialCategory);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG.filter((p) => {
      const matchesCategory = category === "All" || p.category === category;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  const showEmpty = results.length === 0;
  const showAll = !query && category === "All";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.wordmark}>Search</Text>
      </View>

      {/* Search bar — input mode */}
      <View style={styles.searchBlock}>
        <SearchBar
          mode="input"
          value={query}
          onChangeText={setQuery}
          placeholder="Search nada"
        />
      </View>

      {/* Category chips */}
      <View style={styles.chipsBlock}>
        <CategoryChips selected={category} onSelect={setCategory} />
      </View>

      {/* Results area — scrollable, SearchBar + chips remain fixed above */}
      <ScrollView
        style={styles.resultsArea}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.resultsContent}
      >
        <MotiView
          key={`${query}-${category}`}
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 280 }}
        >
          {showEmpty ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={44} color={tokens.colors.muted} />
              <Text style={styles.emptyTitle}>
                {query
                  ? `No results for "${query}"`
                  : `Nothing in ${category}`}
              </Text>
              <Text style={styles.emptySubtitle}>
                {query
                  ? "Try a different search or browse by category."
                  : "Pick another category to keep browsing."}
              </Text>
            </View>
          ) : (
            <Grid products={results} />
          )}
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  header: {
    paddingHorizontal: tokens.space.xl,
    paddingTop: tokens.space.sm,
    paddingBottom: tokens.space.md,
  },
  wordmark: {
    fontSize: 28,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.6,
  },
  searchBlock: {
    paddingHorizontal: tokens.space.xl,
    marginBottom: tokens.space.lg,
  },
  chipsBlock: {
    marginBottom: tokens.space.lg,
  },
  resultsArea: {
    flex: 1,
  },
  resultsContent: {
    paddingBottom: tokens.space.xxxl * 2, // 64 — clears the bottom tab bar
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
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: tokens.space.xl,
    gap: tokens.space.md,
    paddingTop: tokens.space.xxxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: tokens.colors.ink,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    fontSize: 14.5,
    fontWeight: "400",
    color: tokens.colors.muted,
    textAlign: "center",
    lineHeight: 21,
  },
});
