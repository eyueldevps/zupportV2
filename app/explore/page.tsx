import Link from "next/link";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n";
import { CreatorCard } from "@/components/CreatorCard";

export const dynamic = "force-dynamic";

export default async function Explore({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const { q = "", category = "" } = await searchParams;
  const t = await getT();
  const term = q.trim().slice(0, 60);
  const [cats, pages] = await Promise.all([
    db.category.findMany({ orderBy: { sort: "asc" } }),
    db.creatorPage.findMany({
      where: { status: "ACTIVE", ...(category && { category: { slug: category } }),
        ...(term && { OR: [{ displayName: { contains: term, mode: "insensitive" } }, { bio: { contains: term, mode: "insensitive" } }] }) },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: 48,
      include: { category: true, tiers: { where: { active: true }, orderBy: { priceMinor: "asc" }, take: 1 } } }),
  ]);
  const chip = (on: boolean) => `rounded-full border px-3 py-1.5 text-sm font-medium ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"}`;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t("explore.title")}</h1>
      <form className="mt-6 flex gap-2" role="search">
        <label htmlFor="q" className="sr-only">{t("explore.search")}</label>
        <input id="q" name="q" defaultValue={term} placeholder={t("explore.search")} className="input max-w-md" />
        {category && <input type="hidden" name="category" value={category} />}
        <button className="btn">{t("explore.search")}</button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={term ? `/explore?q=${encodeURIComponent(term)}` : "/explore"} className={chip(!category)}>{t("explore.all")}</Link>
        {cats.map(c => <Link key={c.id} href={`/explore?category=${c.slug}${term ? `&q=${encodeURIComponent(term)}` : ""}`} className={chip(category === c.slug)}>{c.name}</Link>)}
      </div>
      {pages.length === 0 ? <p className="mt-10 text-muted-foreground">{t("explore.empty")}</p> :
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{pages.map(p => <CreatorCard key={p.id} p={p} t={t} />)}</div>}
    </div>
  );
}
