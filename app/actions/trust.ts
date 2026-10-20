"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { detectImage } from "@/lib/payments";
import { allow } from "@/lib/ratelimit";
import { requireUser } from "@/lib/session";

const q = encodeURIComponent;

export async function submitVerification(pageId: string, fd: FormData) {
  const user = await requireUser();
  const page = await db.creatorPage.findFirst({ where: { id: pageId, ownerId: user.id } });
  if (!page) redirect("/account");
  const base = `/manage/${page.username}/verification`;
  function fail(m: string): never { redirect(`${base}?error=${q(m)}`); }
  if (!user.emailVerifiedAt) fail("Verify your email first (see your Account page)");
  if (page.verification === "PENDING" || page.verification === "VERIFIED") fail("This page already has a verification request or is verified");
  if (!(await allow(`verif:${user.id}`, 3, 86400))) fail("Too many submissions today. Try again tomorrow.");

  const read = async (field: string) => {
    const f = fd.get(field);
    if (!(f instanceof File) || f.size === 0) fail("Upload both photos");
    if (f.size > 4_000_000) fail("Each photo must be under 4 MB");
    const data = new Uint8Array(await f.arrayBuffer());
    const mime = detectImage(data);
    if (!mime) fail("Photos must be PNG, JPG or WebP");
    return { data, mime };
  };
  const id = await read("idDoc");
  const selfie = await read("selfie");
  await db.$transaction(async tx => {
    const a = await tx.verificationFile.create({ data: id });
    const b = await tx.verificationFile.create({ data: selfie });
    await tx.verification.create({ data: { pageId: page.id, phone: String(fd.get("phone") ?? "").trim().slice(0, 30) || null, idDocKey: a.id, selfieKey: b.id } });
    await tx.creatorPage.update({ where: { id: page.id }, data: { verification: "PENDING" } });
  });
  redirect(`${base}?submitted=1`);
}

const REASONS = ["Scam or fraud", "Pretending to be someone else", "Hateful or abusive content", "Illegal content", "Copyright problem", "Something else"];

export async function submitReport(fd: FormData) {
  const user = await requireUser();
  const pageIdRaw = String(fd.get("pageId") ?? ""), postIdRaw = String(fd.get("postId") ?? "");
  const back = `/report?${postIdRaw ? `post=${q(postIdRaw)}` : `page=${q(pageIdRaw)}`}`;
  if (!(await allow(`report:${user.id}`, 10, 3600))) redirect(`${back}&error=${q("Too many reports. Please try again later.")}`);
  let pageId: string | null = null, postId: string | null = null;
  if (postIdRaw) {
    const post = await db.post.findUnique({ where: { id: postIdRaw } });
    if (!post) redirect("/explore");
    postId = post.id; pageId = post.pageId;
  } else {
    const page = await db.creatorPage.findUnique({ where: { id: pageIdRaw } });
    if (!page) redirect("/explore");
    pageId = page.id;
  }
  const reason = REASONS.includes(String(fd.get("reason"))) ? String(fd.get("reason")) : "Something else";
  const details = String(fd.get("details") ?? "").trim().slice(0, 500);
  await db.report.create({ data: { reporterId: user.id, pageId, postId, reason: details ? `${reason}: ${details}` : reason } });
  redirect("/report?done=1");
}
