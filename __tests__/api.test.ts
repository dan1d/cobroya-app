// Use dynamic imports to avoid Expo's module scope enforcement
let initClient: any;
let getClient: any;
let clearClient: any;
let MercadoPagoError: any;

const mockFetch = jest.fn();
global.fetch = mockFetch;

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

beforeEach(() => {
  jest.resetModules();
  mockFetch.mockReset();
  const api = require("../lib/api");
  initClient = api.initClient;
  getClient = api.getClient;
  clearClient = api.clearClient;
  MercadoPagoError = api.MercadoPagoError;
});

describe("initClient / getClient / clearClient", () => {
  it("throws if getClient called before init", () => {
    expect(() => getClient()).toThrow("Client not initialized");
  });

  it("returns client after init", () => {
    const client = initClient("TEST-token");
    expect(client).toBeDefined();
    expect(getClient()).toBe(client);
  });

  it("clears client", () => {
    initClient("TEST-token");
    clearClient();
    expect(() => getClient()).toThrow();
  });
});

describe("MercadoPagoError", () => {
  it("sets status and body", () => {
    const err = new MercadoPagoError(401, "unauthorized");
    expect(err.status).toBe(401);
    expect(err.body).toBe("unauthorized");
    expect(err.message).toBe("Mercado Pago error (401)");
  });

  it("isUnauthorized", () => {
    expect(new MercadoPagoError(401, "").isUnauthorized).toBe(true);
    expect(new MercadoPagoError(404, "").isUnauthorized).toBe(false);
  });

  it("isNotFound", () => {
    expect(new MercadoPagoError(404, "").isNotFound).toBe(true);
    expect(new MercadoPagoError(401, "").isNotFound).toBe(false);
  });

  it("isRateLimited", () => {
    expect(new MercadoPagoError(429, "").isRateLimited).toBe(true);
    expect(new MercadoPagoError(200, "").isRateLimited).toBe(false);
  });
});

describe("getMerchantInfo", () => {
  it("calls /users/me with bearer token", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: 123, nickname: "SELLER" }));
    const client = initClient("TEST-abc");

    const result = await client.getMerchantInfo();

    expect(result).toEqual({ id: 123, nickname: "SELLER" });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.mercadopago.com/users/me");
    expect(opts.headers.Authorization).toBe("Bearer TEST-abc");
  });

  it("throws MercadoPagoError on 401", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ message: "bad" }, 401));
    const client = initClient("TEST-bad");

    await expect(client.getMerchantInfo()).rejects.toThrow(MercadoPagoError);
  });
});

describe("createPaymentPreference", () => {
  it("posts to /checkout/preferences with item", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ id: "pref_1", init_point: "https://mp.com/checkout" })
    );
    const client = initClient("TEST-abc");

    const result = await client.createPaymentPreference({
      title: "Course",
      quantity: 1,
      currency: "ARS",
      unit_price: 5000,
    });

    expect(result.init_point).toBe("https://mp.com/checkout");
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.mercadopago.com/checkout/preferences");
    expect(opts.method).toBe("POST");

    const body = JSON.parse(opts.body);
    expect(body.items[0].title).toBe("Course");
    expect(body.items[0].quantity).toBe(1);
    expect(body.items[0].currency_id).toBe("ARS");
    expect(body.items[0].unit_price).toBe(5000);
  });

  it("includes back_urls and auto_return when provided", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: "pref_2" }));
    const client = initClient("TEST-abc");

    await client.createPaymentPreference({
      title: "X",
      quantity: 1,
      currency: "ARS",
      unit_price: 100,
      back_urls: { success: "https://ok.com" },
      notification_url: "https://hook.com/ipn",
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.back_urls).toEqual({ success: "https://ok.com" });
    expect(body.auto_return).toBe("approved");
    expect(body.notification_url).toBe("https://hook.com/ipn");
  });

  it("includes description when provided", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: "pref_3" }));
    const client = initClient("TEST-abc");

    await client.createPaymentPreference({
      title: "X",
      quantity: 1,
      currency: "ARS",
      unit_price: 100,
      description: "Some details",
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.items[0].description).toBe("Some details");
  });
});

describe("getPayment", () => {
  it("calls /v1/payments/:id", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: 12345, status: "approved" }));
    const client = initClient("TEST-abc");

    const result = await client.getPayment("12345");

    expect(result.id).toBe(12345);
    expect(mockFetch.mock.calls[0][0]).toBe(
      "https://api.mercadopago.com/v1/payments/12345"
    );
  });

  it("rejects non-numeric payment IDs (path traversal prevention)", async () => {
    const client = initClient("TEST-abc");

    await expect(client.getPayment("../admin")).rejects.toThrow("Invalid payment ID");
    await expect(client.getPayment("abc")).rejects.toThrow("Invalid payment ID");
    await expect(client.getPayment("12/34")).rejects.toThrow("Invalid payment ID");
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe("searchPayments", () => {
  it("calls /v1/payments/search with no params", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ results: [], paging: { total: 0 } }));
    const client = initClient("TEST-abc");

    await client.searchPayments();

    expect(mockFetch.mock.calls[0][0]).toBe(
      "https://api.mercadopago.com/v1/payments/search"
    );
  });

  it("appends query params", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ results: [], paging: { total: 0 } }));
    const client = initClient("TEST-abc");

    await client.searchPayments({ status: "approved", limit: 10, offset: 5 });

    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain("status=approved");
    expect(url).toContain("limit=10");
    expect(url).toContain("offset=5");
  });

  it("ignores undefined params", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ results: [], paging: { total: 0 } }));
    const client = initClient("TEST-abc");

    await client.searchPayments({ status: "approved", limit: undefined });

    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain("status=approved");
    expect(url).not.toContain("limit");
  });
});

describe("createRefund", () => {
  it("posts to /v1/payments/:id/refunds for full refund", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: 999 }));
    const client = initClient("TEST-abc");

    await client.createRefund("12345");

    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.mercadopago.com/v1/payments/12345/refunds");
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body)).toEqual({});
  });

  it("sends amount for partial refund", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: 1000 }));
    const client = initClient("TEST-abc");

    await client.createRefund("12345", 500);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({ amount: 500 });
  });

  it("rejects non-numeric payment IDs", async () => {
    const client = initClient("TEST-abc");

    await expect(client.createRefund("not-a-number")).rejects.toThrow("Invalid payment ID");
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
