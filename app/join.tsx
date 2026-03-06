import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { decodeInvite, decryptToken, setRole, addTeamMember } from "../lib/team";
import { saveToken } from "../lib/auth";
import { initClient } from "../lib/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { colors, spacing, radius } from "../constants/theme";

export default function JoinScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState(params.code || "");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"code" | "pin">("code");
  const [invite, setInvite] = useState<{ token: string; role: any; businessName: string } | null>(null);

  function handleDecodeInvite() {
    if (!code.trim()) {
      Alert.alert("Error", "Pega el codigo de invitacion");
      return;
    }

    try {
      const decoded = decodeInvite(code.trim());
      setInvite(decoded);
      setStep("pin");
    } catch {
      Alert.alert("Error", "Codigo de invitacion invalido");
    }
  }

  async function handleJoin() {
    if (!pin || pin.length < 4) {
      Alert.alert("Error", "Ingresa el PIN de 4+ digitos");
      return;
    }
    if (!invite) return;

    setLoading(true);

    try {
      const token = decryptToken(invite.token, pin);

      // Validate the decrypted token by calling the API
      if (!token.startsWith("APP_USR-") && !token.startsWith("TEST-")) {
        throw new Error("PIN incorrecto");
      }

      const client = initClient(token);
      await client.getMerchantInfo(); // Validates token works

      await saveToken(token);
      await setRole(invite.role);
      await addTeamMember("Yo", invite.role);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Bienvenido!",
        `Te uniste a ${invite.businessName} como ${invite.role === "cashier" ? "cajero" : "lector"}`,
        [{ text: "OK", onPress: () => router.replace("/(tabs)") }]
      );
    } catch (err) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "PIN incorrecto o invitacion invalida. Pedi el PIN correcto al dueño.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Unirse a equipo</Text>
      <Text style={styles.subtitle}>
        Pedi el codigo de invitacion y PIN al dueño del negocio
      </Text>

      {step === "code" ? (
        <View style={styles.card}>
          <Input
            label="Codigo de invitacion"
            placeholder="Pega el codigo aqui..."
            value={code}
            onChangeText={setCode}
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, textAlignVertical: "top" }}
          />
          <Button title="Siguiente" onPress={handleDecodeInvite} />
        </View>
      ) : (
        <View style={styles.card}>
          {invite && (
            <View style={styles.inviteInfo}>
              <Text style={styles.businessName}>{invite.businessName}</Text>
              <Text style={styles.roleText}>
                Rol: {invite.role === "cashier" ? "Cajero" : "Solo lectura"}
              </Text>
            </View>
          )}

          <Input
            label="PIN de seguridad"
            placeholder="1234"
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            maxLength={8}
          />

          <Button title="Unirme" onPress={handleJoin} loading={loading} />
          <Button title="Atras" onPress={() => setStep("code")} variant="ghost" style={{ marginTop: spacing.sm }} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  heading: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: 4 },
  subtitle: { color: colors.textSecondary, fontSize: 15, marginBottom: spacing.lg, lineHeight: 22 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inviteInfo: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  businessName: { color: colors.primary, fontSize: 20, fontWeight: "800", marginBottom: 4 },
  roleText: { color: colors.textSecondary, fontSize: 14 },
});
