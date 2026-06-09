import { useEffect } from "react";
import { Modal, Platform, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { tokens } from "@/lib/theme";
import { formatDuration } from "@/lib/duration";
import { Reveal } from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/PillButton";

interface ReclaimSummaryProps {
  seconds: number;
  onClose: () => void;
}

/**
 * Calm full-screen exit summary. No confetti — this payoff is peace,
 * not a dopamine blast. Gentle scale/fade emblem, soft glow ring, and
 * the reclaimed duration in large positive green.
 */
export function ReclaimSummary({ seconds, onClose }: ReclaimSummaryProps) {
  const emblemScale = useSharedValue(0.6);
  const emblemOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.7);

  useEffect(() => {
    // Gentle selection haptic on mount — web-guarded, kept light.
    if (Platform.OS !== "web") {
      void Haptics.selectionAsync();
    }

    emblemOpacity.value = withTiming(1, { duration: 480 });
    emblemScale.value = withSpring(1, { damping: 18, stiffness: 120, mass: 0.8 });
    glowOpacity.value = withDelay(80, withTiming(1, { duration: 600 }));
    glowScale.value = withDelay(80, withSpring(1, { damping: 20, stiffness: 80 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emblemStyle = useAnimatedStyle(() => ({
    opacity: emblemOpacity.value,
    transform: [{ scale: emblemScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value * 0.22,
    transform: [{ scale: glowScale.value }],
  }));

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.center}>
          {/* Soft emblem with quiet glow ring */}
          <View style={styles.emblemWrap}>
            <Animated.View style={[styles.glow, glowStyle]} />
            <Animated.Text style={[styles.emblem, emblemStyle]}>🌿</Animated.Text>
          </View>

          {/* Kicker */}
          <Reveal delay={180} duration={420}>
            <Text style={styles.kicker}>TIME RECLAIMED</Text>
          </Reveal>

          {/* Duration — large, positive */}
          <Reveal delay={280} duration={460}>
            <Text style={styles.duration}>{formatDuration(seconds)}</Text>
          </Reveal>

          {/* Calm reassurance line */}
          <Reveal delay={400} duration={480}>
            <Text style={styles.reassurance}>
              You scrolled here instead of the spiral — and you feel fine.
            </Text>
          </Reveal>

          {/* CTA */}
          <Reveal delay={560} duration={400} style={styles.cta}>
            <PillButton label="Back to nada" onPress={onClose} variant="subtle" />
          </Reveal>
        </View>
      </View>
    </Modal>
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
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: tokens.colors.magicGlow,
    shadowColor: tokens.colors.magicGlow,
    shadowOpacity: 0.7,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
  },
  emblem: {
    fontSize: 72,
    textAlign: "center",
  },
  kicker: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3.5,
    color: "rgba(244,241,234,0.45)",
    marginBottom: tokens.space.sm,
    textAlign: "center",
  },
  duration: {
    fontSize: 56,
    fontWeight: "900",
    color: tokens.colors.magicGlow,
    letterSpacing: -1,
    textAlign: "center",
    marginBottom: tokens.space.lg,
  },
  reassurance: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    color: "rgba(244,241,234,0.65)",
    maxWidth: 300,
  },
  cta: {
    marginTop: tokens.space.xxxl,
  },
});
