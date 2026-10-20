export function Logo({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/logo-mark.svg"
      alt="Zupport"
      style={{ height: size, width: "auto" }}
      className="rounded-md bg-white p-1"
    />
  );
}