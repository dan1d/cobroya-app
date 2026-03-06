import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { initializeAuth } from "../lib/auth";
import { registerForPushNotifications } from "../lib/notifications";
import { colors } from "../constants/theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    async function init() {
      const hasToken = await initializeAuth();
      setIsLoggedIn(hasToken);
      setIsReady(true);

      if (hasToken) {
        registerForPushNotifications();
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "join";

    if (!isLoggedIn && !inAuthGroup) {
      router.replace("/login");
    } else if (isLoggedIn && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isReady, isLoggedIn, segments]);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="create"
          options={{ title: "Crear pago", presentation: "modal" }}
        />
        <Stack.Screen
          name="payment/[id]"
          options={{ title: "Detalle del pago" }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: "Configuracion" }}
        />
        <Stack.Screen
          name="team"
          options={{ title: "Equipo" }}
        />
        <Stack.Screen
          name="join"
          options={{ title: "Unirse a equipo", headerShown: false }}
        />
      </Stack>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
