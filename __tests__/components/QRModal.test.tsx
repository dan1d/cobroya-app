import React from "react";
import { render, fireEvent, screen, act } from "@testing-library/react-native";
import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";
import { QRModal } from "../../components/QRModal";

jest.spyOn(Share, "share").mockResolvedValue({ action: "sharedAction" } as any);

describe("QRModal", () => {
  const defaultProps = {
    visible: true,
    url: "https://mp.com/checkout/123",
    title: "Test Payment",
    amount: "$5000",
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders title and amount", () => {
    render(<QRModal {...defaultProps} />);
    expect(screen.getByText("Test Payment")).toBeTruthy();
    expect(screen.getByText("$5000")).toBeTruthy();
  });

  it("renders url", () => {
    render(<QRModal {...defaultProps} />);
    expect(screen.getByText("https://mp.com/checkout/123")).toBeTruthy();
  });

  it("renders action buttons", () => {
    render(<QRModal {...defaultProps} />);
    expect(screen.getByText("Copiar")).toBeTruthy();
    expect(screen.getByText("WhatsApp")).toBeTruthy();
    expect(screen.getByText("Compartir")).toBeTruthy();
  });

  it("copies url to clipboard on Copiar press", async () => {
    render(<QRModal {...defaultProps} />);
    await act(async () => {
      fireEvent.press(screen.getByText("Copiar"));
    });
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith("https://mp.com/checkout/123");
  });

  it("opens native share on Compartir press", async () => {
    render(<QRModal {...defaultProps} />);
    await act(async () => {
      fireEvent.press(screen.getByText("Compartir"));
    });
    expect(Share.share).toHaveBeenCalled();
  });

  it("calls onClose when Cerrar is pressed", () => {
    const onClose = jest.fn();
    render(<QRModal {...defaultProps} onClose={onClose} />);
    fireEvent.press(screen.getByText("Cerrar"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render when not visible", () => {
    render(<QRModal {...defaultProps} visible={false} />);
    expect(screen.queryByText("Test Payment")).toBeNull();
  });

  it("renders without amount", () => {
    render(<QRModal {...defaultProps} amount={undefined} />);
    expect(screen.getByText("Test Payment")).toBeTruthy();
    expect(screen.queryByText("$5000")).toBeNull();
  });

  it("handles empty url with fallback", () => {
    // Should not crash with empty url
    render(<QRModal {...defaultProps} url="" />);
    expect(screen.getByText("Test Payment")).toBeTruthy();
  });
});
