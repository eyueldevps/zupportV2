import { db } from "./db";

// What each page has earned (after fees), what was paid out, and what is still owed.
export async function ledger(pageIds?: string[]) {
  const scope = pageIds ? { pageId: { in: pageIds } } : {};
  const [earned, paid] = await Promise.all([
    db.payment.groupBy({ by: ["pageId"], where: { status: "APPROVED", ...scope }, _sum: { grossMinor: true, feeMinor: true, creatorMinor: true } }),
    db.payout.groupBy({ by: ["pageId"], where: { status: "PAID", ...scope }, _sum: { amountMinor: true } }),
  ]);
  const out: Record<string, { gross: number; fee: number; net: number; paid: number; owed: number }> = {};
  for (const e of earned) out[e.pageId] = { gross: e._sum.grossMinor ?? 0, fee: e._sum.feeMinor ?? 0, net: e._sum.creatorMinor ?? 0, paid: 0, owed: 0 };
  for (const p of paid) if (out[p.pageId]) out[p.pageId].paid = p._sum.amountMinor ?? 0;
  for (const k in out) out[k].owed = out[k].net - out[k].paid;
  return out;
}
