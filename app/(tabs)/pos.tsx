import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import * as Haptics from "expo-haptics";
import { useCreatePayment } from "../../hooks/usePayments";
import { getStoredCurrency } from "../../lib/auth";
import { QRModal } from "../../components/QRModal";
import { currencySymbol, colors, spacing, radius } from "../../constants/theme";

const { width } = Dimensions.get("window");
const KEY_SIZE = (width - spacing.lg * 2 - spacing.sm * 2) / 3;

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

export default function POSScreen() {
  const [amount, setAmount] = useState("0");
  const [currency, setCurrency] = useState("ARS");
  const [showQR, setShowQR] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const createPayment = useCreatePayment();

  useEffect(() => {
    getStoredCurrency().then(setCurrency);
  }, []);

  function handleKey(key: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (key === "⌫") {
      setAmount((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
      return;
    }

    if (key === "." && amount.includes(".")) return;

    // Limit decimal places to 2
    const dotIndex = amount.indexOf(".");
    if (dotIndex !== -1 && amount.length - dotIndex > 2) return;

    // Max amount limit
    if (amount.replace(".", "").length >= 10) return;

    if (amount === "0" && key !== ".") {
      setAmount(key);
    } else {
      setAmount((prev) => prev + key);
    }
  }

  async function handleCharge() {
    const numAmount = parseFloat(amount);
    if (numAmount <= 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setLoading(true);

    try {
      const result = await createPayment.mutateAsync({
        title: `Cobro CobroYa`,
        unit_price: numAmount,
        quantity: 1,
        currency,
      });
      setPaymentUrl(result.init_point);
      setShowQR(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }

  function handleNewCharge() {
    setAmount("0");
    setShowQR(false);
    setPaymentUrl("");
  }

  const symbol = currencySymbol(currency);
  const numAmount = parseFloat(amount) || 0;

  return (
    <View style={styles.container}>
      {/* Amount display */}
      <View style={styles.display}>
        <Text style={styles.currencyLabel}>{currency}</Text>
        <Text
          style={[styles.amount, amount.length > 8 && styles.amountSmall]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {symbol}
          {numAmount.toLocaleString("es-AR", {
            minimumFractionDigits: amount.includes(".") ? amount.split(".")[1]?.length || 0 : 0,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {KEYS.map((key) => (
          <Pressable
            key={key}
            style={({ pressed }) => [
              styles.key,
              key === "⌫" && styles.keyDelete,
              pressed && styles.keyPressed,
            ]}
            onPress={() => handleKey(key)}
          >
            <Text style={[styles.keyText, key === "⌫" && styles.keyDeleteText]}>
              {key}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Charge button */}
      <Pressable
        style={[styles.chargeBtn, (numAmount <= 0 || loading) && styles.chargeBtnDisabled]}
        onPress={handleCharge}
        disabled={numAmount <= 0 || loading}
      >
        <Text style={styles.chargeBtnText}>
          {loading ? "Generando..." : `Cobrar ${symbol}${numAmount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`}
        </Text>
      </Pressable>

      <QRModal
        visible={showQR}
        url={paymentUrl}
        title="Cobro CobroYa"
        amount={`${symbol}${numAmount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`}
        onClose={handleNewCharge}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  display: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 120,
  },
  currencyLabel: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  amount: {
    color: colors.text,
    fontSize: 56,
    fontWeight: "800",
    letterSpacing: -1,
  },
  amountSmall: {
    fontSize: 40,
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  key: {
    width: KEY_SIZE,
    height: KEY_SIZE * 0.65,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  keyDelete: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger + "44",
  },
  keyPressed: {
    backgroundColor: colors.surfaceLight,
    transform: [{ scale: 0.95 }],
  },
  keyText: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "600",
  },
  keyDeleteText: {
    color: colors.danger,
    fontSize: 24,
  },
  chargeBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: radius.lg,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  chargeBtnDisabled: {
    opacity: 0.4,
  },
  chargeBtnText: {
    color: colors.black,
    fontSize: 20,
    fontWeight: "800",
  },
});
