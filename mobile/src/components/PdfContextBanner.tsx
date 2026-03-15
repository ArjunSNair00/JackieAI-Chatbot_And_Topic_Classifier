import { Pressable, StyleSheet, Text, View } from "react-native";
import { PdfContext } from "../models/session";

interface PdfContextBannerProps {
  pdfContext: PdfContext | null;
  onClear: () => void;
}

export function PdfContextBanner({
  pdfContext,
  onClear,
}: PdfContextBannerProps) {
  if (!pdfContext) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <Text style={styles.label}>PDF Loaded</Text>
        <Text style={styles.name} numberOfLines={1}>
          {pdfContext.name}
        </Text>
      </View>
      <Pressable onPress={onClear} style={styles.clearButton}>
        <Text style={styles.clearText}>Clear</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#2a1e06",
    borderColor: "#000000",
    borderWidth: 3,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 4,
  },
  left: {
    flex: 1,
  },
  label: {
    color: "#facc15",
    fontFamily: "Bangers_400Regular",
    fontWeight: "700",
    fontSize: 11,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  name: {
    color: "#e5e7eb",
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 12,
  },
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#111827",
    borderColor: "#000000",
    borderWidth: 2,
  },
  clearText: {
    color: "#f87171",
    fontFamily: "Bangers_400Regular",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
