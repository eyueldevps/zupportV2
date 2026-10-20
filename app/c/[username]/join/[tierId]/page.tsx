import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { PayForm } from "@/components/PayForm";

export default async function Join({ params, searchParams }: { params: Promise<{ username: string; tierId: string }>; searchParams: Promise<{ error?: string }> }) {
  await requireUser();
  const { username, tierId } = await params;
  const { error } = await searchParams;
  const tier = await db.tier.findFirst({ where: { id: tierId, active: true, page: { username, status: "ACTIVE" } }, include: { page: true } });
  if (!tier) notFound();
  return <PayForm pageId={tier.pageId} tierId={tier.id} amountMinor={tier.priceMinor} error={error}
    title={`Join ${tier.page.displayName}: ${tier.name}`} />;
}
