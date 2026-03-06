export interface MerchantInfo {
  id: number;
  nickname: string;
  first_name: string;
  last_name: string;
  email: string;
  site_id: string;
  country_id: string;
}

export interface PaymentPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  date_created: string;
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
}

export interface Payment {
  id: number;
  status: string;
  status_detail: string;
  date_created: string;
  date_approved: string | null;
  date_last_updated: string;
  description: string;
  transaction_amount: number;
  currency_id: string;
  payment_method_id: string;
  payment_type_id: string;
  payer: {
    id: number | null;
    email: string;
    first_name: string | null;
    last_name: string | null;
    identification?: {
      type: string;
      number: string;
    };
  };
  additional_info?: {
    items?: Array<{
      title: string;
      quantity: string;
      unit_price: string;
    }>;
  };
  external_reference: string | null;
  notification_url: string | null;
  refunds?: Refund[];
  transaction_details?: {
    net_received_amount: number;
    total_paid_amount: number;
    overpaid_amount: number;
    installment_amount: number;
  };
}

export interface Refund {
  id: number;
  payment_id: number;
  amount: number;
  status: string;
  date_created: string;
}

export interface SearchResult {
  paging: {
    total: number;
    limit: number;
    offset: number;
  };
  results: Payment[];
}

export interface CreatePaymentInput {
  title: string;
  quantity: number;
  currency: string;
  unit_price: number;
  description?: string;
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  notification_url?: string;
}

export interface DashboardStats {
  totalApproved: number;
  totalPending: number;
  totalRejected: number;
  totalAmount: number;
  currency: string;
  recentPayments: Payment[];
  dailyAmounts: { date: string; amount: number }[];
}
