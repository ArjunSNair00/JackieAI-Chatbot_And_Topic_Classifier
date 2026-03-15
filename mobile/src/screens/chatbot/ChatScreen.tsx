import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ModeStackParamList } from "../../navigation/types";
import { ChatScreenBase } from "../shared/ChatScreenBase";

type Props = NativeStackScreenProps<ModeStackParamList, "Chat">;

export function ChatbotChatScreen(props: Props) {
  return <ChatScreenBase {...props} mode="chatbot" />;
}
