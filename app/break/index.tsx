import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tokens } from "@/lib/theme";

export default function BreakScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Break</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 24,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
});
