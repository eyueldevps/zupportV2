import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const tab = "rounded-t-lg px-4 py-2 text-sm font-medium hover:bg-muted";
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Admin</h1>
      <nav aria-label="Admin" className="mt-4 flex gap-1 border-b border-border">
        <Link href="/admin/payments" className={tab}>Payments</Link>
        <Link href="/admin/payouts" className={tab}>Payouts</Link>
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
