import React from "react";
import { render, screen } from "@testing-library/react-native";
import { EmptyState } from "../../components/EmptyState";

describe("EmptyState", () => {
  it("renders icon, title, and message", () => {
    render(<EmptyState icon="💸" title="Sin pagos" message="Crea tu primer link" />);
    expect(screen.getByText("💸")).toBeTruthy();
    expect(screen.getByText("Sin pagos")).toBeTruthy();
    expect(screen.getByText("Crea tu primer link")).toBeTruthy();
  });
});
