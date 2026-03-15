import { AxiosError } from "axios";
import { ChatApiMessage, ChatResponse } from "../models/session";
import { apiClient } from "./client";

export async function sendChat(
  messages: ChatApiMessage[],
  signal?: AbortSignal,
): Promise<ChatResponse> {
  try {
    const response = await apiClient.post<ChatResponse>(
      "/chat",
      { messages },
      { signal },
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    throw new Error(axiosError.response?.data?.detail ?? axiosError.message);
  }
}
