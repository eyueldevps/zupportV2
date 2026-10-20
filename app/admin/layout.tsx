import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [pay, ver, rep] = await Promise.all([
    db.payment.count({ where: { status: "PENDING" } }), db.verification.count({ where: { status: "PENDING" } }), db.report.count({ where: { status: "OPEN" } })]);
  const tabs = [["/admin/payments", "Payments", pay], ["/admin/payouts", "Payouts", 0], ["/admin/verifications", "Verification", ver],
    ["/admin/reports", "Reports", rep], ["/admin/pages", "Pages", 0], ["/admin/users", "Users", 0], ["/admin/audit", "Audit log", 0]] as const;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Admin</h1>
      <nav aria-label="Admin" className="mt-4 flex flex-wrap gap-1 border-b border-border">
        {tabs.map(([href, label, n]) => (
          <Link key={href} href={href} className="rounded-t-lg px-4 py-2 text-sm font-medium hover:bg-muted">{label}
            {n > 0 && <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground" aria-label={`${n} waiting`}>{n}</span>}</Link>))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
