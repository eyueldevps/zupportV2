import { db } from "@/lib/db";
import { ownedPage } from "@/lib/owner";
import { submitVerification } from "@/app/actions/trust";
import { Alert } from "@/components/forms";

export default async function VerificationPage({ params, searchParams }: { params: Promise<{ username: string }>; searchParams: Promise<{ error?: string; submitted?: string }> }) {
  const { username } = await params;
  const sp = await searchParams;
  const page = await ownedPage(username);
  const last = await db.verification.findFirst({ where: { pageId: page.id }, orderBy: { submittedAt: "desc" } });
  const L = "block text-sm font-medium";
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">The Verified badge tells supporters that we checked who runs this page. It is not an endorsement of the content. Your ID photos are seen only by Zupport staff and are deleted as soon as we decide.</p>
      {sp.error && <Alert kind="error">{sp.error}</Alert>}
      {sp.submitted && <Alert kind="ok">Request sent. We will review it by hand.</Alert>}
      {page.verification === "VERIFIED" && <Alert kind="ok">This page is verified.</Alert>}
      {page.verification === "PENDING" && <p className="card p-5">Your request is waiting for review.</p>}
      {page.verification === "REJECTED" && <Alert kind="error">Your last request was not approved{last?.note ? `: ${last.note}` : "."} You can send a new one below.</Alert>}
      {(page.verification === "NONE" || page.verification === "REJECTED") && (
        <form action={submitVerification.bind(null, page.id)} className="card space-y-4 p-6">
          <label className={L}>Phone number (optional)<input name="phone" className="input mt-1" autoComplete="tel" /></label>
          <label className={L}>Photo of your government ID (PNG, JPG or WebP, under 4 MB)<input name="idDoc" type="file" accept="image/png,image/jpeg,image/webp" required className="input mt-1" /></label>
          <label className={L}>Selfie holding that ID<input name="selfie" type="file" accept="image/png,image/jpeg,image/webp" required className="input mt-1" /></label>
          <button className="btn">Send for verification</button>
        </form>)}
    </div>
  );
}
