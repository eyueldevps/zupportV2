import { db } from "@/lib/db";
import { ownedPage } from "@/lib/owner";
import { saveTier } from "@/app/actions/manage";
import { Alert } from "@/components/forms";

type T = { name: string; priceMinor: number; description: string; benefits: string[]; active: boolean };

function TierForm({ action, t, button }: { action: (fd: FormData) => Promise<void>; t: T; button: string }) {
  const L = "block text-sm font-medium";
  return (
    <form action={action} className="card space-y-3 p-5">
      <label className={L}>Tier name<input name="name" defaultValue={t.name} required className="input mt-1" /></label>
      <label className={L}>Price in Birr per 30 days<input name="priceBirr" type="number" min={20} step={1} defaultValue={t.priceMinor / 100 || ""} required className="input mt-1" /></label>
      <label className={L}>Short description<input name="description" defaultValue={t.description} className="input mt-1" /></label>
      <label className={L}>Benefits (one per line)<textarea name="benefits" rows={3} defaultValue={t.benefits.join("\n")} className="input mt-1" /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={t.active} /> Visible to supporters</label>
      <button className="btn">{button}</button>
    </form>
  );
}

export default async function Tiers({ params, searchParams }: { params: Promise<{ username: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { username } = await params;
  const { error, saved } = await searchParams;
  const page = await ownedPage(username);
  const tiers = await db.tier.findMany({ where: { pageId: page.id }, orderBy: { sort: "asc" } });
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Tiers with supporters can be hidden but not deleted, so payment records stay accurate. Memberships last 30 days from approval.</p>
      {error && <Alert kind="error">{error}</Alert>}
      {saved && <Alert kind="ok">Saved.</Alert>}
      {tiers.map(t => <TierForm key={t.id} t={t} action={saveTier.bind(null, page.id, t.id)} button="Save tier" />)}
      <h2 className="pt-2 text-xl font-bold">Add a tier</h2>
      <TierForm t={{ name: "", priceMinor: 0, description: "", benefits: [], active: true }} action={saveTier.bind(null, page.id, null)} button="Add tier" />
    </div>
  );
}
