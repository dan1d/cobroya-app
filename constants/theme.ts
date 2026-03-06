export const colors = {
  background: "#0a0a0a",
  surface: "#1a1a1a",
  surfaceLight: "#2a2a2a",
  border: "#333333",
  primary: "#00D68F",
  primaryDark: "#00B377",
  primaryLight: "#00D68F22",
  danger: "#FF4757",
  dangerLight: "#FF475722",
  warning: "#FFA502",
  warningLight: "#FFA50222",
  info: "#3498DB",
  infoLight: "#3498DB22",
  text: "#FFFFFF",
  textSecondary: "#999999",
  textMuted: "#666666",
  white: "#FFFFFF",
  black: "#000000",
  card: "#141414",
  statusApproved: "#00D68F",
  statusPending: "#FFA502",
  statusRejected: "#FF4757",
  statusRefunded: "#3498DB",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fonts = {
  regular: { fontSize: 14, color: colors.text },
  small: { fontSize: 12, color: colors.textSecondary },
  body: { fontSize: 16, color: colors.text },
  heading: { fontSize: 24, fontWeight: "700" as const, color: colors.text },
  title: { fontSize: 32, fontWeight: "800" as const, color: colors.text },
  mono: { fontFamily: "monospace", fontSize: 14, color: colors.text },
} as const;

export function statusColor(status: string): string {
  switch (status) {
    case "approved":
      return colors.statusApproved;
    case "pending":
    case "in_process":
    case "authorized":
      return colors.statusPending;
    case "rejected":
    case "cancelled":
      return colors.statusRejected;
    case "refunded":
    case "charged_back":
      return colors.statusRefunded;
    default:
      return colors.textSecondary;
  }
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    approved: "Aprobado",
    pending: "Pendiente",
    in_process: "En proceso",
    authorized: "Autorizado",
    rejected: "Rechazado",
    cancelled: "Cancelado",
    refunded: "Reembolsado",
    charged_back: "Contracargo",
  };
  return labels[status] || status;
}

export function currencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    ARS: "$",
    BRL: "R$",
    MXN: "$",
    CLP: "$",
    COP: "$",
    PEN: "S/",
    UYU: "$U",
    USD: "US$",
  };
  return symbols[currency] || "$";
}
