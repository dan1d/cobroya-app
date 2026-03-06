import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import { Input } from "../../components/Input";

describe("Input", () => {
  it("renders label", () => {
    render(<Input label="Email" />);
    expect(screen.getByText("Email")).toBeTruthy();
  });

  it("renders placeholder", () => {
    render(<Input label="Name" placeholder="John" />);
    expect(screen.getByPlaceholderText("John")).toBeTruthy();
  });

  it("calls onChangeText", () => {
    const onChange = jest.fn();
    render(<Input label="Test" placeholder="Enter text" onChangeText={onChange} />);
    fireEvent.changeText(screen.getByPlaceholderText("Enter text"), "hello");
    expect(onChange).toHaveBeenCalledWith("hello");
  });

  it("shows error message", () => {
    render(<Input label="Amount" error="Monto invalido" />);
    expect(screen.getByText("Monto invalido")).toBeTruthy();
  });

  it("does not show error when not provided", () => {
    render(<Input label="Amount" />);
    expect(screen.queryByText("Monto invalido")).toBeNull();
  });

  it("renders with value", () => {
    render(<Input label="Name" value="Dan" />);
    // Value is set on the TextInput
    expect(screen.getByDisplayValue("Dan")).toBeTruthy();
  });
});
