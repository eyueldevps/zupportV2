"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useState } from "react";

export function RichEditor({ name, initial }: { name: string; initial: string }) {
  const [html, setHtml] = useState(initial);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, code: false, codeBlock: false, strike: false, horizontalRule: false }),
      Link.configure({ openOnClick: false }),
    ],
    content: initial,
    immediatelyRender: false,
    editorProps: { attributes: { class: "prose-zupport min-h-[260px] rounded-b-xl border border-border bg-card p-4 focus:outline-none focus:ring-2 focus:ring-primary/30", "aria-label": "Article body" } },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });
  if (!editor) return <div className="min-h-[300px] rounded-xl border border-border" />;

  const Btn = ({ label, on, run }: { label: string; on: boolean; run: () => void }) => (
    <button type="button" onClick={run} aria-pressed={on}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${on ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{label}</button>
  );
  const addLink = () => {
    const url = window.prompt("Link address (starts with https://)");
    if (!url) return editor.chain().focus().unsetLink().run();
    editor.chain().focus().setLink({ href: url }).run();
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-t-xl border border-b-0 border-border bg-muted p-2" role="toolbar" aria-label="Formatting">
        <Btn label="Bold" on={editor.isActive("bold")} run={() => editor.chain().focus().toggleBold().run()} />
        <Btn label="Italic" on={editor.isActive("italic")} run={() => editor.chain().focus().toggleItalic().run()} />
        <Btn label="Heading" on={editor.isActive("heading", { level: 2 })} run={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <Btn label="Bullets" on={editor.isActive("bulletList")} run={() => editor.chain().focus().toggleBulletList().run()} />
        <Btn label="Numbers" on={editor.isActive("orderedList")} run={() => editor.chain().focus().toggleOrderedList().run()} />
        <Btn label="Quote" on={editor.isActive("blockquote")} run={() => editor.chain().focus().toggleBlockquote().run()} />
        <Btn label="Link" on={editor.isActive("link")} run={addLink} />
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
