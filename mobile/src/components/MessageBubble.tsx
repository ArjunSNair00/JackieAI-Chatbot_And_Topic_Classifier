import { Pressable, StyleSheet, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { Message, Mode } from "../models/session";
import { ConfidencePill } from "./ConfidencePill";

interface MessageBubbleProps {
  message: Message;
  mode: Mode;
  onCopy?: () => void;
  onExport?: () => void;
  copyLabel?: string;
  exportLabel?: string;
  copyDisabled?: boolean;
  exportDisabled?: boolean;
}

export function MessageBubble({
  message,
  mode,
  onCopy,
  onExport,
  copyLabel = "Copy",
  exportLabel = "Export PDF",
  copyDisabled = false,
  exportDisabled = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <View style={styles.userWrap}>
        <View style={styles.userBubble}>
          {message.attachedPDF ? (
            <Text style={styles.pdfBadge}>PDF: {message.attachedPDF}</Text>
          ) : null}
          <Text style={styles.userText}>{message.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.botWrap}>
      <View style={styles.botBubble}>
        <Text style={styles.botHeader}>
          {mode === "classifier"
            ? "Mass Identification Complete"
            : "Jackie - AI Command"}
        </Text>
        {message.thinking ? (
          <View style={styles.thinkingWrap}>
            <Text style={styles.thinkingText}>{message.text}</Text>
            <Text style={styles.thinkingDots}>. . .</Text>
          </View>
        ) : mode === "classifier" ? (
          <>
            <Text style={styles.classifierLabel}>Underworld Sector</Text>
            <Text style={styles.classifierTopic}>{message.text}</Text>
            <ConfidencePill confidence={message.conf} />
          </>
        ) : (
          <Markdown style={markdownStyles}>{message.text}</Markdown>
        )}
      </View>
      {!message.thinking && (onCopy || onExport) ? (
        <View style={styles.actions}>
          {onCopy ? (
            <Pressable
              style={[
                styles.actionButton,
                copyDisabled && styles.disabledAction,
              ]}
              onPress={onCopy}
              disabled={copyDisabled}
            >
              <Text style={styles.actionText}>{copyLabel}</Text>
            </Pressable>
          ) : null}
          {onExport ? (
            <Pressable
              style={[
                styles.actionButton,
                exportDisabled && styles.disabledAction,
              ]}
              onPress={onExport}
              disabled={exportDisabled}
            >
              <Text style={styles.actionText}>{exportLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  userWrap: {
    alignItems: "flex-end",
  },
  userBubble: {
    maxWidth: "86%",
    backgroundColor: "#facc15",
    borderRadius: 14,
    borderWidth: 3,
    borderColor: "#000000",
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: -3, height: 3 },
    shadowRadius: 0,
    elevation: 4,
  },
  userText: {
    color: "#111827",
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 14,
    fontWeight: "700",
  },
  pdfBadge: {
    color: "#713f12",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 6,
  },
  botWrap: {
    alignItems: "flex-start",
  },
  botBubble: {
    maxWidth: "92%",
    width: "100%",
    backgroundColor: "#111827",
    borderColor: "#000000",
    borderWidth: 3,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 4,
  },
  botHeader: {
    color: "#9ca3af",
    fontFamily: "Bangers_400Regular",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  classifierLabel: {
    color: "#9ca3af",
    fontFamily: "GochiHand_400Regular",
    fontSize: 12,
    marginBottom: 4,
  },
  classifierTopic: {
    color: "#facc15",
    fontFamily: "Bangers_400Regular",
    fontSize: 24,
    fontWeight: "800",
    textTransform: "capitalize",
    letterSpacing: 0.8,
  },
  thinkingText: {
    color: "#facc15",
    fontFamily: "GochiHand_400Regular",
    fontSize: 13,
    fontStyle: "italic",
  },
  thinkingWrap: {
    gap: 4,
  },
  thinkingDots: {
    color: "#facc15",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
  },
  actions: {
    marginTop: 6,
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    borderRadius: 10,
    borderColor: "#000000",
    borderWidth: 2,
    backgroundColor: "#0f172a",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionText: {
    color: "#d1d5db",
    fontFamily: "Bangers_400Regular",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  disabledAction: {
    opacity: 0.55,
  },
});

const markdownStyles = {
  body: {
    color: "#e5e7eb",
    fontSize: 14,
    lineHeight: 20,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
  },
  heading1: {
    color: "#f9fafb",
  },
  heading2: {
    color: "#f9fafb",
  },
  fence: {
    backgroundColor: "#000000",
    color: "#e6edf3",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 10,
    fontFamily: "Courier",
    fontSize: 13,
    lineHeight: 19,
  },
  code_block: {
    backgroundColor: "#000000",
    color: "#e6edf3",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 10,
    fontFamily: "Courier",
    fontSize: 13,
    lineHeight: 19,
  },
  code_inline: {
    backgroundColor: "#000000",
    color: "#7dd3fc",
    borderColor: "#374151",
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontFamily: "Courier",
  },
  strong: {
    color: "#ffffff",
  },
  em: {
    color: "#e2e8f0",
  },
};
