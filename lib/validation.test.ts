import { describe, it, expect } from "vitest";
import { EMAIL_MAX_LENGTH, stripHtml, validateEmail, validateTaskInput } from "./validation";

describe("stripHtml", () => {
  it("removes simple tags", () => {
    expect(stripHtml("<b>bold</b> text")).toBe("bold text");
  });

  it("removes script tags and their delimiters", () => {
    expect(stripHtml("<script>alert(1)</script>hi")).toBe("alert(1)hi");
  });

  it("removes an unterminated trailing tag", () => {
    expect(stripHtml("hi <script alert(1)")).toBe("hi ");
  });

  it("neutralizes a reported script-injection payload", () => {
    expect(stripHtml("<script>alert('hacked')</script>")).toBe("alert('hacked')");
  });

  it("leaves plain text untouched", () => {
    expect(stripHtml("Buy milk & eggs")).toBe("Buy milk & eggs");
  });
});

describe("validateEmail", () => {
  it("accepts a well-formed email", () => {
    expect(validateEmail("user@example.com")).toBeNull();
  });

  it.each(["not-an-email", "user@", "@example.com", "user@example", "user example.com"])(
    "rejects %s",
    (value) => {
      expect(validateEmail(value)).toBe("Enter a valid email address.");
    },
  );

  it("accepts an email at exactly the max length", () => {
    const local = "a".repeat(EMAIL_MAX_LENGTH - "@example.com".length);
    expect(validateEmail(`${local}@example.com`)).toBeNull();
  });

  it("rejects an email over the max length, even if otherwise well-formed", () => {
    const local = "a".repeat(EMAIL_MAX_LENGTH - "@example.com".length + 1);
    expect(validateEmail(`${local}@example.com`)).toBe("Enter a valid email address.");
  });
});

describe("validateTaskInput", () => {
  const base = {
    title: "Buy milk",
    description: null,
    priority: "medium",
    dueDateStr: null,
    category: null,
  };

  it("returns data for a minimal valid title", () => {
    const result = validateTaskInput(base);
    expect(result).toEqual({
      data: {
        title: "Buy milk",
        description: null,
        priority: "medium",
        dueDate: null,
        category: null,
      },
    });
  });

  it("errors when title is empty after trimming/stripping", () => {
    expect(validateTaskInput({ ...base, title: "   " })).toEqual({ error: "Title is required." });
    expect(validateTaskInput({ ...base, title: "<b></b>" })).toEqual({ error: "Title is required." });
  });

  it("errors when title exceeds 200 characters", () => {
    expect(validateTaskInput({ ...base, title: "a".repeat(201) })).toEqual({
      error: "Title must be 200 characters or fewer.",
    });
  });

  it("allows a title at exactly 200 characters", () => {
    const result = validateTaskInput({ ...base, title: "a".repeat(200) });
    expect("data" in result).toBe(true);
  });

  it("errors when description exceeds 2000 characters", () => {
    expect(
      validateTaskInput({ ...base, description: "a".repeat(2001) }),
    ).toEqual({ error: "Description must be 2000 characters or fewer." });
  });

  it("errors when category exceeds 100 characters", () => {
    expect(
      validateTaskInput({ ...base, category: "a".repeat(101) }),
    ).toEqual({ error: "Category must be 100 characters or fewer." });
  });

  it("strips HTML from title, description, and category", () => {
    const result = validateTaskInput({
      title: "<img src=x onerror=alert(1)>Buy milk",
      description: "<script>alert(2)</script>details",
      priority: "medium",
      dueDateStr: null,
      category: "<b>errands</b>",
    });
    expect(result).toEqual({
      data: {
        title: "Buy milk",
        description: "alert(2)details",
        priority: "medium",
        dueDate: null,
        category: "errands",
      },
    });
  });

  it("errors on an invalid priority", () => {
    expect(validateTaskInput({ ...base, priority: "urgent" })).toEqual({ error: "Invalid priority." });
  });

  it("errors on an unparsable due date", () => {
    expect(validateTaskInput({ ...base, dueDateStr: "not-a-date" })).toEqual({
      error: "Invalid due date.",
    });
  });

  it("parses a valid due date", () => {
    const result = validateTaskInput({ ...base, dueDateStr: "2026-03-01" });
    expect("data" in result && result.data.dueDate).toEqual(new Date("2026-03-01"));
  });
});
