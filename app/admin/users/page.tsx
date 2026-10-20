import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Users({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const term = q.trim().slice(0, 60);
  const users = await db.user.findMany({ take: 100, orderBy: { createdAt: "desc" },
    where: term ? { OR: [{ name: { contains: term, mode: "insensitive" } }, { email: { contains: term, mode: "insensitive" } }] } : {} });
  return (
    <div className="space-y-4">
      <form role="search" className="flex gap-2"><label htmlFor="q" className="sr-only">Search users</label>
        <input id="q" name="q" defaultValue={term} placeholder="Search name or email" className="input max-w-sm" /><button className="btn">Search</button></form>
      <div className="card divide-y divide-border">
        {users.map(u => (
          <div key={u.id} className="flex flex-wrap justify-between gap-2 p-3 text-sm">
            <span><b>{u.name}</b> · {u.email}</span>
            <span className="text-muted-foreground">{u.role.toLowerCase()} · email {u.emailVerifiedAt ? "verified" : "not verified"} · joined {u.createdAt.toLocaleDateString()}</span>
          </div>))}
      </div>
    </div>
  );
}
