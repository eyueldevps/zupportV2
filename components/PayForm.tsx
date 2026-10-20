import { submitPayment } from "@/app/actions/pay";
import { Alert } from "./forms";
import { money } from "@/lib/format";

export function PayForm({ pageId, tierId, title, amountMinor, error }:
  { pageId: string; tierId?: string; title: string; amountMinor?: number; error?: string }) {
  const number = process.env.TELEBIRR_NUMBER, name = process.env.TELEBIRR_NAME;
  const L = "block text-sm font-medium";
  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-12">
      <h1 className="text-2xl font-bold">{title}</h1>
      <section className="card space-y-2 p-6">
        <h2 className="font-semibold">1. Pay with Telebirr</h2>
        {amountMinor ? <p>Send exactly <b>{money(amountMinor, "ETB")}</b> to:</p> : <p>Choose an amount and send it to:</p>}
        {number ? <p className="text-2xl font-bold">{number}</p> : <p className="text-danger">Payment details are not set up yet (missing TELEBIRR_NUMBER in .env).</p>}
        {name && <p className="text-sm text-muted-foreground">Account name: {name}</p>}
        <p className="text-sm text-muted-foreground">Keep the Telebirr receipt. You need its transaction ID and a screenshot.</p>
      </section>
      <form action={submitPayment} className="card space-y-4 p-6">
        <h2 className="font-semibold">2. Send us your proof</h2>
        {error && <Alert kind="error">{error}</Alert>}
        <input type="hidden" name="pageId" value={pageId} />
        {tierId && <input type="hidden" name="tierId" value={tierId} />}
        {!amountMinor && <label className={L}>Amount in Birr<input name="amountBirr" type="number" min={20} step={1} required className="input mt-1" /></label>}
        <label className={L}>Telebirr transaction ID<input name="txId" required autoComplete="off" className="input mt-1" /></label>
        <label className={L}>Screenshot of the receipt (PNG, JPG or WebP, under 4 MB)
          <input name="proof" type="file" accept="image/png,image/jpeg,image/webp" required className="input mt-1" /></label>
        <button className="btn w-full">Submit for approval</button>
        <p className="text-sm text-muted-foreground">We check every payment by hand against our Telebirr records. Your access unlocks once it is approved, and you can follow its status under My support.</p>
      </form>
    </div>
  );
}
