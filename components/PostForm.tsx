"use client";
import { useState } from "react";
import { RichEditor } from "./RichEditor";

type Initial = { type: "ARTICLE" | "VIDEO"; title: string; body: string; youtubeUrl: string; tierId: string; published: boolean };

export function PostForm({ action, tiers, initial }:
  { action: (fd: FormData) => Promise<void>; tiers: { id: string; name: string }[]; initial: Initial }) {
  const [type, setType] = useState<"ARTICLE" | "VIDEO">(initial.type);
  const L = "block text-sm font-medium";
  return (
    <form action={action} className="card space-y-4 p-6">
      <label className={L}>Type
        <select name="type" value={type} onChange={e => setType(e.target.value as "ARTICLE" | "VIDEO")} className="input mt-1">
          <option value="ARTICLE">Article</option><option value="VIDEO">Video (YouTube)</option></select></label>
      <label className={L}>Title
        <input name="title" defaultValue={initial.title} required maxLength={120} className="input mt-1" /></label>
      {type === "ARTICLE" ? (
        <div><div className="mb-1 text-sm font-medium">Article</div>
          <RichEditor name="body" initial={initial.type === "ARTICLE" ? initial.body : ""} /></div>
      ) : (<>
        <label className={L}>YouTube link
          <input name="youtubeUrl" defaultValue={initial.youtubeUrl} placeholder="https://youtu.be/..." className="input mt-1" /></label>
        <p className="text-sm text-muted-foreground">Upload the video to YouTube and set its visibility to <b>Unlisted</b> (not Private, which nobody else can watch). Then paste the link here.</p>
        <label className={L}>Description (optional)
          <textarea name="body" rows={4} defaultValue={initial.type === "VIDEO" ? initial.body : ""} className="input mt-1" /></label>
      </>)}
      <label className={L}>Who can see this
        <select name="tierId" defaultValue={initial.tierId} className="input mt-1">
          <option value="">Everyone (public)</option>
          {tiers.map(t => <option key={t.id} value={t.id}>Members: {t.name} and above</option>)}</select></label>
      <div className="flex flex-wrap gap-3 pt-2">
        <button name="intent" value="publish" className="btn">{initial.published ? "Save changes" : "Publish"}</button>
        <button name="intent" value="draft" className="btn-outline">{initial.published ? "Unpublish (save as draft)" : "Save as draft"}</button>
      </div>
    </form>
  );
}
