import { View, Text, StyleSheet, Modal, Pressable, Share, Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import QRCode from "react-native-qrcode-svg";
import { colors, spacing, radius } from "../constants/theme";
import { useState } from "react";

interface Props {
  visible: boolean;
  url: string;
  title: string;
  amount?: string;
  onClose: () => void;
}

export function QRModal({ visible, url, title, amount, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await Clipboard.setStringAsync(url);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const message = amount
      ? `Te comparto el link de pago por ${amount}: ${url}`
      : `Link de pago: ${url}`;
    await Share.share({
      message,
      url: Platform.OS === "ios" ? url : undefined,
    });
  }

  async function handleWhatsApp() {
    const message = amount
      ? `Hola! Te comparto el link de pago por ${amount}: ${url}`
      : `Hola! Te comparto el link de pago: ${url}`;
    const waUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    const canOpen = await Linking.canOpenURL(waUrl);
    if (canOpen) {
      await Linking.openURL(waUrl);
    } else {
      // Fallback to web
      await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          {amount && <Text style={styles.amount}>{amount}</Text>}

          <View style={styles.qrContainer}>
            <View style={styles.qrBackground}>
              <QRCode value={url || "https://cobroya.app"} size={220} backgroundColor="#FFFFFF" color="#000000" />
            </View>
          </View>

          <Text style={styles.url} numberOfLines={2}>{url}</Text>

          <View style={styles.actions}>
            <Pressable style={styles.actionBtn} onPress={handleCopy}>
              <Text style={styles.actionIcon}>{copied ? "✓" : "📋"}</Text>
              <Text style={styles.actionLabel}>{copied ? "Copiado!" : "Copiar"}</Text>
            </Pressable>

            <Pressable style={styles.actionBtn} onPress={handleWhatsApp}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionLabel}>WhatsApp</Text>
            </Pressable>

            <Pressable style={styles.actionBtn} onPress={handleShare}>
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={styles.actionLabel}>Compartir</Text>
            </Pressable>
          </View>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cerrar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.textMuted,
    borderRadius: 2,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  amount: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  qrContainer: {
    marginBottom: spacing.md,
  },
  qrBackground: {
    backgroundColor: "#FFFFFF",
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  url: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  actionBtn: {
    alignItems: "center",
    gap: 6,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  closeBtn: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.full,
  },
  closeBtnText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 16,
  },
});
