// Mock the storage module
jest.mock("../lib/storage", () => {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn(async (key: string) => store[key] ?? null),
    setItem: jest.fn(async (key: string, value: string) => { store[key] = value; }),
    deleteItem: jest.fn(async (key: string) => { delete store[key]; }),
  };
});

// Mock the API module
jest.mock("../lib/api", () => ({
  initClient: jest.fn(),
  clearClient: jest.fn(),
}));

beforeEach(() => {
  jest.resetModules();

  jest.mock("../lib/storage", () => {
    const store: Record<string, string> = {};
    return {
      getItem: jest.fn(async (key: string) => store[key] ?? null),
      setItem: jest.fn(async (key: string, value: string) => { store[key] = value; }),
      deleteItem: jest.fn(async (key: string) => { delete store[key]; }),
    };
  });

  jest.mock("../lib/api", () => ({
    initClient: jest.fn(),
    clearClient: jest.fn(),
  }));
});

describe("auth", () => {
  it("getStoredToken returns null when no token", async () => {
    const { getStoredToken } = require("../lib/auth");
    const token = await getStoredToken();
    expect(token).toBeNull();
  });

  it("saveToken stores token and initializes client", async () => {
    const { saveToken } = require("../lib/auth");
    const { initClient } = require("../lib/api");
    const { setItem } = require("../lib/storage");

    await saveToken("APP_USR-test-123");

    expect(setItem).toHaveBeenCalledWith("mp_access_token", "APP_USR-test-123");
    expect(initClient).toHaveBeenCalledWith("APP_USR-test-123");
  });

  it("removeToken clears token and client", async () => {
    const { removeToken } = require("../lib/auth");
    const { clearClient } = require("../lib/api");
    const { deleteItem } = require("../lib/storage");

    await removeToken();

    expect(deleteItem).toHaveBeenCalledWith("mp_access_token");
    expect(clearClient).toHaveBeenCalled();
  });

  it("getStoredCurrency defaults to ARS", async () => {
    const { getStoredCurrency } = require("../lib/auth");
    const currency = await getStoredCurrency();
    expect(currency).toBe("ARS");
  });

  it("saveCurrency stores currency", async () => {
    const { saveCurrency } = require("../lib/auth");
    const { setItem } = require("../lib/storage");
    await saveCurrency("BRL");
    expect(setItem).toHaveBeenCalledWith("mp_currency", "BRL");
  });

  it("initializeAuth returns false when no token", async () => {
    const { initializeAuth } = require("../lib/auth");
    const result = await initializeAuth();
    expect(result).toBe(false);
  });

  it("initializeAuth returns true and inits client when token exists", async () => {
    const { saveToken, initializeAuth } = require("../lib/auth");
    const { initClient } = require("../lib/api");

    await saveToken("APP_USR-existing");
    initClient.mockClear();

    const result = await initializeAuth();
    expect(result).toBe(true);
    expect(initClient).toHaveBeenCalledWith("APP_USR-existing");
  });
});
