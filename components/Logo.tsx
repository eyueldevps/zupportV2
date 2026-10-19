// Placeholder approximating Concept C (Z + upward arrow). Swap for the exported SVG (docs/logo-reference.png).
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2 text-xl font-bold">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M7 8h13M7 25h18M9 23 24 9" stroke="rgb(var(--link))" strokeWidth="4" strokeLinecap="round" />
        <path d="M16 6h10v10" stroke="rgb(var(--link))" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Zupport
    </span>
  );
}
