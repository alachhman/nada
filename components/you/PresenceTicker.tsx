import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { PRESENCE_ENABLED } from "@/lib/flags";
import { formatEvent, relativeTime } from "@/lib/presence";
import { usePresence } from "@/components/providers/PresenceProvider";
import { Reveal } from "@/components/ui/Reveal";
import { tokens } from "@/lib/theme";

const SHOWN = 8;

export function PresenceTicker() {
  const { enabled, setEnabled, events } = usePresence();
  const [now, setNow] = useState(() => Date.now());

  // Refresh relative times once a minute while mounted.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!PRESENCE_ENABLED) return null;

  return (
    <Reveal>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>right now</Text>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ true: tokens.colors.positive }}
            accessibilityLabel="share your saves anonymously"
          />
        </View>
        {!enabled ? (
          <Pressable onPress={() => setEnabled(true)}>
            <Text style={styles.invite}>
              others are saying no right now — join anonymously
            </Text>
            <Text style={styles.disclosure}>
              shares only: ritual, rounded amount, your region word. no ids, ever.
            </Text>
          </Pressable>
        ) : events.length === 0 ? (
          <Text style={styles.empty}>
            it&apos;s quiet right now — saves from others will show here
          </Text>
        ) : (
          events.slice(0, SHOWN).map((e) => (
            <Reveal key={e.id}>
              <View style={styles.row}>
                <Text style={styles.event}>{formatEvent(e)}</Text>
                <Text style={styles.time}>{relativeTime(e.created_at, now)}</Text>
              </View>
            </Reveal>
          ))
        )}
      </View>
    </Reveal>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: tokens.colors.hairline,
    paddingVertical: tokens.space.xl,
    paddingHorizontal: tokens.space.xl,
    gap: tokens.space.md,
    ...tokens.shadow.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: -0.4,
  },
  invite: {
    fontSize: 14.5,
    fontWeight: "500",
    color: tokens.colors.muted,
    lineHeight: 21,
    marginBottom: tokens.space.xs,
  },
  disclosure: {
    fontSize: 12.5,
    fontWeight: "500",
    color: tokens.colors.hairline,
    lineHeight: 18,
  },
  empty: {
    fontSize: 14.5,
    fontWeight: "500",
    color: tokens.colors.muted,
    lineHeight: 21,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.space.md,
  },
  event: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: tokens.colors.ink,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    fontWeight: "500",
    color: tokens.colors.muted,
    flexShrink: 0,
  },
});
