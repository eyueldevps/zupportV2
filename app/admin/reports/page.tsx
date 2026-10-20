import Link from "next/link";
import { db } from "@/lib/db";
import { setPageStatus, setReportStatus } from "@/app/actions/moderation";

export const dynamic = "force-dynamic";

export default async function Reports() {
  const reports = await db.report.findMany({ where: { status: "OPEN" }, orderBy: { createdAt: "asc" }, take: 50,
    include: { reporter: true, page: true, post: true } });
  return (
    <div className="space-y-4">
      {reports.length === 0 && <p className="text-muted-foreground">No open reports.</p>}
      {reports.map(r => (
        <div key={r.id} className="card space-y-2 p-4 text-sm">
          <div className="font-semibold">{r.reason}</div>
          <div className="text-muted-foreground">Reported by {r.reporter?.email ?? "unknown"} · {r.createdAt.toLocaleString()}</div>
          {r.page && <div>Page: <Link className="font-medium text-link" href={`/c/${r.page.username}`}>{r.page.displayName}</Link> ({r.page.status.toLowerCase()})
            {r.post && <> · Post: <Link className="font-medium text-link" href={`/c/${r.page.username}/p/${r.post.id}`}>{r.post.title}</Link></>}</div>}
          <div className="flex flex-wrap gap-2 pt-1">
            <form action={setReportStatus.bind(null, r.id, "RESOLVED")}><button className="btn">Mark resolved</button></form>
            <form action={setReportStatus.bind(null, r.id, "DISMISSED")}><button className="btn-outline">Dismiss</button></form>
            {r.page && r.page.status === "ACTIVE" && <form action={setPageStatus.bind(null, r.page.id, "SUSPENDED")}><button className="btn-outline !border-danger !text-danger">Suspend page</button></form>}
          </div>
        </div>))}
    </div>
  );
}
