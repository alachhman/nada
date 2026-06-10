import { useEffect, useState } from "react";
import { AccessibilityInfo, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { formatDuration } from "@/lib/duration";
import type { FeedItem } from "@/lib/feed";
import { tokens } from "@/lib/theme";

const BLURHASH = "L6Pj0^jE.AyE_3t7t7R**0o#DgR4";

// Light text colors for use over imagery / scrims.
const LIGHT = "#F7F4EE";
const LIGHT_MUTED = "rgba(247,244,238,0.78)";

type Props = {
  item: FeedItem;
  height: number;
  width: number;
  sessionSeconds: number;
  index: number;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + second).toUpperCase();
}

/**
 * Slow Ken-Burns drift: scale 1 -> 1.08 over ~12s, reversing forever.
 * Respects reduce-motion (static scale 1). Only reads the shared value in
 * the worklet — no JS-thread fns inside useAnimatedStyle.
 */
function useKenBurns() {
  const scale = useSharedValue(1);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled || reduced) return;
      scale.value = withRepeat(
        withTiming(1.08, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return style;
}

/** Bottom-anchored gradient scrim via stacked Views (no extra dep). */
function BottomScrim() {
  return (
    <View style={[StyleSheet.absoluteFill, { flexDirection: "column" }]} pointerEvents="none">
      <View style={[styles.scrimBand, { height: "60%", backgroundColor: "rgba(13,15,18,0.0)" }]} />
      <View style={[styles.scrimBand, { height: "20%", backgroundColor: "rgba(13,15,18,0.22)" }]} />
      <View style={[styles.scrimBand, { height: "12%", backgroundColor: "rgba(13,15,18,0.46)" }]} />
      <View style={[styles.scrimBand, { height: "8%", backgroundColor: "rgba(13,15,18,0.66)" }]} />
    </View>
  );
}

/** Full-bleed image background with Ken-Burns drift + bottom scrim. */
function ImageBackdrop({ uri }: { uri: string }) {
  const kb = useKenBurns();
  return (
    <>
      <Animated.View style={[StyleSheet.absoluteFill, kb]}>
        <Image
          source={uri}
          placeholder={{ blurhash: BLURHASH }}
          contentFit="cover"
          transition={300}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <BottomScrim />
    </>
  );
}

/**
 * Soft full-screen token gradient via stacked Views — used behind text kinds
 * for calm variety. `top`/`bottom` are token color strings.
 */
function SoftGradient({ top, bottom }: { top: string; bottom: string }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: top }} />
      <View style={{ flex: 1, backgroundColor: bottom }} />
      {/* feathered seam */}
      <View style={styles.seam} pointerEvents="none">
        <View style={{ flex: 1, backgroundColor: top, opacity: 0.5 }} />
        <View style={{ flex: 1, backgroundColor: bottom, opacity: 0.5 }} />
      </View>
    </View>
  );
}

// Pick a calm gradient pairing for variety per text kind.
const TEXT_GRADIENTS: Record<string, { top: string; bottom: string }> = {
  affirmation: { top: tokens.colors.lilac, bottom: tokens.colors.bg },
  tinywin: { top: tokens.colors.sage, bottom: tokens.colors.bg },
  news: { top: tokens.colors.surfaceAlt, bottom: tokens.colors.bg },
  social: { top: tokens.colors.peach, bottom: tokens.colors.bg },
};

export function ImmersiveCard({ item, height, width, sessionSeconds, index }: Props) {
  // expo-image / Animated need explicit size for the full-bleed background.
  const frame = { width, height };

  // ---- nada: calm full-screen sage ----
  if (item.kind === "nada") {
    return (
      <View style={[styles.frame, frame, { backgroundColor: tokens.colors.sage }]}>
        <View style={styles.centerPad}>
          <Text style={styles.nadaMark}>nada</Text>
          <Text style={styles.nadaLine}>no ads. no algorithm. this costs you nothing.</Text>
          <Text style={styles.nadaTime}>
            {formatDuration(sessionSeconds)} of guilt-free scrolling
          </Text>
        </View>
      </View>
    );
  }

  // ---- image-backed kinds: calm, photo, social-with-image ----
  if (item.kind === "calm" || item.kind === "photo") {
    const caption =
      item.kind === "calm" ? item.caption : item.caption ?? "from your camera roll";
    const uri = item.kind === "calm" ? item.image : item.uri;
    return (
      <View style={[styles.frame, frame, { backgroundColor: tokens.colors.magicBg }]}>
        <ImageBackdrop uri={uri} />
        <View style={styles.overlayBottom} pointerEvents="box-none">
          <Text style={styles.caption}>{caption}</Text>
        </View>
      </View>
    );
  }

  if (item.kind === "social" && item.image) {
    return (
      <View style={[styles.frame, frame, { backgroundColor: tokens.colors.magicBg }]}>
        <ImageBackdrop uri={item.image} />
        <View style={styles.overlayBottom} pointerEvents="box-none">
          <SocialOverlay item={item} />
        </View>
      </View>
    );
  }

  // ---- text kinds on a soft gradient: affirmation, tinywin, news, social w/o image ----
  const grad = TEXT_GRADIENTS[item.kind] ?? TEXT_GRADIENTS.affirmation;

  return (
    <View style={[styles.frame, frame]}>
      <SoftGradient top={grad.top} bottom={grad.bottom} />
      <View style={styles.centerPad}>
        {item.kind === "affirmation" ? (
          <Text style={styles.affirmation}>{item.text}</Text>
        ) : null}

        {item.kind === "tinywin" ? (
          <>
            <Text style={styles.tinywinLabel}>🌱 TINY WIN</Text>
            <Text style={styles.tinywinText}>{item.text}</Text>
          </>
        ) : null}

        {item.kind === "news" ? (
          <>
            <Text style={styles.newsSource}>{item.source.toUpperCase()}</Text>
            <Text style={styles.newsHeadline}>{item.headline}</Text>
          </>
        ) : null}

        {item.kind === "social" ? <SocialSoftCard item={item} /> : null}
      </View>
    </View>
  );
}

/** Social overlay shown over a full-bleed image (light text on scrim). */
function SocialOverlay({ item }: { item: Extract<FeedItem, { kind: "social" }> }) {
  return (
    <View>
      <View style={styles.socialRow}>
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <Text style={styles.avatarText}>{initials(item.author)}</Text>
        </View>
        <Text style={styles.socialAuthorLight} numberOfLines={1}>
          {item.author}
        </Text>
      </View>
      <Text style={styles.socialTextLight}>{item.text}</Text>
      <View style={styles.socialCounts}>
        <Text style={styles.countLight}>♡ {item.likes}</Text>
        <Text style={styles.countLight}>💬 {item.comments}</Text>
      </View>
    </View>
  );
}

/** Social card centered on a soft gradient (dark text). */
function SocialSoftCard({ item }: { item: Extract<FeedItem, { kind: "social" }> }) {
  return (
    <View style={styles.socialSoftCard}>
      <View style={styles.socialRow}>
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <Text style={styles.avatarText}>{initials(item.author)}</Text>
        </View>
        <Text style={styles.socialAuthorDark} numberOfLines={1}>
          {item.author}
        </Text>
      </View>
      <Text style={styles.socialTextDark}>{item.text}</Text>
      <View style={styles.socialCounts}>
        <Text style={styles.countDark}>♡ {item.likes}</Text>
        <Text style={styles.countDark}>💬 {item.comments}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: "hidden",
    justifyContent: "center",
  },
  centerPad: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: tokens.space.xxxl,
  },

  // Scrim
  scrimBand: {
    width: "100%",
  },

  // Soft gradient seam (blends the two halves)
  seam: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "35%",
    height: "30%",
    flexDirection: "column",
  },

  // Bottom overlay (over imagery)
  overlayBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: tokens.space.xxl,
    paddingBottom: tokens.space.xxxl + tokens.space.xxl,
    paddingTop: tokens.space.xl,
  },
  caption: {
    fontSize: 20,
    lineHeight: 28,
    color: LIGHT,
    fontWeight: "600",
    letterSpacing: -0.2,
  },

  // nada
  nadaMark: {
    fontSize: 30,
    fontWeight: "900",
    color: tokens.colors.ink,
    letterSpacing: -0.5,
    marginBottom: tokens.space.lg,
  },
  nadaLine: {
    fontSize: 18,
    lineHeight: 26,
    color: tokens.colors.ink,
    textAlign: "center",
    opacity: 0.7,
  },
  nadaTime: {
    fontSize: 15,
    color: tokens.colors.positive,
    fontWeight: "700",
    marginTop: tokens.space.xl,
  },

  // Affirmation
  affirmation: {
    fontSize: 32,
    lineHeight: 42,
    fontWeight: "800",
    color: tokens.colors.ink,
    textAlign: "center",
    letterSpacing: -0.5,
  },

  // Tiny win
  tinywinLabel: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: tokens.colors.positive,
    marginBottom: tokens.space.lg,
    textAlign: "center",
  },
  tinywinText: {
    fontSize: 28,
    lineHeight: 38,
    fontWeight: "700",
    color: tokens.colors.ink,
    textAlign: "center",
    letterSpacing: -0.3,
  },

  // News
  newsSource: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    color: tokens.colors.muted,
    marginBottom: tokens.space.md,
    textAlign: "center",
  },
  newsHeadline: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "800",
    color: tokens.colors.ink,
    textAlign: "center",
    letterSpacing: -0.4,
  },

  // Social (shared)
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: tokens.space.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginRight: tokens.space.md,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: 0.3,
  },
  socialCounts: {
    flexDirection: "row",
    marginTop: tokens.space.lg,
    columnGap: tokens.space.xxl,
  },

  // Social over image (light)
  socialAuthorLight: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: LIGHT,
  },
  socialTextLight: {
    fontSize: 19,
    lineHeight: 27,
    color: LIGHT,
    fontWeight: "500",
  },
  countLight: {
    fontSize: 15,
    color: LIGHT_MUTED,
    fontWeight: "600",
  },

  // Social soft card (dark)
  socialSoftCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.space.xl,
    width: "100%",
    ...tokens.shadow.lifted,
  },
  socialAuthorDark: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  socialTextDark: {
    fontSize: 18,
    lineHeight: 26,
    color: tokens.colors.ink,
    fontWeight: "500",
  },
  countDark: {
    fontSize: 15,
    color: tokens.colors.muted,
    fontWeight: "600",
  },
});
