import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ModeStackParamList } from "../../navigation/types";
import { ChatScreenBase } from "../shared/ChatScreenBase";

type Props = NativeStackScreenProps<ModeStackParamList, "Chat">;

export function ClassifierChatScreen(props: Props) {
  return <ChatScreenBase {...props} mode="classifier" />;
}
