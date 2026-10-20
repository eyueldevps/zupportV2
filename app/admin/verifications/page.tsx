import { db } from "@/lib/db";
import { reviewVerification } from "@/app/actions/moderation";

export const dynamic = "force-dynamic";

export default async function Verifications() {
  const list = await db.verification.findMany({ where: { status: "PENDING" }, orderBy: { submittedAt: "asc" }, include: { page: { include: { owner: true } } } });
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Check that the name and photo on the ID match the selfie, the ID is real and not expired, and the person plausibly runs this page. The photos are deleted as soon as you decide.</p>
      {list.length === 0 && <p className="text-muted-foreground">No requests waiting.</p>}
      {list.map(v => (
        <div key={v.id} className="card space-y-3 p-4">
          <div className="text-sm"><div className="font-semibold">{v.page.displayName} (/c/{v.page.username})</div>
            <div className="text-muted-foreground">{v.page.owner.name} · {v.page.owner.email}{v.phone ? ` · ${v.phone}` : ""}</div></div>
          <div className="flex flex-wrap gap-4">
            {[["ID document", v.idDocKey], ["Selfie with ID", v.selfieKey]].map(([label, key]) => key && (
              <a key={label} href={`/admin/file/${key}`} target="_blank" rel="noreferrer" className="block text-sm">
                <img src={`/admin/file/${key}`} alt={label!} className="h-48 rounded-lg border border-border" />{label}</a>))}
          </div>
          <div className="flex flex-wrap items-start gap-3">
            <form action={reviewVerification.bind(null, v.id, "VERIFIED")}><button className="btn">Approve</button></form>
            <form action={reviewVerification.bind(null, v.id, "REJECTED")} className="flex gap-2">
              <input name="note" placeholder="Reason (shown to creator)" className="input w-64" />
              <button className="btn-outline !border-danger !text-danger">Reject</button></form>
          </div>
        </div>))}
    </div>
  );
}
