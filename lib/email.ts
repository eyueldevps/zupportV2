export const appUrl = () => process.env.APP_URL ?? "http://localhost:3000";

// Development mode: prints the email in the terminal. Swap this body for Resend later.
export async function sendEmail(to: string, subject: string, body: string) {
  console.log(`\n========== EMAIL to ${to} ==========\n${subject}\n\n${body}\n=====================================\n`);
}
