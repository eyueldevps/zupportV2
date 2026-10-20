import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consumeToken } from "@/lib/tokens";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const userId = token ? await consumeToken(token, "VERIFY_EMAIL") : null;
  if (userId) await db.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
  const to = userId ? "/account?verified=1" : "/account?error=" + encodeURIComponent("That verification link is invalid or expired. Request a new one.");
  return NextResponse.redirect(new URL(to, req.url));
}
