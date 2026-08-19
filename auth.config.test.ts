import { describe, it, expect } from "vitest";
import { authConfig } from "./auth.config";

function makeRequest(pathname: string) {
  return { nextUrl: new URL(`https://example.com${pathname}`) } as never;
}

describe("authConfig.callbacks.authorized", () => {
  const authorized = authConfig.callbacks.authorized;

  it("redirects a logged-in user away from the login page", () => {
    const result = authorized({
      auth: { user: { id: "1" } } as never,
      request: makeRequest("/login"),
    } as never);
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get("location")).toBe("https://example.com/dashboard");
  });

  it("redirects a logged-in user away from the signup page", () => {
    const result = authorized({
      auth: { user: { id: "1" } } as never,
      request: makeRequest("/signup"),
    } as never);
    expect(result).toBeInstanceOf(Response);
  });

  it("denies a logged-out user access to a protected page", () => {
    const result = authorized({
      auth: null,
      request: makeRequest("/dashboard"),
    } as never);
    expect(result).toBe(false);
  });

  it("allows a logged-out user to view the login page", () => {
    const result = authorized({
      auth: null,
      request: makeRequest("/login"),
    } as never);
    expect(result).toBe(true);
  });

  it("allows a logged-in user to view a protected page", () => {
    const result = authorized({
      auth: { user: { id: "1" } } as never,
      request: makeRequest("/dashboard"),
    } as never);
    expect(result).toBe(true);
  });

  it("allows a logged-out user to view the landing page", () => {
    const result = authorized({
      auth: null,
      request: makeRequest("/"),
    } as never);
    expect(result).toBe(true);
  });

  it("redirects a logged-in user away from the landing page to the dashboard", () => {
    const result = authorized({
      auth: { user: { id: "1" } } as never,
      request: makeRequest("/"),
    } as never);
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get("location")).toBe("https://example.com/dashboard");
  });

  it("allows a logged-out user to view the privacy policy", () => {
    const result = authorized({
      auth: null,
      request: makeRequest("/privacy"),
    } as never);
    expect(result).toBe(true);
  });

  it("does not redirect a logged-in user away from the privacy policy", () => {
    const result = authorized({
      auth: { user: { id: "1" } } as never,
      request: makeRequest("/privacy"),
    } as never);
    expect(result).toBe(true);
  });

  it("allows a logged-out user to view the terms of service", () => {
    const result = authorized({
      auth: null,
      request: makeRequest("/terms"),
    } as never);
    expect(result).toBe(true);
  });

  it("does not redirect a logged-in user away from the terms of service", () => {
    const result = authorized({
      auth: { user: { id: "1" } } as never,
      request: makeRequest("/terms"),
    } as never);
    expect(result).toBe(true);
  });

  it("allows a logged-out user to view the pricing page", () => {
    const result = authorized({
      auth: null,
      request: makeRequest("/pricing"),
    } as never);
    expect(result).toBe(true);
  });

  it("does not redirect a logged-in user away from the pricing page", () => {
    const result = authorized({
      auth: { user: { id: "1" } } as never,
      request: makeRequest("/pricing"),
    } as never);
    expect(result).toBe(true);
  });
});
