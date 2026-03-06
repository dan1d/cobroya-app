import { useQuery } from "@tanstack/react-query";
import { getClient } from "../lib/api";

export function useMerchant() {
  return useQuery({
    queryKey: ["merchant"],
    queryFn: () => getClient().getMerchantInfo(),
    staleTime: 300_000, // 5 minutes
  });
}
