import { StyleSheet, Text, View } from "react-native";
import { tokens } from "@/lib/theme";
import { RatingStars } from "@/components/shop/RatingStars";
import type { Review } from "@/lib/types";

interface ReviewBlockProps {
  reviews: Review[];
}

export function ReviewBlock({ reviews }: ReviewBlockProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Reviews ({reviews.length})</Text>
      <View style={styles.list}>
        {reviews.map((review, index) => (
          <ReviewCard key={index} review={review} />
        ))}
      </View>
    </View>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <RatingStars rating={review.rating} variant="stars" />
        <Text style={styles.author}>{review.author}</Text>
      </View>
      <Text style={styles.text}>{review.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: tokens.space.md,
  },
  heading: {
    fontSize: 18,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.3,
  },
  list: {
    gap: tokens.space.md,
  },
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.md,
    padding: tokens.space.lg,
    gap: tokens.space.sm,
    ...tokens.shadow.card,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  author: {
    fontSize: 13,
    fontWeight: "600",
    color: tokens.colors.muted,
  },
  text: {
    fontSize: 14.5,
    fontWeight: "400",
    color: tokens.colors.ink,
    lineHeight: 21,
  },
});
