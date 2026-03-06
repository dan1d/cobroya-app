import { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable, Linking } from "react-native";
import { useRouter } from "expo-router";
import { saveToken } from "../lib/auth";
import { initClient, MercadoPagoError } from "../lib/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { colors, spacing, radius } from "../constants/theme";
import { registerForPushNotifications } from "../lib/notifications";

export default function LoginScreen() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    const trimmed = token.trim();
    if (!trimmed) {
      setError("Ingresa tu access token");
      return;
    }

    if (!trimmed.startsWith("APP_USR-") && !trimmed.startsWith("TEST-")) {
      setError("El token debe comenzar con APP_USR- o TEST-");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const client = initClient(trimmed);
      await client.getMerchantInfo();
      await saveToken(trimmed);
      await registerForPushNotifications();
      router.replace("/(tabs)");
    } catch (err) {
      if (err instanceof MercadoPagoError && err.isUnauthorized) {
        setError("Token invalido. Verifica que sea correcto.");
      } else {
        setError("No se pudo conectar. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.logo}>$</Text>
          <Text style={styles.appName}>CobroYa</Text>
          <Text style={styles.tagline}>Cobra con Mercado Pago{"\n"}en segundos</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Access Token de Mercado Pago"
            placeholder="APP_USR-..."
            value={token}
            onChangeText={(text) => {
              setToken(text);
              setError("");
            }}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            error={error}
          />

          <Button
            title={loading ? "Verificando..." : "Conectar cuenta"}
            onPress={handleLogin}
            loading={loading}
          />

          <Pressable
            style={styles.helpLink}
            onPress={() =>
              Linking.openURL(
                "https://www.mercadopago.com/developers/en/docs/checkout-pro/additional-content/your-integrations/credentials"
              )
            }
          >
            <Text style={styles.helpText}>Como obtener tu access token?</Text>
          </Pressable>
        </View>

        <Text style={styles.disclaimer}>
          Tu token se guarda de forma segura en tu dispositivo y nunca se comparte con terceros.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  hero: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  logo: {
    fontSize: 64,
    fontWeight: "900",
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  form: {
    marginBottom: spacing.lg,
  },
  helpLink: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  helpText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  disclaimer: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
