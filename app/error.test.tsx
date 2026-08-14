import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorPage from "./error";

describe("Error", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("shows a friendly message and not the raw error text", () => {
    const error = Object.assign(new Error("password hash mismatch at db.ts:42"), {
      digest: undefined,
    });
    render(<ErrorPage error={error} reset={vi.fn()} />);

    expect(screen.getByText("500")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.queryByText(/password hash mismatch/)).not.toBeInTheDocument();
    expect(screen.queryByText(/db\.ts:42/)).not.toBeInTheDocument();
  });

  it("shows the error digest as a support reference when present, but never the stack", () => {
    const error = Object.assign(new Error("boom"), { digest: "abc123", stack: "at Sensitive.fn()" });
    render(<ErrorPage error={error} reset={vi.fn()} />);

    expect(screen.getByText(/abc123/)).toBeInTheDocument();
    expect(screen.queryByText(/Sensitive\.fn/)).not.toBeInTheDocument();
  });

  it("links back to the homepage", () => {
    const error = Object.assign(new Error("boom"), { digest: undefined });
    render(<ErrorPage error={error} reset={vi.fn()} />);

    const link = screen.getByRole("link", { name: /back to homepage/i });
    expect(link).toHaveAttribute("href", "/");
  });

  it("calls reset when Try again is clicked", () => {
    const reset = vi.fn();
    const error = Object.assign(new Error("boom"), { digest: undefined });
    render(<ErrorPage error={error} reset={reset} />);

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("logs the error for diagnostics without rendering it", () => {
    const error = Object.assign(new Error("boom"), { digest: undefined });
    render(<ErrorPage error={error} reset={vi.fn()} />);
    expect(console.error).toHaveBeenCalledWith(error);
  });
});
