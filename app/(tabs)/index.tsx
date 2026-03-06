import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import { useDashboard } from "../../hooks/usePayments";
import { StatCard } from "../../components/StatCard";
import { PaymentCard } from "../../components/PaymentCard";
import { EmptyState } from "../../components/EmptyState";
import { colors, spacing, radius, currencySymbol } from "../../constants/theme";

const screenWidth = Dimensions.get("window").width - spacing.lg * 2;

export default function DashboardScreen() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useDashboard();

  const symbol = currencySymbol(data?.currency || "ARS");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
    >
      {isLoading && !data ? (
        <EmptyState icon="📊" title="Cargando..." message="Obteniendo datos de tu cuenta" />
      ) : !data ? (
        <EmptyState icon="❌" title="Error" message="No se pudieron cargar los datos" />
      ) : (
        <>
          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatCard
              label="Cobrado (30d)"
              value={`${symbol}${data.totalAmount.toLocaleString("es-AR")}`}
              color={colors.primary}
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              label="Aprobados"
              value={String(data.totalApproved)}
              color={colors.statusApproved}
              subtitle="ultimos 30 dias"
            />
            <View style={{ width: spacing.sm }} />
            <StatCard
              label="Pendientes"
              value={String(data.totalPending)}
              color={colors.statusPending}
            />
            <View style={{ width: spacing.sm }} />
            <StatCard
              label="Rechazados"
              value={String(data.totalRejected)}
              color={colors.statusRejected}
              subtitle="ultimos 30 dias"
            />
          </View>

          {/* Chart */}
          {data.dailyAmounts.length > 0 && data.dailyAmounts.some((d) => d.amount > 0) && (
            <View style={styles.chartContainer}>
              <Text style={styles.sectionTitle}>Ingresos (7 dias)</Text>
              <LineChart
                data={{
                  labels: data.dailyAmounts.map((d) => d.date),
                  datasets: [{ data: data.dailyAmounts.map((d) => d.amount || 0) }],
                }}
                width={screenWidth}
                height={200}
                yAxisLabel={symbol}
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: colors.surface,
                  backgroundGradientFrom: colors.surface,
                  backgroundGradientTo: colors.surface,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 214, 143, ${opacity})`,
                  labelColor: () => colors.textSecondary,
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: colors.primary,
                  },
                  propsForBackgroundLines: {
                    stroke: colors.border,
                    strokeDasharray: "",
                  },
                }}
                bezier
                style={styles.chart}
              />
            </View>
          )}

          {/* Recent payments */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ultimos pagos</Text>
              <Pressable onPress={() => router.push("/(tabs)/payments")}>
                <Text style={styles.seeAll}>Ver todos</Text>
              </Pressable>
            </View>

            {data.recentPayments.length === 0 ? (
              <EmptyState
                icon="💸"
                title="Sin pagos aun"
                message="Crea tu primer link de pago para empezar a cobrar"
              />
            ) : (
              data.recentPayments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onPress={() => router.push(`/payment/${payment.id}`)}
                />
              ))
            )}
          </View>
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
  statsRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  chartContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  chart: {
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  seeAll: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
});
