import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Mode, Session } from "../../models/session";
import {
  loadSessions,
  saveSessions,
  createSession,
} from "../../storage/sessions";
import { ModeStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<ModeStackParamList, "Sessions"> & {
  mode: Mode;
};

export function SessionsScreenBase({ navigation, mode }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const isChatbot = mode === "chatbot";

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const loaded = await loadSessions(mode);
      setSessions(loaded);
    });

    return unsubscribe;
  }, [mode, navigation]);

  async function handleNewSession() {
    const session = createSession();
    const next = [session, ...sessions];
    setSessions(next);
    await saveSessions(mode, next);
    navigation.navigate("Chat", { sessionId: session.id });
  }

  async function handleDelete(id: string) {
    const next = sessions.filter((session) => session.id !== id);
    setSessions(next);
    await saveSessions(mode, next);
  }

  function openSession(id: string) {
    navigation.navigate("Chat", { sessionId: id });
  }

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          {isChatbot ? "Jackie - AI" : "Underworld Scanner"}
        </Text>
        <Text style={styles.heroDesc}>
          {isChatbot
            ? '"Money is always an issue!" Continue a session or start a new quotation.'
            : "Classify deal text into underworld sectors with confidence scoring."}
        </Text>
      </View>

      <Pressable style={styles.newButton} onPress={handleNewSession}>
        <Text style={styles.newButtonText}>New Quotation</Text>
      </Pressable>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.empty}>No sessions yet.</Text>
            <Text style={styles.emptySub}>Tap New Quotation to start.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Pressable
              style={styles.sessionButton}
              onPress={() => openSession(item.id)}
            >
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.subtitle}>
                {item.messages.length} messages {item.pdfContext ? "• PDF" : ""}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {item.messages[item.messages.length - 1]?.text ??
                  "No messages yet."}
              </Text>
            </Pressable>
            <Pressable
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#05080f",
    padding: 16,
  },
  hero: {
    marginBottom: 14,
    borderRadius: 14,
    borderColor: "#000000",
    borderWidth: 3,
    backgroundColor: "#0b1118",
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
    elevation: 5,
  },
  heroTitle: {
    color: "#facc15",
    fontFamily: "Bangers_400Regular",
    fontWeight: "900",
    fontSize: 20,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroDesc: {
    color: "#9ca3af",
    fontFamily: "GochiHand_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  newButton: {
    marginBottom: 12,
    backgroundColor: "#facc15",
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: "stretch",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 3,
    borderColor: "#000000",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
    elevation: 5,
  },
  newButtonText: {
    color: "#111827",
    fontFamily: "Bangers_400Regular",
    fontWeight: "800",
    letterSpacing: 0.6,
    fontSize: 16,
  },
  listContent: {
    gap: 10,
    paddingTop: 10,
    paddingBottom: 24,
  },
  emptyWrap: {
    marginTop: 20,
    alignItems: "center",
    gap: 4,
  },
  empty: {
    color: "#9ca3af",
    fontWeight: "700",
  },
  emptySub: {
    color: "#6b7280",
    fontSize: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sessionButton: {
    flex: 1,
    borderRadius: 12,
    borderColor: "#000000",
    borderWidth: 3,
    backgroundColor: "#0f172a",
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 4,
  },
  title: {
    color: "#f9fafb",
    fontFamily: "Bangers_400Regular",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.4,
  },
  subtitle: {
    color: "#9ca3af",
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 11,
    marginTop: 3,
  },
  meta: {
    color: "#6b7280",
    fontFamily: "GochiHand_400Regular",
    fontSize: 11,
    marginTop: 5,
  },
  deleteButton: {
    borderRadius: 10,
    borderColor: "#000000",
    borderWidth: 2,
    backgroundColor: "#1f1111",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  deleteText: {
    color: "#fca5a5",
    fontFamily: "Bangers_400Regular",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
