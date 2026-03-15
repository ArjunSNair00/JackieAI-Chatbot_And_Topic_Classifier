import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SessionsScreenBase } from "../shared/SessionsScreenBase";
import { ModeStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<ModeStackParamList, "Sessions">;

export function ChatbotSessionsScreen(props: Props) {
  return <SessionsScreenBase {...props} mode="chatbot" />;
}
