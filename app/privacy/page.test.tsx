import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PrivacyPolicyPage from "./page";

describe("PrivacyPolicyPage", () => {
  it("states that email addresses are collected for authentication", () => {
    render(<PrivacyPolicyPage />);
    expect(screen.getByText(/collect your email address/i)).toBeInTheDocument();
  });

  it("states that task data is stored", () => {
    render(<PrivacyPolicyPage />);
    expect(screen.getByText(/store the task data/i)).toBeInTheDocument();
  });

  it("states that data is not shared with third parties", () => {
    render(<PrivacyPolicyPage />);
    expect(
      screen.getByText(/do not sell, rent, or share your data with third parties/i),
    ).toBeInTheDocument();
  });

  it("links to the account page for account deletion", () => {
    render(<PrivacyPolicyPage />);
    const link = screen.getByRole("link", { name: /account page/i });
    expect(link).toHaveAttribute("href", "/account");
  });

  it("links back to the homepage", () => {
    render(<PrivacyPolicyPage />);
    const link = screen.getByRole("link", { name: /back to homepage/i });
    expect(link).toHaveAttribute("href", "/");
  });
});
