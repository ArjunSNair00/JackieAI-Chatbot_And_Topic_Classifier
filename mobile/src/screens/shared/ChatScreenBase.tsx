import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Clipboard from "expo-clipboard";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { sendChat } from "../../api/chat";
import { predictTopic } from "../../api/predict";
import { Composer } from "../../components/Composer";
import { MessageBubble } from "../../components/MessageBubble";
import { PdfContextBanner } from "../../components/PdfContextBanner";
import {
  PdfExtractionJob,
  PdfTextExtractorWebView,
} from "../../components/PdfTextExtractorWebView";
import { ChatApiMessage, Message, Mode, Session } from "../../models/session";
import { ModeStackParamList } from "../../navigation/types";
import { loadJackieMode, saveJackieMode } from "../../storage/preferences";
import { loadSessions, saveSessions } from "../../storage/sessions";
import { pickPdfFile, readPdfAsBase64 } from "../../utils/pdfText";

type Props = NativeStackScreenProps<ModeStackParamList, "Chat"> & {
  mode: Mode;
};

const MAX_PDF_CHARS = 12000;
const PDF_READ_TIMEOUT_MS = 20000;
const PDF_EXTRACT_TIMEOUT_MS = 60000;

function buildAlternatingMessages(messages: Message[]): ChatApiMessage[] {
  const normalized = messages
    .filter((message) => !message.thinking)
    .map((message) => ({
      role: (message.role === "user" ? "user" : "assistant") as
        | "user"
        | "assistant",
      content: message.text,
    }))
    .filter((message) => message.content.trim().length > 0);

  const cleaned: ChatApiMessage[] = [];

  for (const message of normalized) {
    if (cleaned.length === 0 && message.role !== "user") {
      continue;
    }

    const last = cleaned[cleaned.length - 1];
    if (!last) {
      cleaned.push(message);
      continue;
    }

    if (last.role === message.role) {
      cleaned[cleaned.length - 1] = message;
      continue;
    }

    cleaned.push(message);
  }

  return cleaned;
}

export function ChatScreenBase({ route, navigation, mode }: Props) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { sessionId } = route.params;
  const [sessions, setSessions] = useState<Session[]>([]);
  const sessionsRef = useRef<Session[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [attachedFileText, setAttachedFileText] = useState("");
  const [attachedFileName, setAttachedFileName] = useState("");
  const [pdfExtractionJob, setPdfExtractionJob] =
    useState<PdfExtractionJob | null>(null);
  const [isPdfProcessing, setIsPdfProcessing] = useState(false);
  const [isJackieMode, setIsJackieMode] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [exportingMessageId, setExportingMessageId] = useState<string | null>(
    null,
  );
  const [exportedMessageId, setExportedMessageId] = useState<string | null>(
    null,
  );
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const extractionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === sessionId) ?? null,
    [sessionId, sessions],
  );
  const isClassifier = mode === "classifier";

  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const loaded = await loadSessions(mode);
      sessionsRef.current = loaded;
      setSessions(loaded);
    });
    return unsubscribe;
  }, [mode, navigation]);

  useEffect(() => {
    if (mode !== "chatbot") {
      return;
    }

    let active = true;

    loadJackieMode()
      .then((value) => {
        if (active) {
          setIsJackieMode(value);
        }
      })
      .catch(() => {
        if (active) {
          setIsJackieMode(true);
        }
      });

    return () => {
      active = false;
    };
  }, [mode]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      const eventHeight = event.endCoordinates?.height ?? 0;
      const windowHeight = Dimensions.get("window").height;
      const metrics = (
        Keyboard as unknown as {
          metrics?: () => { height?: number; screenY?: number };
        }
      ).metrics?.();

      const screenY = event.endCoordinates?.screenY ?? metrics?.screenY;
      const metricsHeight = metrics?.height ?? 0;
      const fallbackHeight = Math.max(eventHeight, metricsHeight);
      const overlapHeight =
        typeof screenY === "number"
          ? Math.max(0, windowHeight - screenY)
          : fallbackHeight;

      const adjustedHeight = Math.max(0, overlapHeight);

      setIsKeyboardVisible(true);
      setKeyboardHeight(adjustedHeight);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [insets.bottom]);

  useEffect(() => {
    if (!pdfExtractionJob) {
      return;
    }

    if (extractionTimeoutRef.current) {
      clearTimeout(extractionTimeoutRef.current);
    }

    extractionTimeoutRef.current = setTimeout(() => {
      extractionTimeoutRef.current = null;
      setPdfExtractionJob(null);
      setIsPdfProcessing(false);
      Alert.alert(
        "PDF error",
        "PDF extraction timed out. Please try again or use a smaller file.",
      );
    }, PDF_EXTRACT_TIMEOUT_MS);

    return () => {
      if (extractionTimeoutRef.current) {
        clearTimeout(extractionTimeoutRef.current);
        extractionTimeoutRef.current = null;
      }
    };
  }, [pdfExtractionJob]);

  async function persist(nextSessions: Session[]) {
    sessionsRef.current = nextSessions;
    setSessions(nextSessions);
    await saveSessions(mode, nextSessions);
  }

  async function updateActiveSession(
    mutator: (session: Session) => Session,
  ): Promise<Session | null> {
    const currentSessions = sessionsRef.current;
    const currentActive =
      currentSessions.find((session) => session.id === sessionId) ?? null;

    if (!currentActive) {
      return null;
    }

    const nextSessions = currentSessions.map((session) =>
      session.id === currentActive.id ? mutator(session) : session,
    );
    const nextActive =
      nextSessions.find((session) => session.id === currentActive.id) ?? null;
    await persist(nextSessions);
    return nextActive;
  }

  async function attachPdf() {
    const picked = await pickPdfFile();
    if (!picked) {
      return;
    }

    setIsPdfProcessing(true);

    try {
      const base64 = await Promise.race<string>([
        readPdfAsBase64(picked.uri),
        new Promise<string>((_, reject) => {
          setTimeout(() => {
            reject(new Error("Timed out while reading the PDF file."));
          }, PDF_READ_TIMEOUT_MS);
        }),
      ]);

      setPdfExtractionJob({
        id: Date.now().toString(),
        name: picked.name,
        base64,
      });
    } catch (error) {
      setIsPdfProcessing(false);
      const message =
        error instanceof Error ? error.message : "Failed to process PDF.";
      Alert.alert("PDF error", message);
    }
  }

  function handlePdfExtracted(text: string) {
    if (extractionTimeoutRef.current) {
      clearTimeout(extractionTimeoutRef.current);
      extractionTimeoutRef.current = null;
    }

    const currentJob = pdfExtractionJob;
    if (!currentJob) {
      setIsPdfProcessing(false);
      return;
    }

    if (!text.trim()) {
      setPdfExtractionJob(null);
      setIsPdfProcessing(false);
      Alert.alert("PDF error", "No readable text was found in this PDF.");
      return;
    }

    setAttachedFileName(currentJob.name);
    setAttachedFileText(text.slice(0, MAX_PDF_CHARS));
    setPdfExtractionJob(null);
    setIsPdfProcessing(false);
    Alert.alert(
      "PDF attached",
      `${currentJob.name} will be applied as session context on next send.`,
    );
  }

  function handlePdfError(error: string) {
    if (extractionTimeoutRef.current) {
      clearTimeout(extractionTimeoutRef.current);
      extractionTimeoutRef.current = null;
    }

    setPdfExtractionJob(null);
    setIsPdfProcessing(false);
    Alert.alert("PDF error", error);
  }

  async function handleCopy(message: Message) {
    await Clipboard.setStringAsync(message.text);
    setCopiedMessageId(message.id);
    setTimeout(() => {
      setCopiedMessageId((current) =>
        current === message.id ? null : current,
      );
    }, 1800);
  }

  async function handleExport(message: Message) {
    setExportingMessageId(message.id);
    setExportedMessageId(null);

    try {
      const html = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h1>JackieAI Export</h1>
          <p style="color: #666;">Generated ${new Date().toLocaleString()}</p>
          <div>${message.text.replace(/\n/g, "<br/>")}</div>
        </body>
      </html>
    `;

      const { uri } = await Print.printToFileAsync({ html });
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        setExportedMessageId(message.id);
        setTimeout(() => {
          setExportedMessageId((current) =>
            current === message.id ? null : current,
          );
        }, 2200);
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share exported response",
      });
      setExportedMessageId(message.id);
      setTimeout(() => {
        setExportedMessageId((current) =>
          current === message.id ? null : current,
        );
      }, 2200);
    } catch {
      // User can dismiss share flow; we keep a neutral UI state.
    } finally {
      setExportingMessageId(null);
    }
  }

  async function toggleJackieMode() {
    const next = !isJackieMode;
    setIsJackieMode(next);
    await saveJackieMode(next);
  }

  async function send() {
    const value = input.trim();
    if (!value || loading || isPdfProcessing || !activeSession) {
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    setAbortController(controller);

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      text: value,
      attachedPDF: attachedFileName || undefined,
    };

    const thinkingMessage: Message = {
      id: `${Date.now()}-thinking`,
      role: "bot",
      text:
        mode === "classifier"
          ? "Classifying topic..."
          : "Generating response...",
      thinking: true,
      conf: null,
    };

    const nextTitle =
      activeSession.messages.length === 0
        ? `${value.slice(0, 35)}${value.length > 35 ? "..." : ""}`
        : activeSession.title;

    const updatedActive = await updateActiveSession((session) => ({
      ...session,
      title: nextTitle,
      pdfContext: attachedFileText
        ? {
            name: attachedFileName,
            text: attachedFileText,
          }
        : session.pdfContext,
      messages: [...session.messages, userMessage, thinkingMessage],
    }));

    setInput("");
    setAttachedFileName("");
    setAttachedFileText("");

    if (!updatedActive) {
      setLoading(false);
      setAbortController(null);
      return;
    }

    try {
      let botMessage: Message;

      if (mode === "classifier") {
        const result = await predictTopic(value, controller.signal);
        botMessage = {
          id: `${Date.now()}-bot`,
          role: "bot",
          text: result.topic ?? "Unknown Topic",
          conf: result.confidence,
        };
      } else {
        const jackiePrompt =
          "You are Sagar Alias Jackie, the iconic Malayalam movie character. Use mass style, witty sarcasm, and short punchy responses. Use lines like 'Money is always an issue', 'Nee Dubai kanditundo?', and address the user as Customer.";
        const normalPrompt =
          "You are a professional, helpful, and concise AI assistant. Give clear, accurate, and direct answers in a neutral tone.";

        const pdfSystemBlock = updatedActive.pdfContext?.text
          ? `\n\n[ATTACHED DOCUMENT: \"${updatedActive.pdfContext.name}\"]\nUse this document context in answers:\n${updatedActive.pdfContext.text}`
          : "";

        const alternatingMessages = buildAlternatingMessages(
          updatedActive.messages,
        );

        const history: ChatApiMessage[] = [
          {
            role: "system",
            content:
              (isJackieMode ? jackiePrompt : normalPrompt) + pdfSystemBlock,
          },
          ...alternatingMessages,
        ];

        const response = await sendChat(history, controller.signal);
        botMessage = {
          id: `${Date.now()}-bot`,
          role: "bot",
          text: response.response || "No response received.",
          conf: null,
        };
      }

      await updateActiveSession((session) => ({
        ...session,
        messages: [...session.messages.filter((m) => !m.thinking), botMessage],
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown request error";
      await updateActiveSession((session) => ({
        ...session,
        messages: [
          ...session.messages.filter((m) => !m.thinking),
          {
            id: `${Date.now()}-error`,
            role: "bot",
            text: `Request failed: ${message}`,
            conf: null,
          },
        ],
      }));
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  }

  async function stopRequest() {
    if (!abortController) {
      return;
    }
    abortController.abort();

    await updateActiveSession((session) => ({
      ...session,
      messages: [
        ...session.messages.filter((m) => !m.thinking),
        {
          id: `${Date.now()}-cancel`,
          role: "bot",
          text: "Request cancelled by user.",
          conf: null,
        },
      ],
    }));

    setLoading(false);
    setAbortController(null);
  }

  async function clearPdfContext() {
    await updateActiveSession((session) => ({
      ...session,
      pdfContext: null,
    }));
  }

  function clearStagedPdf() {
    setAttachedFileName("");
    setAttachedFileText("");
    setPdfExtractionJob(null);
    setIsPdfProcessing(false);
  }

  if (!activeSession) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Session not found.</Text>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
    >
      <View style={styles.screen}>
        <PdfTextExtractorWebView
          job={pdfExtractionJob}
          maxChars={MAX_PDF_CHARS}
          onExtracted={handlePdfExtracted}
          onError={handlePdfError}
        />

        {mode === "chatbot" ? (
          <View style={styles.modeToggleRow}>
            <Text style={styles.modeLabel}>Jackie Mode</Text>
            <Pressable
              onPress={toggleJackieMode}
              style={[
                styles.modeButton,
                isJackieMode ? styles.modeButtonOn : styles.modeButtonOff,
              ]}
            >
              <Text style={styles.modeButtonText}>
                {isJackieMode ? "ON" : "OFF"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <FlatList
          data={activeSession.messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messages,
            {
              paddingBottom: isKeyboardVisible
                ? keyboardHeight + 96
                : tabBarHeight + insets.bottom + 94,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {isClassifier
                  ? "Identify the Underworld"
                  : "Sagar Alias Jackie"}
              </Text>
              <Text style={styles.emptyDesc}>
                {isClassifier
                  ? "Paste deal details. Jackie will classify the sector with confidence."
                  : '"Money is always an issue." Ask anything and Jackie will handle it.'}
              </Text>
              <View style={styles.hintsRow}>
                <Pressable
                  style={styles.hintCard}
                  onPress={() =>
                    setInput(
                      isClassifier
                        ? "Analyze the impact of Dubai gold rates on Kochi underworld economy."
                        : "How many gold biscuits can I carry from Dubai?",
                    )
                  }
                >
                  <Text style={styles.hintTitle}>
                    {isClassifier ? "Underworld Economics" : "Dubai Deals"}
                  </Text>
                  <Text style={styles.hintSub}>
                    Tap to auto-fill this prompt
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.hintCard}
                  onPress={() =>
                    setInput(
                      isClassifier
                        ? "Explain why sentiments are for losers in Jackie's world."
                        : "Write an anonymous letter to the police commissioner.",
                    )
                  }
                >
                  <Text style={styles.hintTitle}>
                    {isClassifier ? "Jackie Philosophy" : "Underworld Plans"}
                  </Text>
                  <Text style={styles.hintSub}>
                    Tap to auto-fill this prompt
                  </Text>
                </Pressable>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              mode={mode}
              onCopy={
                item.role === "bot" && !item.thinking
                  ? () => handleCopy(item)
                  : undefined
              }
              copyLabel={copiedMessageId === item.id ? "Copied" : "Copy"}
              copyDisabled={false}
              onExport={
                item.role === "bot" && !item.thinking
                  ? () => handleExport(item)
                  : undefined
              }
              exportLabel={
                exportingMessageId === item.id
                  ? "Exporting..."
                  : exportedMessageId === item.id
                    ? "Done"
                    : "Export PDF"
              }
              exportDisabled={exportingMessageId === item.id}
            />
          )}
        />

        {isPdfProcessing ? (
          <Text style={styles.stagedPdf}>Extracting PDF text...</Text>
        ) : null}

        {attachedFileName ? (
          <Text style={styles.stagedPdf}>Staged PDF: {attachedFileName}</Text>
        ) : null}

        <PdfContextBanner
          pdfContext={activeSession.pdfContext}
          onClear={clearPdfContext}
        />

        <View
          style={[
            styles.composerWrap,
            {
              marginBottom: isKeyboardVisible
                ? keyboardHeight + 4
                : tabBarHeight + insets.bottom + 4,
            },
          ]}
        >
          <Composer
            value={input}
            onChange={setInput}
            onSend={send}
            onStop={stopRequest}
            onAttachPdf={attachPdf}
            onClearStagedPdf={clearStagedPdf}
            loading={loading}
            stagedPdfName={attachedFileName || undefined}
            placeholder={
              isClassifier
                ? "Enter deal details..."
                : "Ask Jackie, money is no issue..."
            }
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
    backgroundColor: "#05080f",
  },
  screen: {
    flex: 1,
    backgroundColor: "#05080f",
    padding: 12,
  },
  messages: {
    gap: 10,
    paddingBottom: 14,
    flexGrow: 1,
  },
  emptyState: {
    borderRadius: 14,
    borderWidth: 3,
    borderColor: "#000000",
    backgroundColor: "#0b1118",
    padding: 14,
    gap: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
    elevation: 5,
  },
  emptyTitle: {
    color: "#f9fafb",
    fontFamily: "Bangers_400Regular",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  emptyDesc: {
    color: "#9ca3af",
    fontFamily: "GochiHand_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  hintsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 2,
  },
  hintCard: {
    flexGrow: 1,
    minWidth: 150,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000000",
    backgroundColor: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 3,
  },
  hintTitle: {
    color: "#facc15",
    fontFamily: "Bangers_400Regular",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  hintSub: {
    color: "#9ca3af",
    fontFamily: "GochiHand_400Regular",
    fontSize: 10,
  },
  modeToggleRow: {
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#000000",
    backgroundColor: "#0b1118",
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 4,
  },
  modeLabel: {
    color: "#f3f4f6",
    fontFamily: "Bangers_400Regular",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  modeButton: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
  },
  modeButtonOn: {
    backgroundColor: "#78350f",
    borderColor: "#facc15",
  },
  modeButtonOff: {
    backgroundColor: "#111827",
    borderColor: "#4b5563",
  },
  modeButtonText: {
    color: "#f9fafb",
    fontFamily: "Bangers_400Regular",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  stagedPdf: {
    color: "#facc15",
    fontFamily: "GochiHand_400Regular",
    fontSize: 12,
    marginBottom: 8,
  },
  composerWrap: {
    paddingBottom: 4,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#05080f",
    gap: 12,
  },
  emptyText: {
    color: "#d1d5db",
  },
  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#facc15",
  },
  backButtonText: {
    color: "#111827",
    fontWeight: "700",
  },
});
