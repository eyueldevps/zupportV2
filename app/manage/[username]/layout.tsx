import Link from "next/link";
import { ownedPage } from "@/lib/owner";

export default async function ManageLayout({ children, params }: { children: React.ReactNode; params: Promise<{ username: string }> }) {
  const { username } = await params;
  const page = await ownedPage(username);
  const base = `/manage/${username}`;
  const tab = "rounded-t-lg px-4 py-2 text-sm font-medium hover:bg-muted";
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold">{page.displayName}</h1>
          <p className="text-sm text-muted-foreground">{page.status === "ACTIVE" ? "Published" : page.status === "DRAFT" ? "Draft (only you can see it)" : "Suspended"}</p></div>
        <Link href={`/c/${username}`} className="btn-outline">{page.status === "ACTIVE" ? "View page" : "Preview page"}</Link>
      </div>
      <nav aria-label="Manage page" className="mt-6 flex flex-wrap gap-1 border-b border-border">
        <Link href={base} className={tab}>Profile</Link>
        <Link href={`${base}/tiers`} className={tab}>Memberships</Link>
        <Link href={`${base}/posts`} className={tab}>Posts</Link>
        <Link href={`${base}/earnings`} className={tab}>Earnings</Link>
        <Link href={`${base}/verification`} className={tab}>Verification</Link>
        <Link href="/account" className={`${tab} ml-auto text-muted-foreground`}>All my pages</Link>
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
