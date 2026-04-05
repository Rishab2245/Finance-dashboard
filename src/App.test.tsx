import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { useAuthStore } from "./lib/state/authStore";

describe("App", () => {
  it("renders login screen when no token exists", () => {
    useAuthStore.setState({ token: null, user: null });
    render(<App />);
    expect(screen.getByText("Finance Command Desk")).toBeInTheDocument();
  });
});
