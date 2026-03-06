import { Platform } from "react-native";

// Mock the API module
jest.mock("../lib/api", () => ({
  initClient: jest.fn(),
  clearClient: jest.fn(),
}));

// We test the web path (localStorage) since SecureStore isn't available in jest
// Platform.OS will be 'ios' in jest-expo by default, so we mock it

const mockLocalStorage: Record<string, string> = {};

beforeEach(() => {
  jest.resetModules();
  Object.keys(mockLocalStorage).forEach((k) => delete mockLocalStorage[k]);

  // Mock localStorage for web platform tests
  Object.defineProperty(global, "localStorage", {
    value: {
      getItem: jest.fn((key: string) => mockLocalStorage[key] ?? null),
      setItem: jest.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
    },
    writable: true,
    configurable: true,
  });
});

describe("auth (web platform)", () => {
  beforeEach(() => {
    // Force web platform
    (Platform as any).OS = "web";
  });

  afterEach(() => {
    (Platform as any).OS = "ios";
  });

  it("getStoredToken returns null when no token", async () => {
    const { getStoredToken } = require("../lib/auth");
    const token = await getStoredToken();
    expect(token).toBeNull();
  });

  it("saveToken stores token and initializes client", async () => {
    const { saveToken, getStoredToken } = require("../lib/auth");
    const { initClient } = require("../lib/api");

    await saveToken("APP_USR-test-123");

    expect(localStorage.setItem).toHaveBeenCalledWith("mp_access_token", "APP_USR-test-123");
    expect(initClient).toHaveBeenCalledWith("APP_USR-test-123");

    mockLocalStorage["mp_access_token"] = "APP_USR-test-123";
    const stored = await getStoredToken();
    expect(stored).toBe("APP_USR-test-123");
  });

  it("removeToken clears token and client", async () => {
    const { removeToken } = require("../lib/auth");
    const { clearClient } = require("../lib/api");

    await removeToken();

    expect(localStorage.removeItem).toHaveBeenCalledWith("mp_access_token");
    expect(clearClient).toHaveBeenCalled();
  });

  it("getStoredCurrency defaults to ARS", async () => {
    const { getStoredCurrency } = require("../lib/auth");
    const currency = await getStoredCurrency();
    expect(currency).toBe("ARS");
  });

  it("saveCurrency stores currency", async () => {
    const { saveCurrency } = require("../lib/auth");
    await saveCurrency("BRL");
    expect(localStorage.setItem).toHaveBeenCalledWith("mp_currency", "BRL");
  });

  it("initializeAuth returns false when no token", async () => {
    const { initializeAuth } = require("../lib/auth");
    const result = await initializeAuth();
    expect(result).toBe(false);
  });

  it("initializeAuth returns true and inits client when token exists", async () => {
    const { initializeAuth } = require("../lib/auth");
    const { initClient } = require("../lib/api");

    mockLocalStorage["mp_access_token"] = "APP_USR-existing";
    const result = await initializeAuth();

    expect(result).toBe(true);
    expect(initClient).toHaveBeenCalledWith("APP_USR-existing");
  });
});
