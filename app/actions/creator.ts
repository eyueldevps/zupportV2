"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

const q = encodeURIComponent;

export async function createPage(fd: FormData) {
  const user = await requireUser();
  const p = z.object({
    username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,30}$/, "Username: 3 to 30 letters, numbers or underscores"),
    displayName: z.string().trim().min(2, "Enter a page name").max(80),
    bio: z.string().trim().max(1000),
    category: z.string().max(40),
    country: z.string().trim().max(60).optional(),
  }).safeParse(Object.fromEntries(fd));
  if (!p.success) redirect(`/creator/new?error=${q(p.error.issues[0].message)}`);
  if (await db.creatorPage.findUnique({ where: { username: p.data.username } })) redirect(`/creator/new?error=${q("That username is taken")}`);
  const category = await db.category.findUnique({ where: { slug: p.data.category } });
  await db.creatorPage.create({ data: { ownerId: user.id, username: p.data.username, displayName: p.data.displayName,
    bio: p.data.bio, categoryId: category?.id, country: p.data.country || null, status: "DRAFT" } });
  if (user.role === "SUPPORTER") await db.user.update({ where: { id: user.id }, data: { role: "CREATOR" } });
  redirect("/account?created=1");
}

export async function publishPage(pageId: string) {
  const user = await requireUser();
  if (!user.emailVerifiedAt) redirect(`/account?error=${q("Verify your email before publishing a page")}`);
  await db.creatorPage.updateMany({ where: { id: pageId, ownerId: user.id, status: "DRAFT" }, data: { status: "ACTIVE" } });
  redirect("/account?published=1");
}
