import { useEffect, useState } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { tokens } from "@/lib/theme";

const PHASE_MS = 4000;

/**
 * Centered guided-breathing composition. A soft sage glow behind a circle
 * that scales 1.0 -> 1.45 over 4s and back, looping while `running`. A muted
 * phase label below crossfades between "breathe in" / "breathe out" in sync
 * with the loop. Reduce-motion: static circle, label still flips.
 */
export function BreathingCircle({ running }: { running: boolean }) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.45);
  const labelOpacity = useSharedValue(1);

  const [reduceMotion, setReduceMotion] = useState(false);
  const [phaseIn, setPhaseIn] = useState(true);

  // Detect reduce-motion once on mount.
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (!cancelled) setReduceMotion(reduced);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Scale + glow loop (skipped entirely under reduce-motion).
  useEffect(() => {
    if (!running || reduceMotion) {
      cancelAnimation(scale);
      cancelAnimation(glow);
      scale.value = withTiming(1, { duration: 400 });
      glow.value = withTiming(0.45, { duration: 400 });
      return;
    }

    scale.value = withRepeat(
      withSequence(
        withTiming(1.45, { duration: PHASE_MS, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: PHASE_MS, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: PHASE_MS, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.45, { duration: PHASE_MS, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );

    return () => {
      cancelAnimation(scale);
      cancelAnimation(glow);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, reduceMotion]);

  // Phase label flips every 4s while running, synced to loop start. Drives a
  // JS interval (web-safe) — reduce-motion still flips the label so the cue
  // remains useful without the scale animation.
  useEffect(() => {
    if (!running) {
      setPhaseIn(true);
      return;
    }
    setPhaseIn(true);
    const id = setInterval(() => {
      setPhaseIn((prev) => !prev);
    }, PHASE_MS);
    return () => clearInterval(id);
  }, [running]);

  // Gentle crossfade on each label flip.
  useEffect(() => {
    labelOpacity.value = withSequence(
      withTiming(0, { duration: 280, easing: Easing.in(Easing.quad) }),
      withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseIn]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.5,
  }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.stage}>
        <Animated.View style={[styles.glow, glowStyle]} />
        <Animated.View style={[styles.circle, circleStyle]} />
      </View>
      <Animated.Text style={[styles.label, labelStyle]}>
        {phaseIn ? "breathe in" : "breathe out"}
      </Animated.Text>
    </View>
  );
}

const STAGE = 280;
const CIRCLE = 200;

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  stage: {
    width: STAGE,
    height: STAGE,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: STAGE,
    height: STAGE,
    borderRadius: STAGE / 2,
    backgroundColor: tokens.colors.sage,
    shadowColor: tokens.colors.positive,
    shadowOpacity: 0.6,
    shadowRadius: 50,
    shadowOffset: { width: 0, height: 0 },
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: tokens.colors.sage,
    borderWidth: 1,
    borderColor: "rgba(90,125,90,0.35)",
  },
  label: {
    marginTop: tokens.space.xl,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 1.5,
    color: tokens.colors.muted,
  },
});
