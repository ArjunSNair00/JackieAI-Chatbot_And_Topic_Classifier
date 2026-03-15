import AsyncStorage from "@react-native-async-storage/async-storage";
import { Mode, Session } from "../models/session";

const STORAGE_KEYS: Record<Mode, string> = {
  chatbot: "chatbot_sessions",
  classifier: "classifier_sessions",
};

export async function loadSessions(mode: Mode): Promise<Session[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS[mode]);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as Session[];
    return parsed.map((session) => ({
      ...session,
      pdfContext: session.pdfContext ?? null,
      messages: session.messages ?? [],
    }));
  } catch {
    return [];
  }
}

export async function saveSessions(
  mode: Mode,
  sessions: Session[],
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS[mode], JSON.stringify(sessions));
}

export function createSession(): Session {
  return {
    id: Date.now().toString(),
    title: "New Analysis",
    messages: [],
    pdfContext: null,
  };
}
