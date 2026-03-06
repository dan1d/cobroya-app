describe("storage (native)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    jest.mock("expo-secure-store", () => ({
      getItemAsync: jest.fn().mockResolvedValue(null),
      setItemAsync: jest.fn(),
      deleteItemAsync: jest.fn(),
    }));
  });

  it("getItem calls SecureStore.getItemAsync", async () => {
    const SS = require("expo-secure-store");
    SS.getItemAsync.mockResolvedValue("test-value");
    const storage = require("../lib/storage");
    const result = await storage.getItem("key1");
    expect(SS.getItemAsync).toHaveBeenCalledWith("key1");
    expect(result).toBe("test-value");
  });

  it("getItem returns null when no value", async () => {
    const storage = require("../lib/storage");
    const result = await storage.getItem("missing");
    expect(result).toBeNull();
  });

  it("setItem calls SecureStore.setItemAsync", async () => {
    const SS = require("expo-secure-store");
    const storage = require("../lib/storage");
    await storage.setItem("key1", "val1");
    expect(SS.setItemAsync).toHaveBeenCalledWith("key1", "val1");
  });

  it("deleteItem calls SecureStore.deleteItemAsync", async () => {
    const SS = require("expo-secure-store");
    const storage = require("../lib/storage");
    await storage.deleteItem("key1");
    expect(SS.deleteItemAsync).toHaveBeenCalledWith("key1");
  });
});

describe("storage (web)", () => {
  const mockLocalStorage: Record<string, string> = {};

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Clear mock localStorage
    for (const key of Object.keys(mockLocalStorage)) delete mockLocalStorage[key];

    // Mock Platform.OS as "web"
    jest.mock("react-native", () => ({
      Platform: { OS: "web" },
    }));

    // Provide localStorage mock
    (globalThis as any).localStorage = {
      getItem: jest.fn((key: string) => mockLocalStorage[key] ?? null),
      setItem: jest.fn((key: string, val: string) => { mockLocalStorage[key] = val; }),
      removeItem: jest.fn((key: string) => { delete mockLocalStorage[key]; }),
    };
  });

  it("getItem uses localStorage on web", async () => {
    mockLocalStorage["webkey"] = "webval";
    const storage = require("../lib/storage");
    const result = await storage.getItem("webkey");
    expect(result).toBe("webval");
  });

  it("setItem uses localStorage on web", async () => {
    const storage = require("../lib/storage");
    await storage.setItem("a", "b");
    expect(globalThis.localStorage.setItem).toHaveBeenCalledWith("a", "b");
  });

  it("deleteItem uses localStorage.removeItem on web", async () => {
    const storage = require("../lib/storage");
    await storage.deleteItem("a");
    expect(globalThis.localStorage.removeItem).toHaveBeenCalledWith("a");
  });
});
