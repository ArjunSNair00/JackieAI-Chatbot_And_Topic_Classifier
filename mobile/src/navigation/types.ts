import { Mode } from "../models/session";

export type ModeStackParamList = {
  Sessions: undefined;
  Chat: { sessionId: string };
};

export interface ModeScreenProps {
  mode: Mode;
}
