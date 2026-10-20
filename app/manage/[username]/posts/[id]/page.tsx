import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ownedPage } from "@/lib/owner";
import { savePost } from "@/app/actions/manage";
import { PostForm } from "@/components/PostForm";
import { Alert } from "@/components/forms";

export default async function EditPost({ params, searchParams }: { params: Promise<{ username: string; id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { username, id } = await params;
  const { error } = await searchParams;
  const page = await ownedPage(username);
  const post = await db.post.findFirst({ where: { id, pageId: page.id } });
  if (!post) notFound();
  const tiers = await db.tier.findMany({ where: { pageId: page.id }, orderBy: { priceMinor: "asc" }, select: { id: true, name: true } });
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Edit post</h2>
      {error && <Alert kind="error">{error}</Alert>}
      <PostForm action={savePost.bind(null, page.id, post.id)} tiers={tiers}
        initial={{ type: post.type === "VIDEO" ? "VIDEO" : "ARTICLE", title: post.title, body: post.body,
          youtubeUrl: post.youtubeId ? `https://youtu.be/${post.youtubeId}` : "", tierId: post.tierId ?? "", published: post.published }} />
    </div>
  );
}
