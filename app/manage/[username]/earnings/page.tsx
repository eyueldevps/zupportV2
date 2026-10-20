import { db } from "@/lib/db";
import { money } from "@/lib/format";
import { ledger } from "@/lib/ledger";
import { ownedPage } from "@/lib/owner";

export const dynamic = "force-dynamic";

export default async function Earnings({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const page = await ownedPage(username);
  const l = (await ledger([page.id]))[page.id] ?? { gross: 0, fee: 0, net: 0, paid: 0, owed: 0 };
  const recent = await db.payment.findMany({ where: { pageId: page.id, status: "APPROVED" }, orderBy: { reviewedAt: "desc" }, take: 20, include: { user: true, tier: true } });
  const box = (t: string, v: number, bold = false) => (
    <div className="card p-4"><div className="text-sm text-muted-foreground">{t}</div><div className={`text-xl ${bold ? "font-bold" : "font-semibold"}`}>{money(v, "ETB")}</div></div>);
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Only approved payments count. Zupport sends you what you are owed and records each payout here.</p>
      <div className="grid gap-3 sm:grid-cols-4">{box("Supporters paid", l.gross)}{box("Platform fee", l.fee)}{box("Paid out to you", l.paid)}{box("Owed to you", l.owed, true)}</div>
      <h2 className="text-xl font-bold">Recent approved payments</h2>
      {recent.length === 0 && <p className="text-muted-foreground">No approved payments yet.</p>}
      <div className="space-y-2">{recent.map(p => (
        <div key={p.id} className="card flex justify-between gap-3 p-3 text-sm">
          <span>{p.user.name}: {p.purpose === "TIP" ? "Tip" : p.tier?.name}</span>
          <span>{money(p.creatorMinor, p.currency)} <span className="text-muted-foreground">(after {money(p.feeMinor, p.currency)} fee)</span></span></div>))}</div>
    </div>
  );
}
