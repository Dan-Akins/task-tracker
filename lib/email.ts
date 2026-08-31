import { Resend } from "resend";

// Resend's shared sending domain — works without domain verification, but
// (in the absence of a verified custom domain) only delivers to the email
// address on the Resend account itself. Fine for this single-user app.
const PASSWORD_RESET_FROM_EMAIL = "Task Tracker <onboarding@resend.dev>";

let cachedResend: Resend | undefined;

// Constructed lazily so a missing RESEND_API_KEY can't fail the build the
// same way an eagerly-constructed Stripe client once did (see lib/stripe.ts).
function getResend(): Resend {
  if (!cachedResend) cachedResend = new Resend(process.env.RESEND_API_KEY);
  return cachedResend;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const { error } = await getResend().emails.send({
    from: PASSWORD_RESET_FROM_EMAIL,
    to,
    subject: "Reset your Task Tracker password",
    html: `
      <p>Someone requested a password reset for this Task Tracker account.</p>
      <p><a href="${resetUrl}">Click here to choose a new password</a>. This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });

  if (error) throw new Error(`Failed to send password reset email: ${error.message}`);
}
