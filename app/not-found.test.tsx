import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "./not-found";

describe("NotFound", () => {
  it("shows a friendly message, not technical detail", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Page not found")).toBeInTheDocument();
    expect(
      screen.getByText(/doesn.t exist or may have been moved/i),
    ).toBeInTheDocument();
  });

  it("links back to the homepage", () => {
    render(<NotFound />);
    const link = screen.getByRole("link", { name: /back to homepage/i });
    expect(link).toHaveAttribute("href", "/");
  });
});
