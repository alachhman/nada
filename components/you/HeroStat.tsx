import { StyleSheet, Text, View } from "react-native";
import { tokens } from "@/lib/theme";
import { CountUp } from "@/components/ui/CountUp";

interface HeroStatProps {
  totalSaved: number;
}

export function HeroStat({ totalSaved }: HeroStatProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>SAVED WITH NADA</Text>
      <CountUp value={totalSaved} style={styles.amount} />
      <Text style={styles.tagline}>you spent nada. nice work.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: tokens.space.xxxl + tokens.space.xl,
    paddingHorizontal: tokens.space.xl,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: tokens.colors.muted,
    textTransform: "uppercase",
    marginBottom: tokens.space.sm,
  },
  amount: {
    fontSize: 64,
    fontWeight: "900",
    color: tokens.colors.positive,
    letterSpacing: -2,
    lineHeight: 72,
    marginBottom: tokens.space.sm,
  },
  tagline: {
    fontSize: 15,
    fontWeight: "500",
    color: tokens.colors.muted,
    textAlign: "center",
  },
});
