import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("payments", {
      name: "Pagos",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#00D68F",
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}

export async function sendLocalNotification(title: string, body: string, data?: Record<string, unknown>) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: "default",
    },
    trigger: null,
  });
}

export function notifyPaymentApproved(paymentId: number, amount: number, currency: string) {
  const symbol = currency === "BRL" ? "R$" : "$";
  sendLocalNotification(
    "Pago aprobado!",
    `Recibiste ${symbol}${amount.toLocaleString()} (ID: ${paymentId})`,
    { paymentId: String(paymentId), type: "payment_approved" }
  );
}

export function notifyPaymentPending(paymentId: number, amount: number, currency: string) {
  const symbol = currency === "BRL" ? "R$" : "$";
  sendLocalNotification(
    "Pago pendiente",
    `Nuevo pago por ${symbol}${amount.toLocaleString()} esperando confirmacion (ID: ${paymentId})`,
    { paymentId: String(paymentId), type: "payment_pending" }
  );
}
