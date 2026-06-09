import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import Animated, {
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { tokens } from "@/lib/theme";

/**
 * Stylized courier map. NO real tiles — an abstract "city" backdrop with an
 * SVG route from a restaurant pin (top) to a home pin (bottom), and a courier
 * marker that travels along the route as `progress` goes 0 -> 1.
 *
 * The map is laid out in a 100 x 140 viewBox and scaled to fill the card; the
 * marker is positioned in the same coordinate space via an overlay that matches
 * the SVG aspect ratio, so worklet interpolation stays in viewBox units.
 */

const VB_W = 100;
const VB_H = 140;

// Route endpoints (viewBox units).
const START = { x: 24, y: 26 }; // restaurant (top-left-ish)
const END = { x: 74, y: 116 }; // home (bottom-right-ish)
// Two control points for a gentle S-curve cubic bezier.
const C1 = { x: 86, y: 52 };
const C2 = { x: 14, y: 92 };

const SAMPLES = 24;

function cubicAt(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

interface CourierMapProps {
  progress: SharedValue<number>;
}

export function CourierMap({ progress }: CourierMapProps) {
  // Sample the cubic into waypoints used for both the SVG path and the
  // worklet interpolation of the marker.
  const { pathD, inputRange, xs, ys } = useMemo(() => {
    const xsArr: number[] = [];
    const ysArr: number[] = [];
    const inputArr: number[] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const t = i / SAMPLES;
      xsArr.push(cubicAt(t, START.x, C1.x, C2.x, END.x));
      ysArr.push(cubicAt(t, START.y, C1.y, C2.y, END.y));
      inputArr.push(t);
    }
    const d =
      `M ${START.x} ${START.y} ` +
      `C ${C1.x} ${C1.y} ${C2.x} ${C2.y} ${END.x} ${END.y}`;
    return { pathD: d, inputRange: inputArr, xs: xsArr, ys: ysArr };
  }, []);

  // Marker overlay: positioned absolutely in percentage of the card, matching
  // the SVG viewBox. We translate by viewBox units converted to % via scale.
  const markerStyle = useAnimatedStyle(() => {
    "worklet";
    const x = interpolate(progress.value, inputRange, xs);
    const y = interpolate(progress.value, inputRange, ys);
    // Facing direction: sample a slightly-ahead point.
    const ahead = Math.min(1, progress.value + 0.02);
    const ax = interpolate(ahead, inputRange, xs);
    const ay = interpolate(ahead, inputRange, ys);
    const angle = (Math.atan2(ay - y, ax - x) * 180) / Math.PI;
    return {
      left: `${(x / VB_W) * 100}%`,
      top: `${(y / VB_H) * 100}%`,
      transform: [{ translateX: -16 }, { translateY: -16 }, { rotate: `${angle * 0.15}deg` }],
    };
  });

  // "Traveled" portion of the route revealed via a dash offset driven by progress.
  // Approximate path length in viewBox units for the dash array.
  const routeLen = useMemo(() => {
    let len = 0;
    for (let i = 1; i < xs.length; i++) {
      len += Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]);
    }
    return len;
  }, [xs, ys]);

  const traveledProps = useAnimatedProps(() => {
    "worklet";
    return { strokeDashoffset: routeLen * (1 - progress.value) };
  });

  return (
    <View style={styles.card}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={tokens.colors.sage} stopOpacity="0.55" />
            <Stop offset="1" stopColor={tokens.colors.bg} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Base */}
        <Rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#sky)" />

        {/* Abstract city blocks (low-opacity rounded rects) */}
        <Rect x="6" y="14" width="20" height="16" rx="3" fill={tokens.colors.lilac} opacity={0.35} />
        <Rect x="60" y="10" width="26" height="14" rx="3" fill={tokens.colors.butter} opacity={0.3} />
        <Rect x="70" y="40" width="22" height="22" rx="3" fill={tokens.colors.peach} opacity={0.3} />
        <Rect x="8" y="58" width="24" height="18" rx="3" fill={tokens.colors.peach} opacity={0.28} />
        <Rect x="58" y="78" width="30" height="18" rx="3" fill={tokens.colors.lilac} opacity={0.32} />
        <Rect x="10" y="100" width="22" height="20" rx="3" fill={tokens.colors.butter} opacity={0.3} />

        {/* Abstract "streets" */}
        <Rect x="0" y="48" width={VB_W} height="3" fill={tokens.colors.surface} opacity={0.5} />
        <Rect x="0" y="86" width={VB_W} height="3" fill={tokens.colors.surface} opacity={0.5} />
        <Rect x="44" y="0" width="3" height={VB_H} fill={tokens.colors.surface} opacity={0.45} />

        {/* Remaining route (faint, dashed) */}
        <Path
          d={pathD}
          stroke={tokens.colors.muted}
          strokeWidth={2}
          strokeOpacity={0.4}
          strokeDasharray="4 4"
          fill="none"
          strokeLinecap="round"
        />

        {/* Traveled route (solid accent, revealed via dash offset) */}
        <AnimatedPath
          d={pathD}
          stroke={tokens.colors.accent}
          strokeWidth={2.6}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={routeLen}
          animatedProps={traveledProps}
        />

        {/* Restaurant pin (storefront marker) */}
        <Circle cx={START.x} cy={START.y} r={6} fill={tokens.colors.surface} />
        <Circle cx={START.x} cy={START.y} r={6} fill="none" stroke={tokens.colors.accent} strokeWidth={1.6} />
        <Rect x={START.x - 2.4} y={START.y - 2.4} width={4.8} height={4.8} rx={1} fill={tokens.colors.accent} />

        {/* Home pin (accent location pin) */}
        <Circle cx={END.x} cy={END.y - 1} r={6.5} fill={tokens.colors.accent} />
        <Circle cx={END.x} cy={END.y - 1.5} r={2.4} fill={tokens.colors.accentFg} />
        <Path
          d={`M ${END.x - 4.4} ${END.y + 1.5} L ${END.x} ${END.y + 8} L ${END.x + 4.4} ${END.y + 1.5} Z`}
          fill={tokens.colors.accent}
        />
      </Svg>

      {/* Courier marker overlay (RN view so we get a soft shadow + emoji) */}
      <Animated.View style={[styles.marker, markerStyle]} pointerEvents="none">
        <View style={styles.markerPill}>
          <Animated.Text style={styles.markerEmoji}>🛵</Animated.Text>
        </View>
      </Animated.View>
    </View>
  );
}

// Animated SVG components.
const AnimatedPath = Animated.createAnimatedComponent(Path);

const styles = StyleSheet.create({
  card: {
    width: "100%",
    aspectRatio: 100 / 140,
    borderRadius: tokens.radius.lg,
    overflow: "hidden",
    backgroundColor: tokens.colors.sage,
    ...tokens.shadow.card,
  },
  marker: {
    position: "absolute",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  markerPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: tokens.colors.accent,
    ...tokens.shadow.lifted,
  },
  markerEmoji: {
    fontSize: 17,
    lineHeight: 22,
  },
});
