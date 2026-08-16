import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("@/app/actions", () => ({
  createTask: vi.fn(),
}));

import { createTask } from "@/app/actions";
import {
  TASK_CATEGORY_MAX_LENGTH,
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
} from "@/lib/validation";
import NewTaskForm from "./NewTaskForm";

function fillTitle(value: string) {
  fireEvent.change(screen.getByLabelText(/title/i), { target: { value } });
}

function submit() {
  fireEvent.click(screen.getByRole("button", { name: /add task/i }));
}

describe("NewTaskForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders every field with the expected defaults", () => {
    render(<NewTaskForm />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toHaveValue("medium");
    expect(screen.getByRole("button", { name: "Add Task" })).toBeInTheDocument();
  });

  it("marks title as required but description and category as optional", () => {
    render(<NewTaskForm />);
    expect(screen.getByLabelText(/title/i)).toBeRequired();
    expect(screen.getByLabelText(/description/i)).not.toBeRequired();
    expect(screen.getByLabelText(/category/i)).not.toBeRequired();
    expect(screen.getByLabelText(/due date/i)).not.toBeRequired();
  });

  it("caps each free-text field at the shared validation limits", () => {
    render(<NewTaskForm />);
    expect(screen.getByLabelText(/title/i)).toHaveAttribute("maxlength", String(TASK_TITLE_MAX_LENGTH));
    expect(screen.getByLabelText(/description/i)).toHaveAttribute(
      "maxlength",
      String(TASK_DESCRIPTION_MAX_LENGTH),
    );
    expect(screen.getByLabelText(/category/i)).toHaveAttribute(
      "maxlength",
      String(TASK_CATEGORY_MAX_LENGTH),
    );
  });

  it("submits the entered values as form data to createTask", async () => {
    vi.mocked(createTask).mockResolvedValue(undefined);
    render(<NewTaskForm />);

    fillTitle("Buy milk");
    fireEvent.change(screen.getByLabelText(/category/i), { target: { value: "Errands" } });
    fireEvent.change(screen.getByLabelText(/priority/i), { target: { value: "high" } });
    submit();

    await waitFor(() => expect(createTask).toHaveBeenCalledTimes(1));
    const formData = vi.mocked(createTask).mock.calls[0][0] as FormData;
    expect(formData.get("title")).toBe("Buy milk");
    expect(formData.get("category")).toBe("Errands");
    expect(formData.get("priority")).toBe("high");
  });

  it("clears the form and shows no error after a successful submit", async () => {
    vi.mocked(createTask).mockResolvedValue(undefined);
    render(<NewTaskForm />);
    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;

    fillTitle("Buy milk");
    submit();

    await waitFor(() => expect(titleInput.value).toBe(""));
    expect(screen.queryByText(/./, { selector: "p.text-red-600" })).not.toBeInTheDocument();
  });

  it("shows the server-returned error message on failure", async () => {
    vi.mocked(createTask).mockResolvedValue({ error: "Title is required." });
    render(<NewTaskForm />);

    // Whitespace-only satisfies the browser's native `required` check, so the
    // submit event still reaches createTask, which rejects it server-side.
    fillTitle("   ");
    submit();

    expect(await screen.findByText("Title is required.")).toBeInTheDocument();
  });

  it("clears a previous error once a later submit succeeds", async () => {
    vi.mocked(createTask).mockResolvedValueOnce({ error: "Title is required." });
    render(<NewTaskForm />);

    fillTitle("   ");
    submit();
    expect(await screen.findByText("Title is required.")).toBeInTheDocument();

    vi.mocked(createTask).mockResolvedValueOnce(undefined);
    fillTitle("Buy milk");
    submit();

    await waitFor(() => expect(screen.queryByText("Title is required.")).not.toBeInTheDocument());
  });

  it("disables the submit button while the request is pending", async () => {
    let resolveCreate: (value: undefined) => void = () => {};
    vi.mocked(createTask).mockReturnValue(
      new Promise((resolve) => {
        resolveCreate = resolve;
      }),
    );
    render(<NewTaskForm />);
    const button = screen.getByRole("button", { name: /add task/i });

    fillTitle("Buy milk");
    submit();

    await waitFor(() => expect(button).toBeDisabled());
    expect(button).toHaveTextContent("Adding…");

    resolveCreate(undefined);
    await waitFor(() => expect(button).not.toBeDisabled());
  });
});
