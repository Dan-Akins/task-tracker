import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(currentSearch),
}));

let currentSearch = "";

import StatusFilter from "./StatusFilter";

describe("StatusFilter", () => {
  beforeEach(() => {
    push.mockClear();
    currentSearch = "";
  });

  it("defaults to the 'All' option when there is no status param", () => {
    render(<StatusFilter />);
    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("reflects the current status param", () => {
    currentSearch = "status=done";
    render(<StatusFilter />);
    expect(screen.getByRole("combobox")).toHaveValue("done");
  });

  it("pushes a new URL with the status param set on change", () => {
    render(<StatusFilter />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "in_progress" } });
    expect(push).toHaveBeenCalledWith("?status=in_progress");
  });

  it("removes the status param when 'All' is selected", () => {
    currentSearch = "status=todo";
    render(<StatusFilter />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "" } });
    expect(push).toHaveBeenCalledWith("?");
  });
});
