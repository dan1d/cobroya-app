import { Payment, PaymentPreference, SearchResult, MerchantInfo, CreatePaymentInput, Refund } from "./types";

const BASE_URL = "https://api.mercadopago.com";

class MercadoPagoAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new MercadoPagoError(res.status, body);
    }

    return res.json();
  }

  async getMerchantInfo(): Promise<MerchantInfo> {
    return this.request<MerchantInfo>("/users/me");
  }

  async createPaymentPreference(input: CreatePaymentInput): Promise<PaymentPreference> {
    const body: Record<string, unknown> = {
      items: [
        {
          title: input.title,
          quantity: input.quantity,
          currency_id: input.currency,
          unit_price: input.unit_price,
          ...(input.description ? { description: input.description } : {}),
        },
      ],
    };

    if (input.back_urls) {
      body.back_urls = input.back_urls;
      body.auto_return = "approved";
    }
    if (input.notification_url) {
      body.notification_url = input.notification_url;
    }

    return this.request<PaymentPreference>("/checkout/preferences", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async getPayment(paymentId: string): Promise<Payment> {
    if (!/^\d+$/.test(paymentId)) {
      throw new Error("Invalid payment ID");
    }
    return this.request<Payment>(`/v1/payments/${paymentId}`);
  }

  async searchPayments(params?: {
    status?: string;
    sort?: string;
    criteria?: string;
    limit?: number;
    offset?: number;
    begin_date?: string;
    end_date?: string;
    external_reference?: string;
  }): Promise<SearchResult> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      });
    }
    const qs = searchParams.toString();
    return this.request<SearchResult>(`/v1/payments/search${qs ? `?${qs}` : ""}`);
  }

  async createRefund(paymentId: string, amount?: number): Promise<Refund> {
    if (!/^\d+$/.test(paymentId)) {
      throw new Error("Invalid payment ID");
    }
    return this.request<Refund>(`/v1/payments/${paymentId}/refunds`, {
      method: "POST",
      body: JSON.stringify(amount ? { amount } : {}),
    });
  }
}

export class MercadoPagoError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(`Mercado Pago error (${status})`);
    this.status = status;
    this.body = body;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
  get isNotFound() {
    return this.status === 404;
  }
  get isRateLimited() {
    return this.status === 429;
  }
}

let _client: MercadoPagoAPI | null = null;

export function initClient(token: string): MercadoPagoAPI {
  _client = new MercadoPagoAPI(token);
  return _client;
}

export function getClient(): MercadoPagoAPI {
  if (!_client) throw new Error("Client not initialized. Call initClient first.");
  return _client;
}

export function clearClient(): void {
  _client = null;
}
