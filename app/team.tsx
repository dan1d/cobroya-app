import { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Pressable, Share } from "react-native";
import { useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import QRCode from "react-native-qrcode-svg";
import {
  generateInviteCode,
  getTeamMembers,
  removeTeamMember,
  TeamMember,
  TeamRole,
  ROLE_PERMISSIONS,
} from "../lib/team";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { EmptyState } from "../components/EmptyState";
import { colors, spacing, radius } from "../constants/theme";

const ROLE_LABELS: Record<TeamRole, string> = {
  owner: "Dueño",
  cashier: "Cajero",
  viewer: "Solo lectura",
};

const ROLE_DESCRIPTIONS: Record<TeamRole, string> = {
  owner: "Acceso completo",
  cashier: "Puede cobrar y ver pagos",
  viewer: "Solo puede ver pagos y dashboard",
};

export default function TeamScreen() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteRole, setInviteRole] = useState<TeamRole>("cashier");
  const [pin, setPin] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteQR, setInviteQR] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadMembers();
    }, [])
  );

  async function loadMembers() {
    const m = await getTeamMembers();
    setMembers(m);
  }

  async function handleGenerateInvite() {
    if (!pin || pin.length < 4) {
      Alert.alert("Error", "El PIN debe tener al menos 4 digitos");
      return;
    }
    if (!businessName.trim()) {
      Alert.alert("Error", "Ingresa el nombre del negocio");
      return;
    }

    try {
      const code = await generateInviteCode(inviteRole, businessName.trim(), pin);
      setInviteCode(code);
      setInviteQR(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Error", "No se pudo generar la invitacion");
    }
  }

  async function handleShareInvite() {
    const deepLink = `cobroya://join?code=${encodeURIComponent(inviteCode)}`;
    const message = `Unite a ${businessName} en CobroYa!\n\nCodigo: ${inviteCode.slice(0, 20)}...\nPIN: ${pin}\n\nDescarga CobroYa y usa "Unirse a equipo"`;
    await Share.share({ message });
  }

  function handleRemoveMember(member: TeamMember) {
    Alert.alert("Eliminar miembro", `Eliminar a ${member.name} del equipo?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await removeTeamMember(member.id);
          loadMembers();
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Equipo</Text>
      <Text style={styles.subtitle}>
        Invita a tu equipo a cobrar sin compartir tu contraseña de Mercado Pago
      </Text>

      {/* Members list */}
      {members.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Miembros ({members.length})</Text>
          {members.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>
                  {member.name[0]?.toUpperCase() || "?"}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{ROLE_LABELS[member.role]}</Text>
              </View>
              <Pressable style={styles.memberRemove} onPress={() => handleRemoveMember(member)}>
                <Text style={styles.memberRemoveText}>Eliminar</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          icon="👥"
          title="Sin miembros"
          message="Invita a empleados para que cobren por vos"
        />
      )}

      {/* Invite section */}
      {!showInvite ? (
        <Button
          title="Generar invitacion"
          onPress={() => setShowInvite(true)}
          style={{ marginTop: spacing.lg }}
        />
      ) : !inviteQR ? (
        <View style={styles.inviteForm}>
          <Text style={styles.sectionTitle}>Nueva invitacion</Text>

          <Input
            label="Nombre del negocio"
            placeholder="Mi Tienda"
            value={businessName}
            onChangeText={setBusinessName}
          />

          <Text style={styles.roleLabel}>Rol</Text>
          <View style={styles.roleGrid}>
            {(["cashier", "viewer"] as TeamRole[]).map((role) => (
              <Pressable
                key={role}
                style={[styles.roleCard, inviteRole === role && styles.roleCardActive]}
                onPress={() => setInviteRole(role)}
              >
                <Text style={[styles.roleCardTitle, inviteRole === role && styles.roleCardTitleActive]}>
                  {ROLE_LABELS[role]}
                </Text>
                <Text style={styles.roleCardDesc}>{ROLE_DESCRIPTIONS[role]}</Text>
              </Pressable>
            ))}
          </View>

          <Input
            label="PIN de seguridad (compartilo por separado)"
            placeholder="1234"
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            maxLength={8}
          />

          <Button title="Generar codigo" onPress={handleGenerateInvite} style={{ marginTop: spacing.sm }} />
          <Button title="Cancelar" onPress={() => setShowInvite(false)} variant="ghost" style={{ marginTop: spacing.xs }} />
        </View>
      ) : (
        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>Invitacion lista!</Text>
          <Text style={styles.qrHint}>
            El miembro escanea este QR desde CobroYa y pone el PIN: <Text style={styles.pinHighlight}>{pin}</Text>
          </Text>

          <View style={styles.qrContainer}>
            <View style={styles.qrBackground}>
              <QRCode value={inviteCode} size={200} backgroundColor="#FFFFFF" color="#000000" />
            </View>
          </View>

          <Button title="Compartir invitacion" onPress={handleShareInvite} style={{ marginTop: spacing.md }} />
          <Button
            title="Nueva invitacion"
            onPress={() => {
              setInviteQR(false);
              setInviteCode("");
              setPin("");
            }}
            variant="secondary"
            style={{ marginTop: spacing.sm }}
          />
        </View>
      )}

      {/* Permissions info */}
      <View style={styles.permissionsCard}>
        <Text style={styles.permTitle}>Permisos por rol</Text>
        <View style={styles.permRow}>
          <Text style={styles.permLabel}>Cobrar</Text>
          <Text style={styles.permValue}>Cajero ✓ | Lector ✗</Text>
        </View>
        <View style={styles.permRow}>
          <Text style={styles.permLabel}>Ver pagos</Text>
          <Text style={styles.permValue}>Cajero ✓ | Lector ✓</Text>
        </View>
        <View style={styles.permRow}>
          <Text style={styles.permLabel}>Reembolsar</Text>
          <Text style={styles.permValue}>Solo dueño</Text>
        </View>
        <View style={styles.permRow}>
          <Text style={styles.permLabel}>Dashboard</Text>
          <Text style={styles.permValue}>Dueño ✓ | Lector ✓</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  heading: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: 4 },
  subtitle: { color: colors.textSecondary, fontSize: 15, marginBottom: spacing.lg, lineHeight: 22 },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: spacing.md },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  memberAvatarText: { color: colors.black, fontSize: 18, fontWeight: "800" },
  memberInfo: { flex: 1 },
  memberName: { color: colors.text, fontSize: 16, fontWeight: "600" },
  memberRole: { color: colors.textSecondary, fontSize: 13 },
  memberRemove: { paddingVertical: 6, paddingHorizontal: spacing.sm },
  memberRemoveText: { color: colors.danger, fontSize: 13, fontWeight: "600" },
  inviteForm: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleLabel: { color: colors.textSecondary, fontSize: 14, fontWeight: "600", marginBottom: 6 },
  roleGrid: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  roleCard: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  roleCardTitle: { color: colors.text, fontSize: 15, fontWeight: "700", marginBottom: 4 },
  roleCardTitleActive: { color: colors.primary },
  roleCardDesc: { color: colors.textMuted, fontSize: 12 },
  qrSection: { marginTop: spacing.lg, alignItems: "center" },
  qrHint: { color: colors.textSecondary, fontSize: 14, textAlign: "center", marginBottom: spacing.lg, lineHeight: 20 },
  pinHighlight: { color: colors.primary, fontWeight: "800", fontSize: 18 },
  qrContainer: { marginBottom: spacing.md },
  qrBackground: { backgroundColor: "#FFFFFF", padding: spacing.md, borderRadius: radius.lg },
  permissionsCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  permTitle: { color: colors.text, fontSize: 14, fontWeight: "700", marginBottom: spacing.sm },
  permRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  permLabel: { color: colors.textSecondary, fontSize: 13 },
  permValue: { color: colors.textMuted, fontSize: 13 },
});
