import { notFound } from "next/navigation";
import { db } from "./db";
import { requireUser } from "./session";

// Every manage page and action re-checks ownership. Never trust the URL alone.
export async function ownedPage(username: string) {
  const user = await requireUser();
  const page = await db.creatorPage.findUnique({ where: { username } });
  if (!page || page.ownerId !== user.id) notFound();
  return page;
}
