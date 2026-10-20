"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { DAY_MS, MEMBERSHIP_DAYS } from "@/lib/payments";
import { ledger } from "@/lib/ledger";

export async function reviewPayment(id: string, decision: "APPROVED" | "REJECTED", fd: FormData) {
  const admin = await requireAdmin(); // re-checked on every call
  const note = String(fd.get("note") ?? "").trim().slice(0, 300) || null;
  await db.$transaction(async tx => {
    const p = await tx.payment.findUnique({ where: { id } });
    if (!p || p.status !== "PENDING") return; // a payment can only be reviewed once
    await tx.payment.update({ where: { id }, data: { status: decision, note, reviewedAt: new Date(), reviewedBy: admin.id } });
    if (decision === "APPROVED" && p.purpose === "MEMBERSHIP" && p.tierId) {
      const key = { userId_pageId: { userId: p.userId, pageId: p.pageId } };
      const ex = await tx.membership.findUnique({ where: key });
      const now = new Date();
      const start = ex && ex.status === "ACTIVE" && ex.expiresAt > now ? ex.expiresAt : now; // renewals stack
      const expiresAt = new Date(start.getTime() + MEMBERSHIP_DAYS * DAY_MS);
      await tx.membership.upsert({ where: key, update: { tierId: p.tierId, status: "ACTIVE", expiresAt },
        create: { userId: p.userId, pageId: p.pageId, tierId: p.tierId, expiresAt } });
    }
    await tx.auditLog.create({ data: { actorId: admin.id, action: `payment.${decision.toLowerCase()}`, entity: "Payment", entityId: id, meta: { grossMinor: p.grossMinor } } });
  });
  revalidatePath("/admin/payments");
}

export async function recordPayout(pageId: string, fd: FormData) {
  const admin = await requireAdmin();
  const birr = Number(fd.get("amountBirr"));
  const owed = (await ledger([pageId]))[pageId]?.owed ?? 0;
  if (!Number.isInteger(birr) || birr <= 0 || birr * 100 > owed) redirect("/admin/payouts?error=" + encodeURIComponent("Enter a whole amount that is not more than what is owed"));
  const reference = String(fd.get("reference") ?? "").trim().slice(0, 60) || null;
  await db.payout.create({ data: { pageId, amountMinor: birr * 100, reference, status: "PAID", paidAt: new Date() } });
  await db.auditLog.create({ data: { actorId: admin.id, action: "payout.recorded", entity: "CreatorPage", entityId: pageId, meta: { amountMinor: birr * 100 } } });
  redirect("/admin/payouts?done=1");
}
