import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Audit() {
  const rows = await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  const ids = [...new Set(rows.map(r => r.actorId).filter((x): x is string => !!x))];
  const actors = await db.user.findMany({ where: { id: { in: ids } }, select: { id: true, email: true } });
  const email = Object.fromEntries(actors.map(a => [a.id, a.email]));
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">A record of every approval, rejection, suspension and payout. Newest first.</p>
      <div className="card divide-y divide-border">
        {rows.length === 0 && <p className="p-4 text-muted-foreground">Nothing recorded yet.</p>}
        {rows.map(r => (
          <div key={r.id} className="flex flex-wrap justify-between gap-2 p-3 text-sm">
            <span><b>{r.action}</b> · {r.entity} {r.entityId?.slice(0, 8)}</span>
            <span className="text-muted-foreground">{r.actorId ? email[r.actorId] ?? "unknown" : "system"} · {r.createdAt.toLocaleString()}</span>
          </div>))}
      </div>
    </div>
  );
}
