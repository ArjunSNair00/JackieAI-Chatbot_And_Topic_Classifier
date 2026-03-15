import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ModeStack } from "./ModeStack";

const Tab = createBottomTabNavigator();

export function RootTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: "absolute",
          left: 10,
          right: 10,
          bottom: Math.max(insets.bottom, 6),
          backgroundColor: "#0b1118",
          borderTopColor: "#000000",
          borderTopWidth: 3,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          borderRadius: 14,
        },
        tabBarLabelStyle: {
          fontFamily: "Bangers_400Regular",
          fontWeight: "900",
          letterSpacing: 0.4,
          fontSize: 11,
        },
        tabBarActiveTintColor: "#facc15",
        tabBarInactiveTintColor: "#9ca3af",
      }}
    >
      <Tab.Screen
        name="ChatbotTab"
        options={{
          title: "Jackie",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
          ),
        }}
      >
        {() => <ModeStack mode="chatbot" />}
      </Tab.Screen>
      <Tab.Screen
        name="ClassifierTab"
        options={{
          title: "Scanner",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="radar" size={size} color={color} />
          ),
        }}
      >
        {() => <ModeStack mode="classifier" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
