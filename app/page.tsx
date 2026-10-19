import Link from "next/link";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n";
import { CategoryIcon } from "@/components/icons";
import { CreatorCard } from "@/components/CreatorCard";
import { Heart, Search, ShieldCheck, Wallet, Receipt, Sprout } from "lucide-react";

export const dynamic = "force-dynamic";
const W = "mx-auto max-w-6xl px-4";

export default async function Home() {
  const t = await getT();
  const [cats, featured] = await Promise.all([
    db.category.findMany({ orderBy: { sort: "asc" }, include: { _count: { select: { pages: { where: { status: "ACTIVE" } } } } } }),
    db.creatorPage.findMany({ where: { status: "ACTIVE", featured: true }, take: 6, include: { category: true, tiers: { where: { active: true }, orderBy: { priceMinor: "asc" }, take: 1 } } }),
  ]);
  const steps = [[Search, "how.s1.t", "how.s1.b"], [Heart, "how.s2.t", "how.s2.b"], [Sprout, "how.s3.t", "how.s3.b"]] as const;
  const why = [[Sprout, "why.1.t", "why.1.b"], [Wallet, "why.2.t", "why.2.b"], [ShieldCheck, "why.3.t", "why.3.b"], [Receipt, "why.4.t", "why.4.b"]] as const;
  return (<>
    <section className={`${W} py-16 sm:py-24`}>
      <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">{t("hero.title")}</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{t("hero.body")}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/explore" className="btn">{t("hero.cta1")}</Link>
        <Link href="/#how" className="btn-outline">{t("hero.cta2")}</Link>
      </div>
    </section>

    <section className={`${W} py-10`}>
      <h2 className="text-2xl font-bold sm:text-3xl">{t("cat.title")}</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cats.map(c => (
          <Link key={c.id} href={`/explore?category=${c.slug}`} className="card flex items-center gap-3 p-4 hover:border-primary">
            <span className="text-link"><CategoryIcon name={c.icon} /></span>
            <span><span className="block text-sm font-semibold">{c.name}</span>
              <span className="text-xs text-muted-foreground">{c._count.pages}</span></span>
          </Link>))}
      </div>
    </section>

    <section className={`${W} py-10`}>
      <div className="flex items-end justify-between"><h2 className="text-2xl font-bold sm:text-3xl">{t("feat.title")}</h2>
        <Link href="/explore" className="text-sm font-medium text-link">{t("hero.cta1")}</Link></div>
      {featured.length === 0 ? <p className="mt-6 text-muted-foreground">{t("feat.empty")}</p> :
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{featured.map(p => <CreatorCard key={p.id} p={p} t={t} />)}</div>}
    </section>

    <section id="how" className={`${W} scroll-mt-8 py-14`}>
      <h2 className="text-2xl font-bold sm:text-3xl">{t("how.title")}</h2>
      <ol className="mt-6 grid gap-4 sm:grid-cols-3">
        {steps.map(([I, h, b], i) => (
          <li key={h} className="card p-6"><I className="text-link" aria-hidden />
            <h3 className="mt-3 font-semibold">{i + 1}. {t(h)}</h3><p className="mt-1 text-sm text-muted-foreground">{t(b)}</p></li>))}
      </ol>
    </section>

    <section className={`${W} py-10`}>
      <h2 className="text-2xl font-bold sm:text-3xl">{t("why.title")}</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {why.map(([I, h, b]) => (<div key={h}><I className="text-secondary" aria-hidden /><h3 className="mt-2 font-semibold">{t(h)}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t(b)}</p></div>))}
      </div>
    </section>

    <section id="faq" className={`${W} scroll-mt-8 py-14`}>
      <h2 className="text-2xl font-bold sm:text-3xl">{t("faq.title")}</h2>
      <div className="mt-6 max-w-3xl space-y-3">
        {([1, 2, 3, 4] as const).map(n => (
          <details key={n} className="card p-4">
            <summary className="cursor-pointer font-semibold">{t(`faq.${n}.q`)}</summary>
            <p className="mt-2 text-muted-foreground">{t(`faq.${n}.a`)}</p>
          </details>))}
      </div>
    </section>

    <section className={`${W} py-10`}>
      <div className="rounded-2xl bg-primary p-8 text-primary-foreground sm:p-12">
        <h2 className="text-2xl font-bold sm:text-3xl">{t("cta.title")}</h2>
        <p className="mt-2 opacity-90">{t("cta.body")}</p>
        <Link href="/explore" className="mt-6 inline-flex rounded-xl bg-white px-5 py-2.5 font-semibold text-blue-700 hover:bg-blue-50">{t("hero.cta1")}</Link>
      </div>
    </section>
  </>);
}
