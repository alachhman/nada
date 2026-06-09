import { useEffect, type ReactNode } from "react";
import { AccessibilityInfo, type ViewStyle, type StyleProp } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";

export function Reveal({
  children,
  delay = 0,
  distance = 14,
  duration = 360,
  style,
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const p = useSharedValue(0);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) return;
      if (reduced) {
        p.value = 1;
      } else {
        p.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
      }
    });
    // Fallback: if the reduce-motion promise is slow, ensure we still animate in.
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aStyle = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * distance }],
  }));

  return <Animated.View style={[style, aStyle]}>{children}</Animated.View>;
}
