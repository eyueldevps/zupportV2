import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { resendVerification } from "../actions/auth";
import { publishPage } from "../actions/creator";
import { Alert } from "@/components/forms";

export const dynamic = "force-dynamic";

export default async function Account({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const pages = await db.creatorPage.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: "desc" } });
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="text-3xl font-bold">Hi, {user.name}</h1>
      {sp.error && <Alert kind="error">{sp.error}</Alert>}
      {sp.verified && <Alert kind="ok">Your email is verified.</Alert>}
      {sp.sent && <Alert kind="ok">Verification link sent. In development it appears in the terminal.</Alert>}
      {sp.created && <Alert kind="ok">Draft page created. Click Manage to set it up, then publish.</Alert>}
      {sp.published && <Alert kind="ok">Your page is live.</Alert>}

      <section className="card p-6">
        <h2 className="font-semibold">Email</h2>
        <p className="mt-1 text-sm">{user.email} · {user.emailVerifiedAt ? "Verified" : "Not verified"}</p>
        {!user.emailVerifiedAt && (
          <form action={resendVerification} className="mt-3"><button className="btn-outline">Send verification link</button></form>)}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Your creator pages</h2>
          <Link href="/creator/new" className="btn">New page</Link>
        </div>
        {pages.length === 0 && <p className="mt-4 text-muted-foreground">You have no pages yet. Start one to receive support.</p>}
        <div className="mt-4 space-y-3">
          {pages.map(p => (
            <div key={p.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div><div className="font-semibold">{p.displayName}</div>
                <div className="text-sm text-muted-foreground">/c/{p.username} · {p.status === "ACTIVE" ? "Published" : p.status === "DRAFT" ? "Draft" : "Suspended"}</div></div>
              <div className="flex gap-2">
                <Link href={`/manage/${p.username}`} className="btn-outline">Manage</Link>
                {p.status === "DRAFT" && <form action={publishPage.bind(null, p.id)}><button className="btn">Publish</button></form>}
              </div>
            </div>))}
        </div>
      </section>
    </div>
  );
}
