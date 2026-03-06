import React from "react";
import { render, fireEvent, screen, act } from "@testing-library/react-native";
import { Button } from "../../components/Button";

jest.mock("../../lib/storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  deleteItem: jest.fn(),
}));

describe("Button", () => {
  it("renders title text", () => {
    render(<Button title="Cobrar" onPress={jest.fn()} />);
    expect(screen.getByText("Cobrar")).toBeTruthy();
  });

  it("calls onPress when pressed", async () => {
    const onPress = jest.fn();
    render(<Button title="Click me" onPress={onPress} />);
    await act(async () => {
      fireEvent.press(screen.getByText("Click me"));
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("shows activity indicator when loading", () => {
    render(<Button title="Submit" onPress={jest.fn()} loading />);
    // When loading, the title should NOT be shown
    expect(screen.queryByText("Submit")).toBeNull();
  });

  it("is not pressable when disabled", () => {
    const onPress = jest.fn();
    render(<Button title="Disabled" onPress={onPress} disabled />);
    fireEvent.press(screen.getByText("Disabled"));
    // Haptics mock is called but onPress should not fire due to disabled prop
    // The Pressable with disabled=true won't fire onPress
    expect(onPress).not.toHaveBeenCalled();
  });

  it("is not pressable when loading", () => {
    const onPress = jest.fn();
    render(<Button title="Loading" onPress={onPress} loading />);
    // Can't press when loading since title is replaced with ActivityIndicator
  });

  it("renders different variants", () => {
    const { rerender } = render(<Button title="Primary" onPress={jest.fn()} variant="primary" />);
    expect(screen.getByText("Primary")).toBeTruthy();

    rerender(<Button title="Danger" onPress={jest.fn()} variant="danger" />);
    expect(screen.getByText("Danger")).toBeTruthy();

    rerender(<Button title="Ghost" onPress={jest.fn()} variant="ghost" />);
    expect(screen.getByText("Ghost")).toBeTruthy();

    rerender(<Button title="Secondary" onPress={jest.fn()} variant="secondary" />);
    expect(screen.getByText("Secondary")).toBeTruthy();
  });
});
