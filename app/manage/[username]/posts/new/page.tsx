import { db } from "@/lib/db";
import { ownedPage } from "@/lib/owner";
import { savePost } from "@/app/actions/manage";
import { PostForm } from "@/components/PostForm";
import { Alert } from "@/components/forms";

export default async function NewPost({ params, searchParams }: { params: Promise<{ username: string }>; searchParams: Promise<{ error?: string }> }) {
  const { username } = await params;
  const { error } = await searchParams;
  const page = await ownedPage(username);
  const tiers = await db.tier.findMany({ where: { pageId: page.id }, orderBy: { priceMinor: "asc" }, select: { id: true, name: true } });
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">New post</h2>
      {error && <Alert kind="error">{error}</Alert>}
      <PostForm action={savePost.bind(null, page.id, null)} tiers={tiers}
        initial={{ type: "ARTICLE", title: "", body: "", youtubeUrl: "", tierId: "", published: false }} />
    </div>
  );
}
