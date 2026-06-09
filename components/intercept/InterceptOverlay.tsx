import { useEffect, useMemo, useState } from "react";
import { Modal, Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { tokens } from "@/lib/theme";
import { CountUp } from "@/components/ui/CountUp";
import { PillButton } from "@/components/ui/PillButton";

type Phase = "processing" | "done";

interface InterceptOverlayProps {
  amount: number;
  processingMs?: number;
  onClose: () => void;
}

/**
 * Isolated phase logic: starts in "processing", flips to "done" after
 * `processingMs`. The timer is cleared on unmount.
 */
export function useInterceptPhase(processingMs: number): Phase {
  const [phase, setPhase] = useState<Phase>("processing");
  useEffect(() => {
    const t = setTimeout(() => setPhase("done"), processingMs);
    return () => clearTimeout(t);
  }, [processingMs]);
  return phase;
}

export function InterceptOverlay({ amount, processingMs = 2000, onClose }: InterceptOverlayProps) {
  const phase = useInterceptPhase(processingMs);

  // Light haptic when the processing theater begins.
  useEffect(() => {
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {phase === "processing" ? <Processing /> : <Reveal amount={amount} onClose={onClose} />}
      </View>
    </Modal>
  );
}

/* ---------- Processing phase ---------- */

function Processing() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 900, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(rotation);
  }, [rotation]);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.center}>
      <Animated.View style={[styles.spinner, spinnerStyle]} />
      <Text style={styles.processingTitle}>Placing your order…</Text>
      <Text style={styles.processingSub}>Contacting payment processor</Text>
    </View>
  );
}

/* ---------- Done / reveal phase ---------- */

function Reveal({ amount, onClose }: { amount: number; onClose: () => void }) {
  const { width, height } = useWindowDimensions();

  // Glow + emblem spring-in.
  const emblemScale = useSharedValue(0);
  const emblemOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.6);
  const glowOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(14);

  useEffect(() => {
    // Success haptic on reveal.
    if (Platform.OS !== "web") {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    emblemOpacity.value = withTiming(1, { duration: 220 });
    emblemScale.value = withSpring(1, { damping: 9, stiffness: 170, mass: 0.7 });
    glowOpacity.value = withTiming(1, { duration: 420 });
    glowScale.value = withDelay(60, withSpring(1, { damping: 14, stiffness: 90 }));
    textOpacity.value = withDelay(220, withTiming(1, { duration: 380 }));
    textY.value = withDelay(220, withSpring(0, { damping: 16, stiffness: 200 }));
  }, [emblemOpacity, emblemScale, glowOpacity, glowScale, textOpacity, textY]);

  const emblemStyle = useAnimatedStyle(() => ({
    opacity: emblemOpacity.value,
    transform: [{ scale: emblemScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value * 0.55,
    transform: [{ scale: glowScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));

  return (
    <View style={styles.center}>
      <Confetti width={width} height={height} />

      <View style={styles.emblemWrap}>
        <Animated.View style={[styles.glow, glowStyle]} />
        <Animated.Text style={[styles.emblem, emblemStyle]}>🌱</Animated.Text>
      </View>

      <Animated.View style={[styles.revealText, textStyle]}>
        <Text style={styles.kicker}>CRAVING HANDLED</Text>
        <View style={styles.savedRow}>
          <Text style={styles.savedLabel}>You saved </Text>
          <CountUp value={amount} durationMs={1200} style={styles.savedAmount} />
        </View>
        <Text style={styles.reassurance}>
          You got the hunt, the pick, the click — and kept the money. That&apos;s the whole trick.
        </Text>
      </Animated.View>

      <Animated.View style={[styles.cta, textStyle]}>
        <PillButton label="Back to shopping" onPress={onClose} variant="subtle" />
      </Animated.View>
    </View>
  );
}

/* ---------- Hand-rolled, web-safe confetti ---------- */

const CONFETTI_COLORS = [
  tokens.colors.magicGlow,
  tokens.colors.peach,
  tokens.colors.butter,
  tokens.colors.sage,
  tokens.colors.lilac,
];
const CONFETTI_COUNT = 20;

interface Piece {
  key: number;
  color: string;
  size: number;
  rounded: boolean;
  angle: number; // radians, outward direction
  distance: number; // burst radius
  fall: number; // extra downward drift
  rotateTo: number; // degrees
  delay: number;
}

function Confetti({ width, height }: { width: number; height: number }) {
  const pieces = useMemo<Piece[]>(() => {
    return Array.from({ length: CONFETTI_COUNT }, (_, i) => {
      const angle = (Math.PI * 2 * i) / CONFETTI_COUNT + Math.random() * 0.5;
      return {
        key: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 8 + Math.round(Math.random() * 8),
        rounded: Math.random() > 0.5,
        angle,
        distance: Math.min(width, height) * (0.28 + Math.random() * 0.32),
        fall: height * (0.25 + Math.random() * 0.35),
        rotateTo: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360),
        delay: Math.round(Math.random() * 120),
      };
    });
  }, [width, height]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.confettiOrigin}>
        {pieces.map((p) => (
          <ConfettiPiece key={p.key} piece={p} />
        ))}
      </View>
    </View>
  );
}

function ConfettiPiece({ piece }: { piece: Piece }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    // Spring outward, then a timed fall+fade. Both are JS-thread-safe on web.
    progress.value = withDelay(
      piece.delay,
      withTiming(1, { duration: 1300, easing: Easing.out(Easing.quad) }),
    );
  }, [progress, piece.delay]);

  const dx = Math.cos(piece.angle) * piece.distance;
  const dy = Math.sin(piece.angle) * piece.distance;

  const style = useAnimatedStyle(() => {
    const t = progress.value;
    // Burst out fast (eased), then settle with gravity drift.
    const x = dx * t;
    const y = dy * t + piece.fall * t * t;
    const rot = piece.rotateTo * t;
    // Pop in instantly, fade out over the back half.
    const opacity = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
    return {
      opacity,
      transform: [{ translateX: x }, { translateY: y }, { rotate: `${rot}deg` }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: piece.size,
          height: piece.size,
          backgroundColor: piece.color,
          borderRadius: piece.rounded ? piece.size / 2 : 2,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: tokens.colors.magicBg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: tokens.space.xxxl,
  },
  /* processing */
  spinner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.14)",
    borderTopColor: tokens.colors.magicGlow,
    marginBottom: tokens.space.xxl,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F4F1EA",
    letterSpacing: 0.2,
  },
  processingSub: {
    marginTop: tokens.space.sm,
    fontSize: 13,
    color: "rgba(244,241,234,0.5)",
  },
  /* reveal */
  emblemWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.space.xl,
  },
  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: tokens.colors.magicGlow,
    // Soft radial feel via large shadow on native + low opacity blob on web.
    shadowColor: tokens.colors.magicGlow,
    shadowOpacity: 0.9,
    shadowRadius: 80,
    shadowOffset: { width: 0, height: 0 },
  },
  emblem: {
    fontSize: 84,
    textAlign: "center",
  },
  revealText: {
    alignItems: "center",
  },
  kicker: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 3,
    color: "rgba(244,241,234,0.55)",
    marginBottom: tokens.space.md,
  },
  savedRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  savedLabel: {
    fontSize: 26,
    fontWeight: "700",
    color: "#F4F1EA",
  },
  savedAmount: {
    fontSize: 52,
    fontWeight: "900",
    color: tokens.colors.magicGlow,
    letterSpacing: -1,
  },
  reassurance: {
    marginTop: tokens.space.lg,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: "rgba(244,241,234,0.7)",
    maxWidth: 320,
  },
  cta: {
    marginTop: tokens.space.xxxl,
  },
  confettiOrigin: {
    position: "absolute",
    top: "38%",
    left: "50%",
    width: 0,
    height: 0,
  },
});
