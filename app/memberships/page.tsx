import Link from "next/link";
import { db } from "@/lib/db";
import { money } from "@/lib/format";
import { DAY_MS } from "@/lib/payments";
import { requireUser } from "@/lib/session";
import { Alert } from "@/components/forms";

export const dynamic = "force-dynamic";
const label = { PENDING: "Waiting for review", APPROVED: "Approved", REJECTED: "Rejected" } as const;

export default async function MySupport({ searchParams }: { searchParams: Promise<{ submitted?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const [mems, pays] = await Promise.all([
    db.membership.findMany({ where: { userId: user.id }, orderBy: { expiresAt: "desc" }, include: { page: true, tier: true } }),
    db.payment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30, include: { page: true, tier: true } }),
  ]);
  const now = Date.now();
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <h1 className="text-3xl font-bold">My support</h1>
      {sp.submitted && <Alert kind="ok">Payment submitted. We will check it and unlock your access once it is approved.</Alert>}
      <section>
        <h2 className="text-xl font-bold">Memberships</h2>
        {mems.length === 0 && <p className="mt-3 text-muted-foreground">You have no memberships yet. <Link href="/explore" className="font-medium text-link">Explore creators</Link></p>}
        <div className="mt-3 space-y-3">
          {mems.map(m => { const days = Math.ceil((m.expiresAt.getTime() - now) / DAY_MS); const active = m.status === "ACTIVE" && days > 0; return (
            <div key={m.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div><Link href={`/c/${m.page.username}`} className="font-semibold">{m.page.displayName}</Link>
                <div className="text-sm text-muted-foreground">{m.tier.name} · {active ? `expires in ${days} day${days === 1 ? "" : "s"}` : "expired"}</div></div>
              <Link href={`/c/${m.page.username}/join/${m.tierId}`} className={active ? "btn-outline" : "btn"}>{active ? "Renew early" : "Renew"}</Link>
            </div>); })}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold">Payments</h2>
        {pays.length === 0 && <p className="mt-3 text-muted-foreground">No payments yet.</p>}
        <div className="mt-3 space-y-3">
          {pays.map(p => (
            <div key={p.id} className="card p-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2"><span className="font-semibold">{p.page.displayName}: {p.purpose === "TIP" ? "Tip" : p.tier?.name}</span>
                <span>{money(p.grossMinor, p.currency)}</span></div>
              <div className="text-muted-foreground">{label[p.status as keyof typeof label] ?? p.status} · Ref {p.reference} · {p.createdAt.toLocaleDateString()}</div>
              {p.status === "REJECTED" && p.note && <div className="mt-1">Reason: {p.note}</div>}
            </div>))}
        </div>
      </section>
    </div>
  );
}
