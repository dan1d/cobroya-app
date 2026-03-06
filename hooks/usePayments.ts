import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClient } from "../lib/api";
import type { CreatePaymentInput, DashboardStats, Payment } from "../lib/types";
import { format, subDays, startOfDay } from "date-fns";

export function useSearchPayments(params?: {
  status?: string;
  limit?: number;
  offset?: number;
  sort?: string;
  criteria?: string;
}) {
  return useQuery({
    queryKey: ["payments", "search", params],
    queryFn: () => getClient().searchPayments(params),
    staleTime: 30_000,
  });
}

export function usePayment(paymentId: string | null) {
  return useQuery({
    queryKey: ["payment", paymentId],
    queryFn: () => getClient().getPayment(paymentId!),
    enabled: !!paymentId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePaymentInput) => getClient().createPaymentPreference(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, amount }: { paymentId: string; amount?: number }) =>
      getClient().createRefund(paymentId, amount),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payment", variables.paymentId] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async (): Promise<DashboardStats> => {
      const client = getClient();
      const now = new Date();
      const thirtyDaysAgo = subDays(now, 30);

      const [approved, pending, rejected, recent] = await Promise.all([
        client.searchPayments({
          status: "approved",
          begin_date: thirtyDaysAgo.toISOString(),
          end_date: now.toISOString(),
          limit: 100,
        }),
        client.searchPayments({
          status: "pending",
          limit: 50,
        }),
        client.searchPayments({
          status: "rejected",
          begin_date: thirtyDaysAgo.toISOString(),
          end_date: now.toISOString(),
          limit: 50,
        }),
        client.searchPayments({
          sort: "date_created",
          criteria: "desc",
          limit: 10,
        }),
      ]);

      const totalAmount = approved.results.reduce((sum, p) => sum + p.transaction_amount, 0);
      const currency = approved.results[0]?.currency_id || "ARS";

      // Build daily amounts for chart
      const dailyMap = new Map<string, number>();
      for (let i = 6; i >= 0; i--) {
        const day = format(subDays(now, i), "dd/MM");
        dailyMap.set(day, 0);
      }
      for (const payment of approved.results) {
        const day = format(new Date(payment.date_created), "dd/MM");
        if (dailyMap.has(day)) {
          dailyMap.set(day, (dailyMap.get(day) || 0) + payment.transaction_amount);
        }
      }

      return {
        totalApproved: approved.paging.total,
        totalPending: pending.paging.total,
        totalRejected: rejected.paging.total,
        totalAmount,
        currency,
        recentPayments: recent.results,
        dailyAmounts: Array.from(dailyMap.entries()).map(([date, amount]) => ({ date, amount })),
      };
    },
    staleTime: 60_000,
  });
}
