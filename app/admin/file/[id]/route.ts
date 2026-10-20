import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";

// Verification photos are private: only a logged-in admin can open them.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") return new Response("Not found", { status: 404 });
  const { id } = await params;
  const f = await db.verificationFile.findUnique({ where: { id } });
  if (!f) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(f.data), { headers: { "Content-Type": f.mime, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
