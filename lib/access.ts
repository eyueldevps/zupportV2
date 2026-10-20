import { db } from "./db";

// An active membership is ACTIVE and not past its expiry date.
export async function getMembership(userId: string, pageId: string) {
  const m = await db.membership.findUnique({ where: { userId_pageId: { userId, pageId } }, include: { tier: true } });
  return m && m.status === "ACTIVE" && m.expiresAt > new Date() ? m : null;
}
// A higher-priced tier also unlocks posts meant for cheaper tiers.
export const allows = (m: { tier: { priceMinor: number } } | null, need: { priceMinor: number } | null) =>
  !need || (!!m && m.tier.priceMinor >= need.priceMinor);
