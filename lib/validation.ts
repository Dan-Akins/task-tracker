import { TaskPriority } from "@/app/generated/prisma/enums";
import { DEFAULT_TASK_PRIORITY } from "@/lib/taskMeta";

export const TASK_TITLE_MAX_LENGTH = 200;
export const TASK_DESCRIPTION_MAX_LENGTH = 2000;
export const TASK_CATEGORY_MAX_LENGTH = 100;
// RFC 5321's mailbox length limit.
export const EMAIL_MAX_LENGTH = 254;
// Above bcrypt's 72-byte effective limit; bounds hashing cost on oversized input.
export const PASSWORD_MAX_LENGTH = 128;
export const PASSWORD_MIN_LENGTH = 8;
// OWASP-recommended minimum bcrypt work factor; the cost is embedded in the
// hash itself, so raising this later doesn't invalidate existing hashes.
export const BCRYPT_COST_FACTOR = 12;
// How long a password-reset link stays valid after being emailed.
export const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
// Entropy of the raw reset token (before hashing) sent in the reset link.
export const PASSWORD_RESET_TOKEN_BYTES = 32;

const VALID_PRIORITIES = new Set<string>(Object.values(TaskPriority));
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Strips anything between (and including) angle brackets, including an unterminated trailing `<...`. */
export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>?/g, "");
}

export function validateEmail(email: string): string | null {
  if (email.length > EMAIL_MAX_LENGTH) return "Enter a valid email address.";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`;
  }
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one special character.";
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

  const priority = fields.priority || DEFAULT_TASK_PRIORITY;
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
