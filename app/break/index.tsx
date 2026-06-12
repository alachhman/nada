import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { tokens } from "@/lib/theme";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";
import { BreathingCircle } from "@/components/break/BreathingCircle";
import { BreakComplete } from "@/components/break/BreakComplete";
import { useBreaks } from "@/components/providers/BreakProvider";
import { usePresence } from "@/components/providers/PresenceProvider";
import { PRESENCE_ENABLED } from "@/lib/flags";

type Phase = "setup" | "breaking" | "done";

const DURATIONS = [1, 3, 5] as const;
const MIN_COUNTABLE_SECONDS = 30;

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${ss.toString().padStart(2, "0")}`;
}

export default function BreakScreen() {
  const router = useRouter();
  const { recordBreak } = useBreaks();
  const { enabled, events, post } = usePresence();

  const [phase, setPhase] = useState<Phase>("setup");
  const [minutes, setMinutes] = useState<number>(3);
  const [remaining, setRemaining] = useState<number>(0);
  const [recordedSeconds, setRecordedSeconds] = useState<number>(0);

  const startRef = useRef<number>(0);
  const committedRef = useRef<boolean>(false);
  const durationSecRef = useRef<number>(minutes * 60);
  const durationMs = minutes * 60 * 1000;

  // Countdown ticker — drives off wall-clock so backgrounded tabs stay accurate.
  useEffect(() => {
    if (phase !== "breaking") return;

    const tick = () => {
      const left = (startRef.current + durationMs - Date.now()) / 1000;
      if (left <= 0) {
        setRemaining(0);
        finish();
      } else {
        setRemaining(left);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, durationMs]);

  const stepOut = () => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    durationSecRef.current = minutes * 60;
    startRef.current = Date.now();
    committedRef.current = false;
    setRemaining(minutes * 60);
    setPhase("breaking");
  };

  const finish = () => {
    if (committedRef.current) return;
    committedRef.current = true;
    const elapsed = (Date.now() - startRef.current) / 1000;
    const clamped = Math.min(durationSecRef.current, Math.round(elapsed));
    setRecordedSeconds(clamped);
    recordBreak(clamped);
    post("break");
    setPhase("done");
  };

  const endEarly = () => {
    const elapsed = (Date.now() - startRef.current) / 1000;
    if (elapsed >= MIN_COUNTABLE_SECONDS) {
      finish();
    } else {
      // Too short to count — just slip back out, nothing recorded.
      if (router.canGoBack()) router.back();
      else router.replace("/(tabs)/you");
    }
  };

  const recentBreaks =
    PRESENCE_ENABLED && enabled
      ? events
          .filter(
            (e) =>
              e.ritual === "break" &&
              Date.now() - new Date(e.created_at).getTime() < 60 * 60_000,
          )
          .length
      : 0;

  if (phase === "done") {
    return (
      <BreakComplete
        seconds={recordedSeconds}
        onClose={() => router.replace("/(tabs)/you")}
      />
    );
  }

  if (phase === "breaking") {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.breakingBody}>
          <Reveal delay={60}>
            <Text style={styles.countdown}>{formatClock(remaining)}</Text>
          </Reveal>

          <View style={styles.circleWrap}>
            <BreathingCircle running />
          </View>

          {recentBreaks > 0 && (
            <Text style={styles.presenceSmall}>
              {recentBreaks} real break{recentBreaks === 1 ? "" : "s"} taken in the last hour
            </Text>
          )}
        </View>

        <Pressable
          onPress={endEarly}
          style={styles.endEarly}
          accessibilityRole="button"
          accessibilityLabel="End break early"
          hitSlop={8}
        >
          <Text style={styles.endEarlyText}>End break early</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // phase === "setup"
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
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

      <View style={styles.setupBody}>
        <Reveal delay={60} style={styles.header}>
          <Text style={styles.title}>Step outside</Text>
          <Text style={styles.subtitle}>All of the break, none of the cigarette.</Text>
        </Reveal>

        <Reveal delay={140} style={styles.pillRow}>
          {DURATIONS.map((m) => {
            const selected = m === minutes;
            return (
              <Pressable
                key={m}
                onPress={() => setMinutes(m)}
                style={[styles.durationPill, selected ? styles.durationPillOn : styles.durationPillOff]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${m} minute break`}
              >
                <Text style={[styles.durationLabel, selected && styles.durationLabelOn]}>
                  {m} min
                </Text>
              </Pressable>
            );
          })}
        </Reveal>

        {recentBreaks > 0 && (
          <Reveal delay={220}>
            <Text style={styles.presence}>
              {recentBreaks} real break{recentBreaks === 1 ? "" : "s"} taken in the last hour
            </Text>
          </Reveal>
        )}

        <Reveal delay={300} style={styles.cta}>
          <PillButton label="Step out" onPress={stepOut} variant="solid" style={styles.ctaButton} />
        </Reveal>
      </View>
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
  // setup
  setupBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: tokens.space.xxxl,
    gap: tokens.space.xxl,
  },
  header: {
    alignItems: "center",
    gap: tokens.space.sm,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.8,
    lineHeight: 40,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "400",
    color: tokens.colors.muted,
    lineHeight: 21,
    textAlign: "center",
  },
  pillRow: {
    flexDirection: "row",
    gap: tokens.space.md,
  },
  durationPill: {
    paddingHorizontal: tokens.space.xl,
    paddingVertical: tokens.space.md,
    borderRadius: tokens.radius.pill,
    minWidth: 84,
    alignItems: "center",
  },
  durationPillOn: {
    backgroundColor: tokens.colors.accent,
  },
  durationPillOff: {
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.hairline,
  },
  durationLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  durationLabelOn: {
    color: tokens.colors.accentFg,
  },
  presence: {
    fontSize: 14,
    color: tokens.colors.muted,
    textAlign: "center",
  },
  cta: {
    alignSelf: "stretch",
  },
  ctaButton: {
    alignSelf: "stretch",
  },
  // breaking
  breakingBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.space.xxxl,
    paddingHorizontal: tokens.space.xxxl,
  },
  countdown: {
    fontSize: 56,
    fontWeight: "900",
    color: tokens.colors.ink,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
    textAlign: "center",
  },
  circleWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  presenceSmall: {
    fontSize: 13,
    color: tokens.colors.muted,
    textAlign: "center",
  },
  endEarly: {
    alignItems: "center",
    paddingVertical: tokens.space.xl,
  },
  endEarlyText: {
    fontSize: 14,
    fontWeight: "600",
    color: tokens.colors.muted,
    letterSpacing: 0.2,
  },
});
