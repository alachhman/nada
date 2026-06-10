import { useEffect, useMemo, useState } from "react";
import { Pressable, Share, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { cancelAnimation, Easing, useSharedValue, withTiming } from "react-native-reanimated";
import { tokens } from "@/lib/theme";
import { usd } from "@/lib/format";
import { NOTHING_STAGES, nothingStageFor } from "@/lib/nothing";
import { useNada } from "@/components/providers/NadaProvider";
import { CourierMap } from "@/components/food/CourierMap";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";

export default function NothingTrackerScreen() {
  const { ts } = useLocalSearchParams<{ ts: string }>();
  const { state } = useNada();

  const tsNum = Number(ts);
  const save = useMemo(
    () => (Number.isFinite(tsNum) ? state.saves.find((s) => s.timestamp === tsNum) : undefined),
    [state.saves, tsNum],
  );

  // Drive the courier with a shared value, set on the JS thread. We animate
  // from 0 up to the true stage progress for a little arrival delight.
  const progress = useSharedValue(0);
  const status = useMemo(
    () => (save ? nothingStageFor(Date.now() - save.timestamp) : null),
    [save],
  );

  useEffect(() => {
    if (status == null) return;
    progress.value = withTiming(status.progress, {
      duration: 1100,
      easing: Easing.out(Easing.cubic),
    });
    return () => cancelAnimation(progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [shareNote, setShareNote] = useState<string | null>(null);

  if (!save || !status) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Header />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>That nothing is long gone.</Text>
          <PillButton
            label="Back"
            variant="subtle"
            onPress={() => router.back()}
            style={styles.emptyCta}
          />
        </View>
      </SafeAreaView>
    );
  }

  const itemsKeptOut = save.itemCount ?? save.items.length;
  const title = save.items.join(", ");

  const handleShare = async () => {
    const message = `I almost spent ${usd(save.amount)}. The order was intercepted. Nothing is on its way. 🌱 — nada`;
    try {
      await Share.share({ message });
    } catch {
      // Web / unsupported: fail gracefully with a brief inline note.
      setShareNote("Sharing isn't available here — but your nothing is safe.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Reveal delay={40} distance={10} style={styles.headerBlock}>
          <Text style={styles.kicker}>TRACKING YOUR NOTHING</Text>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.amountRow}>
            <Text style={styles.amount}>{usd(save.amount)}</Text>
            <Text style={styles.amountSub}> staying home</Text>
          </View>
        </Reveal>

        <Reveal delay={120} distance={16} style={styles.mapWrap}>
          <CourierMap progress={progress} />
        </Reveal>

        <Reveal delay={200} distance={18} style={styles.timeline}>
          {NOTHING_STAGES.map((stage, i) => {
            const isPast = i < status.index;
            const isCurrent = i === status.index;
            return (
              <View key={stage.label} style={styles.stageRow}>
                <View style={styles.stageMarkerCol}>
                  {isPast ? (
                    <Ionicons name="checkmark-circle" size={20} color={tokens.colors.positive} />
                  ) : isCurrent ? (
                    <View style={styles.currentDot} />
                  ) : (
                    <View style={styles.futureDot} />
                  )}
                  {i < NOTHING_STAGES.length - 1 ? (
                    <View
                      style={[styles.connector, (isPast || isCurrent) && styles.connectorActive]}
                    />
                  ) : null}
                </View>
                <View style={styles.stageTextCol}>
                  <Text
                    style={[
                      styles.stageLabel,
                      isCurrent && styles.stageLabelCurrent,
                      !isPast && !isCurrent && styles.stageLabelFuture,
                    ]}
                  >
                    {stage.label}
                  </Text>
                  {isCurrent ? (
                    <Text style={styles.stageSublabel}>{stage.sublabel}</Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </Reveal>

        <Reveal delay={280} distance={16} style={styles.keptOutWrap}>
          <Text style={styles.keptOut}>
            {itemsKeptOut} thing{itemsKeptOut === 1 ? "" : "s"} kept out of your house · 0 boxes
            headed to your door
          </Text>
        </Reveal>

        <Reveal delay={340} distance={16} style={styles.shareWrap}>
          <PillButton label="Share your nothing" icon="share-outline" onPress={handleShare} />
          {shareNote ? <Text style={styles.shareNote}>{shareNote}</Text> : null}
        </Reveal>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header() {
  return (
    <Reveal style={styles.navRow}>
      <Pressable
        onPress={() => {
          if (router.canGoBack()) router.back();
          else router.replace("/(tabs)/you");
        }}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
      >
        <Ionicons name="chevron-back" size={22} color={tokens.colors.ink} />
      </Pressable>
      <View style={styles.backButton} />
    </Reveal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: tokens.space.xl,
    paddingVertical: tokens.space.sm,
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  /* empty */
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: tokens.space.xxxl,
    gap: tokens.space.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: tokens.colors.ink,
    textAlign: "center",
  },
  emptyCta: {
    minWidth: 140,
  },

  scroll: {
    paddingHorizontal: tokens.space.xl,
    paddingTop: tokens.space.sm,
    paddingBottom: tokens.space.xxxl + tokens.space.xl,
  },

  /* header block */
  headerBlock: {
    marginBottom: tokens.space.xl,
  },
  kicker: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: tokens.colors.muted,
    marginBottom: tokens.space.xs,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.4,
    marginBottom: tokens.space.sm,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  amount: {
    fontSize: 40,
    fontWeight: "900",
    color: tokens.colors.positive,
    letterSpacing: -1,
  },
  amountSub: {
    fontSize: 16,
    fontWeight: "600",
    color: tokens.colors.muted,
  },

  /* map */
  mapWrap: {
    marginBottom: tokens.space.xxl,
  },

  /* timeline */
  timeline: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tokens.colors.hairline,
    paddingVertical: tokens.space.xl,
    paddingHorizontal: tokens.space.xl,
    ...tokens.shadow.card,
  },
  stageRow: {
    flexDirection: "row",
  },
  stageMarkerCol: {
    width: 24,
    alignItems: "center",
  },
  currentDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: tokens.colors.accent,
    borderWidth: 3,
    borderColor: tokens.colors.sage,
  },
  futureDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 2,
    backgroundColor: "transparent",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tokens.colors.hairline,
  },
  connector: {
    flex: 1,
    width: 2,
    marginTop: 2,
    marginBottom: 2,
    backgroundColor: tokens.colors.hairline,
  },
  connectorActive: {
    backgroundColor: tokens.colors.positive,
  },
  stageTextCol: {
    flex: 1,
    paddingLeft: tokens.space.md,
    paddingBottom: tokens.space.lg,
  },
  stageLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.muted,
  },
  stageLabelCurrent: {
    color: tokens.colors.ink,
    fontWeight: "800",
  },
  stageLabelFuture: {
    color: tokens.colors.hairline,
  },
  stageSublabel: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
    color: tokens.colors.muted,
  },

  /* kept out line */
  keptOutWrap: {
    marginTop: tokens.space.xl,
  },
  keptOut: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: tokens.colors.muted,
    textAlign: "center",
  },

  /* share */
  shareWrap: {
    marginTop: tokens.space.xxl,
    alignItems: "center",
    gap: tokens.space.md,
  },
  shareNote: {
    fontSize: 12.5,
    fontWeight: "500",
    color: tokens.colors.muted,
    textAlign: "center",
  },
});
