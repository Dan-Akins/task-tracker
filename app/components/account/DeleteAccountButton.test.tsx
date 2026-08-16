import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/app/actions", () => ({
  deleteAccount: vi.fn(),
}));

import { deleteAccount } from "@/app/actions";
import DeleteAccountButton from "./DeleteAccountButton";

describe("DeleteAccountButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not call deleteAccount if the confirm dialog is declined", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<DeleteAccountButton />);

    fireEvent.click(screen.getByRole("button", { name: /delete my account/i }));

    expect(window.confirm).toHaveBeenCalled();
    expect(deleteAccount).not.toHaveBeenCalled();
  });

  it("calls deleteAccount once the confirm dialog is accepted", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.mocked(deleteAccount).mockResolvedValue(undefined as never);
    render(<DeleteAccountButton />);

    fireEvent.click(screen.getByRole("button", { name: /delete my account/i }));

    await waitFor(() => expect(deleteAccount).toHaveBeenCalledTimes(1));
  });

  it("warns that the action is permanent in the confirm message", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<DeleteAccountButton />);

    fireEvent.click(screen.getByRole("button", { name: /delete my account/i }));

    expect(confirmSpy.mock.calls[0][0]).toMatch(/permanent|cannot be undone/i);
  });

  it("disables the button while the request is pending", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    let resolveDelete: () => void = () => {};
    vi.mocked(deleteAccount).mockReturnValue(
      new Promise((resolve) => {
        resolveDelete = () => resolve(undefined as never);
      }),
    );
    render(<DeleteAccountButton />);
    const button = screen.getByRole("button", { name: /delete my account/i });

    fireEvent.click(button);

    await waitFor(() => expect(button).toBeDisabled());
    expect(button).toHaveTextContent("Deleting…");

    resolveDelete();
    await waitFor(() => expect(button).not.toBeDisabled());
  });
});
