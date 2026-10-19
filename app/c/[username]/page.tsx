import { notFound } from "next/navigation";
import { BadgeCheck, MapPin } from "lucide-react";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CreatorPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const t = await getT();
  const page = await db.creatorPage.findUnique({ where: { username }, include: { category: true,
    tiers: { where: { active: true }, orderBy: { priceMinor: "asc" } },
    posts: { where: { published: true }, orderBy: { publishedAt: "desc" }, take: 20 } } });
  if (!page || page.status !== "ACTIVE") notFound();
  return (
    <div>
      <div className="h-40 bg-gradient-to-r from-primary to-blue-400 sm:h-56" aria-hidden />
      <div className="mx-auto max-w-6xl px-4">
        <div className="-mt-10 flex items-end gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-primary text-4xl font-bold text-primary-foreground" aria-hidden>{page.displayName[0]}</div>
        </div>
        <h1 className="mt-4 flex items-center gap-2 text-3xl font-bold">{page.displayName}
          {page.verification === "VERIFIED" && <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-sm font-medium text-secondary"><BadgeCheck size={16} />{t("badge.verified")}</span>}</h1>
        <p className="mt-1 flex items-center gap-3 text-muted-foreground">{page.category?.name}
          {page.country && <span className="inline-flex items-center gap-1"><MapPin size={14} />{page.country}</span>}</p>

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold">{t("page.about")}</h2>
            <p className="mt-2 whitespace-pre-line">{page.bio}</p>
            <h2 className="mt-10 text-xl font-bold">{t("page.posts")}</h2>
            {page.posts.length === 0 && <p className="mt-3 text-muted-foreground">{t("page.noposts")}</p>}
            <div className="mt-4 space-y-4">
              {page.posts.map(post => {
                const locked = !!post.tierId; // member access check arrives with accounts + payments; locked bodies are never sent
                return (
                  <article key={post.id} className="card p-5">
                    <h3 className="font-semibold">{post.title}</h3>
                    {locked ? <p className="mt-2 text-sm text-muted-foreground">{t("page.locked")}</p> : <>
                      {post.type === "VIDEO" && post.youtubeId && (
                        <iframe className="mt-3 aspect-video w-full rounded-xl" title={post.title} loading="lazy" allowFullScreen
                          src={`https://www.youtube-nocookie.com/embed/${post.youtubeId}`} />)}
                      <p className="mt-2 whitespace-pre-line">{post.body || post.excerpt}</p></>}
                  </article>);
              })}
            </div>
          </div>
          <aside className="space-y-4">
            <h2 className="text-xl font-bold">{t("page.membership")}</h2>
            {page.tiers.map(tier => (
              <div key={tier.id} className="card p-5">
                <div className="font-semibold">{tier.name}</div>
                <div className="text-2xl font-bold">{money(tier.priceMinor, tier.currency)} <span className="text-sm font-normal text-muted-foreground">{t("page.period")}</span></div>
                <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
                <ul className="mt-2 list-disc pl-5 text-sm">{tier.benefits.map(b => <li key={b}>{b}</li>)}</ul>
                <button className="btn mt-4 w-full" disabled>{t("page.soon")}</button>
              </div>))}
            <button className="btn-outline w-full" disabled>{t("page.tip")}</button>
          </aside>
        </div>
      </div>
    </div>
  );
}
