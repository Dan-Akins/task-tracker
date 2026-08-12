import { TaskPriority } from "@/app/generated/prisma/enums";

export const TASK_TITLE_MAX_LENGTH = 200;
export const TASK_DESCRIPTION_MAX_LENGTH = 2000;
export const TASK_CATEGORY_MAX_LENGTH = 100;

const VALID_PRIORITIES = new Set<string>(Object.values(TaskPriority));
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Strips anything between (and including) angle brackets, including an unterminated trailing `<...`. */
export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>?/g, "");
}

export function validateEmail(email: string): string | null {
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
  return null;
}

export type TaskInput = {
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: Date | null;
  category: string | null;
};

export type TaskInputFields = {
  title: string;
  description: string | null;
  priority: string;
  dueDateStr: string | null;
  category: string | null;
};

export function validateTaskInput(fields: TaskInputFields): { data: TaskInput } | { error: string } {
  const title = stripHtml(fields.title).trim();
  if (!title) return { error: "Title is required." };
  if (title.length > TASK_TITLE_MAX_LENGTH) {
    return { error: `Title must be ${TASK_TITLE_MAX_LENGTH} characters or fewer.` };
  }

  const descriptionRaw = fields.description?.trim();
  const description = descriptionRaw ? stripHtml(descriptionRaw).trim() || null : null;
  if (description && description.length > TASK_DESCRIPTION_MAX_LENGTH) {
    return { error: `Description must be ${TASK_DESCRIPTION_MAX_LENGTH} characters or fewer.` };
  }

  const categoryRaw = fields.category?.trim();
  const category = categoryRaw ? stripHtml(categoryRaw).trim() || null : null;
  if (category && category.length > TASK_CATEGORY_MAX_LENGTH) {
    return { error: `Category must be ${TASK_CATEGORY_MAX_LENGTH} characters or fewer.` };
  }

  const priority = fields.priority || "medium";
  if (!VALID_PRIORITIES.has(priority)) {
    return { error: "Invalid priority." };
  }

  let dueDate: Date | null = null;
  if (fields.dueDateStr) {
    const parsed = new Date(fields.dueDateStr);
    if (Number.isNaN(parsed.getTime())) {
      return { error: "Invalid due date." };
    }
    dueDate = parsed;
  }

  return { data: { title, description, priority: priority as TaskPriority, dueDate, category } };
}
