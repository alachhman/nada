import { StyleSheet, Text, View } from "react-native";
import { Reveal } from "@/components/ui/Reveal";
import { formatDuration } from "@/lib/duration";
import { tokens } from "@/lib/theme";

export function NadaInterstitial({ sessionSeconds }: { sessionSeconds: number }) {
  return (
    <Reveal delay={40} distance={10}>
      <View style={styles.card}>
        <Text style={styles.mark}>nada</Text>
        <Text style={styles.line}>no ads. no algorithm. this costs you nothing.</Text>
        <Text style={styles.time}>
          {formatDuration(sessionSeconds)} of guilt-free scrolling
        </Text>
      </View>
    </Reveal>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.sage,
    borderRadius: tokens.radius.lg,
    paddingVertical: tokens.space.xxxl,
    paddingHorizontal: tokens.space.xl,
    alignItems: "center",
  },
  mark: {
    fontSize: 17,
    fontWeight: "900",
    color: tokens.colors.ink,
    letterSpacing: -0.3,
    marginBottom: tokens.space.md,
  },
  line: {
    fontSize: 15,
    lineHeight: 22,
    color: tokens.colors.ink,
    textAlign: "center",
    opacity: 0.75,
  },
  time: {
    fontSize: 13,
    color: tokens.colors.positive,
    fontWeight: "600",
    marginTop: tokens.space.md,
  },
});
