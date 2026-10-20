import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { createPage } from "../../actions/creator";
import { Alert, Field } from "@/components/forms";

export default async function NewPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireUser();
  const { error } = await searchParams;
  const cats = await db.category.findMany({ orderBy: { sort: "asc" } });
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold">Start a creator page</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your page starts as a draft. You choose when to publish it. You can run more than one page from the same account.</p>
      <form action={createPage} className="card mt-6 space-y-4 p-6">
        {error && <Alert kind="error">{error}</Alert>}
        <Field label="Page name" name="displayName" />
        <Field label="Username (your page address: /c/username)" name="username" />
        <label className="block text-sm font-medium">Category
          <select name="category" className="input mt-1">{cats.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}</select></label>
        <Field label="Country" name="country" required={false} />
        <label className="block text-sm font-medium">About
          <textarea name="bio" rows={4} className="input mt-1" /></label>
        <button className="btn w-full">Create draft page</button>
      </form>
    </div>
  );
}
