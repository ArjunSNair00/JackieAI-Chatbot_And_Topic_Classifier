import "react-native-gesture-handler";
import { Bangers_400Regular } from "@expo-google-fonts/bangers";
import { GochiHand_400Regular } from "@expo-google-fonts/gochi-hand";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootTabs } from "./src/navigation/RootTabs";

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("App startup crash:", message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.crashScreen}>
          <Text style={styles.crashTitle}>App failed to start</Text>
          <Text style={styles.crashText}>{this.state.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Bangers_400Regular,
    GochiHand_400Regular,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={styles.bootScreen} />;
  }

  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <NavigationContainer>
          <RootTabs />
        </NavigationContainer>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  bootScreen: {
    flex: 1,
    backgroundColor: "#05080f",
  },
  crashScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#05080f",
    padding: 20,
    gap: 10,
  },
  crashTitle: {
    color: "#f9fafb",
    fontSize: 20,
    fontWeight: "800",
  },
  crashText: {
    color: "#fca5a5",
    fontSize: 12,
    textAlign: "center",
  },
});
