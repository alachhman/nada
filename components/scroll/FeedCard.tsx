import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Reveal } from "@/components/ui/Reveal";
import type { FeedItem } from "@/lib/feed";
import { tokens } from "@/lib/theme";

const BLURHASH = "L6Pj0^jE.AyE_3t7t7R**0o#DgR4";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + second).toUpperCase();
}

function SocialCard({ item }: { item: Extract<FeedItem, { kind: "social" }> }) {
  const [liked, setLiked] = useState(false);
  const scale = useSharedValue(1);

  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const toggleLike = () => {
    setLiked((prev) => !prev);
    scale.value = withSequence(
      withTiming(1.35, { duration: 130, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 160, easing: Easing.out(Easing.cubic) }),
    );
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const likeCount = item.likes + (liked ? 1 : 0);

  return (
    <View style={styles.card}>
      <View style={styles.socialHeader}>
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <Text style={styles.avatarText}>{initials(item.author)}</Text>
        </View>
        <View style={styles.socialNames}>
          <Text style={styles.author} numberOfLines={1}>
            {item.author}
          </Text>
          <Text style={styles.handle} numberOfLines={1}>
            {item.handle} · 2h
          </Text>
        </View>
      </View>

      <Text style={styles.socialBody}>{item.text}</Text>

      {item.image ? (
        <View style={styles.socialImageWrap}>
          <Image
            source={item.image}
            placeholder={{ blurhash: BLURHASH }}
            contentFit="cover"
            transition={250}
            style={styles.socialImage}
          />
        </View>
      ) : null}

      <View style={styles.socialFooter}>
        <Pressable
          onPress={toggleLike}
          style={styles.action}
          accessibilityRole="button"
          accessibilityLabel={liked ? "Unlike" : "Like"}
          hitSlop={8}
        >
          <Animated.Text style={[styles.actionIcon, heartStyle, liked && styles.likedIcon]}>
            {liked ? "♥" : "♡"}
          </Animated.Text>
          <Text style={[styles.actionCount, liked && styles.likedCount]}>{likeCount}</Text>
        </Pressable>
        <View style={styles.action}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{item.comments}</Text>
        </View>
      </View>
    </View>
  );
}

function AffirmationCard({ item }: { item: Extract<FeedItem, { kind: "affirmation" }> }) {
  return (
    <View style={[styles.card, styles.affirmationCard]}>
      <Text style={styles.affirmationText}>{item.text}</Text>
    </View>
  );
}

function TinyWinCard({ item }: { item: Extract<FeedItem, { kind: "tinywin" }> }) {
  return (
    <View style={[styles.card, styles.tinywinCard]}>
      <Text style={styles.tinywinLabel}>🌱 TINY WIN</Text>
      <Text style={styles.tinywinText}>{item.text}</Text>
    </View>
  );
}

function NewsCard({ item }: { item: Extract<FeedItem, { kind: "news" }> }) {
  return (
    <View style={[styles.card, styles.newsCard]}>
      <Text style={styles.newsSource}>{item.source.toUpperCase()}</Text>
      <Text style={styles.newsHeadline}>{item.headline}</Text>
    </View>
  );
}

function CalmCard({ item }: { item: Extract<FeedItem, { kind: "calm" }> }) {
  return (
    <View style={[styles.card, styles.calmCard]}>
      <View style={styles.calmImageWrap}>
        <Image
          source={item.image}
          placeholder={{ blurhash: BLURHASH }}
          contentFit="cover"
          transition={250}
          style={styles.calmImage}
        />
      </View>
      <Text style={styles.calmCaption}>{item.caption}</Text>
    </View>
  );
}

function PhotoCard({ item }: { item: Extract<FeedItem, { kind: "photo" }> }) {
  return (
    <View style={[styles.card, styles.calmCard]}>
      <View style={styles.calmImageWrap}>
        <Image
          source={{ uri: item.uri }}
          contentFit="cover"
          transition={250}
          style={styles.calmImage}
        />
      </View>
      <Text style={styles.calmCaption}>
        {item.caption ?? "from your camera roll"}
      </Text>
    </View>
  );
}

export function FeedCard({ item }: { item: FeedItem }) {
  let inner: React.ReactNode = null;
  switch (item.kind) {
    case "social":
      inner = <SocialCard item={item} />;
      break;
    case "affirmation":
      inner = <AffirmationCard item={item} />;
      break;
    case "tinywin":
      inner = <TinyWinCard item={item} />;
      break;
    case "news":
      inner = <NewsCard item={item} />;
      break;
    case "calm":
      inner = <CalmCard item={item} />;
      break;
    case "photo":
      inner = <PhotoCard item={item} />;
      break;
    case "nada":
      return null;
  }

  return (
    <Reveal delay={40} distance={10}>
      {inner}
    </Reveal>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.space.xl,
    ...tokens.shadow.card,
  },

  // Social
  socialHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: tokens.space.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: tokens.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginRight: tokens.space.md,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: 0.3,
  },
  socialNames: {
    flex: 1,
  },
  author: {
    fontSize: 15,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  handle: {
    fontSize: 13,
    color: tokens.colors.muted,
    marginTop: 1,
  },
  socialBody: {
    fontSize: 16,
    lineHeight: 23,
    color: tokens.colors.ink,
  },
  socialImageWrap: {
    marginTop: tokens.space.md,
    borderRadius: tokens.radius.md,
    overflow: "hidden",
    backgroundColor: tokens.colors.hairline,
  },
  socialImage: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  socialFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: tokens.space.lg,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: tokens.space.xxl,
  },
  actionIcon: {
    fontSize: 19,
    color: tokens.colors.muted,
  },
  likedIcon: {
    color: "#E0544F",
  },
  actionCount: {
    fontSize: 14,
    color: tokens.colors.muted,
    marginLeft: tokens.space.sm,
    fontWeight: "600",
  },
  likedCount: {
    color: "#E0544F",
  },

  // Affirmation
  affirmationCard: {
    backgroundColor: tokens.colors.lilac,
    alignItems: "center",
    paddingVertical: tokens.space.xxxl,
  },
  affirmationText: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "700",
    color: tokens.colors.ink,
    textAlign: "center",
    letterSpacing: -0.2,
  },

  // Tiny win
  tinywinCard: {
    backgroundColor: tokens.colors.sage,
  },
  tinywinLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    color: tokens.colors.positive,
    marginBottom: tokens.space.sm,
  },
  tinywinText: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "600",
    color: tokens.colors.ink,
  },

  // News
  newsCard: {
    backgroundColor: tokens.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: tokens.colors.hairline,
  },
  newsSource: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: tokens.colors.muted,
    marginBottom: tokens.space.sm,
  },
  newsHeadline: {
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.3,
  },

  // Calm
  calmCard: {
    padding: tokens.space.md,
  },
  calmImageWrap: {
    borderRadius: tokens.radius.md,
    overflow: "hidden",
    backgroundColor: tokens.colors.hairline,
  },
  calmImage: {
    width: "100%",
    aspectRatio: 4 / 3,
  },
  calmCaption: {
    fontSize: 14,
    color: tokens.colors.muted,
    marginTop: tokens.space.md,
    marginHorizontal: tokens.space.sm,
    fontStyle: "italic",
  },
});
