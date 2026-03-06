import React from "react";
import { render, screen } from "@testing-library/react-native";
import { StatCard } from "../../components/StatCard";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Aprobados" value="42" />);
    expect(screen.getByText("Aprobados")).toBeTruthy();
    expect(screen.getByText("42")).toBeTruthy();
  });

  it("renders subtitle when provided", () => {
    render(<StatCard label="Total" value="$5000" subtitle="ultimos 30 dias" />);
    expect(screen.getByText("ultimos 30 dias")).toBeTruthy();
  });

  it("does not render subtitle when not provided", () => {
    render(<StatCard label="Total" value="$5000" />);
    expect(screen.queryByText("ultimos 30 dias")).toBeNull();
  });
});
