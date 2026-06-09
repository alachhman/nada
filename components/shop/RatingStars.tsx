import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "@/lib/theme";

interface RatingStarsProps {
  rating: number; // 1-5
  reviewCount?: number;
  /** "compact" shows one ★ + number; "stars" shows 5 small stars. */
  variant?: "compact" | "stars";
}

function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

export function RatingStars({ rating, reviewCount, variant = "compact" }: RatingStarsProps) {
  if (variant === "stars") {
    return (
      <View style={styles.row}>
        <View style={styles.starsRow}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Ionicons
              key={i}
              name={i < Math.round(rating) ? "star" : "star-outline"}
              size={11}
              color={i < Math.round(rating) ? tokens.colors.ink : tokens.colors.muted}
              style={styles.star}
            />
          ))}
        </View>
        {reviewCount != null ? (
          <Text style={styles.count}>({formatCount(reviewCount)})</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Ionicons name="star" size={12} color={tokens.colors.ink} />
      <Text style={styles.rating}>{rating.toFixed(1)}</Text>
      {reviewCount != null ? (
        <Text style={styles.count}>({formatCount(reviewCount)})</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsRow: {
    flexDirection: "row",
  },
  star: {
    marginRight: 1,
  },
  rating: {
    fontSize: 12.5,
    fontWeight: "700",
    color: tokens.colors.ink,
    marginLeft: 3,
  },
  count: {
    fontSize: 12,
    fontWeight: "500",
    color: tokens.colors.muted,
    marginLeft: 4,
  },
});
