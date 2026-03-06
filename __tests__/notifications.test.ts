describe("registerForPushNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    jest.mock("expo-notifications", () => ({
      getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
      requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
      setNotificationHandler: jest.fn(),
      setNotificationChannelAsync: jest.fn(),
      getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: "test-token" }),
      scheduleNotificationAsync: jest.fn(),
      AndroidImportance: { HIGH: 4 },
    }));

    jest.mock("expo-device", () => ({ isDevice: false }));
  });

  it("returns null on non-device (simulator)", async () => {
    const { registerForPushNotifications } = require("../lib/notifications");
    const result = await registerForPushNotifications();
    expect(result).toBeNull();
  });

  it("returns token on real device with granted permissions", async () => {
    jest.mock("expo-device", () => ({ isDevice: true }));
    const Notif = require("expo-notifications");
    Notif.getPermissionsAsync.mockResolvedValue({ status: "granted" });
    Notif.getExpoPushTokenAsync.mockResolvedValue({ data: "ExponentPushToken[abc123]" });

    const { registerForPushNotifications } = require("../lib/notifications");
    const result = await registerForPushNotifications();
    expect(result).toBe("ExponentPushToken[abc123]");
  });

  it("requests permissions when not granted", async () => {
    jest.mock("expo-device", () => ({ isDevice: true }));
    const Notif = require("expo-notifications");
    Notif.getPermissionsAsync.mockResolvedValue({ status: "undetermined" });
    Notif.requestPermissionsAsync.mockResolvedValue({ status: "granted" });
    Notif.getExpoPushTokenAsync.mockResolvedValue({ data: "token123" });

    const { registerForPushNotifications } = require("../lib/notifications");
    const result = await registerForPushNotifications();
    expect(Notif.requestPermissionsAsync).toHaveBeenCalled();
    expect(result).toBe("token123");
  });

  it("returns null when permissions denied", async () => {
    jest.mock("expo-device", () => ({ isDevice: true }));
    const Notif = require("expo-notifications");
    Notif.getPermissionsAsync.mockResolvedValue({ status: "undetermined" });
    Notif.requestPermissionsAsync.mockResolvedValue({ status: "denied" });

    const { registerForPushNotifications } = require("../lib/notifications");
    const result = await registerForPushNotifications();
    expect(result).toBeNull();
  });
});

describe("sendLocalNotification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    jest.mock("expo-notifications", () => ({
      setNotificationHandler: jest.fn(),
      scheduleNotificationAsync: jest.fn(),
      AndroidImportance: { HIGH: 4 },
    }));
    jest.mock("expo-device", () => ({ isDevice: false }));
  });

  it("schedules a notification with title, body, and data", async () => {
    const Notif = require("expo-notifications");
    const { sendLocalNotification } = require("../lib/notifications");
    await sendLocalNotification("Titulo", "Cuerpo", { key: "val" });
    expect(Notif.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: "Titulo",
        body: "Cuerpo",
        data: { key: "val" },
        sound: "default",
      },
      trigger: null,
    });
  });

  it("works without data parameter", async () => {
    const Notif = require("expo-notifications");
    const { sendLocalNotification } = require("../lib/notifications");
    await sendLocalNotification("Titulo", "Cuerpo");
    expect(Notif.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: "Titulo",
        body: "Cuerpo",
        data: undefined,
        sound: "default",
      },
      trigger: null,
    });
  });
});

describe("notifyPaymentApproved", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    jest.mock("expo-notifications", () => ({
      setNotificationHandler: jest.fn(),
      scheduleNotificationAsync: jest.fn(),
      AndroidImportance: { HIGH: 4 },
    }));
    jest.mock("expo-device", () => ({ isDevice: false }));
  });

  it("sends notification with correct title and data", () => {
    const Notif = require("expo-notifications");
    const { notifyPaymentApproved } = require("../lib/notifications");
    notifyPaymentApproved(123, 5000, "ARS");
    expect(Notif.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: "Pago aprobado!",
          data: { paymentId: "123", type: "payment_approved" },
        }),
      })
    );
  });

  it("uses R$ symbol for BRL", () => {
    const Notif = require("expo-notifications");
    const { notifyPaymentApproved } = require("../lib/notifications");
    notifyPaymentApproved(456, 100, "BRL");
    expect(Notif.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: "Pago aprobado!",
        }),
      })
    );
  });
});

describe("notifyPaymentPending", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    jest.mock("expo-notifications", () => ({
      setNotificationHandler: jest.fn(),
      scheduleNotificationAsync: jest.fn(),
      AndroidImportance: { HIGH: 4 },
    }));
    jest.mock("expo-device", () => ({ isDevice: false }));
  });

  it("sends pending notification", () => {
    const Notif = require("expo-notifications");
    const { notifyPaymentPending } = require("../lib/notifications");
    notifyPaymentPending(789, 3000, "ARS");
    expect(Notif.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: "Pago pendiente",
          data: { paymentId: "789", type: "payment_pending" },
        }),
      })
    );
  });
});
