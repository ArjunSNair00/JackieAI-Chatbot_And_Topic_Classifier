import { AxiosError } from "axios";
import { PredictResponse } from "../models/session";
import { apiClient } from "./client";

export async function predictTopic(
  text: string,
  signal?: AbortSignal,
): Promise<PredictResponse> {
  try {
    const response = await apiClient.post<PredictResponse>(
      "/predict",
      { text },
      { signal },
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    throw new Error(axiosError.response?.data?.detail ?? axiosError.message);
  }
}
