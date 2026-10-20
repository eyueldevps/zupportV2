import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";

// Payment screenshots are private: only a logged-in admin can open them.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") return new Response("Not found", { status: 404 });
  const { id } = await params;
  const proof = await db.paymentProof.findUnique({ where: { paymentId: id } });
  if (!proof) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(proof.data), { headers: {
    "Content-Type": proof.mime, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
