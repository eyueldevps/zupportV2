import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

const key = () => {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET is missing or too short in .env");
  return new TextEncoder().encode(s);
};

export async function createSession(userId: string) {
  const token = await new SignJWT({ uid: userId }).setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d").sign(key());
  (await cookies()).set("zs", token, { httpOnly: true, sameSite: "lax", path: "/",
    secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30 });
}
export async function destroySession() { (await cookies()).delete("zs"); }

// Identity always comes from the signed cookie, never from form fields.
export async function currentUser() {
  const t = (await cookies()).get("zs")?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, key());
    return await db.user.findUnique({ where: { id: payload.uid as string } });
  } catch { return null; }
}
export async function requireUser() {
  const u = await currentUser();
  if (!u) redirect("/login");
  return u;
}
