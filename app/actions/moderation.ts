"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const log = (actorId: string, action: string, entity: string, entityId: string) =>
  db.auditLog.create({ data: { actorId, action, entity, entityId } });

export async function reviewVerification(id: string, decision: "VERIFIED" | "REJECTED", fd: FormData) {
  const admin = await requireAdmin();
  const note = String(fd.get("note") ?? "").trim().slice(0, 300) || null;
  await db.$transaction(async tx => {
    const v = await tx.verification.findUnique({ where: { id } });
    if (!v || v.status !== "PENDING") return;
    const keys = [v.idDocKey, v.selfieKey].filter((k): k is string => !!k);
    await tx.verificationFile.deleteMany({ where: { id: { in: keys } } }); // ID photos are deleted once a decision is made
    await tx.verification.update({ where: { id }, data: { status: decision, note, reviewedAt: new Date(), reviewedBy: admin.id, idDocKey: null, selfieKey: null } });
    await tx.creatorPage.update({ where: { id: v.pageId }, data: { verification: decision } });
    await tx.auditLog.create({ data: { actorId: admin.id, action: `verification.${decision.toLowerCase()}`, entity: "CreatorPage", entityId: v.pageId } });
  });
  revalidatePath("/admin/verifications");
}

export async function setReportStatus(id: string, status: "RESOLVED" | "DISMISSED") {
  const admin = await requireAdmin();
  await db.report.updateMany({ where: { id, status: "OPEN" }, data: { status } });
  await log(admin.id, `report.${status.toLowerCase()}`, "Report", id);
  revalidatePath("/admin/reports");
}

export async function setPageStatus(pageId: string, status: "ACTIVE" | "SUSPENDED") {
  const admin = await requireAdmin();
  await db.creatorPage.update({ where: { id: pageId }, data: { status } });
  await log(admin.id, status === "SUSPENDED" ? "page.suspended" : "page.restored", "CreatorPage", pageId);
  revalidatePath("/admin/pages"); revalidatePath("/admin/reports");
}

export async function setFeatured(pageId: string, featured: boolean) {
  const admin = await requireAdmin();
  await db.creatorPage.update({ where: { id: pageId }, data: { featured } });
  await log(admin.id, featured ? "page.featured" : "page.unfeatured", "CreatorPage", pageId);
  revalidatePath("/admin/pages");
}

export async function removeVerified(pageId: string) {
  const admin = await requireAdmin();
  await db.creatorPage.update({ where: { id: pageId }, data: { verification: "NONE" } });
  await log(admin.id, "verification.removed", "CreatorPage", pageId);
  revalidatePath("/admin/pages");
}
