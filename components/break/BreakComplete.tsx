import { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  cancelAnimation,
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

interface BreakCompleteProps {
  seconds: number;
  onClose: () => void;
}

/**
 * Calm completion for the smoke-break ritual. Mirrors ReclaimSummary's quiet
 * language — soft emblem, low-opacity glow, no confetti. This payoff is peace.
 */
export function BreakComplete({ seconds, onClose }: BreakCompleteProps) {
  const emblemScale = useSharedValue(0.6);
  const emblemOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.7);

  useEffect(() => {
    if (Platform.OS !== "web") {
      void Haptics.selectionAsync();
    }

    emblemOpacity.value = withTiming(1, { duration: 480 });
    emblemScale.value = withSpring(1, { damping: 18, stiffness: 120, mass: 0.8 });
    glowOpacity.value = withDelay(80, withTiming(1, { duration: 600 }));
    glowScale.value = withDelay(80, withSpring(1, { damping: 20, stiffness: 80 }));

    return () => {
      cancelAnimation(emblemScale);
      cancelAnimation(emblemOpacity);
      cancelAnimation(glowOpacity);
      cancelAnimation(glowScale);
    };
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
    <SafeAreaView style={styles.backdrop}>
      <View style={styles.center}>
        {/* Soft emblem with quiet glow ring */}
        <View style={styles.emblemWrap}>
          <Animated.View style={[styles.glow, glowStyle]} />
          <Animated.Text style={[styles.emblem, emblemStyle]}>🌿</Animated.Text>
        </View>

        {/* Kicker */}
        <Reveal delay={180} duration={420}>
          <Text style={styles.kicker}>BREAK TAKEN</Text>
        </Reveal>

        {/* Duration — large, with a small "away" suffix */}
        <Reveal delay={280} duration={460}>
          <View style={styles.durationRow}>
            <Text style={styles.duration}>{formatDuration(seconds)}</Text>
            <Text style={styles.suffix}>away</Text>
          </View>
        </Reveal>

        {/* Calm reassurance line */}
        <Reveal delay={400} duration={480}>
          <Text style={styles.reassurance}>
            You stepped out, you breathed, you came back. No cigarette required.
          </Text>
        </Reveal>

        {/* CTA */}
        <Reveal delay={560} duration={400} style={styles.cta}>
          <PillButton label="Back to nada" onPress={onClose} variant="subtle" />
        </Reveal>
      </View>
    </SafeAreaView>
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
  durationRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: tokens.space.lg,
  },
  duration: {
    fontSize: 56,
    fontWeight: "900",
    color: tokens.colors.magicGlow,
    letterSpacing: -1,
    textAlign: "center",
  },
  suffix: {
    fontSize: 18,
    fontWeight: "600",
    color: tokens.colors.magicGlow,
    marginLeft: tokens.space.sm,
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
