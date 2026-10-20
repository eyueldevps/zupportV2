import { db } from "@/lib/db";
import { removeVerified, setFeatured, setPageStatus } from "@/app/actions/moderation";

export const dynamic = "force-dynamic";

export default async function AdminPages({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const term = q.trim().slice(0, 60);
  const pages = await db.creatorPage.findMany({ take: 100, orderBy: { createdAt: "desc" }, include: { owner: true },
    where: term ? { OR: [{ displayName: { contains: term, mode: "insensitive" } }, { username: { contains: term, mode: "insensitive" } }] } : {} });
  return (
    <div className="space-y-4">
      <form role="search" className="flex gap-2"><label htmlFor="q" className="sr-only">Search pages</label>
        <input id="q" name="q" defaultValue={term} placeholder="Search name or username" className="input max-w-sm" /><button className="btn">Search</button></form>
      {pages.map(p => (
        <div key={p.id} className="card flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
          <div><div className="font-semibold">{p.displayName} <span className="font-normal text-muted-foreground">/c/{p.username}</span></div>
            <div className="text-muted-foreground">{p.owner.email} · {p.status.toLowerCase()} · verification: {p.verification.toLowerCase()}{p.featured ? " · featured" : ""}</div></div>
          <div className="flex flex-wrap gap-2">
            {p.status === "SUSPENDED"
              ? <form action={setPageStatus.bind(null, p.id, "ACTIVE")}><button className="btn">Restore</button></form>
              : <form action={setPageStatus.bind(null, p.id, "SUSPENDED")}><button className="btn-outline !border-danger !text-danger">Suspend</button></form>}
            <form action={setFeatured.bind(null, p.id, !p.featured)}><button className="btn-outline">{p.featured ? "Unfeature" : "Feature"}</button></form>
            {p.verification === "VERIFIED" && <form action={removeVerified.bind(null, p.id)}><button className="btn-outline">Remove badge</button></form>}
          </div>
        </div>))}
    </div>
  );
}
