import { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSearchPayments } from "../../hooks/usePayments";
import { PaymentCard } from "../../components/PaymentCard";
import { EmptyState } from "../../components/EmptyState";
import { colors, spacing, radius } from "../../constants/theme";

const FILTERS = [
  { key: undefined, label: "Todos" },
  { key: "approved", label: "Aprobados" },
  { key: "pending", label: "Pendientes" },
  { key: "rejected", label: "Rechazados" },
  { key: "refunded", label: "Reembolsados" },
] as const;

export default function PaymentsScreen() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [offset, setOffset] = useState(0);

  const { data, isLoading, refetch, isRefetching } = useSearchPayments({
    status: statusFilter,
    sort: "date_created",
    criteria: "desc",
    limit: 30,
    offset,
  });

  const handleRefresh = useCallback(() => {
    setOffset(0);
    refetch();
  }, [refetch]);

  return (
    <View style={styles.container}>
      {/* Filter chips */}
      <View style={styles.filters}>
        {FILTERS.map((filter) => {
          const active = statusFilter === filter.key;
          return (
            <Pressable
              key={filter.label}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => {
                setStatusFilter(filter.key);
                setOffset(0);
              }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={data?.results || []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PaymentCard
            payment={item}
            onPress={() => router.push(`/payment/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <EmptyState icon="⏳" title="Cargando..." message="Buscando pagos" />
          ) : (
            <EmptyState
              icon="🔍"
              title="Sin resultados"
              message={statusFilter ? `No hay pagos con estado "${statusFilter}"` : "No hay pagos aun"}
            />
          )
        }
        ListFooterComponent={
          data && data.paging.total > (offset + 30) ? (
            <Pressable style={styles.loadMore} onPress={() => setOffset((o) => o + 30)}>
              <Text style={styles.loadMoreText}>Cargar mas</Text>
            </Pressable>
          ) : null
        }
      />

      {data && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {data.paging.total} pago{data.paging.total !== 1 ? "s" : ""} encontrado{data.paging.total !== 1 ? "s" : ""}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filters: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: colors.primary,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loadMore: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  loadMoreText: {
    color: colors.primary,
    fontWeight: "600",
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
