import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { submitReport } from "../actions/trust";
import { Alert } from "@/components/forms";

const REASONS = ["Scam or fraud", "Pretending to be someone else", "Hateful or abusive content", "Illegal content", "Copyright problem", "Something else"];

export default async function Report({ searchParams }: { searchParams: Promise<{ page?: string; post?: string; done?: string; error?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  if (sp.done) return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-12"><Alert kind="ok">Thank you. We will review your report.</Alert>
      <Link href="/explore" className="btn-outline">Back to Explore</Link></div>);
  const post = sp.post ? await db.post.findUnique({ where: { id: sp.post }, include: { page: true } }) : null;
  const page = post?.page ?? (sp.page ? await db.creatorPage.findUnique({ where: { id: sp.page } }) : null);
  if (!page) notFound();
  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-12">
      <h1 className="text-2xl font-bold">Report {post ? "a post" : "a page"}</h1>
      <p className="text-muted-foreground">{post ? `"${post.title}" on ` : ""}{page.displayName}</p>
      {sp.error && <Alert kind="error">{sp.error}</Alert>}
      <form action={submitReport} className="card space-y-4 p-6">
        <input type="hidden" name="pageId" value={page.id} />
        {post && <input type="hidden" name="postId" value={post.id} />}
        <label className="block text-sm font-medium">What is the problem?
          <select name="reason" className="input mt-1">{REASONS.map(r => <option key={r}>{r}</option>)}</select></label>
        <label className="block text-sm font-medium">Details (optional)
          <textarea name="details" rows={4} maxLength={500} className="input mt-1" /></label>
        <button className="btn w-full">Send report</button>
      </form>
    </div>
  );
}
