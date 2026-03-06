import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useMerchant } from "../../hooks/useMerchant";
import { EmptyState } from "../../components/EmptyState";
import { Button } from "../../components/Button";
import { colors, spacing, radius } from "../../constants/theme";

function InfoRow({ label, value }: { label: string; value: string | number | undefined }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{String(value)}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useMerchant();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
      }
    >
      {isLoading ? (
        <EmptyState icon="👤" title="Cargando..." message="Obteniendo info de tu cuenta" />
      ) : !data ? (
        <EmptyState icon="❌" title="Error" message="No se pudo cargar tu perfil" />
      ) : (
        <>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(data.first_name?.[0] || data.nickname?.[0] || "?").toUpperCase()}
            </Text>
          </View>

          <Text style={styles.name}>
            {data.first_name && data.last_name
              ? `${data.first_name} ${data.last_name}`
              : data.nickname}
          </Text>
          <Text style={styles.nickname}>@{data.nickname}</Text>

          <View style={styles.card}>
            <InfoRow label="ID" value={data.id} />
            <InfoRow label="Email" value={data.email} />
            <InfoRow label="Sitio" value={data.site_id} />
            <InfoRow label="Pais" value={data.country_id} />
          </View>

          <Button
            title="Configuracion"
            onPress={() => router.push("/settings")}
            variant="secondary"
            style={{ marginTop: spacing.lg }}
          />
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
    alignItems: "center",
    paddingBottom: spacing.xxl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.black,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  nickname: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  card: {
    width: "100%",
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
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  rowValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
});
