import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, FileText, Lock, MapPin, PlayCircle } from "lucide-react";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n";
import { money } from "@/lib/format";
import { allows, getMembership } from "@/lib/access";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CreatorPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const t = await getT();
  const user = await currentUser();
  const page = await db.creatorPage.findUnique({ where: { username }, include: { category: true,
    tiers: { where: { active: true }, orderBy: { priceMinor: "asc" } },
    posts: { where: { published: true }, orderBy: { publishedAt: "desc" }, take: 30, include: { tier: true } } } });
  const isOwner = !!user && !!page && page.ownerId === user.id;
  if (!page || (page.status !== "ACTIVE" && !isOwner)) notFound();
  const member = user ? await getMembership(user.id, page.id) : null;
  const links = Object.entries((page.links ?? {}) as Record<string, string>).filter(([, v]) => v);
  return (
    <div>
      {page.status !== "ACTIVE" && <div className="bg-accent/20 px-4 py-2 text-center text-sm font-medium">Draft preview. Only you can see this page.</div>}
      <div className="h-40 bg-gradient-to-r from-primary to-blue-400 sm:h-56" aria-hidden />
      <div className="mx-auto max-w-6xl px-4">
        <div className="-mt-10 flex items-end gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-primary text-4xl font-bold text-primary-foreground" aria-hidden>{page.displayName[0]}</div>
          {isOwner && <Link href={`/manage/${username}`} className="btn-outline ml-auto">Manage page</Link>}
        </div>
        <h1 className="mt-4 flex items-center gap-2 text-3xl font-bold">{page.displayName}
          {page.verification === "VERIFIED" && <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-sm font-medium text-secondary"><BadgeCheck size={16} />{t("badge.verified")}</span>}</h1>
        <p className="mt-1 flex items-center gap-3 text-muted-foreground">{page.category?.name}
          {page.country && <span className="inline-flex items-center gap-1"><MapPin size={14} />{page.country}</span>}</p>
        {links.length > 0 && <p className="mt-2 flex flex-wrap gap-4 text-sm">{links.map(([k, v]) =>
          <a key={k} href={v} target="_blank" rel="noopener noreferrer nofollow" className="font-medium capitalize text-link">{k}</a>)}</p>}

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold">{t("page.about")}</h2>
            <p className="mt-2 whitespace-pre-line">{page.bio}</p>
            <h2 className="mt-10 text-xl font-bold">{t("page.posts")}</h2>
            {page.posts.length === 0 && <p className="mt-3 text-muted-foreground">{t("page.noposts")}</p>}
            <div className="mt-4 space-y-4">
              {page.posts.map(post => {
                const locked = !!post.tierId && !isOwner && !allows(member, post.tier);
                return (
                  <Link key={post.id} href={`/c/${username}/p/${post.id}`} className="card block p-5 hover:border-primary">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">{post.type === "VIDEO" ? <PlayCircle size={14} /> : <FileText size={14} />}{post.type === "VIDEO" ? "Video" : "Article"}</span>
                      {post.tierId && <span className="inline-flex items-center gap-1"><Lock size={12} />Members only</span>}
                    </div>
                    <h3 className="mt-1 font-semibold">{post.title}</h3>
                    {!locked && post.excerpt && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>}
                  </Link>);
              })}
            </div>
          </div>
          <aside className="space-y-4">
            <h2 className="text-xl font-bold">{t("page.membership")}</h2>
            {member && <p role="status" className="rounded-xl border border-secondary p-3 text-sm text-secondary"><b>You are a member</b> ({member.tier.name}) until {member.expiresAt.toLocaleDateString()}.</p>}
            {page.tiers.length === 0 && <p className="text-sm text-muted-foreground">No memberships yet.</p>}
            {page.tiers.map(tier => (
              <div key={tier.id} className="card p-5">
                <div className="font-semibold">{tier.name}</div>
                <div className="text-2xl font-bold">{money(tier.priceMinor, tier.currency)} <span className="text-sm font-normal text-muted-foreground">{t("page.period")}</span></div>
                <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
                <ul className="mt-2 list-disc pl-5 text-sm">{tier.benefits.map(b => <li key={b}>{b}</li>)}</ul>
                {isOwner ? <p className="mt-4 text-sm text-muted-foreground">This is your page.</p> :
                  <Link href={`/c/${username}/join/${tier.id}`} className="btn mt-4 w-full">{member?.tierId === tier.id ? "Renew" : member ? "Switch to this tier" : "Join"}</Link>}
              </div>))}
            {!isOwner && page.status === "ACTIVE" && <Link href={`/c/${username}/tip`} className="btn-outline w-full">{t("page.tip")}</Link>}
          </aside>
        </div>
      </div>
    </div>
  );
}
