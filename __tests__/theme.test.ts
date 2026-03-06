let statusColor: any;
let statusLabel: any;
let currencySymbol: any;
let colors: any;

beforeEach(() => {
  jest.resetModules();
  const theme = require("../constants/theme");
  statusColor = theme.statusColor;
  statusLabel = theme.statusLabel;
  currencySymbol = theme.currencySymbol;
  colors = theme.colors;
});

describe("statusColor", () => {
  it("returns green for approved", () => {
    expect(statusColor("approved")).toBe(colors.statusApproved);
  });

  it("returns yellow for pending statuses", () => {
    expect(statusColor("pending")).toBe(colors.statusPending);
    expect(statusColor("in_process")).toBe(colors.statusPending);
    expect(statusColor("authorized")).toBe(colors.statusPending);
  });

  it("returns red for rejected/cancelled", () => {
    expect(statusColor("rejected")).toBe(colors.statusRejected);
    expect(statusColor("cancelled")).toBe(colors.statusRejected);
  });

  it("returns blue for refunded/charged_back", () => {
    expect(statusColor("refunded")).toBe(colors.statusRefunded);
    expect(statusColor("charged_back")).toBe(colors.statusRefunded);
  });

  it("returns secondary for unknown", () => {
    expect(statusColor("unknown")).toBe(colors.textSecondary);
  });
});

describe("statusLabel", () => {
  it("returns Spanish labels", () => {
    expect(statusLabel("approved")).toBe("Aprobado");
    expect(statusLabel("pending")).toBe("Pendiente");
    expect(statusLabel("rejected")).toBe("Rechazado");
    expect(statusLabel("refunded")).toBe("Reembolsado");
    expect(statusLabel("in_process")).toBe("En proceso");
    expect(statusLabel("authorized")).toBe("Autorizado");
    expect(statusLabel("cancelled")).toBe("Cancelado");
    expect(statusLabel("charged_back")).toBe("Contracargo");
  });

  it("returns raw status for unknown", () => {
    expect(statusLabel("foo")).toBe("foo");
  });
});

describe("currencySymbol", () => {
  it("returns correct symbols", () => {
    expect(currencySymbol("ARS")).toBe("$");
    expect(currencySymbol("BRL")).toBe("R$");
    expect(currencySymbol("MXN")).toBe("$");
    expect(currencySymbol("PEN")).toBe("S/");
    expect(currencySymbol("UYU")).toBe("$U");
    expect(currencySymbol("USD")).toBe("US$");
  });

  it("defaults to $ for unknown", () => {
    expect(currencySymbol("XYZ")).toBe("$");
  });
});
