import Link from "next/link";
import { db } from "@/lib/db";
import { ownedPage } from "@/lib/owner";
import { deletePost } from "@/app/actions/manage";
import { Alert } from "@/components/forms";

export default async function Posts({ params, searchParams }: { params: Promise<{ username: string }>; searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const { username } = await params;
  const sp = await searchParams;
  const page = await ownedPage(username);
  const posts = await db.post.findMany({ where: { pageId: page.id }, orderBy: { createdAt: "desc" }, include: { tier: true } });
  return (
    <div className="space-y-4">
      {sp.saved && <Alert kind="ok">Post saved.</Alert>}
      {sp.deleted && <Alert kind="ok">Post deleted.</Alert>}
      <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Posts</h2>
        <Link href={`/manage/${username}/posts/new`} className="btn">New post</Link></div>
      {posts.length === 0 && <p className="text-muted-foreground">No posts yet. Write your first article or add a video.</p>}
      {posts.map(p => (
        <div key={p.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
          <div><div className="font-semibold">{p.title}</div>
            <div className="text-sm text-muted-foreground">{p.type === "VIDEO" ? "Video" : "Article"} · {p.published ? "Published" : "Draft"} · {p.tier ? `Members: ${p.tier.name}+` : "Public"}</div></div>
          <div className="flex gap-2">
            <Link href={`/manage/${username}/posts/${p.id}`} className="btn-outline">Edit</Link>
            <form action={deletePost.bind(null, page.id, p.id)}><button className="btn-outline !border-danger !text-danger">Delete</button></form>
          </div>
        </div>))}
    </div>
  );
}
