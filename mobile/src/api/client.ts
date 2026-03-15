import Constants from "expo-constants";
import axios from "axios";

const config = Constants.expoConfig ?? Constants.manifest2?.extra?.expoClient;
const baseURL =
  (config?.extra?.apiBaseUrl as string | undefined) ??
  "https://topic-classifier-ai.onrender.com";

export const apiClient = axios.create({
  baseURL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});
