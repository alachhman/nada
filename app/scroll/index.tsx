import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { FeedCard } from "@/components/scroll/FeedCard";
import { ImmersiveCard } from "@/components/scroll/ImmersiveCard";
import { NadaInterstitial } from "@/components/scroll/NadaInterstitial";
import { ReclaimSummary } from "@/components/scroll/ReclaimSummary";
import { Reveal } from "@/components/ui/Reveal";
import { generateFeed, injectPhotos, type FeedItem } from "@/lib/feed";
import { getRecentPhotos, type CameraPhoto } from "@/lib/cameraRoll";
import { tokens } from "@/lib/theme";
import { useScroll } from "@/components/providers/ScrollProvider";
import { useFeedPrefs } from "@/components/providers/FeedPrefsProvider";

const SEPARATOR_STYLE = { height: tokens.space.lg };
function Separator() {
  return <View style={SEPARATOR_STYLE} />;
}

export default function ScrollScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { addReclaimed } = useScroll();
  const { prefs } = useFeedPrefs();
  const immersive = prefs.layout === "immersive";

  // Stable signature of the content-affecting prefs (postTypes + photoThemes).
  // Keying the re-seed effect on this string avoids re-running on layout/cameraRoll changes.
  const contentSig = useMemo(
    () => JSON.stringify({ postTypes: prefs.postTypes, photoThemes: prefs.photoThemes }),
    [prefs.postTypes, prefs.photoThemes],
  );

  // Camera-roll photos (native-only; always [] on web / denied)
  const [photos, setPhotos] = useState<CameraPhoto[]>([]);

  const [items, setItems] = useState<FeedItem[]>(() => generateFeed(0, 18, prefs)); // photos injected after mount via effect
  const listRef = useRef<FlatList<FeedItem>>(null);
  const loadingRef = useRef(false);
  // Tracks next content-stream index (excludes injected cam-<n> photo items).
  const nextContentIndexRef = useRef(18);

  // Swipe-up hint: visible on the first immersive card, hidden once scrolled.
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  const startRef = useRef(Date.now());
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Null = summary not shown; number = elapsed seconds to show in summary.
  const [summary, setSummary] = useState<number | null>(null);
  const committedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      setSessionSeconds(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Best-effort commit on unmount if the user leaves without the close button.
  useEffect(() => {
    return () => {
      if (!committedRef.current) {
        const elapsed = Math.round((Date.now() - startRef.current) / 1000);
        if (elapsed >= 2) addReclaimed(elapsed);
        committedRef.current = true;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commitAndSummarize = () => {
    const elapsed = Math.round((Date.now() - startRef.current) / 1000);
    if (committedRef.current) return;
    committedRef.current = true;
    if (elapsed >= 2) {
      addReclaimed(elapsed);
      setSummary(elapsed);
    } else {
      // Nothing meaningful to log — just navigate back.
      if (router.canGoBack()) router.back();
    }
  };

  // Fetch camera-roll photos once when cameraRoll pref is enabled.
  // Web-safe: getRecentPhotos returns [] on web (no-op). Clear when disabled.
  useEffect(() => {
    if (!prefs.cameraRoll) {
      setPhotos([]);
      return;
    }
    getRecentPhotos(8).then(setPhotos).catch(() => setPhotos([]));
  }, [prefs.cameraRoll]);

  // Re-seed the feed when content-affecting prefs change so edits apply immediately.
  // Also re-runs when photos changes so enabling camera roll injects photos immediately.
  // Keyed on contentSig (not the prefs object) to avoid an infinite loop.
  useEffect(() => {
    setItems(injectPhotos(generateFeed(0, 18, prefs), photos));
    nextContentIndexRef.current = 18;
    // Best-effort scroll to top
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentSig, photos]);

  const loadMore = () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    const start = nextContentIndexRef.current;
    nextContentIndexRef.current = start + 12;
    const base = generateFeed(start, 12, prefs);
    setItems((prev) => {
      const existingCam = prev.filter((i) => i.kind === "photo").length;
      const next = [...prev, ...injectPhotos(base, photos, 10, existingCam)];
      loadingRef.current = false;
      return next;
    });
  };

  const openCustomize = () => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/scroll/customize");
  };

  // Overlaid top bar for the immersive layout: soft surface circles so the
  // buttons stay visible over imagery (no full-width scrim needed).
  const immersiveTopBar = (
    <View style={[styles.immersiveTopBar, { top: insets.top + tokens.space.sm }]} pointerEvents="box-none">
      <Pressable
        onPress={commitAndSummarize}
        style={styles.closeButton}
        accessibilityRole="button"
        accessibilityLabel="Close feed"
        hitSlop={8}
      >
        <Ionicons name="chevron-down" size={22} color={tokens.colors.ink} />
      </Pressable>
      <Pressable
        onPress={openCustomize}
        style={styles.closeButton}
        accessibilityRole="button"
        accessibilityLabel="Customize feed"
        hitSlop={8}
      >
        <Ionicons name="options-outline" size={20} color={tokens.colors.ink} />
      </Pressable>
    </View>
  );

  const summaryOverlay =
    summary !== null ? (
      <ReclaimSummary seconds={summary} onClose={() => router.replace("/(tabs)/you")} />
    ) : null;

  if (immersive) {
    return (
      <View style={styles.container}>
        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(it) => it.id}
          renderItem={({ item, index }) => (
            <View style={{ width, height }}>
              <ImmersiveCard
                item={item}
                width={width}
                height={height}
                sessionSeconds={sessionSeconds}
                index={index}
              />
            </View>
          )}
          pagingEnabled
          snapToInterval={height}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            if (showSwipeHint && e.nativeEvent.contentOffset.y > 12) {
              setShowSwipeHint(false);
            }
          }}
          scrollEventThrottle={16}
          onEndReached={loadMore}
          onEndReachedThreshold={0.6}
        />

        {immersiveTopBar}

        {/* Subtle swipe-up hint on the first card only, fades after the first scroll. */}
        {showSwipeHint ? (
          <Reveal delay={600} distance={0} duration={700} style={styles.swipeHintWrap}>
            <View style={styles.swipeHint} pointerEvents="none">
              <Ionicons name="chevron-up" size={16} color={tokens.colors.accentFg} />
              <Text style={styles.swipeHintText}>swipe up</Text>
            </View>
          </Reveal>
        ) : null}

        {summaryOverlay}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={commitAndSummarize}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close feed"
          hitSlop={8}
        >
          <Ionicons name="chevron-down" size={22} color={tokens.colors.ink} />
        </Pressable>
        <Text style={styles.topLabel}>you're all caught up forever</Text>
        <Pressable
          onPress={openCustomize}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Customize feed"
          hitSlop={8}
        >
          <Ionicons name="options-outline" size={20} color={tokens.colors.ink} />
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
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
        ItemSeparatorComponent={Separator}
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
      />

      {summaryOverlay}
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
  immersiveTopBar: {
    position: "absolute",
    left: tokens.space.lg,
    right: tokens.space.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  swipeHintWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: tokens.space.xxxl,
    alignItems: "center",
    zIndex: 5,
  },
  swipeHint: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.sm,
    borderRadius: tokens.radius.pill,
    backgroundColor: "rgba(13,15,18,0.5)",
    columnGap: tokens.space.xs,
  },
  swipeHintText: {
    fontSize: 13,
    color: tokens.colors.accentFg,
    fontWeight: "600",
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
});
