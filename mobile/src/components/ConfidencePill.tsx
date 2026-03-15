import { StyleSheet, Text, View } from "react-native";

interface ConfidencePillProps {
  confidence: number | "N/A" | null | undefined;
}

export function ConfidencePill({ confidence }: ConfidencePillProps) {
  if (confidence === null || confidence === undefined || confidence === "N/A") {
    return (
      <View style={[styles.pill, styles.neutral]}>
        <Text style={styles.neutralText}>N/A</Text>
      </View>
    );
  }

  const percent = Math.round(confidence * 100);
  const high = confidence >= 0.85;
  const medium = confidence >= 0.6 && confidence < 0.85;

  return (
    <View
      style={[
        styles.pill,
        high ? styles.high : medium ? styles.medium : styles.low,
      ]}
    >
      <Text style={styles.text}>
        {percent}% {high ? "Match" : medium ? "Possible" : "Low"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 8,
  },
  text: {
    color: "#f9fafb",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  neutral: {
    backgroundColor: "#1f2937",
    borderColor: "#374151",
  },
  neutralText: {
    color: "#9ca3af",
    fontSize: 11,
    fontWeight: "700",
  },
  high: {
    backgroundColor: "#064e3b",
    borderColor: "#10b981",
  },
  medium: {
    backgroundColor: "#78350f",
    borderColor: "#f59e0b",
  },
  low: {
    backgroundColor: "#7f1d1d",
    borderColor: "#f87171",
  },
});
