import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Text,
  type StyleProp,
  type TextStyle,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { usd } from "@/lib/format";

interface CountUpProps {
  value: number;
  durationMs?: number;
  /** Force snap-to-value (skips the animation). Falls back to system reduce-motion. */
  reduceMotion?: boolean;
  style?: StyleProp<TextStyle>;
}

const AnimatedText = Animated.createAnimatedComponent(Text);

/**
 * Animated USD number. Tweens 0 -> value (cubic ease-out) on mount / value change.
 * Respects reduce-motion (prop or system) by snapping straight to the final value.
 * Always renders the formatted `usd()` string.
 */
export function CountUp({ value, durationMs = 1100, reduceMotion, style }: CountUpProps) {
  const progress = useSharedValue(0);
  // The text actually shown. Driven off the animated value via runOnJS so the
  // formatted string is always a real, testable React state value.
  const [display, setDisplay] = useState<string>(usd(value));
  const [systemReduce, setSystemReduce] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setSystemReduce(enabled);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const snap = reduceMotion ?? systemReduce;

  useEffect(() => {
    if (snap) {
      progress.value = value;
      setDisplay(usd(value));
      return;
    }
    progress.value = 0;
    progress.value = withTiming(value, {
      duration: durationMs,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, durationMs, snap, progress]);

  // IMPORTANT: format on the JS thread, never inside the worklet. usd() is a
  // non-worklet function (Intl.NumberFormat); calling it on the UI thread throws
  // and hard-crashes Hermes on native (react-native-web silently tolerates it).
  const applyValue = (n: number) => setDisplay(usd(n));
  useAnimatedReaction(
    () => progress.value,
    (current) => {
      runOnJS(applyValue)(current);
    },
  );

  return <AnimatedText style={style}>{display}</AnimatedText>;
}
