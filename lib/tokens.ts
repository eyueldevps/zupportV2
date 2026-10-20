import { createHash, randomBytes } from "crypto";
import type { TokenType } from "@prisma/client";
import { db } from "./db";

const sha = (t: string) => createHash("sha256").update(t).digest("hex");

// Only the hash is stored. The raw token exists only inside the emailed link.
export async function createToken(userId: string, type: TokenType, minutes: number) {
  await db.emailToken.deleteMany({ where: { userId, type, usedAt: null } });
  const raw = randomBytes(32).toString("hex");
  await db.emailToken.create({ data: { userId, type, tokenHash: sha(raw), expiresAt: new Date(Date.now() + minutes * 60_000) } });
  return raw;
}
export async function consumeToken(raw: string, type: TokenType) {
  const row = await db.emailToken.findUnique({ where: { tokenHash: sha(raw) } });
  if (!row || row.type !== type || row.usedAt || row.expiresAt < new Date()) return null;
  await db.emailToken.update({ where: { id: row.id }, data: { usedAt: new Date() } });
  return row.userId;
}
