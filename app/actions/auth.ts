"use server";
import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { appUrl, sendEmail } from "@/lib/email";
import { createSession, currentUser, destroySession } from "@/lib/session";
import { consumeToken, createToken } from "@/lib/tokens";

const q = encodeURIComponent;
const password = z.string().min(8, "Password needs at least 8 characters").max(100);

async function sendVerification(user: { id: string; email: string }) {
  const token = await createToken(user.id, "VERIFY_EMAIL", 60 * 24);
  await sendEmail(user.email, "Verify your Zupport email", `Open this link to verify your email:\n${appUrl()}/verify?token=${token}`);
}

export async function signup(fd: FormData) {
  const p = z.object({
    name: z.string().trim().min(2, "Enter your name").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password,
  }).safeParse(Object.fromEntries(fd));
  if (!p.success) redirect(`/signup?error=${q(p.error.issues[0].message)}`);
  if (await db.user.findUnique({ where: { email: p.data.email } })) redirect(`/signup?error=${q("That email is already registered. Try logging in.")}`);
  const user = await db.user.create({ data: { name: p.data.name, email: p.data.email, passwordHash: await hash(p.data.password, 12) } });
  await sendVerification(user);
  await createSession(user.id);
  redirect("/account");
}

export async function login(fd: FormData) {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email } });
  const ok = user ? await compare(String(fd.get("password") ?? ""), user.passwordHash) : false;
  if (!user || !ok) redirect(`/login?error=${q("Wrong email or password")}`);
  await createSession(user.id);
  redirect("/account");
}

export async function logout() { await destroySession(); redirect("/"); }

export async function resendVerification() {
  const user = await currentUser();
  if (user && !user.emailVerifiedAt) await sendVerification(user);
  redirect("/account?sent=1");
}

export async function forgotPassword(fd: FormData) {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    const token = await createToken(user.id, "RESET_PASSWORD", 60);
    await sendEmail(user.email, "Reset your Zupport password", `Open this link to choose a new password (valid 1 hour):\n${appUrl()}/reset-password?token=${token}`);
  }
  redirect("/forgot-password?sent=1"); // same answer whether or not the email exists
}

export async function resetPassword(fd: FormData) {
  const token = String(fd.get("token") ?? "");
  const pw = password.safeParse(fd.get("password"));
  if (!pw.success) redirect(`/reset-password?token=${q(token)}&error=${q(pw.error.issues[0].message)}`);
  const userId = await consumeToken(token, "RESET_PASSWORD");
  if (!userId) redirect(`/forgot-password?error=${q("That reset link is invalid or expired. Request a new one.")}`);
  await db.user.update({ where: { id: userId }, data: { passwordHash: await hash(pw.data, 12) } });
  redirect("/login?reset=1");
}
