import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  onAttachPdf: () => void;
  onClearStagedPdf?: () => void;
  loading: boolean;
  placeholder?: string;
  stagedPdfName?: string;
}

export function Composer({
  value,
  onChange,
  onSend,
  onStop,
  onAttachPdf,
  onClearStagedPdf,
  loading,
  placeholder = "Type your message...",
  stagedPdfName,
}: ComposerProps) {
  const canSend = value.trim().length > 0 && !loading;

  return (
    <View style={styles.container}>
      <View style={styles.leftRail}>
        <Pressable style={styles.attachButton} onPress={onAttachPdf}>
          <Text style={styles.attachText}>PDF</Text>
        </Pressable>
        {stagedPdfName ? (
          <Pressable
            style={styles.stagedButton}
            onPress={onClearStagedPdf}
            disabled={!onClearStagedPdf}
          >
            <Text style={styles.stagedButtonText}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#6b7280"
        multiline
        style={styles.input}
      />

      {loading ? (
        <Pressable style={styles.stopButton} onPress={onStop}>
          <Text style={styles.stopText}>Stop</Text>
        </Pressable>
      ) : (
        <Pressable
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          onPress={onSend}
          disabled={!canSend}
        >
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 3,
    borderColor: "#000000",
    backgroundColor: "#111827",
    padding: 8,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 0,
    elevation: 6,
  },
  leftRail: {
    gap: 6,
  },
  attachButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#000000",
    backgroundColor: "#1f2937",
  },
  attachText: {
    color: "#e5e7eb",
    fontFamily: "Bangers_400Regular",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  stagedButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#000000",
    backgroundColor: "#1f1111",
  },
  stagedButtonText: {
    color: "#fca5a5",
    fontFamily: "Bangers_400Regular",
    fontSize: 11,
    fontWeight: "700",
  },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 120,
    color: "#f9fafb",
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 15,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  sendButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#facc15",
    borderWidth: 2,
    borderColor: "#000000",
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendText: {
    color: "#111827",
    fontFamily: "Bangers_400Regular",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.4,
  },
  stopButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#7f1d1d",
    borderWidth: 2,
    borderColor: "#000000",
  },
  stopText: {
    color: "#fecaca",
    fontFamily: "Bangers_400Regular",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.4,
  },
});
