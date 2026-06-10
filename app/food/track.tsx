import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { tokens } from "@/lib/theme";
import type { CartItem } from "@/lib/types";
import { statusForProgress, statusLabel } from "@/lib/courier";
import { useFoodOrder } from "@/components/providers/FoodOrderProvider";
import { useNada } from "@/components/providers/NadaProvider";
import { CourierMap } from "@/components/food/CourierMap";
import { CelebrationReveal } from "@/components/food/CelebrationReveal";
import { Reveal } from "@/components/ui/Reveal";

const TRACK_MS = 7000;

export default function TrackingScreen() {
  const router = useRouter();
  const { items, total, restaurant, clear } = useFoodOrder();
  const { intercept } = useNada();

  // Capture the order on mount so a later clear() doesn't blank the UI.
  const capturedRef = useRef<{ items: CartItem[]; total: number; name: string; etaMins: number } | null>(
    null,
  );
  if (capturedRef.current === null && items.length > 0) {
    capturedRef.current = {
      items,
      total,
      name: restaurant?.name ?? "Your restaurant",
      etaMins: restaurant?.etaMins ?? 25,
    };
  }
  const captured = capturedRef.current;

  const progress = useSharedValue(0);
  const [status, setStatus] = useState<string>(statusLabel(statusForProgress(0)));
  const [eta, setEta] = useState<number>(captured?.etaMins ?? 25);
  const [saved, setSaved] = useState<number | null>(null);
  const finishedRef = useRef(false);

  // Guard against direct loads with no order.
  useEffect(() => {
    if (items.length === 0 && saved === null) {
      router.replace("/food");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drive the ritual.
  useEffect(() => {
    if (!captured) return;
    progress.value = withTiming(
      1,
      { duration: TRACK_MS, easing: Easing.inOut(Easing.quad) },
      (done) => {
        if (done) runOnJS(finish)();
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Status beats. Compute the label on the JS thread (statusForProgress/statusLabel
  // are non-worklet functions — calling them inside the worklet crashes Hermes on
  // native). The worklet only reads progress.value and hops to JS via runOnJS.
  const lastStatusRef = useRef<string>(statusLabel(statusForProgress(0)));
  const applyStatus = (p: number) => {
    const label = statusLabel(statusForProgress(p));
    if (label !== lastStatusRef.current) {
      lastStatusRef.current = label;
      setStatus(label);
    }
  };
  useAnimatedReaction(
    () => progress.value,
    (current) => {
      runOnJS(applyStatus)(current);
    },
  );

  // ETA countdown driven off progress (compresses etaMins -> 0).
  const etaMins = captured?.etaMins ?? 25;
  useAnimatedReaction(
    () => Math.max(1, Math.ceil(etaMins * (1 - progress.value))),
    (mins, prev) => {
      if (mins !== prev) runOnJS(setEta)(mins);
    },
  );

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  function finish() {
    if (finishedRef.current || !capturedRef.current) return;
    finishedRef.current = true;
    // Capture BEFORE clear; saved must equal the order total.
    const amount = intercept(capturedRef.current.items);
    clear();
    setEta(0);
    setStatus(statusLabel(statusForProgress(1)));
    setSaved(amount);
  }

  function handleClose() {
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (typeof router.dismissAll === "function") {
      try {
        router.dismissAll();
      } catch {
        /* no-op if nothing to dismiss */
      }
    }
    router.replace("/(tabs)/you");
  }

  if (!captured) {
    return <SafeAreaView style={styles.container} edges={["top", "bottom"]} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <Reveal delay={40} distance={10} style={styles.header}>
          <Text style={styles.kicker}>TRACKING ORDER</Text>
          <Text style={styles.headerTitle}>{captured.name}</Text>
          <Text style={styles.headerSub}>to your door</Text>
        </Reveal>

        <Reveal delay={120} distance={16} style={styles.mapWrap}>
          <CourierMap progress={progress} />
        </Reveal>

        <Reveal delay={200} distance={20} style={styles.panel}>
          <View style={styles.panelRow}>
            <Text style={styles.statusText}>{status}</Text>
            <Text style={styles.etaText}>{eta <= 1 ? "Any min" : `${eta} min`}</Text>
          </View>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, barStyle]} />
          </View>
        </Reveal>
      </View>

      {saved !== null ? (
        <CelebrationReveal
          amount={saved}
          title="Cravings handled."
          body="You wanted it, you tracked it, you kept the cash. No tip required."
          buttonLabel="Back to nada"
          onClose={handleClose}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: tokens.space.xl,
    paddingTop: tokens.space.lg,
  },
  header: {
    marginBottom: tokens.space.lg,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: tokens.colors.muted,
    marginBottom: tokens.space.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 14,
    fontWeight: "500",
    color: tokens.colors.muted,
    marginTop: 2,
  },
  mapWrap: {
    flex: 1,
    justifyContent: "center",
  },
  panel: {
    marginTop: tokens.space.xl,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.space.xl,
    ...tokens.shadow.card,
  },
  panelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: tokens.space.md,
  },
  statusText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.ink,
    marginRight: tokens.space.md,
  },
  etaText: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.colors.positive,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.colors.hairline,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: tokens.colors.accent,
  },
});
