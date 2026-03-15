export type Mode = "chatbot" | "classifier";

export type MessageRole = "user" | "bot";

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  conf?: number | "N/A" | null;
  thinking?: boolean;
  attachedPDF?: string;
}

export interface PdfContext {
  name: string;
  text: string;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  pdfContext: PdfContext | null;
}

export interface PredictResponse {
  topic: string;
  confidence: number | "N/A";
}

export interface ChatApiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  response: string;
}
