import AsyncStorage from "@react-native-async-storage/async-storage";

const JACKIE_MODE_KEY = "jackie_mode";

export async function loadJackieMode(): Promise<boolean> {
  const value = await AsyncStorage.getItem(JACKIE_MODE_KEY);
  if (value === null) {
    return true;
  }

  return value !== "false";
}

export async function saveJackieMode(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(JACKIE_MODE_KEY, String(enabled));
}
