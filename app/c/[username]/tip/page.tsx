import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { PayForm } from "@/components/PayForm";

export default async function Tip({ params, searchParams }: { params: Promise<{ username: string }>; searchParams: Promise<{ error?: string }> }) {
  await requireUser();
  const { username } = await params;
  const { error } = await searchParams;
  const page = await db.creatorPage.findFirst({ where: { username, status: "ACTIVE" } });
  if (!page) notFound();
  return <PayForm pageId={page.id} error={error} title={`Send a tip to ${page.displayName}`} />;
}
