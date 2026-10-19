// Amounts are stored in minor units (santim/cents) with an explicit currency.
export function money(minor: number, currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: minor % 100 ? 2 : 0 }).format(minor / 100);
}
// Accepts watch/embed/share/shorts URLs and returns the 11-char video ID, or null.
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com" || host === "m.youtube.com") {
      id = u.searchParams.get("v") ?? (/^\/(embed|shorts)\//.test(u.pathname) ? u.pathname.split("/")[2] : null);
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}
