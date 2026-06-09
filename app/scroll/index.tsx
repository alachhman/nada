import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tokens } from "@/lib/theme";

export default function ScrollScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.center}>
        <Text style={styles.title}>Doomscroll</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: tokens.colors.ink,
    letterSpacing: -0.5,
  },
});
