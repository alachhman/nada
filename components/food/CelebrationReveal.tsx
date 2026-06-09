import { useEffect, useMemo } from "react";
import { Modal, Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { tokens } from "@/lib/theme";
import { CountUp } from "@/components/ui/CountUp";
import { PillButton } from "@/components/ui/PillButton";

interface CelebrationRevealProps {
  amount: number;
  title?: string;
  body?: string;
  buttonLabel?: string;
  /** Fired once on mount (e.g. for haptics from the caller). */
  onShow?: () => void;
  onClose: () => void;
}

/**
 * Reusable full-screen celebration on the magic backdrop. Spring-in emblem +
 * radial glow + hand-rolled confetti burst + CountUp of the saved amount.
 * Web-safe (no native-only APIs); haptics are guarded.
 */
export function CelebrationReveal({
  amount,
  title = "Cravings handled.",
  body = "You wanted it, you tracked it, you kept the cash.",
  buttonLabel = "Back to nada",
  onShow,
  onClose,
}: CelebrationRevealProps) {
  const { width, height } = useWindowDimensions();

  const emblemScale = useSharedValue(0);
  const emblemOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.6);
  const glowOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(14);

  useEffect(() => {
    // Success haptic on reveal (web-guarded).
    if (Platform.OS !== "web") {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onShow?.();

    emblemOpacity.value = withTiming(1, { duration: 220 });
    emblemScale.value = withSpring(1, { damping: 9, stiffness: 170, mass: 0.7 });
    glowOpacity.value = withTiming(1, { duration: 420 });
    glowScale.value = withDelay(60, withSpring(1, { damping: 14, stiffness: 90 }));
    textOpacity.value = withDelay(220, withTiming(1, { duration: 380 }));
    textY.value = withDelay(220, withSpring(0, { damping: 16, stiffness: 200 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.center}>
          <Confetti width={width} height={height} />

          <View style={styles.emblemWrap}>
            <Animated.View style={[styles.glow, glowStyle]} />
            <Animated.Text style={[styles.emblem, emblemStyle]}>🌱</Animated.Text>
          </View>

          <Animated.View style={[styles.revealText, textStyle]}>
            <Text style={styles.kicker}>CRAVING HANDLED</Text>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.savedRow}>
              <Text style={styles.savedLabel}>You saved </Text>
              <CountUp value={amount} durationMs={1200} style={styles.savedAmount} />
            </View>
            <Text style={styles.reassurance}>{body}</Text>
          </Animated.View>

          <Animated.View style={[styles.cta, textStyle]}>
            <PillButton label={buttonLabel} onPress={onClose} variant="subtle" />
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

/* ---------- Hand-rolled, web-safe confetti (mirrors InterceptOverlay) ---------- */

const CONFETTI_COLORS = [
  tokens.colors.magicGlow,
  tokens.colors.peach,
  tokens.colors.butter,
  tokens.colors.sage,
  tokens.colors.lilac,
];
const CONFETTI_COUNT = 18;

interface Piece {
  key: number;
  color: string;
  size: number;
  rounded: boolean;
  angle: number;
  distance: number;
  fall: number;
  rotateTo: number;
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
    progress.value = withDelay(
      piece.delay,
      withTiming(1, { duration: 1300, easing: Easing.out(Easing.quad) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dx = Math.cos(piece.angle) * piece.distance;
  const dy = Math.sin(piece.angle) * piece.distance;

  const style = useAnimatedStyle(() => {
    const t = progress.value;
    const x = dx * t;
    const y = dy * t + piece.fall * t * t;
    const rot = piece.rotateTo * t;
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
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#F4F1EA",
    marginBottom: tokens.space.md,
    textAlign: "center",
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
