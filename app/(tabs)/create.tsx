import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useCreatePayment } from "../../hooks/usePayments";
import { getStoredCurrency } from "../../lib/auth";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { QRModal } from "../../components/QRModal";
import { currencySymbol } from "../../constants/theme";
import { colors, spacing, radius } from "../../constants/theme";

export default function CreatePaymentScreen() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("ARS");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showQR, setShowQR] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");

  const createPayment = useCreatePayment();

  useEffect(() => {
    getStoredCurrency().then(setCurrency);
  }, []);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Ingresa un titulo";
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Ingresa un monto valido";
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) newErrors.quantity = "Cantidad invalida";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleCreate() {
    if (!validate()) return;

    try {
      const result = await createPayment.mutateAsync({
        title: title.trim(),
        unit_price: Number(amount),
        quantity: parseInt(quantity, 10),
        currency,
        description: description.trim() || undefined,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPaymentUrl(result.init_point);
      setShowQR(true);
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrors({ submit: "No se pudo crear el pago. Intenta de nuevo." });
    }
  }

  function handleReset() {
    setTitle("");
    setAmount("");
    setQuantity("1");
    setDescription("");
    setErrors({});
    setShowQR(false);
    setPaymentUrl("");
  }

  const symbol = currencySymbol(currency);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Nuevo cobro</Text>
        <Text style={styles.subtitle}>Crea un link de pago para compartir</Text>

        <Input
          label="Titulo"
          placeholder="Ej: Curso de Python"
          value={title}
          onChangeText={(t) => { setTitle(t); setErrors((e) => ({ ...e, title: "" })); }}
          error={errors.title}
        />

        <Input
          label={`Precio unitario (${symbol})`}
          placeholder="5000"
          value={amount}
          onChangeText={(t) => { setAmount(t); setErrors((e) => ({ ...e, amount: "" })); }}
          keyboardType="decimal-pad"
          error={errors.amount}
        />

        <Input
          label="Cantidad"
          placeholder="1"
          value={quantity}
          onChangeText={(t) => { setQuantity(t); setErrors((e) => ({ ...e, quantity: "" })); }}
          keyboardType="number-pad"
          error={errors.quantity}
        />

        <Input
          label="Descripcion (opcional)"
          placeholder="Detalles adicionales..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: "top" }}
        />

        {/* Currency selector */}
        <View style={styles.currencyRow}>
          <Text style={styles.currencyLabel}>Moneda:</Text>
          {["ARS", "BRL", "MXN", "CLP", "COP", "USD"].map((c) => (
            <View
              key={c}
              style={[styles.currencyChip, currency === c && styles.currencyChipActive]}
            >
              <Text
                style={[styles.currencyText, currency === c && styles.currencyTextActive]}
                onPress={() => setCurrency(c)}
              >
                {c}
              </Text>
            </View>
          ))}
        </View>

        {/* Amount preview */}
        {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Total:</Text>
            <Text style={styles.previewAmount}>
              {symbol}{(Number(amount) * (parseInt(quantity, 10) || 1)).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        )}

        {errors.submit && <Text style={styles.submitError}>{errors.submit}</Text>}

        <Button
          title="Generar link de pago"
          onPress={handleCreate}
          loading={createPayment.isPending}
          style={{ marginTop: spacing.md }}
        />

        {showQR && (
          <Button
            title="Crear otro pago"
            onPress={handleReset}
            variant="secondary"
            style={{ marginTop: spacing.sm }}
          />
        )}
      </ScrollView>

      <QRModal
        visible={showQR}
        url={paymentUrl}
        title={title}
        amount={`${symbol}${(Number(amount) * (parseInt(quantity, 10) || 1)).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`}
        onClose={() => setShowQR(false)}
      />
    </KeyboardAvoidingView>
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
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    marginBottom: spacing.lg,
  },
  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  currencyLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  currencyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    fontSize: 13,
    fontWeight: "600",
  },
  currencyTextActive: {
    color: colors.primary,
  },
  preview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary + "44",
    marginBottom: spacing.md,
  },
  previewLabel: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  previewAmount: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "800",
  },
  submitError: {
    color: colors.danger,
    fontSize: 14,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
});
