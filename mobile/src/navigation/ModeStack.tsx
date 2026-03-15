import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Mode } from "../models/session";
import { ChatbotChatScreen } from "../screens/chatbot/ChatScreen";
import { ChatbotSessionsScreen } from "../screens/chatbot/SessionsScreen";
import { ClassifierChatScreen } from "../screens/classifier/ChatScreen";
import { ClassifierSessionsScreen } from "../screens/classifier/SessionsScreen";
import { ModeStackParamList } from "./types";

const Stack = createNativeStackNavigator<ModeStackParamList>();

interface ModeStackProps {
  mode: Mode;
}

export function ModeStack({ mode }: ModeStackProps) {
  const title = mode === "chatbot" ? "Jackie - AI" : "Underworld Scanner";
  const SessionsComponent =
    mode === "chatbot" ? ChatbotSessionsScreen : ClassifierSessionsScreen;
  const ChatComponent =
    mode === "chatbot" ? ChatbotChatScreen : ClassifierChatScreen;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0b1118",
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: "Bangers_400Regular",
          fontWeight: "900",
        },
        headerTintColor: "#f7fafc",
        contentStyle: { backgroundColor: "#05080f" },
      }}
    >
      <Stack.Screen
        name="Sessions"
        component={SessionsComponent}
        options={{
          title: mode === "chatbot" ? "Jackie Sessions" : "Scanner Sessions",
        }}
      />
      <Stack.Screen name="Chat" component={ChatComponent} options={{ title }} />
    </Stack.Navigator>
  );
}
