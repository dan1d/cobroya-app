import { useEffect, useState, useCallback } from "react";
import { Stack, useRouter, useRootNavigationState } from "expo-router";
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
  const [initialRoute, setInitialRoute] = useState<"login" | "(tabs)">("login");
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    async function init() {
      const hasToken = await initializeAuth();
      setInitialRoute(hasToken ? "(tabs)" : "login");
      setIsReady(true);

      if (hasToken) {
        registerForPushNotifications();
      }
    }
    init();
  }, []);

  // Navigate once when ready and navigation is loaded
  useEffect(() => {
    if (!isReady || !navigationState?.key) return;
    router.replace(initialRoute === "(tabs)" ? "/(tabs)" : "/login");
  }, [isReady, navigationState?.key]);

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
