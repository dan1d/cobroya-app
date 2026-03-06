import { Platform } from "react-native";
import { initClient, clearClient } from "./api";

const TOKEN_KEY = "mp_access_token";
const CURRENCY_KEY = "mp_currency";

// SecureStore doesn't work on web, fallback to AsyncStorage
async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  const SecureStore = await import("expo-secure-store");
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }
  const SecureStore = await import("expo-secure-store");
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }
  const SecureStore = await import("expo-secure-store");
  await SecureStore.deleteItemAsync(key);
}

export async function getStoredToken(): Promise<string | null> {
  return getItem(TOKEN_KEY);
}

export async function saveToken(token: string): Promise<void> {
  await setItem(TOKEN_KEY, token);
  initClient(token);
}

export async function removeToken(): Promise<void> {
  await deleteItem(TOKEN_KEY);
  clearClient();
}

export async function getStoredCurrency(): Promise<string> {
  const currency = await getItem(CURRENCY_KEY);
  return currency || "ARS";
}

export async function saveCurrency(currency: string): Promise<void> {
  await setItem(CURRENCY_KEY, currency);
}

export async function initializeAuth(): Promise<boolean> {
  const token = await getStoredToken();
  if (token) {
    initClient(token);
    return true;
  }
  return false;
}
