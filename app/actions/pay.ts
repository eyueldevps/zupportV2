"use server";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { FEE_BPS, detectImage, newReference, split } from "@/lib/payments";
import { requireUser } from "@/lib/session";

const q = encodeURIComponent;

export async function submitPayment(fd: FormData) {
  const user = await requireUser();
  const page = await db.creatorPage.findUnique({ where: { id: String(fd.get("pageId") ?? "") } });
  if (!page || page.status !== "ACTIVE") redirect("/explore");
  const tierRaw = String(fd.get("tierId") ?? "");
  const back = tierRaw ? `/c/${page.username}/join/${tierRaw}` : `/c/${page.username}/tip`;
  function fail(m: string): never { redirect(`${back}?error=${q(m)}`); }

  if (page.ownerId === user.id) fail("You can't pay your own page");
  let gross: number;
  let tierId: string | null = null;
  let purpose: "MEMBERSHIP" | "TIP";
  if (tierRaw) {
    // The price always comes from the database, never from the form.
    const tier = await db.tier.findFirst({ where: { id: tierRaw, pageId: page.id, active: true } });
    if (!tier) redirect(`/c/${page.username}`);
    gross = tier.priceMinor; tierId = tier.id; purpose = "MEMBERSHIP";
  } else {
    const birr = Number(fd.get("amountBirr"));
    if (!Number.isInteger(birr) || birr < 20 || birr > 100000) fail("Enter a whole amount from 20 to 100,000 Birr");
    gross = birr * 100; purpose = "TIP";
  }
  const txId = String(fd.get("txId") ?? "").replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z0-9]{6,20}$/.test(txId)) fail("Enter the transaction ID from your Telebirr receipt");
  const file = fd.get("proof");
  if (!(file instanceof File) || file.size === 0) fail("Upload a screenshot of your Telebirr receipt");
  if (file.size > 4_000_000) fail("The screenshot must be under 4 MB");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = detectImage(bytes);
  if (!mime) fail("Upload a PNG, JPG or WebP screenshot");

  const { feeMinor, creatorMinor } = split(gross);
  try {
    await db.$transaction(async tx => {
      const p = await tx.payment.create({ data: { userId: user.id, pageId: page.id, purpose, tierId, grossMinor: gross,
        feeBps: FEE_BPS, feeMinor, creatorMinor, reference: newReference(), providerRef: txId } });
      await tx.paymentProof.create({ data: { paymentId: p.id, mime, data: bytes } });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") fail("That transaction ID was already submitted");
    throw e;
  }
  redirect("/memberships?submitted=1");
}
