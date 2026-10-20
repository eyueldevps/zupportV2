import { db } from "@/lib/db";
import { money } from "@/lib/format";
import { ledger } from "@/lib/ledger";
import { recordPayout } from "@/app/actions/admin";
import { Alert } from "@/components/forms";

export const dynamic = "force-dynamic";

export default async function Payouts({ searchParams }: { searchParams: Promise<{ error?: string; done?: string }> }) {
  const sp = await searchParams;
  const led = await ledger();
  const ids = Object.keys(led).filter(id => led[id].net > 0);
  const pages = await db.creatorPage.findMany({ where: { id: { in: ids } }, include: { owner: true } });
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Amounts are what creators earned after the platform fee. After you send a creator their money (for example by Telebirr), record it here so the balance stays correct.</p>
      {sp.error && <Alert kind="error">{sp.error}</Alert>}
      {sp.done && <Alert kind="ok">Payout recorded.</Alert>}
      {pages.length === 0 && <p className="text-muted-foreground">No approved payments yet.</p>}
      {pages.map(p => { const l = led[p.id]; return (
        <div key={p.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-sm"><div className="font-semibold">{p.displayName}</div>
            <div className="text-muted-foreground">{p.owner.email}</div>
            <div className="mt-2">Earned {money(l.net, "ETB")} · Paid out {money(l.paid, "ETB")}</div>
            <div className="text-lg font-bold">Owed {money(l.owed, "ETB")}</div></div>
          {l.owed >= 100 && (
            <form action={recordPayout.bind(null, p.id)} className="flex flex-wrap gap-2">
              <input name="amountBirr" type="number" min={1} step={1} defaultValue={Math.floor(l.owed / 100)} className="input w-28" aria-label="Amount in Birr" />
              <input name="reference" placeholder="Telebirr transaction ID" className="input w-52" />
              <button className="btn">Record payout</button></form>)}
        </div>); })}
    </div>
  );
}
