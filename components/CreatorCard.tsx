import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { money } from "@/lib/format";
import type { Key } from "@/lib/i18n";

type P = { username: string; displayName: string; bio: string; verification: string; category: { name: string } | null; tiers: { priceMinor: number; currency: string }[] };
export function CreatorCard({ p, t }: { p: P; t: (k: Key) => string }) {
  const from = p.tiers[0];
  return (
    <Link href={`/c/${p.username}`} className="card block p-5 transition-colors hover:border-primary">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground" aria-hidden>{p.displayName[0]}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-1 font-semibold"><span className="truncate">{p.displayName}</span>
            {p.verification === "VERIFIED" && <BadgeCheck size={16} className="shrink-0 text-secondary" aria-label={t("badge.verified")} />}</div>
          <div className="text-sm text-muted-foreground">{p.category?.name}</div>
        </div>
        {p.username.startsWith("sample-") && <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{t("badge.sample")}</span>}
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{p.bio}</p>
      {from && <div className="mt-3 text-sm font-medium">{money(from.priceMinor, from.currency)} / 30d</div>}
    </Link>
  );
}
