export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-3 rounded-xl border border-accent p-3 text-sm"><b>Draft.</b> This text is being finalized and reviewed before Zupport launches to the public.</p>
      <div className="prose-zupport mt-6">{children}</div>
    </article>
  );
}
