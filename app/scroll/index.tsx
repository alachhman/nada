import { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { FeedCard } from "@/components/scroll/FeedCard";
import { NadaInterstitial } from "@/components/scroll/NadaInterstitial";
import { generateFeed, type FeedItem } from "@/lib/feed";
import { tokens } from "@/lib/theme";

export default function ScrollScreen() {
  const router = useRouter();
  const [items, setItems] = useState<FeedItem[]>(() => generateFeed(0, 18));
  const loadingRef = useRef(false);

  const startRef = useRef(Date.now());
  const [sessionSeconds, setSessionSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSessionSeconds(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const loadMore = () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setItems((prev) => {
      const next = [...prev, ...generateFeed(prev.length, 12)];
      return next;
    });
    loadingRef.current = false;
  };

  const onClose = () => {
    if (router.canGoBack()) router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={onClose}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close feed"
          hitSlop={8}
        >
          <Ionicons name="chevron-down" size={22} color={tokens.colors.ink} />
        </Pressable>
        <Text style={styles.topLabel}>you're all caught up forever</Text>
        <View style={styles.closeButton} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) =>
          item.kind === "nada" ? (
            <NadaInterstitial sessionSeconds={sessionSeconds} />
          ) : (
            <FeedCard item={item} />
          )
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.sm,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...tokens.shadow.card,
  },
  topLabel: {
    fontSize: 13,
    color: tokens.colors.muted,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: tokens.space.lg,
    paddingTop: tokens.space.md,
    paddingBottom: tokens.space.xxxl,
  },
  separator: {
    height: tokens.space.lg,
  },
});
