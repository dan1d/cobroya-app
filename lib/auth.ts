import * as SecureStore from "expo-secure-store";
import { initClient, clearClient } from "./api";

const TOKEN_KEY = "mp_access_token";
const CURRENCY_KEY = "mp_currency";

export async function getStoredToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  initClient(token);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  clearClient();
}

export async function getStoredCurrency(): Promise<string> {
  const currency = await SecureStore.getItemAsync(CURRENCY_KEY);
  return currency || "ARS";
}

export async function saveCurrency(currency: string): Promise<void> {
  await SecureStore.setItemAsync(CURRENCY_KEY, currency);
}

export async function initializeAuth(): Promise<boolean> {
  const token = await getStoredToken();
  if (token) {
    initClient(token);
    return true;
  }
  return false;
}
