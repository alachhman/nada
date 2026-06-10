import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Reveal } from "@/components/ui/Reveal";
import { useFeedPrefs } from "@/components/providers/FeedPrefsProvider";
import type { PostType, PhotoTheme } from "@/lib/feedPrefs";
import { tokens } from "@/lib/theme";

function haptic() {
  if (Platform.OS !== "web") {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

// ─── Post-type rows ───────────────────────────────────────────────────────────

const POST_TYPE_ROWS: { key: PostType; label: string }[] = [
  { key: "social", label: "Wholesome posts" },
  { key: "affirmation", label: "Affirmations" },
  { key: "tinywin", label: "Tiny wins" },
  { key: "news", label: "Slow news" },
  { key: "calm", label: "Calm photos" },
];

// ─── Photo theme chips ────────────────────────────────────────────────────────

const PHOTO_THEME_CHIPS: { key: PhotoTheme; label: string }[] = [
  { key: "nature", label: "Nature" },
  { key: "animals", label: "Animals" },
  { key: "cozy", label: "Cozy" },
  { key: "food", label: "Food" },
  { key: "art", label: "Art" },
  { key: "skies", label: "Skies" },
];

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  delay = 0,
  children,
}: {
  title: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <Reveal delay={delay} style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </Reveal>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={(v) => {
          haptic();
          onValueChange(v);
        }}
        trackColor={{ false: tokens.colors.hairline, true: tokens.colors.accent }}
        thumbColor={tokens.colors.surface}
        ios_backgroundColor={tokens.colors.hairline}
      />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CustomizeScreen() {
  const router = useRouter();
  const { prefs, setLayout, togglePostType, togglePhotoTheme, setCameraRoll } = useFeedPrefs();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <Reveal style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={tokens.colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Customize your feed</Text>
        {/* Spacer to balance header */}
        <View style={styles.backButton} />
      </Reveal>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Layout */}
        <Section title="Layout" delay={60}>
          <View style={styles.segmentRow}>
            <Pressable
              style={[
                styles.segmentHalf,
                styles.segmentLeft,
                prefs.layout === "classic" && styles.segmentSelected,
              ]}
              onPress={() => {
                haptic();
                setLayout("classic");
              }}
              accessibilityRole="button"
              accessibilityLabel="Classic layout"
              accessibilityState={{ selected: prefs.layout === "classic" }}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  prefs.layout === "classic" && styles.segmentLabelSelected,
                ]}
              >
                Classic
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.segmentHalf,
                styles.segmentRight,
                prefs.layout === "immersive" && styles.segmentSelected,
              ]}
              onPress={() => {
                haptic();
                setLayout("immersive");
              }}
              accessibilityRole="button"
              accessibilityLabel="Immersive layout"
              accessibilityState={{ selected: prefs.layout === "immersive" }}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  prefs.layout === "immersive" && styles.segmentLabelSelected,
                ]}
              >
                Immersive
              </Text>
            </Pressable>
          </View>
          <Text style={styles.mutedNote}>
            Immersive is a full-screen, swipe-up view.
          </Text>
        </Section>

        {/* What you see */}
        <Section title="What you see" delay={120}>
          <View style={styles.card}>
            {POST_TYPE_ROWS.map(({ key, label }, i) => (
              <View
                key={key}
                style={[styles.rowInCard, i < POST_TYPE_ROWS.length - 1 && styles.rowDivider]}
              >
                <ToggleRow
                  label={label}
                  value={prefs.postTypes[key]}
                  onValueChange={() => togglePostType(key)}
                />
              </View>
            ))}
          </View>
          <Text style={styles.mutedNote}>nada reminders always stay.</Text>
        </Section>

        {/* Photo vibes */}
        <Section title="Photo vibes" delay={180}>
          <Text style={[styles.mutedNote, styles.mutedNoteTop]}>
            What kinds of pictures show up.
          </Text>
          <View style={styles.chipWrap}>
            {PHOTO_THEME_CHIPS.map(({ key, label }) => {
              const on = prefs.photoThemes[key];
              return (
                <Pressable
                  key={key}
                  style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                  onPress={() => {
                    haptic();
                    togglePhotoTheme(key);
                  }}
                  accessibilityRole="checkbox"
                  accessibilityLabel={label}
                  accessibilityState={{ checked: on }}
                >
                  {on ? (
                    <Ionicons
                      name="checkmark"
                      size={13}
                      color={tokens.colors.accentFg}
                      style={styles.chipCheck}
                    />
                  ) : null}
                  <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* Your photos */}
        <Section title="Your photos" delay={240}>
          <View style={styles.card}>
            <ToggleRow
              label="Weave in recent photos"
              value={prefs.cameraRoll}
              onValueChange={(v) => setCameraRoll(v)}
            />
          </View>
          <Text style={styles.mutedNote}>On your device only. Never uploaded.</Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.sm,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...tokens.shadow.card,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: tokens.colors.ink,
    letterSpacing: 0.1,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: tokens.space.lg,
    paddingTop: tokens.space.md,
    paddingBottom: tokens.space.xxxl,
    gap: tokens.space.xxl,
  },

  // Section
  section: {
    gap: tokens.space.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: tokens.space.xs,
  },

  // Card (surface container for rows)
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    overflow: "hidden",
    ...tokens.shadow.card,
  },
  rowInCard: {
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.sm,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: tokens.colors.hairline,
  },

  // Toggle row
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: tokens.space.xs,
  },
  toggleLabel: {
    fontSize: 15,
    color: tokens.colors.ink,
    fontWeight: "500",
    flex: 1,
    marginRight: tokens.space.md,
  },

  // Muted notes
  mutedNote: {
    fontSize: 12,
    color: tokens.colors.muted,
    lineHeight: 17,
  },
  mutedNoteTop: {
    marginBottom: tokens.space.sm,
  },

  // Segmented control (Layout)
  segmentRow: {
    flexDirection: "row",
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tokens.colors.hairline,
    ...tokens.shadow.card,
  },
  segmentHalf: {
    flex: 1,
    paddingVertical: tokens.space.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.surface,
  },
  segmentLeft: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: tokens.colors.hairline,
  },
  segmentRight: {},
  segmentSelected: {
    backgroundColor: tokens.colors.accent,
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: tokens.colors.ink,
  },
  segmentLabelSelected: {
    color: tokens.colors.accentFg,
  },

  // Photo theme chips
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.space.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.sm,
    borderRadius: tokens.radius.pill,
  },
  chipOn: {
    backgroundColor: tokens.colors.accent,
  },
  chipOff: {
    backgroundColor: tokens.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tokens.colors.hairline,
  },
  chipCheck: {
    marginRight: tokens.space.xs,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: tokens.colors.ink,
  },
  chipLabelOn: {
    color: tokens.colors.accentFg,
  },
});
