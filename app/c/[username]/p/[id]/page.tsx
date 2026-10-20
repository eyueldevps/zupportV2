import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { db } from "@/lib/db";
import { allows, getMembership } from "@/lib/access";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ username: string; id: string }> }) {
  const { username, id } = await params;
  const user = await currentUser();
  const page = await db.creatorPage.findUnique({ where: { username } });
  const isOwner = !!user && !!page && page.ownerId === user.id;
  if (!page || (page.status !== "ACTIVE" && !isOwner)) notFound();
  const post = await db.post.findFirst({ where: { id, pageId: page.id }, include: { tier: true } });
  if (!post || (!post.published && !isOwner)) notFound();
  const member = user ? await getMembership(user.id, page.id) : null;
  const locked = !!post.tierId && !isOwner && !allows(member, post.tier); // the body is never rendered when locked
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href={`/c/${username}`} className="text-sm font-medium text-link">← {page.displayName}</Link>
      <h1 className="mt-4 text-3xl font-bold">{post.title}</h1>
      {!post.published && <p className="mt-2 text-sm font-medium text-accent">Draft. Only you can see this.</p>}
      {locked ? (
        <div className="card mt-8 flex flex-wrap items-center gap-4 p-6"><Lock aria-hidden />
          <p className="flex-1">This post is for <b>{post.tier?.name}</b> members and above.</p>
          <Link href={`/c/${username}/join/${post.tierId}`} className="btn">Join to read</Link></div>
      ) : (<>
        {post.type === "VIDEO" && post.youtubeId && (
          <iframe className="mt-6 aspect-video w-full rounded-xl" title={post.title} allowFullScreen
            src={`https://www.youtube-nocookie.com/embed/${post.youtubeId}`} />)}
        {post.type === "VIDEO"
          ? <p className="mt-4 whitespace-pre-line">{post.body}</p>
          : <div className="prose-zupport mt-6" dangerouslySetInnerHTML={{ __html: post.body }} />}
      </>)}
    </article>
  );
}
