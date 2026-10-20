import Link from "next/link";
import type { PayStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { money } from "@/lib/format";
import { reviewPayment } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminPayments({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "PENDING" } = await searchParams;
  const st = (["PENDING", "APPROVED", "REJECTED"].includes(status) ? status : "PENDING") as PayStatus;
  const payments = await db.payment.findMany({ where: { status: st }, orderBy: { createdAt: st === "PENDING" ? "asc" : "desc" }, take: 50,
    include: { user: true, page: true, tier: true } });
  const chip = (on: boolean) => `rounded-full border px-3 py-1.5 text-sm font-medium ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`;
  return (
    <div className="space-y-4">
      <div className="flex gap-2">{(["PENDING", "APPROVED", "REJECTED"] as const).map(s =>
        <Link key={s} href={`/admin/payments?status=${s}`} className={chip(s === st)}>{s[0] + s.slice(1).toLowerCase()}</Link>)}</div>
      {st === "PENDING" && <p className="text-sm text-muted-foreground">Open your Telebirr history and match the transaction ID and amount before approving.</p>}
      {payments.length === 0 && <p className="text-muted-foreground">Nothing here.</p>}
      {payments.map(p => (
        <div key={p.id} className="card flex flex-col gap-4 p-4 sm:flex-row">
          <a href={`/admin/proof/${p.id}`} target="_blank" rel="noreferrer">
            <img src={`/admin/proof/${p.id}`} alt={`Payment proof ${p.reference}`} className="h-44 w-32 rounded-lg border border-border object-cover" /></a>
          <div className="flex-1 space-y-1 text-sm">
            <div className="font-semibold">{p.user.name} ({p.user.email})</div>
            <div>{p.page.displayName}: {p.purpose === "TIP" ? "Tip" : p.tier?.name}</div>
            <div className="text-xl font-bold">{money(p.grossMinor, p.currency)}</div>
            <div>Transaction ID: <b>{p.providerRef}</b></div>
            <div className="text-muted-foreground">Ref {p.reference} · {p.createdAt.toLocaleString()}</div>
            {p.note && <div>Note: {p.note}</div>}
          </div>
          {st === "PENDING" && (
            <div className="flex flex-col gap-2 sm:w-56">
              <form action={reviewPayment.bind(null, p.id, "APPROVED")}><button className="btn w-full">Approve</button></form>
              <form action={reviewPayment.bind(null, p.id, "REJECTED")} className="space-y-2">
                <input name="note" placeholder="Reason (shown to supporter)" className="input" />
                <button className="btn-outline w-full !border-danger !text-danger">Reject</button></form>
            </div>)}
        </div>))}
    </div>
  );
}
