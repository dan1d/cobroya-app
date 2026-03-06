import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { removeToken, getStoredCurrency, saveCurrency } from "../lib/auth";
import { Button } from "../components/Button";
import { colors, spacing, radius } from "../constants/theme";

const CURRENCIES = ["ARS", "BRL", "MXN", "CLP", "COP", "PEN", "UYU", "USD"];

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currency, setCurrency] = useState("ARS");

  useEffect(() => {
    getStoredCurrency().then(setCurrency);
  }, []);

  async function handleCurrencyChange(c: string) {
    setCurrency(c);
    await saveCurrency(c);
  }

  function handleLogout() {
    Alert.alert(
      "Cerrar sesion",
      "Se eliminara tu token de acceso de este dispositivo. Podras volver a conectarte en cualquier momento.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesion",
          style: "destructive",
          onPress: async () => {
            await removeToken();
            queryClient.clear();
            router.replace("/login");
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Moneda predeterminada</Text>
      <View style={styles.currencyGrid}>
        {CURRENCIES.map((c) => (
          <Pressable
            key={c}
            style={[styles.currencyChip, currency === c && styles.currencyChipActive]}
            onPress={() => handleCurrencyChange(c)}
          >
            <Text style={[styles.currencyText, currency === c && styles.currencyTextActive]}>
              {c}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Informacion</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          CobroYa es una herramienta open-source que conecta tu cuenta de Mercado Pago para gestionar pagos desde tu celular.
        </Text>
        <Text style={styles.infoText}>
          Tu access token se guarda de forma segura usando el keychain del dispositivo y nunca se envia a servidores de terceros.
        </Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Version</Text>
      <Text style={styles.version}>CobroYa v1.0.0</Text>

      <View style={styles.divider} />

      <Button
        title="Cerrar sesion"
        onPress={handleLogout}
        variant="danger"
        style={{ marginTop: spacing.md }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  currencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  currencyChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  currencyText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  currencyTextActive: {
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  version: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
