import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useCreatePayment } from "../hooks/usePayments";
import { getStoredCurrency } from "../lib/auth";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { QRModal } from "../components/QRModal";
import { currencySymbol } from "../constants/theme";
import { colors, spacing } from "../constants/theme";

export default function CreateModalScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ARS");
  const [showQR, setShowQR] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [error, setError] = useState("");

  const createPayment = useCreatePayment();

  useEffect(() => {
    getStoredCurrency().then(setCurrency);
  }, []);

  async function handleCreate() {
    if (!title.trim()) { setError("Ingresa un titulo"); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError("Monto invalido"); return; }

    setError("");
    try {
      const result = await createPayment.mutateAsync({
        title: title.trim(),
        unit_price: Number(amount),
        quantity: 1,
        currency,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPaymentUrl(result.init_point);
      setShowQR(true);
    } catch {
      setError("Error al crear el pago");
    }
  }

  const symbol = currencySymbol(currency);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input label="Titulo" placeholder="Ej: Servicio freelance" value={title} onChangeText={(t) => { setTitle(t); setError(""); }} />
        <Input label={`Monto (${symbol})`} placeholder="5000" value={amount} onChangeText={(t) => { setAmount(t); setError(""); }} keyboardType="decimal-pad" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Crear link de pago" onPress={handleCreate} loading={createPayment.isPending} />
      </ScrollView>

      <QRModal
        visible={showQR}
        url={paymentUrl}
        title={title}
        amount={`${symbol}${Number(amount || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`}
        onClose={() => { setShowQR(false); router.back(); }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  error: { color: colors.danger, fontSize: 14, marginBottom: spacing.sm, textAlign: "center" },
});
