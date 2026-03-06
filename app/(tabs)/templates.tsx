import { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Alert, Modal } from "react-native";
import { useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { getTemplates, saveTemplate, deleteTemplate, PaymentTemplate } from "../../lib/templates";
import { useCreatePayment } from "../../hooks/usePayments";
import { getStoredCurrency } from "../../lib/auth";
import { QRModal } from "../../components/QRModal";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { EmptyState } from "../../components/EmptyState";
import { colors, spacing, radius, currencySymbol } from "../../constants/theme";

const ICONS = ["🛒", "💇", "🧘", "🍕", "📚", "💻", "🎨", "🔧", "🏋️", "☕", "🎵", "📦"];

export default function TemplatesScreen() {
  const [templates, setTemplates] = useState<PaymentTemplate[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [activeTemplate, setActiveTemplate] = useState<PaymentTemplate | null>(null);
  const [currency, setCurrency] = useState("ARS");

  // Form state
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🛒");

  const createPayment = useCreatePayment();

  useFocusEffect(
    useCallback(() => {
      loadTemplates();
      getStoredCurrency().then(setCurrency);
    }, [])
  );

  async function loadTemplates() {
    const t = await getTemplates();
    setTemplates(t);
  }

  async function handleCreate() {
    if (!name.trim()) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    await saveTemplate({
      name: name.trim(),
      amount: numAmount,
      currency,
      description: description.trim() || undefined,
      icon,
    });

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowCreate(false);
    resetForm();
    loadTemplates();
  }

  function resetForm() {
    setName("");
    setAmount("");
    setDescription("");
    setIcon("🛒");
  }

  async function handleUseTemplate(template: PaymentTemplate) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveTemplate(template);

    try {
      const result = await createPayment.mutateAsync({
        title: template.name,
        unit_price: template.amount,
        quantity: 1,
        currency: template.currency,
        description: template.description,
      });
      setPaymentUrl(result.init_point);
      setShowQR(true);
    } catch {
      Alert.alert("Error", "No se pudo generar el link de pago");
    }
  }

  function handleDelete(template: PaymentTemplate) {
    Alert.alert("Eliminar plantilla", `Eliminar "${template.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteTemplate(template.id);
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          loadTemplates();
        },
      },
    ]);
  }

  const symbol = currencySymbol(currency);

  return (
    <View style={styles.container}>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => handleUseTemplate(item)}
            onLongPress={() => handleDelete(item)}
          >
            <Text style={styles.cardIcon}>{item.icon || "🛒"}</Text>
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.cardAmount}>
              {currencySymbol(item.currency)}{item.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </Text>
            {item.description && (
              <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
            )}
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="📋"
            title="Sin plantillas"
            message={'Crea plantillas para cobrar con un solo tap.\nEj: "Clase de yoga $5000"'}
          />
        }
      />

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => setShowCreate(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      {/* Create modal */}
      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowCreate(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Nueva plantilla</Text>

            <Input label="Nombre" placeholder='Ej: Corte de pelo' value={name} onChangeText={setName} />
            <Input label={`Monto (${symbol})`} placeholder="3000" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <Input label="Descripcion (opcional)" placeholder="Detalles..." value={description} onChangeText={setDescription} />

            <Text style={styles.iconLabel}>Icono</Text>
            <View style={styles.iconGrid}>
              {ICONS.map((i) => (
                <Pressable
                  key={i}
                  style={[styles.iconBtn, icon === i && styles.iconBtnActive]}
                  onPress={() => setIcon(i)}
                >
                  <Text style={styles.iconBtnText}>{i}</Text>
                </Pressable>
              ))}
            </View>

            <Button title="Crear plantilla" onPress={handleCreate} style={{ marginTop: spacing.md }} />
          </Pressable>
        </Pressable>
      </Modal>

      {/* QR Modal */}
      <QRModal
        visible={showQR}
        url={paymentUrl}
        title={activeTemplate?.name || ""}
        amount={activeTemplate ? `${currencySymbol(activeTemplate.currency)}${activeTemplate.amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}` : ""}
        onClose={() => { setShowQR(false); setActiveTemplate(null); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: 100 },
  row: { gap: spacing.sm, marginBottom: spacing.sm },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  cardPressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  cardIcon: { fontSize: 36, marginBottom: spacing.sm },
  cardName: { color: colors.text, fontSize: 15, fontWeight: "700", marginBottom: 4, textAlign: "center" },
  cardAmount: { color: colors.primary, fontSize: 18, fontWeight: "800" },
  cardDesc: { color: colors.textMuted, fontSize: 12, marginTop: 4, textAlign: "center" },
  fab: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabPressed: { transform: [{ scale: 0.9 }] },
  fabText: { color: colors.black, fontSize: 32, fontWeight: "700", marginTop: -2 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  handle: { width: 40, height: 4, backgroundColor: colors.textMuted, borderRadius: 2, alignSelf: "center", marginBottom: spacing.lg },
  sheetTitle: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: spacing.lg },
  iconLabel: { color: colors.textSecondary, fontSize: 14, fontWeight: "600", marginBottom: 6 },
  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.sm },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBtnActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  iconBtnText: { fontSize: 22 },
});
