import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Share, RefreshControl } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { format } from "date-fns";
import * as Haptics from "expo-haptics";
import { usePayment, useRefund } from "../../hooks/usePayments";
import { EmptyState } from "../../components/EmptyState";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { colors, spacing, radius, statusColor, statusLabel, currencySymbol } from "../../constants/theme";

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} selectable>{String(value)}</Text>
    </View>
  );
}

export default function PaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: payment, isLoading, refetch, isRefetching } = usePayment(id || null);
  const refundMutation = useRefund();
  const [showRefund, setShowRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");

  if (!id) return <EmptyState icon="❌" title="Error" message="ID de pago no encontrado" />;

  async function handleFullRefund() {
    Alert.alert(
      "Reembolso total",
      "Estas seguro de reembolsar el pago completo? Esta accion no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Reembolsar",
          style: "destructive",
          onPress: async () => {
            try {
              await refundMutation.mutateAsync({ paymentId: id });
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Listo", "Reembolso procesado exitosamente");
            } catch {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert("Error", "No se pudo procesar el reembolso");
            }
          },
        },
      ]
    );
  }

  async function handlePartialRefund() {
    const amt = Number(refundAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert("Error", "Ingresa un monto valido");
      return;
    }
    if (payment && amt >= payment.transaction_amount) {
      Alert.alert("Error", "El monto parcial debe ser menor al total");
      return;
    }

    try {
      await refundMutation.mutateAsync({ paymentId: id, amount: amt });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Listo", `Reembolso de ${symbol}${amt} procesado`);
      setShowRefund(false);
      setRefundAmount("");
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "No se pudo procesar el reembolso");
    }
  }

  const symbol = currencySymbol(payment?.currency_id || "ARS");
  const sColor = statusColor(payment?.status || "");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
      }
    >
      {isLoading ? (
        <EmptyState icon="⏳" title="Cargando..." message="Obteniendo detalle del pago" />
      ) : !payment ? (
        <EmptyState icon="❌" title="Error" message="No se encontro el pago" />
      ) : (
        <>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.amount}>
              {symbol}{payment.transaction_amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </Text>
            <View style={[styles.badge, { backgroundColor: sColor + "22" }]}>
              <View style={[styles.dot, { backgroundColor: sColor }]} />
              <Text style={[styles.badgeText, { color: sColor }]}>
                {statusLabel(payment.status)}
              </Text>
            </View>
          </View>

          {/* Details card */}
          <View style={styles.card}>
            <DetailRow label="ID" value={payment.id} />
            <DetailRow label="Descripcion" value={payment.description} />
            <DetailRow label="Metodo" value={payment.payment_method_id} />
            <DetailRow label="Tipo" value={payment.payment_type_id} />
            <DetailRow label="Moneda" value={payment.currency_id} />
            <DetailRow
              label="Creado"
              value={format(new Date(payment.date_created), "dd/MM/yyyy HH:mm")}
            />
            {payment.date_approved && (
              <DetailRow
                label="Aprobado"
                value={format(new Date(payment.date_approved), "dd/MM/yyyy HH:mm")}
              />
            )}
            <DetailRow label="Estado detalle" value={payment.status_detail} />
            <DetailRow label="Ref. externa" value={payment.external_reference} />
          </View>

          {/* Payer info */}
          {payment.payer && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pagador</Text>
              <View style={styles.card}>
                <DetailRow label="Email" value={payment.payer.email} />
                <DetailRow
                  label="Nombre"
                  value={
                    payment.payer.first_name && payment.payer.last_name
                      ? `${payment.payer.first_name} ${payment.payer.last_name}`
                      : null
                  }
                />
                <DetailRow label="ID" value={payment.payer.id} />
                {payment.payer.identification && (
                  <DetailRow
                    label={payment.payer.identification.type}
                    value={payment.payer.identification.number}
                  />
                )}
              </View>
            </View>
          )}

          {/* Transaction details */}
          {payment.transaction_details && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detalle de transaccion</Text>
              <View style={styles.card}>
                <DetailRow
                  label="Neto recibido"
                  value={`${symbol}${payment.transaction_details.net_received_amount}`}
                />
                <DetailRow
                  label="Total pagado"
                  value={`${symbol}${payment.transaction_details.total_paid_amount}`}
                />
                <DetailRow
                  label="Cuota"
                  value={`${symbol}${payment.transaction_details.installment_amount}`}
                />
              </View>
            </View>
          )}

          {/* Refunds */}
          {payment.refunds && payment.refunds.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reembolsos</Text>
              {payment.refunds.map((refund) => (
                <View key={refund.id} style={styles.refundCard}>
                  <Text style={styles.refundAmount}>
                    {symbol}{refund.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.refundDate}>
                    {format(new Date(refund.date_created), "dd/MM/yyyy HH:mm")} - {refund.status}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          {payment.status === "approved" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Acciones</Text>

              <Button
                title="Reembolso total"
                onPress={handleFullRefund}
                variant="danger"
                loading={refundMutation.isPending}
              />

              <Button
                title={showRefund ? "Cancelar" : "Reembolso parcial"}
                onPress={() => setShowRefund(!showRefund)}
                variant="secondary"
                style={{ marginTop: spacing.sm }}
              />

              {showRefund && (
                <View style={styles.refundForm}>
                  <Input
                    label={`Monto a reembolsar (${symbol})`}
                    placeholder="500"
                    value={refundAmount}
                    onChangeText={setRefundAmount}
                    keyboardType="decimal-pad"
                  />
                  <Button
                    title="Procesar reembolso parcial"
                    onPress={handlePartialRefund}
                    loading={refundMutation.isPending}
                  />
                </View>
              )}

              <Button
                title="Compartir detalle"
                onPress={() =>
                  Share.share({
                    message: `Pago #${payment.id}\nMonto: ${symbol}${payment.transaction_amount}\nEstado: ${statusLabel(payment.status)}\nFecha: ${format(new Date(payment.date_created), "dd/MM/yyyy HH:mm")}`,
                  })
                }
                variant="ghost"
                style={{ marginTop: spacing.sm }}
              />
            </View>
          )}
        </>
      )}
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
  header: {
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
  },
  amount: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  rowValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  refundCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  refundAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.statusRefunded,
  },
  refundDate: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  refundForm: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
