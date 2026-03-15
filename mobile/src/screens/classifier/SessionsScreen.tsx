import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ModeStackParamList } from "../../navigation/types";
import { SessionsScreenBase } from "../shared/SessionsScreenBase";

type Props = NativeStackScreenProps<ModeStackParamList, "Sessions">;

export function ClassifierSessionsScreen(props: Props) {
  return <SessionsScreenBase {...props} mode="classifier" />;
}
