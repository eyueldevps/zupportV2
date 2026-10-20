import { db } from "@/lib/db";
import { ownedPage } from "@/lib/owner";
import { updateProfile } from "@/app/actions/manage";
import { publishPage } from "@/app/actions/creator";
import { Alert } from "@/components/forms";

export default async function Profile({ params, searchParams }: { params: Promise<{ username: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { username } = await params;
  const { error, saved } = await searchParams;
  const page = await ownedPage(username);
  const cats = await db.category.findMany({ orderBy: { sort: "asc" } });
  const links = (page.links ?? {}) as Record<string, string>;
  const L = "block text-sm font-medium";
  return (
    <div className="space-y-6">
      {error && <Alert kind="error">{error}</Alert>}
      {saved && <Alert kind="ok">Saved.</Alert>}
      {page.status === "DRAFT" && (
        <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="text-sm">This page is a draft. Publish it when your memberships and first posts are ready.</p>
          <form action={publishPage.bind(null, page.id)}><button className="btn">Publish page</button></form>
        </div>)}
      <form action={updateProfile.bind(null, page.id)} className="card space-y-4 p-6">
        <label className={L}>Page name<input name="displayName" defaultValue={page.displayName} required className="input mt-1" /></label>
        <label className={L}>Category<select name="category" defaultValue={cats.find(c => c.id === page.categoryId)?.slug} className="input mt-1">
          {cats.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}</select></label>
        <label className={L}>Country<input name="country" defaultValue={page.country ?? ""} className="input mt-1" /></label>
        <label className={L}>About<textarea name="bio" rows={5} defaultValue={page.bio} className="input mt-1" /></label>
        <h2 className="pt-2 font-semibold">Links (optional, must start with https://)</h2>
        <label className={L}>Website<input name="website" defaultValue={links.website ?? ""} className="input mt-1" /></label>
        <label className={L}>YouTube channel<input name="youtube" defaultValue={links.youtube ?? ""} className="input mt-1" /></label>
        <label className={L}>Instagram<input name="instagram" defaultValue={links.instagram ?? ""} className="input mt-1" /></label>
        <label className={L}>Telegram<input name="telegram" defaultValue={links.telegram ?? ""} className="input mt-1" /></label>
        <button className="btn">Save profile</button>
      </form>
    </div>
  );
}
