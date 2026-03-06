import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { PaymentCard } from "../../components/PaymentCard";
import type { Payment } from "../../lib/types";

const mockPayment: Payment = {
  id: 12345,
  status: "approved",
  status_detail: "accredited",
  date_created: "2026-03-06T12:00:00.000Z",
  date_approved: "2026-03-06T12:01:00.000Z",
  date_last_updated: "2026-03-06T12:01:00.000Z",
  description: "Curso de Python",
  transaction_amount: 5000,
  currency_id: "ARS",
  payment_method_id: "visa",
  payment_type_id: "credit_card",
  payer: {
    id: 999,
    email: "buyer@test.com",
    first_name: "Juan",
    last_name: "Perez",
  },
  external_reference: null,
  notification_url: null,
};

describe("PaymentCard", () => {
  it("renders payment description", () => {
    render(<PaymentCard payment={mockPayment} />);
    expect(screen.getByText("Curso de Python")).toBeTruthy();
  });

  it("renders formatted amount", () => {
    render(<PaymentCard payment={mockPayment} />);
    // Should contain $5
    const amountText = screen.getByText(/5[.,]000/);
    expect(amountText).toBeTruthy();
  });

  it("renders status badge", () => {
    render(<PaymentCard payment={mockPayment} />);
    expect(screen.getByText("Aprobado")).toBeTruthy();
  });

  it("renders payment method", () => {
    render(<PaymentCard payment={mockPayment} />);
    expect(screen.getByText("visa")).toBeTruthy();
  });

  it("calls onPress when tapped", () => {
    const onPress = jest.fn();
    render(<PaymentCard payment={mockPayment} onPress={onPress} />);
    fireEvent.press(screen.getByText("Curso de Python"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("shows fallback description for payments without description", () => {
    const noDesc = { ...mockPayment, description: "" };
    render(<PaymentCard payment={noDesc} />);
    expect(screen.getByText("Pago #12345")).toBeTruthy();
  });

  it("renders pending status", () => {
    const pending = { ...mockPayment, status: "pending" };
    render(<PaymentCard payment={pending} />);
    expect(screen.getByText("Pendiente")).toBeTruthy();
  });

  it("renders rejected status", () => {
    const rejected = { ...mockPayment, status: "rejected" };
    render(<PaymentCard payment={rejected} />);
    expect(screen.getByText("Rechazado")).toBeTruthy();
  });
});
