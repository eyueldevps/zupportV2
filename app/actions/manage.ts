"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { youtubeId } from "@/lib/format";
import { cleanHtml, textOnly } from "@/lib/sanitize";
import { requireUser } from "@/lib/session";

const q = encodeURIComponent;

async function owned(pageId: string) {
  const user = await requireUser();
  const page = await db.creatorPage.findFirst({ where: { id: pageId, ownerId: user.id } });
  if (!page) redirect("/account");
  return page;
}

const link = z.union([z.literal(""), z.string().trim().url("Links must be full web addresses").refine(u => u.startsWith("https://"), "Links must start with https://")]);

export async function updateProfile(pageId: string, fd: FormData) {
  const page = await owned(pageId);
  const base = `/manage/${page.username}`;
  const p = z.object({
    displayName: z.string().trim().min(2, "Enter a page name").max(80),
    bio: z.string().trim().max(1000), category: z.string().max(40), country: z.string().trim().max(60),
    website: link, youtube: link, instagram: link, telegram: link,
  }).safeParse(Object.fromEntries(fd));
  if (!p.success) redirect(`${base}?error=${q(p.error.issues[0].message)}`);
  const cat = await db.category.findUnique({ where: { slug: p.data.category } });
  const links = Object.fromEntries(Object.entries({ website: p.data.website, youtube: p.data.youtube, instagram: p.data.instagram, telegram: p.data.telegram }).filter(([, v]) => v));
  await db.creatorPage.update({ where: { id: page.id }, data: { displayName: p.data.displayName, bio: p.data.bio,
    categoryId: cat?.id ?? null, country: p.data.country || null, links } });
  redirect(`${base}?saved=1`);
}

export async function saveTier(pageId: string, tierId: string | null, fd: FormData) {
  const page = await owned(pageId);
  const base = `/manage/${page.username}/tiers`;
  const p = z.object({
    name: z.string().trim().min(2, "Enter a tier name").max(40),
    priceBirr: z.coerce.number().int("Price must be a whole number of Birr").min(20, "Minimum price is 20 Birr").max(100000),
    description: z.string().trim().max(300), benefits: z.string().max(1200),
  }).safeParse(Object.fromEntries(fd));
  if (!p.success) redirect(`${base}?error=${q(p.error.issues[0].message)}`);
  const data = { name: p.data.name, priceMinor: p.data.priceBirr * 100, description: p.data.description,
    benefits: p.data.benefits.split("\n").map(s => s.trim().slice(0, 100)).filter(Boolean).slice(0, 8),
    active: fd.get("active") === "on" };
  if (tierId) await db.tier.updateMany({ where: { id: tierId, pageId: page.id }, data });
  else await db.tier.create({ data: { ...data, pageId: page.id, sort: await db.tier.count({ where: { pageId: page.id } }) } });
  redirect(`${base}?saved=1`);
}

export async function savePost(pageId: string, postId: string | null, fd: FormData) {
  const page = await owned(pageId);
  const list = `/manage/${page.username}/posts`;
  const here = postId ? `${list}/${postId}` : `${list}/new`;
  const fail = (m: string) => redirect(`${here}?error=${q(m)}`);

  const type = fd.get("type") === "VIDEO" ? "VIDEO" : "ARTICLE";
  const title = String(fd.get("title") ?? "").trim().slice(0, 120);
  if (title.length < 2) fail("Enter a title");
  const tierRaw = String(fd.get("tierId") ?? "");
  let tierId: string | null = null;
  if (tierRaw) {
    const tier = await db.tier.findFirst({ where: { id: tierRaw, pageId: page.id } });
    if (!tier) fail("Choose one of your own tiers");
    tierId = tier!.id;
  }
  const raw = String(fd.get("body") ?? "");
  let body = "", excerpt = "", yt: string | null = null;
  if (type === "ARTICLE") {
    body = cleanHtml(raw);
    const text = textOnly(body);
    if (!text) fail("Write something in the article");
    excerpt = text.slice(0, 160);
  } else {
    yt = youtubeId(String(fd.get("youtubeUrl") ?? ""));
    if (!yt) fail("That is not a valid YouTube link");
    body = raw.trim().slice(0, 2000);
    excerpt = body.slice(0, 160);
  }
  const publish = fd.get("intent") === "publish";
  const existing = postId ? await db.post.findFirst({ where: { id: postId, pageId: page.id } }) : null;
  if (postId && !existing) redirect(list);
  const data = { type, title, body, excerpt, youtubeId: yt, tierId, published: publish,
    publishedAt: publish ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt ?? null } as const;
  if (existing) await db.post.update({ where: { id: existing.id }, data });
  else await db.post.create({ data: { ...data, pageId: page.id } });
  redirect(`${list}?saved=1`);
}

export async function deletePost(pageId: string, postId: string) {
  const page = await owned(pageId);
  await db.post.deleteMany({ where: { id: postId, pageId: page.id } });
  redirect(`/manage/${page.username}/posts?deleted=1`);
}
