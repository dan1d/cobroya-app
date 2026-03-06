import { View, Text, StyleSheet, Pressable } from "react-native";
import { format } from "date-fns";
import { colors, spacing, radius, statusColor, statusLabel, currencySymbol } from "../constants/theme";
import type { Payment } from "../lib/types";

interface Props {
  payment: Payment;
  onPress?: () => void;
}

export function PaymentCard({ payment, onPress }: Props) {
  const color = statusColor(payment.status);
  const symbol = currencySymbol(payment.currency_id);
  const date = format(new Date(payment.date_created), "dd/MM/yyyy HH:mm");

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.description} numberOfLines={1}>
            {payment.description || `Pago #${payment.id}`}
          </Text>
          <Text style={styles.date}>{date}</Text>
          <View style={[styles.badge, { backgroundColor: color + "22" }]}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.badgeText, { color }]}>
              {statusLabel(payment.status)}
            </Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>
            {symbol}{payment.transaction_amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.paymentMethod}>
            {payment.payment_method_id || payment.payment_type_id}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  left: {
    flex: 1,
    marginRight: spacing.md,
  },
  right: {
    alignItems: "flex-end",
  },
  description: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  date: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  amount: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  paymentMethod: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});
